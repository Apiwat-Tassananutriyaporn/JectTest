import type { SceneObjectKind, SceneObjectModel, SceneToolboxItem, SceneToolboxItemKind } from "./types";

let sceneObjectCounter = 3;

function createSceneObjectId(kind: SceneObjectKind) {
  sceneObjectCounter += 1;
  return `obj-${kind}-${sceneObjectCounter}`;
}

export function cloneSceneObject(source: SceneObjectModel, offset = 24): SceneObjectModel {
  return {
    ...source,
    id: createSceneObjectId(source.kind),
    x: source.x + offset,
    y: source.y + offset,
  };
}

export const sceneObjectsSeed: SceneObjectModel[] = [
  {
    action: "rotate",
    height: 36,
    id: "obj-pump-a1",
    inputValue: "",
    kind: "pump",
    label: "Pump A1",
    status: "selected",
    tag: "motor/run",
    valueText: "Pump A1",
    width: 112,
    x: 260,
    y: 210,
  },
  {
    action: "display",
    height: 36,
    id: "obj-temp-output",
    inputValue: "",
    kind: "text-output",
    label: "Temperature",
    status: "info",
    tag: "sensor/temp",
    valueText: "Temp: 42.8 C",
    width: 108,
    x: 360,
    y: 160,
  },
  {
    action: "toggle",
    height: 36,
    id: "obj-motor-switch",
    inputValue: "",
    kind: "switch",
    label: "Motor",
    status: "online",
    tag: "motor/run",
    valueText: "Motor: ON",
    width: 102,
    x: 335,
    y: 285,
  },
  {
    action: "publish",
    height: 36,
    id: "obj-speed-setpoint",
    inputValue: "1450",
    kind: "text-input",
    label: "Speed Setpoint",
    status: "info",
    tag: "motor/speed/setpoint",
    valueText: "Setpoint: 1450 rpm",
    width: 148,
    x: 470,
    y: 245,
  },
];

export const sceneToolboxItems: SceneToolboxItem[] = [
  {
    description: "Realtime model state placeholder",
    kind: "pump",
    label: "Pump",
  },
  {
    description: "Subscribe and display raw tag value",
    kind: "text-output",
    label: "Text Output",
  },
  {
    description: "Publish a raw value to a bound tag",
    kind: "text-input",
    label: "Text Input",
  },
  {
    description: "Toggle publish state from scene",
    kind: "switch",
    label: "Switch",
  },
];

export function createSceneObjectFromTool(kind: SceneToolboxItemKind, x: number, y: number): SceneObjectModel {
  const id = createSceneObjectId(kind);

  if (kind === "text-output") {
    return {
      action: "display",
      height: 36,
      id,
      inputValue: "",
      kind,
      label: "Text Output",
      status: "info",
      tag: "sensor/temp",
      valueText: "Value: 0",
      width: 112,
      x,
      y,
    };
  }

  if (kind === "text-input") {
    return {
      action: "publish",
      height: 36,
      id,
      inputValue: "1000",
      kind,
      label: "Text Input",
      status: "info",
      tag: "motor/speed/setpoint",
      valueText: "Value: 1000 rpm",
      width: 144,
      x,
      y,
    };
  }

  if (kind === "switch") {
    return {
      action: "toggle",
      height: 36,
      id,
      inputValue: "",
      kind,
      label: "Switch",
      status: "online",
      tag: "motor/run",
      valueText: "Switch: OFF",
      width: 108,
      x,
      y,
    };
  }

  return {
    action: "rotate",
    height: 36,
    id,
    inputValue: "",
    kind,
    label: "Pump",
    status: "selected",
    tag: "motor/run",
    valueText: "Pump",
    width: 108,
    x,
    y,
  };
}
