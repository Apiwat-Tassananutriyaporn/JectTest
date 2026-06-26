export type AlarmConditionType = "number" | "text";
export type AlarmConditionCombinator = "and" | "or";
export type AlarmSeverity = "Critical" | "Info" | "Warning";

export type AlarmRuleCondition = {
  combinator: AlarmConditionCombinator;
  id: string;
  max: string;
  min: string;
  tagId: string;
  text: string;
  type: AlarmConditionType;
};

export type AlarmRule = {
  conditions: AlarmRuleCondition[];
  createdAt: string;
  id: string;
  severity: AlarmSeverity;
  warningText: string;
};

export type AlarmEventRow = {
  condition: string;
  message: string;
  name: string;
  severity: AlarmSeverity;
  source: string;
  time: string | undefined;
  value: string | number | boolean | null;
};
