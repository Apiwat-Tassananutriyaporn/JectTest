import { BellRing, CalendarDays, CircleAlert, Info, Pencil, Plus, RotateCcw, Save, Search, Trash2, TriangleAlert, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, IconButton, SelectField, TextField } from "../../shared/ui";
import { useProjectStore } from "../project";
import { useTagRuntimeStore } from "../tags";
import { evaluateAlarmEvents } from "./alarmEngine";
import { useAlarmRuleStore } from "./store/useAlarmRuleStore";
import type { AlarmConditionType, AlarmRule, AlarmRuleCondition, AlarmSeverity } from "./types";

type AlarmRuleDraft = {
  conditions: AlarmRuleCondition[];
  sourceTagId: string;
  type: AlarmConditionType;
};

function createCondition(
  sourceTagId = "",
  type: AlarmConditionType = "",
): AlarmRuleCondition {
  return {
    id: `condition-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    max: "",
    min: "",
    severity: "Warning",
    tagId: sourceTagId,
    text: "",
    type,
    warningText: "",
  };
}

function createRuleId() {
  return `alarm-rule-${Date.now()}`;
}

function formatTimestamp(isoDate?: string) {
  if (!isoDate) {
    return "--";
  }

  return new Date(isoDate).toLocaleString("en-GB", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    second: "2-digit",
    year: "numeric",
  });
}

function getOverlappingConditionIds(conditions: AlarmRuleCondition[]) {
  const conflictingIds = new Set<string>();
  const numericConditions = conditions.filter(
    (condition) =>
      condition.tagId &&
      condition.type === "number" &&
      (condition.min.trim() || condition.max.trim()),
  );

  numericConditions.forEach((condition, index) => {
    const min = condition.min.trim() ? Number(condition.min) : Number.NEGATIVE_INFINITY;
    const max = condition.max.trim() ? Number(condition.max) : Number.POSITIVE_INFINITY;

    numericConditions.slice(index + 1).forEach((candidate) => {
      if (condition.tagId !== candidate.tagId) {
        return;
      }

      const candidateMin = candidate.min.trim() ? Number(candidate.min) : Number.NEGATIVE_INFINITY;
      const candidateMax = candidate.max.trim() ? Number(candidate.max) : Number.POSITIVE_INFINITY;

      if (Number.isFinite(min) || Number.isFinite(max)) {
        if (Math.max(min, candidateMin) <= Math.min(max, candidateMax)) {
          conflictingIds.add(condition.id);
          conflictingIds.add(candidate.id);
        }
      }
    });
  });

  return conflictingIds;
}

export function AlarmLogView() {
  const activeProject = useProjectStore((state) => state.activeProject);
  const connectionStatus = useTagRuntimeStore((state) => state.connectionStatus);
  const deleteRule = useAlarmRuleStore((state) => state.deleteRule);
  const rules = useAlarmRuleStore((state) => state.rules);
  const saveRuleForSource = useAlarmRuleStore((state) => state.saveRuleForSource);
  const runtimeByTopicPath = useTagRuntimeStore((state) => state.runtimeByTopicPath);
  const [draft, setDraft] = useState<AlarmRuleDraft>({
    conditions: [createCondition()],
    sourceTagId: "",
    type: "",
  });
  const [formError, setFormError] = useState("");
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [rulePendingDelete, setRulePendingDelete] = useState<AlarmRule | null>(null);
  const tags = activeProject?.tags ?? [];
  const selectedTag = tags.find((tag) => tag.id === draft.sourceTagId);
  const pendingDeleteTag = tags.find((tag) => tag.id === rulePendingDelete?.conditions[0]?.tagId);
  const rows = evaluateAlarmEvents(rules, tags, runtimeByTopicPath);
  const overlappingConditionIds = getOverlappingConditionIds(draft.conditions);

  useEffect(() => {
    if (!isRuleModalOpen && !rulePendingDelete) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (rulePendingDelete) {
          setRulePendingDelete(null);
        } else {
          setIsRuleModalOpen(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRuleModalOpen, rulePendingDelete]);

  if (connectionStatus !== "connected" && activeProject?.type === "mqtt_client") {
    rows.push({
      condition: `mqtt status = ${connectionStatus}`,
      message: "MQTT connection is not in connected state.",
      name: "Connection State",
      severity: connectionStatus === "error" ? "Critical" : "Info",
      source: activeProject.mqttConnection?.name ?? "mqtt",
      time: new Date().toISOString(),
      value: connectionStatus,
    });
  }

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredRows = rows.filter((row) =>
    [
      row.condition,
      row.message,
      row.name,
      row.severity,
      row.source,
      String(row.value ?? ""),
    ].some((value) => value.toLowerCase().includes(normalizedSearch)),
  );
  const criticalCount = rows.filter((row) => row.severity === "Critical").length;

  const updateCondition = (conditionId: string, patch: Partial<AlarmRuleCondition>) => {
    setFormError("");
    setDraft((current) => ({
      ...current,
      conditions: current.conditions.map((condition) =>
        condition.id === conditionId ? { ...condition, ...patch } : condition,
      ),
    }));
  };

  const addCondition = () => {
    setDraft((current) => ({
      ...current,
      conditions: [
        ...current.conditions,
        createCondition(current.sourceTagId, current.type),
      ],
    }));
  };

  const removeCondition = (conditionId: string) => {
    setDraft((current) => ({
      ...current,
      conditions: current.conditions.filter((condition) => condition.id !== conditionId),
    }));
  };

  const resetDraft = () => {
    setEditingRuleId(null);
    setDraft({
      conditions: [createCondition()],
      sourceTagId: "",
      type: "",
    });
    setFormError("");
  };

  const saveRule = () => {
    if (!draft.sourceTagId || !draft.type) {
      setFormError("Select a source tag and value type.");
      return;
    }

    const invalidCondition = draft.conditions.find((condition) => {
      if (!condition.warningText?.trim()) {
        return true;
      }

      if (condition.type === "number") {
        const hasMin = condition.min.trim();
        const hasMax = condition.max.trim();
        const invalidOrder = hasMin && hasMax && Number(condition.min) >= Number(condition.max);
        return (!hasMin && !hasMax) || invalidOrder;
      }

      return !condition.text.trim();
    });

    if (invalidCondition) {
      setFormError("Each condition needs a message and a valid threshold or text match.");
      return;
    }

    if (overlappingConditionIds.size) {
      setFormError("Numeric ranges for the same tag must not overlap.");
      return;
    }

    const firstCondition = draft.conditions[0];
    const existingRule = rules.find((rule) => rule.id === editingRuleId);
    const rule: AlarmRule = {
      conditions: draft.conditions,
      createdAt: existingRule?.createdAt ?? new Date().toISOString(),
      id: existingRule?.id ?? createRuleId(),
      severity: firstCondition.severity ?? "Warning",
      warningText: firstCondition.warningText?.trim() ?? "",
    };

    saveRuleForSource(rule);
    resetDraft();
    setIsRuleModalOpen(false);
  };

  const loadSavedConditions = (sourceTagId: string, type: AlarmConditionType) => {
    if (!sourceTagId || !type) {
      return [createCondition(sourceTagId, type)];
    }

    const savedRule = rules.find(
      (rule) =>
        rule.conditions.length > 0 &&
        rule.conditions.every(
          (condition) => condition.tagId === sourceTagId && condition.type === type,
        ),
    );

    return savedRule?.conditions.map((condition) => ({ ...condition })) ?? [
      createCondition(sourceTagId, type),
    ];
  };

  const selectSourceTag = (sourceTagId: string) => {
    const savedRule = rules.find(
      (rule) =>
        rule.conditions.length > 0 &&
        rule.conditions.every((condition) => condition.tagId === sourceTagId),
    );
    const type = savedRule?.conditions[0]?.type ?? "";

    setFormError("");
    setDraft({
      conditions: savedRule?.conditions.map((condition) => ({ ...condition })) ?? [
        createCondition(sourceTagId, type),
      ],
      sourceTagId,
      type,
    });
  };

  const selectValueType = (type: AlarmConditionType) => {
    setFormError("");
    setDraft((current) => ({
      ...current,
      conditions: loadSavedConditions(current.sourceTagId, type),
      type,
    }));
  };

  const editRule = (rule: AlarmRule) => {
    const sourceCondition = rule.conditions[0];

    if (!sourceCondition) {
      return;
    }

    setDraft({
      conditions: rule.conditions.map((condition) => ({ ...condition })),
      sourceTagId: sourceCondition.tagId,
      type: sourceCondition.type,
    });
    setEditingRuleId(rule.id);
    setFormError("");
    setIsRuleModalOpen(true);
  };

  return (
    <section className="surface-view" aria-label="Alarm log">
      <div className="alarm-monitor-header">
        <div>
          <span className="alarm-monitor-eyebrow">Monitoring</span>
          <h2>Alarm Log</h2>
        </div>
        <div className="surface-header-actions">
          <span className="alarm-summary-chip"><strong>{rows.length}</strong> Active</span>
          <span className="alarm-summary-chip alarm-summary-chip-critical">
            <strong>{criticalCount}</strong> Critical
          </span>
          <Button
            onClick={() => {
              resetDraft();
              setIsRuleModalOpen(true);
            }}
          >
            <Plus size={16} />
            Add Alarm Rule
          </Button>
        </div>
      </div>

      <div className="alarm-log-toolbar">
        <label className="alarm-search-field">
          <Search size={15} />
          <input
            aria-label="Search alarm log"
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search alarm, source, value, condition..."
            type="search"
            value={searchQuery}
          />
        </label>
        <Button>
          <CalendarDays size={15} />
          Today
        </Button>
      </div>

      {isRuleModalOpen ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setIsRuleModalOpen(false)}>
          <section
            aria-label="Create alarm rule"
            aria-modal="true"
            className="settings-modal alarm-rule-modal"
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="settings-modal-header">
              <div className="panel-title">
                <TriangleAlert size={17} />
                <h2>{editingRuleId ? "Edit Alarm Rule" : "Create Alarm Rule"}</h2>
              </div>
              <IconButton aria-label="Close alarm rule" onClick={() => setIsRuleModalOpen(false)}>
                <X size={16} />
              </IconButton>
            </div>

            <div className="alarm-rule-source-fields">
              <SelectField
                disabled={Boolean(editingRuleId)}
                label="Source tag"
                onChange={(event) => selectSourceTag(event.target.value)}
                value={draft.sourceTagId}
              >
                <option value="">Select tag</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name} ({tag.topicPath})
                  </option>
                ))}
              </SelectField>
              <SelectField
                disabled={!draft.sourceTagId || Boolean(editingRuleId)}
                label="Value type"
                onChange={(event) => selectValueType(event.target.value as AlarmConditionType)}
                value={draft.type}
              >
                <option value="">Select value type</option>
                <option value="number">Number / range</option>
                <option value="text">Text match</option>
              </SelectField>
            </div>

            <div className="alarm-builder-layout">
              <div className="alarm-condition-workspace">
                <div className="alarm-section-heading">
                  <div>
                    <strong>Activation conditions</strong>
                  </div>
                  <Button disabled={!draft.sourceTagId || !draft.type} onClick={addCondition}>
                    <Plus size={16} />
                    Add condition
                  </Button>
                </div>

                {draft.sourceTagId && draft.type ? (
                  <div className="alarm-rule-conditions">
                  {draft.conditions.map((condition, index) => {
                    const hasInvalidRange =
                      condition.type === "number" &&
                      Boolean(condition.min.trim()) &&
                      Boolean(condition.max.trim()) &&
                      Number(condition.min) >= Number(condition.max);

                    return (
                      <div className="alarm-rule-condition" key={condition.id}>
                        <div className="alarm-condition-row">
                          <span className="alarm-condition-index">{index + 1}</span>
                          <div className="alarm-condition-content">
                            {selectedTag ? (
                              condition.type === "number" ? (
                                <div className="alarm-threshold-fields">
                                  <TextField
                                    label={`Low limit${selectedTag.unit ? ` (${selectedTag.unit})` : ""}`}
                                    onChange={(event) => updateCondition(condition.id, { min: event.target.value })}
                                    placeholder="No lower limit"
                                    type="number"
                                    value={condition.min}
                                  />
                                  <TextField
                                    label={`High limit${selectedTag.unit ? ` (${selectedTag.unit})` : ""}`}
                                    onChange={(event) => updateCondition(condition.id, { max: event.target.value })}
                                    placeholder="No upper limit"
                                    type="number"
                                    value={condition.max}
                                  />
                                </div>
                              ) : (
                                <TextField
                                  label="Text to match"
                                  onChange={(event) => updateCondition(condition.id, { text: event.target.value })}
                                  placeholder="Example: ERROR, OFF, RUN"
                                  value={condition.text}
                                />
                              )
                            ) : null}

                            {selectedTag ? (
                              <div className="alarm-condition-details-fields">
                                <TextField
                                  label="Operator message"
                                  onChange={(event) =>
                                    updateCondition(condition.id, { warningText: event.target.value })
                                  }
                                  placeholder="Example: Temperature is too high"
                                  value={condition.warningText ?? ""}
                                />
                                <label className="alarm-severity-field">
                                  Severity
                                  <span className="alarm-severity-options">
                                    {(["Info", "Warning", "Critical"] as AlarmSeverity[]).map((severity) => {
                                      const SeverityIcon =
                                        severity === "Info" ? Info : severity === "Warning" ? TriangleAlert : CircleAlert;

                                      return (
                                        <button
                                          aria-label={`${severity} severity`}
                                          aria-pressed={(condition.severity ?? "Warning") === severity}
                                          className={`alarm-severity-option alarm-severity-option-${severity.toLowerCase()}`}
                                          key={severity}
                                          onClick={() => updateCondition(condition.id, { severity })}
                                          title={severity}
                                          type="button"
                                        >
                                          <SeverityIcon size={15} />
                                          {severity}
                                        </button>
                                      );
                                    })}
                                  </span>
                                </label>
                              </div>
                            ) : null}

                            {hasInvalidRange ? (
                              <div className="alarm-condition-warning">
                                <TriangleAlert size={14} />
                                Low limit must be less than high limit.
                              </div>
                            ) : overlappingConditionIds.has(condition.id) ? (
                              <div className="alarm-condition-warning">
                                <TriangleAlert size={14} />
                                Range overlaps another condition using this tag.
                              </div>
                            ) : null}

                          </div>
                          {draft.conditions.length > 1 ? (
                            <IconButton
                              aria-label={`Remove condition ${index + 1}`}
                              onClick={() => removeCondition(condition.id)}
                              title="Remove condition"
                            >
                              <Trash2 size={16} />
                            </IconButton>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                  </div>
                ) : null}
              </div>

            </div>

            {formError ? <div className="form-error">{formError}</div> : null}

            <div className="settings-modal-actions">
              <Button onClick={resetDraft}>
                <RotateCcw size={16} />
                Reset
              </Button>
              <Button onClick={() => setIsRuleModalOpen(false)}>
                Cancel
              </Button>
              <Button className="alarm-save-button" onClick={saveRule}>
                <Save size={16} />
                {editingRuleId ? "Save changes" : "Save rule"}
              </Button>
            </div>
          </section>
        </div>
      ) : null}

      {rulePendingDelete ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setRulePendingDelete(null)}>
          <section
            aria-label="Confirm delete alarm rule"
            aria-modal="true"
            className="settings-modal alarm-delete-modal"
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="settings-modal-header">
              <div className="panel-title">
                <CircleAlert size={17} />
                <h2>Delete alarm rule?</h2>
              </div>
              <IconButton aria-label="Close delete confirmation" onClick={() => setRulePendingDelete(null)}>
                <X size={16} />
              </IconButton>
            </div>
            <p className="alarm-delete-copy">
              Delete the rule for <strong>{pendingDeleteTag?.name ?? "this tag"}</strong>?
            </p>
            <div className="settings-modal-actions">
              <Button onClick={() => setRulePendingDelete(null)}>Cancel</Button>
              <Button
                className="alarm-delete-button"
                onClick={() => {
                  deleteRule(rulePendingDelete.id);
                  setRulePendingDelete(null);
                }}
              >
                <Trash2 size={16} />
                Delete
              </Button>
            </div>
          </section>
        </div>
      ) : null}

      {rules.length ? (
        <section className="alarm-rule-list" aria-label="Saved alarm rules">
          <div className="alarm-rule-list-header">
            <strong>Tag name</strong>
            <strong className="alarm-rule-type">Type</strong>
            <strong className="alarm-rule-condition-count">Conditions</strong>
            <strong>Severity</strong>
            <span aria-hidden="true" />
          </div>
          {rules.map((rule) => {
            const sourceTag = tags.find((tag) => tag.id === rule.conditions[0]?.tagId);
            const typeLabel = rule.conditions[0]?.type === "text" ? "Text match" : "Number / range";
            return (
              <div className="alarm-rule-item" key={rule.id}>
                <div className="alarm-rule-item-copy">
                  <strong>{sourceTag?.name ?? "Unknown tag"}</strong>
                  <span>{rule.warningText}</span>
                </div>
                <span className="alarm-rule-type">{typeLabel}</span>
                <span className="alarm-rule-condition-count">{rule.conditions.length}</span>
                <span className={`alarm-pill alarm-pill-${rule.severity.toLowerCase()}`}>
                  {rule.severity}
                </span>
                <div className="alarm-rule-row-actions">
                  <IconButton
                    aria-label={`Edit rule for ${sourceTag?.name ?? "unknown tag"}`}
                    onClick={() => editRule(rule)}
                    title="Edit rule"
                  >
                    <Pencil size={16} />
                  </IconButton>
                  <IconButton
                    aria-label={`Delete rule for ${sourceTag?.name ?? "unknown tag"}`}
                    onClick={() => setRulePendingDelete(rule)}
                    title="Delete rule"
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </div>
              </div>
            );
          })}
        </section>
      ) : null}

      <div className="alarm-table">
        <div className="alarm-table-row is-head">
          <span>Severity</span>
          <span>Timestamp</span>
          <span>Alarm name</span>
          <span>Status</span>
          <span>Source / Device</span>
          <span>Value</span>
          <span>Condition</span>
          <span>Project</span>
        </div>
        {filteredRows.length === 0 ? (
          <div className="alarm-table-empty">
            <BellRing size={18} />
            <span>{normalizedSearch ? "No alarms match this search." : "No active alarms."}</span>
          </div>
        ) : null}
        {filteredRows.map((row) => {
          const SeverityIcon =
            row.severity === "Info" ? Info : row.severity === "Warning" ? TriangleAlert : CircleAlert;

          return (
            <div
              className={`alarm-table-row alarm-table-row-${row.severity.toLowerCase()}`}
              key={`${row.time}-${row.name}`}
            >
              <span
                aria-label={row.severity}
                className={`alarm-severity-cell alarm-severity-cell-${row.severity.toLowerCase()}`}
                title={row.severity}
              >
                <SeverityIcon size={16} />
              </span>
              <span className="alarm-time">{formatTimestamp(row.time)}</span>
              <strong>{row.message}</strong>
              <span className="alarm-status-pill alarm-status-active">Active</span>
              <span>{row.source}</span>
              <strong>{String(row.value ?? "--")}</strong>
              <span className="alarm-condition-pill" title={row.condition}>{row.condition}</span>
              <span>{activeProject?.name ?? "--"}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
