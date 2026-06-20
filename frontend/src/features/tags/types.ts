import type {
  TagDataSourceType,
  TagDefinition,
  TagMode,
  TagPayloadType,
} from "../project/types";

export type { TagDataSourceType, TagDefinition, TagMode, TagPayloadType };

export type TagRuntimeStatus = "idle" | "fresh" | "stale" | "error";

export type TagRuntimeValue = {
  error?: string;
  rawPayload: string | null;
  receivedAt?: string;
  sourceTopic?: string;
  status: TagRuntimeStatus;
  tagId: string;
  value: string | number | boolean | null;
};
