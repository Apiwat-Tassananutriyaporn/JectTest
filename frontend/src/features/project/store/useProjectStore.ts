import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  getBrowserLocalStorage,
  localPersistenceKeys,
  localPersistenceVersion,
} from "../../../services/persistence";
import { tagSeed } from "../../tags";
import { defaultMqttConnection, projectSeed } from "../constants";
import type { MqttConnectionConfig, ProjectSummary, ProjectType, TagDefinition } from "../types";

type ProjectState = {
  activeProject: ProjectSummary | null;
  createProject: (name: string, type: ProjectType) => void;
  openProject: (projectId: string) => void;
  projects: ProjectSummary[];
  updateActiveProject: (patch: Pick<ProjectSummary, "name" | "type"> & {
    mqttConnection: MqttConnectionConfig | null;
    tags: TagDefinition[];
  }) => void;
};

function createProjectId(name: string) {
  return `project-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "untitled"}-${Date.now()}`;
}

function formatDateTime(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hour}:${minute}`;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      activeProject: null,
      createProject: (name, type) =>
        set((state) => {
          const nextProject = {
            id: createProjectId(name),
            mqttConnection: type === "mqtt_client" ? { ...defaultMqttConnection, id: `mqtt-${Date.now()}` } : null,
            name: name.trim(),
            tags: tagSeed,
            type,
            updatedAt: formatDateTime(new Date()),
          };

          return {
            activeProject: nextProject,
            projects: [nextProject, ...state.projects],
          };
        }),
      openProject: (projectId) =>
        set((state) => ({
          activeProject: state.projects.find((project) => project.id === projectId) ?? state.activeProject,
        })),
      projects: projectSeed,
      updateActiveProject: (patch) =>
        set((state) => {
          if (!state.activeProject) {
            return state;
          }

          const updatedProject = {
            ...state.activeProject,
            ...patch,
            name: patch.name.trim(),
            updatedAt: formatDateTime(new Date()),
          };

          return {
            activeProject: updatedProject,
            projects: state.projects.map((project) =>
              project.id === updatedProject.id ? updatedProject : project,
            ),
          };
        }),
    }),
    {
      name: localPersistenceKeys.projectStore,
      partialize: (state) => ({
        activeProject: state.activeProject,
        projects: state.projects,
      }),
      storage: createJSONStorage(getBrowserLocalStorage),
      version: localPersistenceVersion,
    },
  ),
);
