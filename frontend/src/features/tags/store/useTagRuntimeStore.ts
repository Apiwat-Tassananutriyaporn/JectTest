import { create } from "zustand";
import {
  connectMqtt,
  disconnectMqtt,
  isBrowserMqttAddress,
  publishMqttMessage,
  subscribeMqttTopics,
} from "../../../services/mqtt";
import type { MqttConnectionStatus, MqttPollingOption, ProjectSummary } from "../../project";
import type { TagDefinition, TagRuntimeValue } from "../types";

type TagRuntimeState = {
  connectionStatus: MqttConnectionStatus;
  hydrateProject: (project: ProjectSummary | null) => void;
  isSimulated: boolean;
  lastUpdatedAt: string | null;
  publishTagValue: (topicPath: string, nextValue: string | number | boolean) => void;
  runtimeByTagId: Record<string, TagRuntimeValue>;
  runtimeByTopicPath: Record<string, TagRuntimeValue>;
};

const pollingToMs: Record<MqttPollingOption, number> = {
  "1 min": 60000,
  "1 sec": 1000,
  "1.5 sec": 1500,
  "100 ms": 100,
  "2 sec": 2000,
  "200 ms": 200,
  "3 sec": 3000,
  "30 sec": 30000,
  "300 ms": 300,
  "5 sec": 5000,
  "50 ms": 50,
  "500 ms": 500,
};

let connectTimeout: ReturnType<typeof setTimeout> | null = null;
let mockInterval: ReturnType<typeof setInterval> | null = null;

function clearMockSession() {
  if (connectTimeout) {
    clearTimeout(connectTimeout);
    connectTimeout = null;
  }

  if (mockInterval) {
    clearInterval(mockInterval);
    mockInterval = null;
  }
}

function clearRuntimeSession() {
  clearMockSession();
  disconnectMqtt();
}

function createRuntimeSeed(tags: TagDefinition[]) {
  const runtimeByTagId: Record<string, TagRuntimeValue> = {};
  const runtimeByTopicPath: Record<string, TagRuntimeValue> = {};

  tags.forEach((tag) => {
    const runtime: TagRuntimeValue = {
      rawPayload: null,
      sourceTopic: tag.topicPath,
      status: "idle",
      tagId: tag.id,
      value: null,
    };

    runtimeByTagId[tag.id] = runtime;
    runtimeByTopicPath[tag.topicPath] = runtime;
  });

  return { runtimeByTagId, runtimeByTopicPath };
}

function coercePayloadValue(payloadText: string) {
  const trimmedPayload = payloadText.trim();

  if (!trimmedPayload) {
    return "";
  }

  const numericValue = Number(trimmedPayload);

  if (Number.isFinite(numericValue)) {
    return numericValue;
  }

  return payloadText;
}

function updateRuntimeFromMessage(message: { payloadText: string; receivedAt: string; topic: string }, set: (partial: Partial<TagRuntimeState>) => void, get: () => TagRuntimeState) {
  const matchingRuntimes = Object.values(get().runtimeByTagId).filter((runtime) => runtime.sourceTopic === message.topic);

  if (!matchingRuntimes.length) {
    return;
  }

  const nextValue = coercePayloadValue(message.payloadText);
  const runtimeByTagId = { ...get().runtimeByTagId };
  const runtimeByTopicPath = { ...get().runtimeByTopicPath };

  matchingRuntimes.forEach((runtime) => {
    const nextRuntime: TagRuntimeValue = {
      ...runtime,
      rawPayload: message.payloadText,
      receivedAt: message.receivedAt,
      sourceTopic: message.topic,
      status: "fresh",
      value: nextValue,
    };

    runtimeByTagId[runtime.tagId] = nextRuntime;
    runtimeByTopicPath[message.topic] = nextRuntime;
  });

  set({
    lastUpdatedAt: message.receivedAt,
    runtimeByTagId,
    runtimeByTopicPath,
  });
}

function markTopicsAsError(topics: string[], errorMessage: string, set: (partial: Partial<TagRuntimeState>) => void, get: () => TagRuntimeState) {
  const topicSet = new Set(topics);
  const runtimeByTagId = { ...get().runtimeByTagId };
  const runtimeByTopicPath = { ...get().runtimeByTopicPath };

  Object.values(get().runtimeByTagId)
    .filter((runtime) => runtime.sourceTopic && topicSet.has(runtime.sourceTopic))
    .forEach((runtime) => {
      const nextRuntime: TagRuntimeValue = {
        ...runtime,
        error: errorMessage,
        status: "error",
      };

      runtimeByTagId[runtime.tagId] = nextRuntime;
      runtimeByTopicPath[runtime.sourceTopic!] = nextRuntime;
    });

  set({
    runtimeByTagId,
    runtimeByTopicPath,
  });
}

function inferMockValue(tag: TagDefinition, previousValue: TagRuntimeValue["value"]) {
  const signal = `${tag.name} ${tag.topicPath}`.toLowerCase();

  if (signal.includes("temp")) {
    const lastValue = typeof previousValue === "number" ? previousValue : 41.8;
    return Math.max(28, Math.min(48, Number((lastValue + (Math.random() * 2.4 - 1.2)).toFixed(1))));
  }

  if (signal.includes("setpoint") || signal.includes("speed")) {
    if (typeof previousValue === "number") {
      return previousValue;
    }

    if (typeof previousValue === "string" && previousValue.trim()) {
      const numericValue = Number(previousValue);
      return Number.isFinite(numericValue) ? numericValue : previousValue;
    }

    return 1450;
  }

  if (signal.includes("run") || signal.includes("motor") || signal.includes("switch") || signal.includes("pump")) {
    if (typeof previousValue === "string") {
      return previousValue;
    }

    return Math.random() > 0.35 ? "ON" : "OFF";
  }

  if (signal.includes("pressure")) {
    const lastValue = typeof previousValue === "number" ? previousValue : 3.2;
    return Math.max(1.5, Math.min(7.5, Number((lastValue + (Math.random() * 0.6 - 0.3)).toFixed(1))));
  }

  return Math.max(0, Math.min(100, Math.round(typeof previousValue === "number" ? previousValue + (Math.random() * 18 - 9) : 56)));
}

function applyMockCycle(tags: TagDefinition[], set: (partial: Partial<TagRuntimeState>) => void, get: () => TagRuntimeState) {
  const nextRuntimeByTagId: Record<string, TagRuntimeValue> = {};
  const nextRuntimeByTopicPath: Record<string, TagRuntimeValue> = {};
  const receivedAt = new Date().toISOString();

  tags.forEach((tag) => {
    const previousRuntime = get().runtimeByTagId[tag.id];
    const nextValue = inferMockValue(tag, previousRuntime?.value ?? null);
    const runtime: TagRuntimeValue = {
      rawPayload: String(nextValue),
      receivedAt,
      sourceTopic: tag.topicPath,
      status: "fresh",
      tagId: tag.id,
      value: nextValue,
    };

    nextRuntimeByTagId[tag.id] = runtime;
    nextRuntimeByTopicPath[tag.topicPath] = runtime;
  });

  set({
    lastUpdatedAt: receivedAt,
    runtimeByTagId: nextRuntimeByTagId,
    runtimeByTopicPath: nextRuntimeByTopicPath,
  });
}

function startMockSession(project: ProjectSummary, set: (partial: Partial<TagRuntimeState>) => void, get: () => TagRuntimeState) {
  set({
    connectionStatus: "connecting",
    isSimulated: true,
  });

  connectTimeout = setTimeout(() => {
    set({ connectionStatus: "connected" });
    applyMockCycle(project.tags, set, get);

    mockInterval = setInterval(() => {
      if (get().connectionStatus !== "connected") {
        return;
      }

      applyMockCycle(project.tags, set, get);
    }, pollingToMs[project.mqttConnection?.polling ?? "5 sec"]);
  }, 700);
}

function startMqttSession(project: ProjectSummary, set: (partial: Partial<TagRuntimeState>) => void, get: () => TagRuntimeState) {
  const subscribableTopics = project.tags
    .filter((tag) => tag.mode === "subscribe" || tag.mode === "pubsub")
    .map((tag) => tag.topicPath);

  set({
    connectionStatus: "connecting",
    isSimulated: false,
  });

  try {
    connectMqtt(project.mqttConnection!, {
      onConnect: () => {
        void subscribeMqttTopics(subscribableTopics).catch((error: Error) => {
          markTopicsAsError(subscribableTopics, error.message, set, get);
          set({ connectionStatus: "connected" });
          console.error(error);
        });
      },
      onError: () => {
        set({ connectionStatus: "error" });
      },
      onMessage: (message) => {
        updateRuntimeFromMessage(message, set, get);
      },
      onStatusChange: (connectionStatus) => {
        set({ connectionStatus });
      },
    });
  } catch {
    set({ connectionStatus: "error" });
  }
}

export const useTagRuntimeStore = create<TagRuntimeState>((set, get) => ({
  connectionStatus: "idle",
  hydrateProject: (project) => {
    clearRuntimeSession();

    if (!project) {
      set({
        connectionStatus: "idle",
        isSimulated: false,
        lastUpdatedAt: null,
        runtimeByTagId: {},
        runtimeByTopicPath: {},
      });
      return;
    }

    set({
      connectionStatus: "idle",
      isSimulated: false,
      lastUpdatedAt: null,
      ...createRuntimeSeed(project.tags),
    });

    if (project.type !== "mqtt_client" || !project.mqttConnection?.enabled) {
      return;
    }

    if (isBrowserMqttAddress(project.mqttConnection.address)) {
      startMqttSession(project, set, get);
      return;
    }

    startMockSession(project, set, get);
  },
  isSimulated: false,
  lastUpdatedAt: null,
  publishTagValue: (topicPath, nextValue) => {
    const runtime = get().runtimeByTopicPath[topicPath];

    if (!runtime) {
      return;
    }

    const receivedAt = new Date().toISOString();
    const nextRuntime: TagRuntimeValue = {
      ...runtime,
      rawPayload: String(nextValue),
      receivedAt,
      sourceTopic: topicPath,
      status: "fresh",
      value: nextValue,
    };

    set((state) => ({
      lastUpdatedAt: receivedAt,
      runtimeByTagId: {
        ...state.runtimeByTagId,
        [nextRuntime.tagId]: nextRuntime,
      },
      runtimeByTopicPath: {
        ...state.runtimeByTopicPath,
        [topicPath]: nextRuntime,
      },
    }));

    if (get().connectionStatus === "connected" && !get().isSimulated) {
      void publishMqttMessage(topicPath, String(nextValue)).catch((error: Error) => {
        const errorRuntime: TagRuntimeValue = {
          ...nextRuntime,
          error: error.message,
          status: "error",
        };

        set((state) => ({
          runtimeByTagId: {
            ...state.runtimeByTagId,
            [nextRuntime.tagId]: errorRuntime,
          },
          runtimeByTopicPath: {
            ...state.runtimeByTopicPath,
            [topicPath]: errorRuntime,
          },
        }));
      });
    }
  },
  runtimeByTagId: {},
  runtimeByTopicPath: {},
}));
