export type ProjectType = "normal" | "mqtt_client";
export type TagMode = "publish" | "subscribe" | "pubsub";
export type TagDataSourceType = "direct_mqtt_topic";
export type TagPayloadType = "plaintext";

export type MqttPollingOption =
  | "50 ms"
  | "100 ms"
  | "200 ms"
  | "300 ms"
  | "500 ms"
  | "1 sec"
  | "1.5 sec"
  | "2 sec"
  | "3 sec"
  | "5 sec"
  | "30 sec"
  | "1 min";

export type MqttConnectionStatus = "idle" | "connecting" | "connected" | "disconnected" | "error";

export type MqttConnectionConfig = {
  address: string;
  clientId: string;
  enabled: boolean;
  id: string;
  name: string;
  password: string;
  polling: MqttPollingOption;
  securityMode: "without_security_and_encryption";
  tlsEnabled: boolean;
  type: "MQTTclient";
  username: string;
};

export type TagDefinition = {
  createdAt: string;
  dataSourceType: TagDataSourceType;
  id: string;
  mode: TagMode;
  name: string;
  payloadType: TagPayloadType;
  topicPath: string;
  unit: string;
  updatedAt: string;
};

export type ProjectSummary = {
  id: string;
  mqttConnection: MqttConnectionConfig | null;
  name: string;
  tags: TagDefinition[];
  type: ProjectType;
  updatedAt: string;
};
