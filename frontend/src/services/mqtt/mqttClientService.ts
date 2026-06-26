import mqtt from "mqtt";
import type { IClientOptions, MqttClient } from "mqtt";
import type { MqttConnectionConfig, MqttConnectionStatus } from "../../features/project";
import type { MqttClientHandlers, MqttRawMessage } from "./types";

let activeClient: MqttClient | null = null;
let activeStatus: MqttConnectionStatus = "idle";

function toError(error: unknown, fallbackMessage: string) {
  if (error instanceof Error) {
    return error;
  }

  return new Error(fallbackMessage);
}

export function isBrowserMqttAddress(address: string) {
  const normalizedAddress = address.trim().toLowerCase();
  return normalizedAddress.startsWith("ws://") || normalizedAddress.startsWith("wss://");
}

export function validateBrowserMqttConfig(config: MqttConnectionConfig) {
  const address = config.address.trim();

  if (!config.name.trim()) {
    return "Name is required.";
  }

  if (!address) {
    return "Address is required.";
  }

  if (!config.clientId.trim()) {
    return "Client ID is required for MQTT WebSocket connection.";
  }

  if (address.startsWith("mqtt://")) {
    return "Browser cannot connect to mqtt:// directly in Version 07. Use ws:// or wss://.";
  }

  if (!isBrowserMqttAddress(address)) {
    return "Unsupported protocol. Browser MQTT supports ws:// or wss:// only.";
  }

  return null;
}

function buildClientOptions(config: MqttConnectionConfig, clientId = config.clientId.trim()): IClientOptions {
  return {
    clean: true,
    clientId,
    connectTimeout: 8000,
    keepalive: 30,
    password: config.password || undefined,
    reconnectPeriod: 0,
    username: config.username || undefined,
  };
}

function setStatus(status: MqttConnectionStatus, handlers?: MqttClientHandlers) {
  activeStatus = status;
  handlers?.onStatusChange?.(status);
}

function endClient(client: MqttClient | null) {
  if (!client) {
    return;
  }

  client.removeAllListeners();
  client.end(true);
}

export function getMqttConnectionStatus() {
  return activeStatus;
}

export function disconnectMqtt() {
  endClient(activeClient);
  activeClient = null;
  activeStatus = "disconnected";
}

export function connectMqtt(config: MqttConnectionConfig, handlers: MqttClientHandlers = {}) {
  const validationError = validateBrowserMqttConfig(config);

  if (validationError) {
    const error = new Error(validationError);
    setStatus("error", handlers);
    handlers.onError?.(error);
    throw error;
  }

  disconnectMqtt();
  setStatus("connecting", handlers);

  const client = mqtt.connect(config.address.trim(), buildClientOptions(config));
  activeClient = client;

  client.on("connect", () => {
    setStatus("connected", handlers);
    handlers.onConnect?.();
  });

  client.on("message", (topic, payload) => {
    const message: MqttRawMessage = {
      payloadText: payload.toString(),
      receivedAt: new Date().toISOString(),
      topic,
    };

    handlers.onMessage?.(message);
  });

  client.on("close", () => {
    if (activeClient === client && activeStatus !== "error") {
      setStatus("disconnected", handlers);
    }
  });

  client.on("error", (error) => {
    if (activeClient === client) {
      setStatus("error", handlers);
      handlers.onError?.(toError(error, "MQTT connection failed."));
    }
  });

  return client;
}

export function subscribeMqttTopics(topics: string[]) {
  const client = activeClient;
  const uniqueTopics = Array.from(new Set(topics.map((topic) => topic.trim()).filter(Boolean)));

  if (!client || activeStatus !== "connected") {
    return Promise.reject(new Error("MQTT is not connected."));
  }

  if (!uniqueTopics.length) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    client.subscribe(uniqueTopics, { qos: 0 }, (error) => {
      if (error) {
        reject(toError(error, "MQTT subscribe failed."));
        return;
      }

      resolve();
    });
  });
}

export function publishMqttMessage(topic: string, payload: string) {
  const client = activeClient;
  const topicPath = topic.trim();

  if (!client || activeStatus !== "connected") {
    return Promise.reject(new Error("MQTT is not connected."));
  }

  if (!topicPath) {
    return Promise.reject(new Error("MQTT topic path is required."));
  }

  return new Promise<void>((resolve, reject) => {
    client.publish(topicPath, payload, { qos: 0 }, (error) => {
      if (error) {
        reject(toError(error, "MQTT publish failed."));
        return;
      }

      resolve();
    });
  });
}

export function testMqttConnection(config: MqttConnectionConfig) {
  const validationError = validateBrowserMqttConfig(config);

  if (validationError) {
    return Promise.reject(new Error(validationError));
  }

  return new Promise<void>((resolve, reject) => {
    let settled = false;
    const testClientId = `${config.clientId.trim()}_test_${Date.now()}`;
    const client = mqtt.connect(config.address.trim(), buildClientOptions(config, testClientId));
    const timeout = window.setTimeout(() => {
      if (settled) {
        return;
      }

      settled = true;
      endClient(client);
      reject(new Error("MQTT connection timeout."));
    }, 8000);

    const cleanup = () => {
      window.clearTimeout(timeout);
      endClient(client);
    };

    client.on("connect", () => {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();
      resolve();
    });

    client.on("error", (error) => {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();
      reject(toError(error, "MQTT connection failed."));
    });
  });
}
