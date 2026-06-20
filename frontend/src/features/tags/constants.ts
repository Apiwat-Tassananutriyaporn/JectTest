import type { TagDefinition, TagMode } from "./types";

function createTagTimestamp() {
  return "2026-06-18T09:20:00.000Z";
}

export const defaultTagDraft = {
  mode: "subscribe" as TagMode,
  name: "",
  topicPath: "",
  unit: "",
};

export const tagSeed: TagDefinition[] = [
  {
    createdAt: createTagTimestamp(),
    dataSourceType: "direct_mqtt_topic",
    id: "tag-motor-run",
    mode: "pubsub",
    name: "Motor Run",
    payloadType: "plaintext",
    topicPath: "motor/run",
    unit: "",
    updatedAt: createTagTimestamp(),
  },
  {
    createdAt: createTagTimestamp(),
    dataSourceType: "direct_mqtt_topic",
    id: "tag-sensor-temp",
    mode: "subscribe",
    name: "Temperature",
    payloadType: "plaintext",
    topicPath: "sensor/temp",
    unit: "C",
    updatedAt: createTagTimestamp(),
  },
  {
    createdAt: createTagTimestamp(),
    dataSourceType: "direct_mqtt_topic",
    id: "tag-speed-setpoint",
    mode: "pubsub",
    name: "Speed Setpoint",
    payloadType: "plaintext",
    topicPath: "motor/speed/setpoint",
    unit: "rpm",
    updatedAt: createTagTimestamp(),
  },
];
