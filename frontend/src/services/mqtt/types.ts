import type { MqttConnectionStatus } from "../../features/project";

export type MqttRawMessage = {
  payloadText: string;
  receivedAt: string;
  topic: string;
};

export type MqttClientHandlers = {
  onConnect?: () => void;
  onError?: (error: Error) => void;
  onMessage?: (message: MqttRawMessage) => void;
  onStatusChange?: (status: MqttConnectionStatus) => void;
};
