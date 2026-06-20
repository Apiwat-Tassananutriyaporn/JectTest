import { tagSeed } from "../tags";
import type { MqttConnectionConfig, ProjectSummary } from "./types";

export const projectTypeLabels = {
  mqtt_client: "MQTTClient",
  normal: "Normal",
} as const;

export const defaultMqttConnection: MqttConnectionConfig = {
  address: "ws://172.20.10.2:8083/mqtt",
  clientId: "scada_frontend_001",
  enabled: true,
  id: "mqtt-default",
  name: "mqtt",
  password: "",
  polling: "5 sec",
  securityMode: "without_security_and_encryption",
  tlsEnabled: false,
  type: "MQTTclient",
  username: "",
};

export const projectSeed: ProjectSummary[] = [
  {
    id: "project-line-01",
    mqttConnection: defaultMqttConnection,
    name: "Line 01 Monitoring",
    tags: tagSeed,
    type: "mqtt_client",
    updatedAt: "2026-06-18 09:20",
  },
  {
    id: "project-demo-cell",
    mqttConnection: null,
    name: "Factory Cell Demo",
    tags: tagSeed,
    type: "normal",
    updatedAt: "2026-06-17 18:05",
  },
];
