import { useEffect, useState } from "react";
import { ProjectEntryView, useProjectStore } from "../features/project";
import { useTagRuntimeStore } from "../features/tags";
import { AppShell } from "../layouts/AppShell";

export type ThemeMode = "dark" | "light";
export type ActiveView = "scene" | "alarm-log";
export type SidebarMode = "views" | "toolbox";

export function App() {
  const activeProject = useProjectStore((state) => state.activeProject);
  const hydrateProjectRuntime = useTagRuntimeStore((state) => state.hydrateProject);
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [activeView, setActiveView] = useState<ActiveView>("scene");
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>("views");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    hydrateProjectRuntime(activeProject);
  }, [activeProject, hydrateProjectRuntime]);

  return activeProject ? (
    <AppShell
      activeView={activeView}
      onChangeView={setActiveView}
      onChangeSidebarMode={setSidebarMode}
      project={activeProject}
      sidebarMode={sidebarMode}
      theme={theme}
      onToggleTheme={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
    />
  ) : (
    <ProjectEntryView />
  );
}
