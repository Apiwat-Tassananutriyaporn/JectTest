export type AlarmConditionType = "" | "number" | "text";
export type AlarmSeverity = "Critical" | "Info" | "Warning";

export type AlarmRuleCondition = {
  id: string;
  max: string;
  min: string;
  severity?: AlarmSeverity;
  tagId: string;
  text: string;
  type: AlarmConditionType;
  warningText?: string;
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
