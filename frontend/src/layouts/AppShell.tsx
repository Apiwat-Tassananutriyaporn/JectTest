import type { ReactNode } from "react";
import { useState } from "react";
import type { ActiveView, SidebarMode, ThemeMode } from "../app/App";
import { AlarmLogView } from "../features/alarms/AlarmLogView";
import type { ProjectSummary } from "../features/project";
import { ProjectSettingsModal } from "../features/project-settings";
import { SceneView } from "../features/scene/SceneView";
import { RightRail } from "./RightRail";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

type AppShellProps = {
  activeView: ActiveView;
  onChangeSidebarMode: (mode: SidebarMode) => void;
  onChangeView: (view: ActiveView) => void;
  project: ProjectSummary;
  sidebarMode: SidebarMode;
  theme: ThemeMode;
  onToggleTheme: () => void;
};

export function AppShell({
  activeView,
  onChangeSidebarMode,
  onChangeView,
  project,
  sidebarMode,
  theme,
  onToggleTheme,
}: AppShellProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const content = {
    "alarm-log": <AlarmLogView />,
    scene: <SceneView />,
  } satisfies Record<ActiveView, ReactNode>;

  return (
    <div className="app-shell">
      <Sidebar
        activeView={activeView}
        onChangeSidebarMode={onChangeSidebarMode}
        onChangeView={onChangeView}
        projectName={project.name}
        sidebarMode={sidebarMode}
      />
      <main className="workspace">
        <Topbar
          activeView={activeView}
          onOpenProjectSettings={() => setSettingsOpen(true)}
          project={project}
          theme={theme}
          onToggleTheme={onToggleTheme}
        />
        {content[activeView]}
      </main>
      <RightRail activeView={activeView} onChangeView={onChangeView} />
      {settingsOpen ? <ProjectSettingsModal project={project} onClose={() => setSettingsOpen(false)} /> : null}
    </div>
  );
}
