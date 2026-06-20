import { Activity, ClipboardPaste, Copy, MoveDiagonal, PanelRight, Power, SendHorizontal, Trash2 } from "lucide-react";
import { Button, Panel, SelectField, TextField } from "../shared/ui";
import type { SceneObjectModel, SceneTool } from "../features/scene/types";
import type { TagDefinition } from "../features/project";
import type { TagRuntimeValue } from "../features/tags";

type PublishFeedback = {
  message: string;
  tone: "connected" | "error";
};

type EditorLayoutProps = {
  activeTool: SceneTool;
  canDeleteSelectedObject: boolean;
  canCopySelectedObject: boolean;
  canPasteObject: boolean;
  onCopySelectedObject: () => void;
  isDropTarget: boolean;
  onDeleteSelectedObject: () => void;
  onBackgroundPointerDown: () => void;
  onChangeTool: (tool: SceneTool) => void;
  onPasteObject: () => void;
  onObjectFieldChange: (object: SceneObjectModel, patch: Partial<SceneObjectModel>) => void;
  onSceneDragLeave: () => void;
  onSceneDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onSceneDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onObjectPointerDown: (event: React.PointerEvent<HTMLDivElement>, object: SceneObjectModel) => void;
  onObjectPointerMove: (event: React.PointerEvent<HTMLDivElement>, object: SceneObjectModel) => void;
  onObjectPointerUp: (event: React.PointerEvent<HTMLDivElement>) => void;
  onResizeHandlePointerDown: (event: React.PointerEvent<HTMLButtonElement>, object: SceneObjectModel) => void;
  onSwitchToggle: (object: SceneObjectModel) => void;
  onTextInputPublish: (object: SceneObjectModel) => void;
  publishFeedback: PublishFeedback | null;
  runtimeByTopicPath: Record<string, TagRuntimeValue>;
  sceneObjects: SceneObjectModel[];
  selectedObject: SceneObjectModel | null;
  tags: TagDefinition[];
};

function getSceneObjectClassName(object: SceneObjectModel, selectedObjectId: string | null) {
  const classes = ["scene-object", `scene-object-${object.kind}`, `scene-object-${object.status}`];

  if (selectedObjectId === object.id) {
    classes.push("is-selected");
  }

  return classes.join(" ");
}

export function EditorLayout({
  activeTool,
  canDeleteSelectedObject,
  canCopySelectedObject,
  canPasteObject,
  onCopySelectedObject,
  isDropTarget,
  onDeleteSelectedObject,
  onBackgroundPointerDown,
  onChangeTool,
  onPasteObject,
  onObjectFieldChange,
  onSceneDragLeave,
  onSceneDragOver,
  onSceneDrop,
  onObjectPointerDown,
  onObjectPointerMove,
  onObjectPointerUp,
  onResizeHandlePointerDown,
  onSwitchToggle,
  onTextInputPublish,
  publishFeedback,
  runtimeByTopicPath,
  sceneObjects,
  selectedObject,
  tags,
}: EditorLayoutProps) {
  return (
    <section className="editor-grid" aria-label="Editor workspace">
      <div
        className={`scene-surface${isDropTarget ? " is-drop-target" : ""}`}
        onDragLeave={onSceneDragLeave}
        onDragOver={onSceneDragOver}
        onDrop={onSceneDrop}
        onPointerDown={(event) => {
          if (event.target === event.currentTarget) {
            onBackgroundPointerDown();
          }
        }}
      >
        <div className="scene-toolbar">
          <Button active={activeTool === "select"} onClick={() => onChangeTool("select")}>
            Select
          </Button>
          <Button active={activeTool === "move"} onClick={() => onChangeTool("move")}>
            Move
          </Button>
          <Button active={activeTool === "resize"} onClick={() => onChangeTool("resize")}>
            Resize
          </Button>
          <Button disabled={canDeleteSelectedObject === false} onClick={onDeleteSelectedObject}>
            <Trash2 size={14} />
            Delete
          </Button>
          <Button disabled={canPasteObject === false} onClick={onPasteObject}>
            <ClipboardPaste size={14} />
            Paste
          </Button>
          <Button disabled={canCopySelectedObject === false} onClick={onCopySelectedObject}>
            <Copy size={14} />
            Copy
          </Button>
        </div>
        <Button variant="scene-color">
          Background
        </Button>

        {isDropTarget ? <div className="scene-drop-hint">Drop component to create object</div> : null}

        {sceneObjects.map((object) => (
          <div
            className={getSceneObjectClassName(object, selectedObject?.id ?? null)}
            key={object.id}
            onPointerDown={(event) => onObjectPointerDown(event, object)}
            onPointerMove={(event) => onObjectPointerMove(event, object)}
            onPointerUp={onObjectPointerUp}
            style={{
              height: `${object.height}px`,
              left: `${object.x}px`,
              top: `${object.y}px`,
              width: `${object.width}px`,
            }}
          >
            {object.kind === "pump" ? <Activity size={22} /> : null}
            <span>{object.valueText}</span>
            {object.kind === "switch" ? (
              <button
                aria-label={`Toggle ${object.label}`}
                className="scene-inline-control"
                onClick={(event) => {
                  event.stopPropagation();
                  onSwitchToggle(object);
                }}
                onPointerDown={(event) => event.stopPropagation()}
                title="Toggle switch output"
                type="button"
              >
                <Power size={12} />
              </button>
            ) : null}
            {selectedObject?.id === object.id ? (
              <button
                aria-label={`Resize ${object.label}`}
                className="scene-resize-handle"
                onPointerDown={(event) => onResizeHandlePointerDown(event, object)}
                type="button"
              >
                <MoveDiagonal size={12} />
              </button>
            ) : null}
          </div>
        ))}
      </div>

      {selectedObject ? (
        <Panel as="aside" className="config-panel" aria-label="Selection configuration">
          <div className="panel-title">
            <PanelRight size={16} />
            <h2>Selection</h2>
          </div>
          <div className="field-stack">
            {publishFeedback ? (
              <div
                className={`mqtt-test-message ${
                  publishFeedback.tone === "connected" ? "mqtt-test-message-connected" : "mqtt-test-message-error"
                }`}
              >
                {publishFeedback.message}
              </div>
            ) : null}
            <TextField
              label="Name"
              onChange={(event) => onObjectFieldChange(selectedObject, { label: event.target.value })}
              value={selectedObject.label}
            />
            <TextField
              label="Display Text"
              onChange={(event) => onObjectFieldChange(selectedObject, { valueText: event.target.value })}
              value={selectedObject.valueText}
            />
            <SelectField
              defaultValue={selectedObject.tag}
              label="Bound Tag"
              onChange={(event) => onObjectFieldChange(selectedObject, { tag: event.target.value })}
              value={selectedObject.tag}
            >
              {tags.map((tag) => (
                <option key={tag.id} value={tag.topicPath}>
                  {tag.name} ({tag.topicPath})
                </option>
              ))}
            </SelectField>
            <TextField
              disabled
              label="Runtime Value"
              value={
                runtimeByTopicPath[selectedObject.tag]?.value === null ||
                runtimeByTopicPath[selectedObject.tag]?.value === undefined
                  ? "--"
                  : String(runtimeByTopicPath[selectedObject.tag]?.value)
              }
            />
            {selectedObject.kind === "text-input" ? (
              <>
                <TextField
                  label="Input Value"
                  onChange={(event) => onObjectFieldChange(selectedObject, { inputValue: event.target.value })}
                  value={selectedObject.inputValue}
                />
                <Button onClick={() => onTextInputPublish(selectedObject)}>
                  <SendHorizontal size={14} />
                  Send Value
                </Button>
              </>
            ) : null}
            <SelectField
              defaultValue={selectedObject.action}
              label="Action"
              onChange={(event) => onObjectFieldChange(selectedObject, { action: event.target.value })}
              value={selectedObject.action}
            >
              <option value="rotate">Rotate when value is ON</option>
              <option value="stop">Stop when value is OFF</option>
              <option value="display">Display realtime value</option>
              <option value="toggle">Toggle raw publish state</option>
            </SelectField>
            <TextField
              label="Position X"
              onChange={(event) => onObjectFieldChange(selectedObject, { x: Number(event.target.value) || 0 })}
              type="number"
              value={String(selectedObject.x)}
            />
            <TextField
              label="Position Y"
              onChange={(event) => onObjectFieldChange(selectedObject, { y: Number(event.target.value) || 0 })}
              type="number"
              value={String(selectedObject.y)}
            />
            <TextField
              label="Width"
              onChange={(event) =>
                onObjectFieldChange(selectedObject, { width: Number(event.target.value) || selectedObject.width })
              }
              type="number"
              value={String(selectedObject.width)}
            />
            <TextField
              label="Height"
              onChange={(event) =>
                onObjectFieldChange(selectedObject, { height: Number(event.target.value) || selectedObject.height })
              }
              type="number"
              value={String(selectedObject.height)}
            />
          </div>
        </Panel>
      ) : null}
    </section>
  );
}
