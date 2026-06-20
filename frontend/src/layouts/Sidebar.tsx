import { Activity, AlarmClock, Boxes, LayoutDashboard, Network, Plus, RadioTower, ToggleRight, Type, Tags } from "lucide-react";
import type { ActiveView, SidebarMode } from "../app/App";
import { sceneToolboxItems } from "../features/scene/constants";
import type { SceneToolboxItemKind } from "../features/scene/types";
import { Button, IconButton } from "../shared/ui";

const views = [
  { label: "Scene", icon: Boxes, value: "scene" },
  { label: "Alarm Log", icon: AlarmClock, value: "alarm-log" },
  { label: "Dashboard", icon: LayoutDashboard, value: "dashboard" },
];

const toolIcons: Record<SceneToolboxItemKind, typeof Activity> = {
  pump: Activity,
  switch: ToggleRight,
  "text-input": Type,
  "text-output": Type,
};

type SidebarProps = {
  activeView: ActiveView;
  onChangeSidebarMode: (mode: SidebarMode) => void;
  onChangeView: (view: ActiveView) => void;
  projectName: string;
  sidebarMode: SidebarMode;
};

export function Sidebar({
  activeView,
  onChangeSidebarMode,
  onChangeView,
  projectName,
  sidebarMode,
}: SidebarProps) {
  return (
    <aside className="sidebar" aria-label="Project navigation">
      <div className="brand-row">
        <div className="brand-mark" aria-hidden="true">
          <Network size={18} />
        </div>
        <div>
          <div className="brand-name">3D SCADA</div>
          <div className="brand-subtitle">Frontend v07</div>
        </div>
      </div>

      <div className="sidebar-tabs" role="tablist" aria-label="Sidebar mode">
        <Button
          active={sidebarMode === "views"}
          onClick={() => onChangeSidebarMode("views")}
          variant="sidebar-tab"
        >
          Views
        </Button>
        <Button
          active={sidebarMode === "toolbox"}
          onClick={() => onChangeSidebarMode("toolbox")}
          variant="sidebar-tab"
        >
          Toolbox
        </Button>
      </div>

      {sidebarMode === "views" ? (
        <section className="sidebar-section" aria-labelledby="project-title">
          <div className="section-header">
            <h2 id="project-title">{projectName}</h2>
            <IconButton aria-label="Create scene">
              <Plus size={16} />
            </IconButton>
          </div>
          <nav className="nav-stack" aria-label="Project views">
            {views.map((view) => (
              <Button
                active={activeView === view.value}
                key={view.label}
                onClick={() => onChangeView(view.value as ActiveView)}
                variant="nav-item"
              >
                <view.icon size={16} />
                <span>{view.label}</span>
              </Button>
            ))}
          </nav>
        </section>
      ) : (
        <section className="sidebar-section" aria-labelledby="toolbox-title">
          <div className="section-header">
            <h2 id="toolbox-title">Toolbox</h2>
          </div>
          <div className="tool-list">
            {activeView === "scene" ? (
              sceneToolboxItems.map((tool) => {
                const ToolIcon = toolIcons[tool.kind];

                return (
                  <Button
                    aria-label={`${tool.label}: ${tool.description}`}
                    draggable
                    key={tool.kind}
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = "copy";
                      event.dataTransfer.setData("application/x-scada-tool", tool.kind);
                      event.dataTransfer.setData("text/plain", tool.label);
                    }}
                    title={tool.description}
                    variant="tool-item"
                  >
                    <ToolIcon size={16} />
                    <span>{tool.label}</span>
                  </Button>
                );
              })
            ) : (
              <>
                <Button variant="tool-item">
                  <Tags size={16} />
                  <span>Scene only</span>
                </Button>
                <Button variant="tool-item">
                  <RadioTower size={16} />
                  <span>Open Scene view to add objects</span>
                </Button>
              </>
            )}
          </div>
        </section>
      )}
    </aside>
  );
}
