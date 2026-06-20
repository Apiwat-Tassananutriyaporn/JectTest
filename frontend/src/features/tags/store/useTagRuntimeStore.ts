import { create } from "zustand";
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

export const useTagRuntimeStore = create<TagRuntimeState>((set, get) => ({
  connectionStatus: "idle",
  hydrateProject: (project) => {
    clearMockSession();

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
  },
  runtimeByTagId: {},
  runtimeByTopicPath: {},
}));
