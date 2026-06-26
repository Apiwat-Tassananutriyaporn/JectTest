import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  getBrowserLocalStorage,
  localPersistenceKeys,
  localPersistenceVersion,
} from "../../../services/persistence";
import { cloneSceneObject, createSceneObjectFromTool, sceneObjectsSeed } from "../constants";
import type { SceneObjectModel, SceneTool, SceneToolboxItemKind } from "../types";

type SceneEditorState = {
  activeTool: SceneTool;
  addObjectFromTool: (kind: SceneToolboxItemKind, x: number, y: number) => void;
  deselectObject: () => void;
  deleteObject: (objectId: string) => void;
  duplicateObject: (objectId: string) => void;
  pasteObject: (source: SceneObjectModel) => void;
  sceneObjects: SceneObjectModel[];
  selectedObjectId: string | null;
  selectObject: (objectId: string) => void;
  setActiveTool: (tool: SceneTool) => void;
  updateObject: (objectId: string, patch: Partial<SceneObjectModel>) => void;
};

function clampSize(value: number) {
  return Math.max(72, Math.round(value));
}

export const useSceneEditorStore = create<SceneEditorState>()(
  persist(
    (set) => ({
      activeTool: "select",
      addObjectFromTool: (kind, x, y) =>
        set((state) => {
          const nextObject = createSceneObjectFromTool(kind, x, y);
          return {
            sceneObjects: [...state.sceneObjects, nextObject],
            selectedObjectId: nextObject.id,
          };
        }),
      deselectObject: () => set({ selectedObjectId: null }),
      deleteObject: (objectId) =>
        set((state) => {
          const nextSceneObjects = state.sceneObjects.filter((object) => object.id !== objectId);

          return {
            sceneObjects: nextSceneObjects,
            selectedObjectId:
              state.selectedObjectId === objectId ? nextSceneObjects[0]?.id ?? null : state.selectedObjectId,
          };
        }),
      duplicateObject: (objectId) =>
        set((state) => {
          const sourceObject = state.sceneObjects.find((object) => object.id === objectId);

          if (!sourceObject) {
            return state;
          }

          const nextObject = cloneSceneObject(sourceObject);

          return {
            sceneObjects: [...state.sceneObjects, nextObject],
            selectedObjectId: nextObject.id,
          };
        }),
      sceneObjects: sceneObjectsSeed,
      selectedObjectId: sceneObjectsSeed[0]?.id ?? null,
      selectObject: (objectId) => set({ selectedObjectId: objectId }),
      setActiveTool: (tool) => set({ activeTool: tool }),
      pasteObject: (source) =>
        set((state) => {
          const nextObject = cloneSceneObject(source);

          return {
            sceneObjects: [...state.sceneObjects, nextObject],
            selectedObjectId: nextObject.id,
          };
        }),
      updateObject: (objectId, patch) =>
        set((state) => ({
          sceneObjects: state.sceneObjects.map((object) =>
            object.id === objectId
              ? {
                  ...object,
                  ...patch,
                  height: patch.height === undefined ? object.height : clampSize(patch.height),
                  width: patch.width === undefined ? object.width : clampSize(patch.width),
                  x: patch.x === undefined ? object.x : Math.max(16, Math.round(patch.x)),
                  y: patch.y === undefined ? object.y : Math.max(16, Math.round(patch.y)),
                }
              : object,
          ),
        })),
    }),
    {
      name: localPersistenceKeys.sceneEditorStore,
      partialize: (state) => ({
        sceneObjects: state.sceneObjects,
      }),
      storage: createJSONStorage(getBrowserLocalStorage),
      version: localPersistenceVersion,
    },
  ),
);
