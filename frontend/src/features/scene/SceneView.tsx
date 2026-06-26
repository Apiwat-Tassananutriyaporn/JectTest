import { useEffect, useMemo, useRef, useState } from "react";
import { useProjectStore } from "../project";
import { useTagRuntimeStore } from "../tags";
import { EditorLayout } from "../../layouts/EditorLayout";
import { useSceneEditorStore } from "./store/useSceneEditorStore";
import type { SceneObjectModel, SceneToolboxItemKind } from "./types";

export function SceneView() {
  const activeProject = useProjectStore((state) => state.activeProject);
  const addObjectFromTool = useSceneEditorStore((state) => state.addObjectFromTool);
  const deselectObject = useSceneEditorStore((state) => state.deselectObject);
  const deleteObject = useSceneEditorStore((state) => state.deleteObject);
  const pasteObject = useSceneEditorStore((state) => state.pasteObject);
  const sceneObjects = useSceneEditorStore((state) => state.sceneObjects);
  const selectedObjectId = useSceneEditorStore((state) => state.selectedObjectId);
  const selectObject = useSceneEditorStore((state) => state.selectObject);
  const updateObject = useSceneEditorStore((state) => state.updateObject);
  const connectionStatus = useTagRuntimeStore((state) => state.connectionStatus);
  const publishTagValue = useTagRuntimeStore((state) => state.publishTagValue);
  const runtimeByTopicPath = useTagRuntimeStore((state) => state.runtimeByTopicPath);
  const [isDropTarget, setIsDropTarget] = useState(false);
  const [hasClipboardObject, setHasClipboardObject] = useState(false);
  const [publishFeedback, setPublishFeedback] = useState<{ message: string; tone: "connected" | "error" } | null>(null);

  const interactionRef = useRef<{
    mode: "move" | "resize";
    objectId: string;
    originHeight: number;
    originWidth: number;
    originX: number;
    originY: number;
    pointerId: number;
    startClientX: number;
    startClientY: number;
  } | null>(null);
  const clipboardRef = useRef<SceneObjectModel | null>(null);

  const selectedObject = useMemo(
    () => sceneObjects.find((object) => object.id === selectedObjectId) ?? null,
    [sceneObjects, selectedObjectId],
  );
  const runtimeSceneObjects = useMemo(
    () =>
      sceneObjects.map((object): SceneObjectModel => {
        const runtime = runtimeByTopicPath[object.tag];

        if (!runtime) {
          return object;
        }

        if (object.kind === "pump") {
          const isRunning = String(runtime.value).toUpperCase() === "ON";
          return {
            ...object,
            status: isRunning ? "online" : "info",
            valueText: `${object.label}: ${isRunning ? "Running" : "Stopped"}`,
          };
        }

        if (object.kind === "switch") {
          const isOn = String(runtime.value).toUpperCase() === "ON";
          return {
            ...object,
            status: isOn ? "online" : "info",
            valueText: `${object.label}: ${isOn ? "ON" : "OFF"}`,
          };
        }

        if (object.kind === "text-input") {
          const tagUnit = activeProject?.tags.find((tag) => tag.topicPath === object.tag)?.unit;
          const formattedValue = runtime.value === null ? "--" : String(runtime.value);
          return {
            ...object,
            status: runtime.status === "fresh" ? "online" : "info",
            valueText: `${object.label}: ${formattedValue}${tagUnit ? ` ${tagUnit}` : ""}`,
          };
        }

        const tagUnit = activeProject?.tags.find((tag) => tag.topicPath === object.tag)?.unit;
        const formattedValue = runtime.value === null ? "--" : String(runtime.value);
        return {
          ...object,
          status: runtime.status === "fresh" ? "online" : "info",
          valueText: `${object.label}: ${formattedValue}${tagUnit ? ` ${tagUnit}` : ""}`,
        };
      }),
    [activeProject?.tags, runtimeByTopicPath, sceneObjects],
  );

  const copySelectedObject = () => {
    if (!selectedObject) {
      return;
    }

    clipboardRef.current = { ...selectedObject };
    setHasClipboardObject(true);
  };

  const pasteCopiedObject = () => {
    if (!clipboardRef.current) {
      return;
    }

    pasteObject(clipboardRef.current);
  };

  const deleteSelectedObject = () => {
    if (!selectedObject) {
      return;
    }

    deleteObject(selectedObject.id);
  };

  useEffect(() => {
    if (!publishFeedback) {
      return;
    }

    const timer = window.setTimeout(() => {
      setPublishFeedback(null);
    }, 2400);

    return () => {
      window.clearTimeout(timer);
    };
  }, [publishFeedback]);

  useEffect(() => {
    const isEditableTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) {
        return false;
      }

      return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) {
        return;
      }

      const isModifierKey = event.ctrlKey || event.metaKey;

      if (event.key === "Escape") {
        deselectObject();
        return;
      }

      if (!selectedObject && !clipboardRef.current) {
        return;
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        if (!selectedObject) {
          return;
        }

        event.preventDefault();
        deleteSelectedObject();
        return;
      }

      if (isModifierKey && event.key.toLowerCase() === "c") {
        if (!selectedObject) {
          return;
        }

        event.preventDefault();
        copySelectedObject();
        return;
      }

      if (isModifierKey && event.key.toLowerCase() === "v") {
        if (!clipboardRef.current) {
          return;
        }

        event.preventDefault();
        pasteCopiedObject();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [deselectObject, selectedObject]);

  const handleFieldChange = (object: SceneObjectModel, patch: Partial<SceneObjectModel>) => {
    updateObject(object.id, patch);
  };

  const handleSwitchToggle = (object: SceneObjectModel) => {
    if (object.kind !== "switch") {
      return;
    }

    const boundTag = activeProject?.tags.find((tag) => tag.topicPath === object.tag);

    if (!boundTag) {
      setPublishFeedback({
        message: "Cannot publish because the switch is not bound to a valid tag.",
        tone: "error",
      });
      return;
    }

    if (boundTag.mode !== "publish" && boundTag.mode !== "pubsub") {
      setPublishFeedback({
        message: `Tag ${boundTag.name} does not allow publish control.`,
        tone: "error",
      });
      return;
    }

    if (activeProject?.type === "mqtt_client" && connectionStatus !== "connected") {
      setPublishFeedback({
        message: "MQTT is not connected yet. Wait for the connection before toggling the switch.",
        tone: "error",
      });
      return;
    }

    const currentValue = String(runtimeByTopicPath[boundTag.topicPath]?.value ?? "OFF").toUpperCase();
    const nextValue = currentValue === "ON" ? "OFF" : "ON";

    publishTagValue(boundTag.topicPath, nextValue);
    setPublishFeedback({
      message: `Published ${nextValue} to ${boundTag.topicPath}.`,
      tone: "connected",
    });
  };

  const handleTextInputPublish = (object: SceneObjectModel) => {
    if (object.kind !== "text-input") {
      return;
    }

    const boundTag = activeProject?.tags.find((tag) => tag.topicPath === object.tag);

    if (!boundTag) {
      setPublishFeedback({
        message: "Cannot publish because the text input is not bound to a valid tag.",
        tone: "error",
      });
      return;
    }

    if (boundTag.mode !== "publish" && boundTag.mode !== "pubsub") {
      setPublishFeedback({
        message: `Tag ${boundTag.name} does not allow publish control.`,
        tone: "error",
      });
      return;
    }

    if (!object.inputValue.trim()) {
      setPublishFeedback({
        message: "Input value is required before sending.",
        tone: "error",
      });
      return;
    }

    if (activeProject?.type === "mqtt_client" && connectionStatus !== "connected") {
      setPublishFeedback({
        message: "MQTT is not connected yet. Wait for the connection before sending a value.",
        tone: "error",
      });
      return;
    }

    const numericValue = Number(object.inputValue);
    const nextValue = Number.isFinite(numericValue) ? numericValue : object.inputValue.trim();

    publishTagValue(boundTag.topicPath, nextValue);
    setPublishFeedback({
      message: `Published ${nextValue} to ${boundTag.topicPath}.`,
      tone: "connected",
    });
  };

  const stopInteraction = (pointerId?: number) => {
    if (!interactionRef.current) {
      return;
    }

    if (pointerId !== undefined && interactionRef.current.pointerId !== pointerId) {
      return;
    }

    interactionRef.current = null;
  };

  return (
    <EditorLayout
      canDeleteSelectedObject={Boolean(selectedObject)}
      canCopySelectedObject={Boolean(selectedObject)}
      canPasteObject={hasClipboardObject}
      onCopySelectedObject={copySelectedObject}
      onBackgroundPointerDown={deselectObject}
      onDeleteSelectedObject={deleteSelectedObject}
      onSceneDragLeave={() => setIsDropTarget(false)}
      onSceneDragOver={(event) => {
        const toolKind = event.dataTransfer.types.includes("application/x-scada-tool");

        if (!toolKind) {
          return;
        }

        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
        setIsDropTarget(true);
      }}
      onSceneDrop={(event) => {
        const toolKind = event.dataTransfer.getData("application/x-scada-tool") as SceneToolboxItemKind;

        if (!toolKind) {
          return;
        }

        event.preventDefault();
        setIsDropTarget(false);

        const sceneBounds = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - sceneBounds.left - 56;
        const y = event.clientY - sceneBounds.top - 18;

        addObjectFromTool(toolKind, x, y);
      }}
      onObjectFieldChange={handleFieldChange}
      onObjectPointerDown={(event, object) => {
        event.stopPropagation();
        selectObject(object.id);

        interactionRef.current = {
          mode: "move",
          objectId: object.id,
          originHeight: object.height,
          originWidth: object.width,
          originX: object.x,
          originY: object.y,
          pointerId: event.pointerId,
          startClientX: event.clientX,
          startClientY: event.clientY,
        };

        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onObjectPointerMove={(event, object) => {
        const interaction = interactionRef.current;

        if (!interaction || interaction.objectId !== object.id || interaction.pointerId !== event.pointerId) {
          return;
        }

        const deltaX = event.clientX - interaction.startClientX;
        const deltaY = event.clientY - interaction.startClientY;

        if (interaction.mode === "move") {
          updateObject(object.id, {
            x: interaction.originX + deltaX,
            y: interaction.originY + deltaY,
          });
          return;
        }

        updateObject(object.id, {
          height: interaction.originHeight + deltaY,
          width: interaction.originWidth + deltaX,
        });
      }}
      onObjectPointerUp={(event) => {
        stopInteraction(event.pointerId);
      }}
      onResizeHandlePointerDown={(event, object) => {
        event.stopPropagation();
        selectObject(object.id);

        interactionRef.current = {
          mode: "resize",
          objectId: object.id,
          originHeight: object.height,
          originWidth: object.width,
          originX: object.x,
          originY: object.y,
          pointerId: event.pointerId,
          startClientX: event.clientX,
          startClientY: event.clientY,
        };

        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onSwitchToggle={handleSwitchToggle}
      onTextInputPublish={handleTextInputPublish}
      publishFeedback={publishFeedback}
      isDropTarget={isDropTarget}
      onPasteObject={pasteCopiedObject}
      runtimeByTopicPath={runtimeByTopicPath}
      sceneObjects={runtimeSceneObjects}
      selectedObject={selectedObject}
      tags={activeProject?.tags ?? []}
    />
  );
}
