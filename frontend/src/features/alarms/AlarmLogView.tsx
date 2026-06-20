import { BellRing, Clock3, TriangleAlert } from "lucide-react";
import { useProjectStore } from "../project";
import { useTagRuntimeStore } from "../tags";

function formatTime(isoDate?: string) {
  if (!isoDate) {
    return "--:--:--";
  }

  return new Date(isoDate).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function AlarmLogView() {
  const activeProject = useProjectStore((state) => state.activeProject);
  const connectionStatus = useTagRuntimeStore((state) => state.connectionStatus);
  const runtimeByTopicPath = useTagRuntimeStore((state) => state.runtimeByTopicPath);
  const rows: Array<{ condition: string; name: string; severity: string; time: string }> = [];

  const temperatureTag = activeProject?.tags.find((tag) => tag.topicPath === "sensor/temp");
  const motorTag = activeProject?.tags.find((tag) => tag.topicPath === "motor/run");
  const temperatureRuntime = temperatureTag ? runtimeByTopicPath[temperatureTag.topicPath] : undefined;
  const motorRuntime = motorTag ? runtimeByTopicPath[motorTag.topicPath] : undefined;

  if (typeof temperatureRuntime?.value === "number" && temperatureRuntime.value > 40) {
    rows.push({
      condition: `${temperatureTag?.topicPath} > 40 ${temperatureTag?.unit ?? ""}`.trim(),
      name: "High Temperature",
      severity: "Critical",
      time: formatTime(temperatureRuntime.receivedAt),
    });
  }

  if (motorRuntime?.value === "OFF") {
    rows.push({
      condition: `${motorTag?.topicPath} = OFF`,
      name: "Pump Stopped",
      severity: "Warning",
      time: formatTime(motorRuntime.receivedAt),
    });
  }

  if (connectionStatus !== "connected" && activeProject?.type === "mqtt_client") {
    rows.push({
      condition: `mqtt status = ${connectionStatus}`,
      name: "Connection State",
      severity: connectionStatus === "error" ? "Critical" : "Info",
      time: formatTime(new Date().toISOString()),
    });
  }

  return (
    <section className="surface-view" aria-label="Alarm log">
      <div className="surface-header">
        <div>
          <h2>Active and Recent Events</h2>
          <p>Severity, source condition, and latest operational changes.</p>
        </div>
        <div className="surface-stat">
          <BellRing size={16} />
          {rows.length} events
        </div>
      </div>

      <div className="alarm-table">
        <div className="alarm-table-row is-head">
          <span>Time</span>
          <span>Name</span>
          <span>Condition</span>
          <span>Severity</span>
        </div>
        {rows.length === 0 ? (
          <div className="alarm-table-row">
            <span className="alarm-cell alarm-time">
              <Clock3 size={14} />
              --
            </span>
            <span>No active events</span>
            <span>Realtime tag runtime is within the current mock thresholds.</span>
            <span className="alarm-pill alarm-pill-info">
              <TriangleAlert size={14} />
              Info
            </span>
          </div>
        ) : null}
        {rows.map((row) => (
          <div className="alarm-table-row" key={`${row.time}-${row.name}`}>
            <span className="alarm-cell alarm-time">
              <Clock3 size={14} />
              {row.time}
            </span>
            <span>{row.name}</span>
            <span>{row.condition}</span>
            <span className={`alarm-pill alarm-pill-${row.severity.toLowerCase()}`}>
              <TriangleAlert size={14} />
              {row.severity}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
