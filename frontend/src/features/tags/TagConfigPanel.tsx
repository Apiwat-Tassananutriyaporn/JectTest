import { Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button, SelectField, TextField } from "../../shared/ui";
import { defaultTagDraft } from "./constants";
import type { TagDefinition, TagMode } from "./types";

type TagConfigPanelProps = {
  onChange: (tags: TagDefinition[]) => void;
  showHeader?: boolean;
  tags: TagDefinition[];
};

type TagDraft = {
  mode: TagMode;
  name: string;
  topicPath: string;
  unit: string;
};

function createTagId(name: string) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "tag";
  return `tag-${base}-${Date.now()}`;
}

function createTimestamp() {
  return new Date().toISOString();
}

function toDraft(tag: TagDefinition): TagDraft {
  return {
    mode: tag.mode,
    name: tag.name,
    topicPath: tag.topicPath,
    unit: tag.unit,
  };
}

export function TagConfigPanel({ onChange, showHeader = true, tags }: TagConfigPanelProps) {
  const [draft, setDraft] = useState<TagDraft>(defaultTagDraft);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const resetDraft = () => {
    setDraft(defaultTagDraft);
    setEditingTagId(null);
    setError("");
  };

  const handleSelectTag = (tag: TagDefinition) => {
    setDraft(toDraft(tag));
    setEditingTagId(tag.id);
    setError("");
  };

  const handleSaveTag = () => {
    const trimmedName = draft.name.trim();
    const trimmedTopicPath = draft.topicPath.trim();
    const trimmedUnit = draft.unit.trim();

    if (!trimmedName) {
      setError("Tag Name is required.");
      return;
    }

    if (!trimmedTopicPath) {
      setError("Topic Path is required.");
      return;
    }

    const duplicateName = tags.find((tag) => tag.name.toLowerCase() === trimmedName.toLowerCase() && tag.id !== editingTagId);
    if (duplicateName) {
      setError("Tag Name must be unique in this project.");
      return;
    }

    const duplicateTopic = tags.find((tag) => tag.topicPath === trimmedTopicPath && tag.id !== editingTagId);
    if (duplicateTopic) {
      setError("Topic Path is already used by another tag.");
      return;
    }

    if (editingTagId) {
      onChange(
        tags.map((tag) =>
          tag.id === editingTagId
            ? {
                ...tag,
                mode: draft.mode,
                name: trimmedName,
                topicPath: trimmedTopicPath,
                unit: trimmedUnit,
                updatedAt: createTimestamp(),
              }
            : tag,
        ),
      );
      resetDraft();
      return;
    }

    const timestamp = createTimestamp();
    onChange([
      ...tags,
      {
        createdAt: timestamp,
        dataSourceType: "direct_mqtt_topic",
        id: createTagId(trimmedName),
        mode: draft.mode,
        name: trimmedName,
        payloadType: "plaintext",
        topicPath: trimmedTopicPath,
        unit: trimmedUnit,
        updatedAt: timestamp,
      },
    ]);
    resetDraft();
  };

  const handleDeleteTag = () => {
    if (!editingTagId) {
      return;
    }

    onChange(tags.filter((tag) => tag.id !== editingTagId));
    resetDraft();
  };

  return (
    <section className="tag-config-panel" aria-label="Tag configuration">
      {showHeader ? (
        <div className="surface-header">
          <div>
            <h2>Tag Configuration</h2>
            <p>Direct MQTT Topic tags for subscribe, publish, and pubsub flows.</p>
          </div>
          <div className="tag-config-actions">
            <Button onClick={resetDraft}>
              <Plus size={16} />
              New Tag
            </Button>
          </div>
        </div>
      ) : (
        <div className="tag-config-actions">
          <Button onClick={resetDraft}>
            <Plus size={16} />
            New Tag
          </Button>
        </div>
      )}

      <div className="tag-config-layout">
        <div className="tag-config-list" aria-label="Existing tags">
          {tags.map((tag) => (
            <button
              className={`tag-list-item${editingTagId === tag.id ? " is-active" : ""}`}
              key={tag.id}
              onClick={() => handleSelectTag(tag)}
              type="button"
            >
              <strong>{tag.name}</strong>
              <span>{tag.topicPath}</span>
              <small>{tag.mode} / {tag.payloadType}</small>
            </button>
          ))}
        </div>

        <div className="tag-config-form">
          <TextField
            label="Tag Name"
            onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
            value={draft.name}
          />
          <SelectField
            label="Mode"
            onChange={(event) => setDraft((current) => ({ ...current, mode: event.target.value as TagMode }))}
            value={draft.mode}
          >
            <option value="publish">publish</option>
            <option value="subscribe">subscribe</option>
            <option value="pubsub">pubsub</option>
          </SelectField>
          <TextField
            label="Topic Path"
            onChange={(event) => setDraft((current) => ({ ...current, topicPath: event.target.value }))}
            value={draft.topicPath}
          />
          <TextField
            label="Unit"
            onChange={(event) => setDraft((current) => ({ ...current, unit: event.target.value }))}
            value={draft.unit}
          />
          <SelectField label="Data Source Type" value="direct_mqtt_topic" disabled>
            <option value="direct_mqtt_topic">direct_mqtt_topic</option>
          </SelectField>
          <SelectField label="Payload Type" value="plaintext" disabled>
            <option value="plaintext">plaintext</option>
          </SelectField>

          {error ? <div className="form-error">{error}</div> : null}

          <div className="tag-config-footer">
            {editingTagId ? (
              <Button onClick={handleDeleteTag}>
                <Trash2 size={16} />
                Delete
              </Button>
            ) : null}
            <Button onClick={handleSaveTag}>
              <Save size={16} />
              {editingTagId ? "Save Tag" : "Add Tag"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
