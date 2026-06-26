export const localPersistenceVersion = 1;

export const localPersistenceKeys = {
  alarmRuleStore: "scada-platform.alarm-rule-store",
  projectStore: "scada-platform.project-store",
  sceneEditorStore: "scada-platform.scene-editor-store",
} as const;

export function getBrowserLocalStorage() {
  return localStorage;
}
