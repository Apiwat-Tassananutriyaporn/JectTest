import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  getBrowserLocalStorage,
  localPersistenceKeys,
  localPersistenceVersion,
} from "../../../services/persistence";
import type { AlarmRule } from "../types";

type AlarmRuleState = {
  addRule: (rule: AlarmRule) => void;
  deleteRule: (ruleId: string) => void;
  rules: AlarmRule[];
};

export const useAlarmRuleStore = create<AlarmRuleState>()(
  persist(
    (set) => ({
      addRule: (rule) =>
        set((state) => ({
          rules: [rule, ...state.rules],
        })),
      deleteRule: (ruleId) =>
        set((state) => ({
          rules: state.rules.filter((rule) => rule.id !== ruleId),
        })),
      rules: [],
    }),
    {
      name: localPersistenceKeys.alarmRuleStore,
      partialize: (state) => ({
        rules: state.rules,
      }),
      storage: createJSONStorage(getBrowserLocalStorage),
      version: localPersistenceVersion,
    },
  ),
);
