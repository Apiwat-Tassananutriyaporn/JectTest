export type SceneTool = "select" | "move" | "resize";

export type SceneObjectKind = "pump" | "text-output" | "text-input" | "switch";
export type SceneToolboxItemKind = SceneObjectKind;

export type SceneObjectStatus = "info" | "online" | "selected";

export type SceneObjectModel = {
  action: string;
  id: string;
  inputValue: string;
  kind: SceneObjectKind;
  label: string;
  tag: string;
  valueText: string;
  x: number;
  y: number;
  width: number;
  height: number;
  status: SceneObjectStatus;
};

export type SceneToolboxItem = {
  description: string;
  kind: SceneToolboxItemKind;
  label: string;
};
