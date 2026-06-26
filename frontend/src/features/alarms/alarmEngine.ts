import type { TagDefinition } from "../tags";
import type { TagRuntimeValue } from "../tags";
import type { AlarmEventRow, AlarmRule, AlarmRuleCondition } from "./types";

function getNumericValue(runtime?: TagRuntimeValue) {
  if (typeof runtime?.value === "number") {
    return runtime.value;
  }

  if (typeof runtime?.value === "string") {
    const numericValue = Number(runtime.value.trim());
    return Number.isFinite(numericValue) ? numericValue : null;
  }

  return null;
}

function formatValue(value: string | number | boolean | null, unit: string) {
  if (value === null) {
    return "--";
  }

  return `${value}${unit ? ` ${unit}` : ""}`;
}

function getRuntimeDisplayValue(runtime?: TagRuntimeValue) {
  if (!runtime || runtime.value === null || runtime.value === undefined) {
    return null;
  }

  return runtime.value;
}

function evaluateCondition(
  condition: AlarmRuleCondition,
  tags: TagDefinition[],
  runtimeByTopicPath: Record<string, TagRuntimeValue>,
) {
  const tag = tags.find((candidate) => candidate.id === condition.tagId);
  const runtime = tag ? runtimeByTopicPath[tag.topicPath] : undefined;

  if (!tag || !runtime) {
    return {
      active: false,
      conditionText: "Tag waiting for runtime value",
      source: tag?.topicPath ?? "--",
      time: undefined,
      value: null,
    };
  }

  if (condition.type === "number") {
    const numericValue = getNumericValue(runtime);
    const minValue = condition.min.trim() ? Number(condition.min) : null;
    const maxValue = condition.max.trim() ? Number(condition.max) : null;
    const lowerActive = minValue !== null && Number.isFinite(minValue) && numericValue !== null && numericValue < minValue;
    const upperActive = maxValue !== null && Number.isFinite(maxValue) && numericValue !== null && numericValue > maxValue;
    const conditionParts = [
      minValue !== null && Number.isFinite(minValue) ? `min ${minValue}` : "",
      maxValue !== null && Number.isFinite(maxValue) ? `max ${maxValue}` : "",
    ].filter(Boolean);

    return {
      active: lowerActive || upperActive,
      conditionText: `${tag.name} outside ${conditionParts.join(" / ") || "range"}`,
      source: tag.topicPath,
      time: runtime.receivedAt,
      value: formatValue(getRuntimeDisplayValue(runtime), tag.unit),
    };
  }

  const expectedText = condition.text.trim();
  const runtimeText = String(runtime.value ?? "");

  return {
    active: expectedText ? runtimeText.includes(expectedText) : false,
    conditionText: `${tag.name} contains "${expectedText}"`,
    source: tag.topicPath,
    time: runtime.receivedAt,
    value: formatValue(getRuntimeDisplayValue(runtime), tag.unit),
  };
}

export function evaluateAlarmEvents(
  rules: AlarmRule[],
  tags: TagDefinition[],
  runtimeByTopicPath: Record<string, TagRuntimeValue>,
) {
  const events: AlarmEventRow[] = [];

  rules.forEach((rule, ruleIndex) => {
    const conditionResults = rule.conditions.map((condition) => evaluateCondition(condition, tags, runtimeByTopicPath));

    if (!conditionResults.length) {
      return;
    }

    const isActive = conditionResults.reduce((currentResult, conditionResult, index) => {
      if (index === 0) {
        return conditionResult.active;
      }

      const combinator = rule.conditions[index].combinator;
      return combinator === "and" ? currentResult && conditionResult.active : currentResult || conditionResult.active;
    }, conditionResults[0].active);

    if (!isActive) {
      return;
    }

    const activeResult = conditionResults.find((result) => result.active) ?? conditionResults[0];

    events.push({
      condition: conditionResults.map((result, index) => {
        const prefix = index === 0 ? "" : `${rule.conditions[index].combinator.toUpperCase()} `;
        return `${prefix}${result.conditionText}`;
      }).join(" "),
      message: rule.warningText,
      name: `Alarm Rule ${ruleIndex + 1}`,
      severity: rule.severity,
      source: activeResult.source,
      time: activeResult.time,
      value: activeResult.value,
    });
  });

  return events;
}
