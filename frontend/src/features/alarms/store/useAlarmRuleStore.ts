import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  getBrowserLocalStorage,
  localPersistenceKeys,
  localPersistenceVersion,
} from "../../../services/persistence";
import type { AlarmRule } from "../types";

type AlarmRuleState = {
  deleteRule: (ruleId: string) => void;
  rules: AlarmRule[];
  saveRuleForSource: (rule: AlarmRule) => void;
};

export const useAlarmRuleStore = create<AlarmRuleState>()(
  persist(
    (set) => ({
      deleteRule: (ruleId) =>
        set((state) => ({
          rules: state.rules.filter((rule) => rule.id !== ruleId),
        })),
      rules: [],
      saveRuleForSource: (rule) =>
        set((state) => {
          const source = rule.conditions[0];
          const otherRules = state.rules.filter((candidate) => {
            if (!source || !candidate.conditions.length) {
              return true;
            }

            return !candidate.conditions.every(
              (condition) => condition.tagId === source.tagId && condition.type === source.type,
            );
          });

          return { rules: [rule, ...otherRules] };
        }),
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
