import { BellRing, Clock3, Plus, Trash2, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { Button, SelectField, TextField } from "../../shared/ui";
import { useProjectStore } from "../project";
import { useTagRuntimeStore } from "../tags";
import { evaluateAlarmEvents } from "./alarmEngine";
import { useAlarmRuleStore } from "./store/useAlarmRuleStore";
import type { AlarmConditionType, AlarmRule, AlarmRuleCondition, AlarmSeverity } from "./types";

type AlarmRuleDraft = {
  conditions: AlarmRuleCondition[];
  severity: AlarmSeverity;
  warningText: string;
};

function createCondition(combinator: AlarmRuleCondition["combinator"] = "and"): AlarmRuleCondition {
  return {
    combinator,
    id: `condition-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    max: "",
    min: "",
    tagId: "",
    text: "",
    type: "number",
  };
}

function createRuleId() {
  return `alarm-rule-${Date.now()}`;
}

function formatTime(isoDate?: string) {
  if (!isoDate) {
    return "--:--:--";
  }

  return new Date(isoDate).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function AlarmLogView() {
  const activeProject = useProjectStore((state) => state.activeProject);
  const addRule = useAlarmRuleStore((state) => state.addRule);
  const connectionStatus = useTagRuntimeStore((state) => state.connectionStatus);
  const deleteRule = useAlarmRuleStore((state) => state.deleteRule);
  const rules = useAlarmRuleStore((state) => state.rules);
  const runtimeByTopicPath = useTagRuntimeStore((state) => state.runtimeByTopicPath);
  const [draft, setDraft] = useState<AlarmRuleDraft>({
    conditions: [createCondition()],
    severity: "Warning",
    warningText: "",
  });
  const [formError, setFormError] = useState("");
  const tags = activeProject?.tags ?? [];
  const rows = evaluateAlarmEvents(rules, tags, runtimeByTopicPath);

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

  const updateCondition = (conditionId: string, patch: Partial<AlarmRuleCondition>) => {
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
      conditions: [...current.conditions, createCondition("and")],
    }));
  };

  const removeCondition = (conditionId: string) => {
    setDraft((current) => ({
      ...current,
      conditions: current.conditions.filter((condition) => condition.id !== conditionId),
    }));
  };

  const resetDraft = () => {
    setDraft({
      conditions: [createCondition()],
      severity: "Warning",
      warningText: "",
    });
    setFormError("");
  };

  const saveRule = () => {
    const trimmedWarningText = draft.warningText.trim();
    const validConditions = draft.conditions.filter((condition) => condition.tagId);

    if (!validConditions.length) {
      setFormError("Select at least one tag before saving an alarm rule.");
      return;
    }

    const invalidCondition = validConditions.find((condition) => {
      if (condition.type === "number") {
        return !condition.min.trim() && !condition.max.trim();
      }

      return !condition.text.trim();
    });

    if (invalidCondition) {
      setFormError("Number conditions need min or max. Text conditions need match text.");
      return;
    }

    if (!trimmedWarningText) {
      setFormError("Warning text is required.");
      return;
    }

    const rule: AlarmRule = {
      conditions: validConditions,
      createdAt: new Date().toISOString(),
      id: createRuleId(),
      severity: draft.severity,
      warningText: trimmedWarningText,
    };

    addRule(rule);
    resetDraft();
  };

  return (
    <section className="surface-view" aria-label="Alarm log">
      <div className="surface-header">
        <div>
          <h2>Active and Recent Events</h2>
          <p>Severity, source condition, and latest operational changes.</p>
        </div>
        <div className="surface-stat">
          <BellRing size={16} />
          {rows.length} events
        </div>
      </div>

      <section className="alarm-rule-builder" aria-label="Alarm rule builder">
        <div className="surface-header">
          <div>
            <h2>Alarm Rule</h2>
            <p>Select a tag first. Condition inputs appear only after a tag is selected.</p>
          </div>
          <Button onClick={saveRule}>
            <Plus size={16} />
            Add Rule
          </Button>
        </div>

        <div className="alarm-rule-conditions">
          {draft.conditions.map((condition, index) => {
            const selectedTag = tags.find((tag) => tag.id === condition.tagId);

            return (
              <div className="alarm-rule-condition" key={condition.id}>
                {index > 0 ? (
                  <SelectField
                    label="Join"
                    onChange={(event) =>
                      updateCondition(condition.id, { combinator: event.target.value as AlarmRuleCondition["combinator"] })
                    }
                    value={condition.combinator}
                  >
                    <option value="and">AND</option>
                    <option value="or">OR</option>
                  </SelectField>
                ) : null}

                <SelectField
                  label="Tag"
                  onChange={(event) => updateCondition(condition.id, { tagId: event.target.value })}
                  value={condition.tagId}
                >
                  <option value="">Select tag</option>
                  {tags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name} ({tag.topicPath})
                    </option>
                  ))}
                </SelectField>

                {selectedTag ? (
                  <>
                    <SelectField
                      label="Type"
                      onChange={(event) =>
                        updateCondition(condition.id, { type: event.target.value as AlarmConditionType })
                      }
                      value={condition.type}
                    >
                      <option value="number">number</option>
                      <option value="text">text</option>
                    </SelectField>

                    {condition.type === "number" ? (
                      <>
                        <TextField
                          label="Min"
                          onChange={(event) => updateCondition(condition.id, { min: event.target.value })}
                          placeholder="Optional"
                          type="number"
                          value={condition.min}
                        />
                        <TextField
                          label="Max"
                          onChange={(event) => updateCondition(condition.id, { max: event.target.value })}
                          placeholder="Optional"
                          type="number"
                          value={condition.max}
                        />
                      </>
                    ) : (
                      <TextField
                        label="Match Text"
                        onChange={(event) => updateCondition(condition.id, { text: event.target.value })}
                        placeholder="OFF, ERROR, RUN"
                        value={condition.text}
                      />
                    )}

                    {index > 0 ? (
                      <Button onClick={() => removeCondition(condition.id)}>
                        <Trash2 size={16} />
                        Remove
                      </Button>
                    ) : null}
                  </>
                ) : null}
              </div>
            );
          })}
        </div>

        {draft.conditions[0]?.tagId ? (
          <>
            <div className="alarm-rule-footer">
              <TextField
                label="Warning Text"
                onChange={(event) => setDraft((current) => ({ ...current, warningText: event.target.value }))}
                placeholder="Temperature is too high"
                value={draft.warningText}
              />
              <SelectField
                label="Severity"
                onChange={(event) => setDraft((current) => ({ ...current, severity: event.target.value as AlarmSeverity }))}
                value={draft.severity}
              >
                <option value="Info">Info</option>
                <option value="Warning">Warning</option>
                <option value="Critical">Critical</option>
              </SelectField>
            </div>
            <div className="alarm-rule-actions">
              <Button onClick={addCondition}>
                <Plus size={16} />
                Add Condition
              </Button>
              <Button onClick={resetDraft}>
                Reset
              </Button>
            </div>
          </>
        ) : null}

        {formError ? <div className="form-error">{formError}</div> : null}
      </section>

      {rules.length ? (
        <section className="alarm-rule-list" aria-label="Saved alarm rules">
          {rules.map((rule, index) => (
            <div className="alarm-rule-item" key={rule.id}>
              <div>
                <strong>Rule {rules.length - index}</strong>
                <span>{rule.warningText}</span>
                <small>{rule.conditions.length} condition{rule.conditions.length === 1 ? "" : "s"} / {rule.severity}</small>
              </div>
              <Button onClick={() => deleteRule(rule.id)}>
                <Trash2 size={16} />
                Delete
              </Button>
            </div>
          ))}
        </section>
      ) : null}

      <div className="alarm-table">
        <div className="alarm-table-row is-head">
          <span>Time</span>
          <span>Name</span>
          <span>Condition</span>
          <span>Warning Text</span>
          <span>Severity</span>
        </div>
        {rows.length === 0 ? (
          <div className="alarm-table-row">
            <span className="alarm-cell alarm-time">
              <Clock3 size={14} />
              --
            </span>
            <span>No active events</span>
            <span>Realtime tag runtime is within the current alarm thresholds.</span>
            <span>No warning text</span>
            <span className="alarm-pill alarm-pill-info">
              <TriangleAlert size={14} />
              Info
            </span>
          </div>
        ) : null}
        {rows.map((row) => (
          <div className="alarm-table-row" key={`${row.time}-${row.name}`}>
            <span className="alarm-cell alarm-time">
              <Clock3 size={14} />
              {formatTime(row.time)}
            </span>
            <span>{row.name}</span>
            <span title={`${row.message} Source: ${row.source}. Value: ${row.value}`}>
              {row.condition}
            </span>
            <span>{row.message}</span>
            <span className={`alarm-pill alarm-pill-${row.severity.toLowerCase()}`}>
              <TriangleAlert size={14} />
              {row.severity}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
