import { Moon, Save, Settings, Sun } from "lucide-react";
import type { ActiveView, ThemeMode } from "../app/App";
import type { ProjectSummary } from "../features/project";
import { useTagRuntimeStore } from "../features/tags";
import { Button, IconButton, StatusPill } from "../shared/ui";

type TopbarProps = {
  activeView: ActiveView;
  onOpenProjectSettings: () => void;
  project: ProjectSummary;
  theme: ThemeMode;
  onToggleTheme: () => void;
};

const viewMeta: Record<ActiveView, { title: string; description: string }> = {
  "alarm-log": {
    description: "Review active conditions, event history, and operational severity.",
    title: "Alarm Log",
  },
  scene: {
    description: "World-anchored components, MQTT tags, and alarm-ready state.",
    title: "Scene Editor",
  },
};

export function Topbar({ activeView, onOpenProjectSettings, project, theme, onToggleTheme }: TopbarProps) {
  const ThemeIcon = theme === "dark" ? Sun : Moon;
  const meta = viewMeta[activeView];
  const connectionStatus = useTagRuntimeStore((state) => state.connectionStatus);
  const isSimulated = useTagRuntimeStore((state) => state.isSimulated);
  const statusTone =
    connectionStatus === "connected"
      ? "online"
      : connectionStatus === "connecting"
        ? "info"
        : connectionStatus === "error"
          ? "danger"
          : "offline";
  const statusLabel =
    connectionStatus === "connected"
      ? isSimulated
        ? "MQTT Simulated"
        : "MQTT Connected"
      : connectionStatus === "connecting"
        ? "MQTT Connecting"
        : connectionStatus === "error"
          ? "MQTT Error"
          : "MQTT Idle";

  return (
    <header className="topbar">
      <div>
        <h1>{meta.title}</h1>
        <p>{project.name} / {meta.description}</p>
      </div>
      <div className="topbar-actions">
        <StatusPill title="MQTT connection status" tone={statusTone}>
          {statusLabel}
        </StatusPill>
        <Button>
          <Save size={16} />
          Save
        </Button>
        <IconButton aria-label="Open project settings" onClick={onOpenProjectSettings}>
          <Settings size={16} />
        </IconButton>
        <IconButton
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          onClick={onToggleTheme}
        >
          <ThemeIcon size={16} />
        </IconButton>
      </div>
    </header>
  );
}
