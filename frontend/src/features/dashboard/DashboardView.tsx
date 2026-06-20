import { Activity, Gauge, TrendingUp } from "lucide-react";
import { useProjectStore } from "../project";
import { useTagRuntimeStore } from "../tags";

export function DashboardView() {
  const activeProject = useProjectStore((state) => state.activeProject);
  const runtimeByTagId = useTagRuntimeStore((state) => state.runtimeByTagId);

  const panels = (activeProject?.tags ?? []).slice(0, 3).map((tag) => {
    const runtime = runtimeByTagId[tag.id];
    const numericValue = typeof runtime?.value === "number" ? runtime.value : null;
    const tone =
      numericValue !== null && numericValue >= 40
        ? "warning"
        : runtime?.status === "fresh"
          ? "online"
          : "info";
    const value =
      runtime?.value === null || runtime?.value === undefined
        ? "--"
        : `${runtime.value}${tag.unit ? ` ${tag.unit}` : ""}`;

    return {
      label: tag.name,
      tone,
      value,
    };
  });

  return (
    <section className="surface-view" aria-label="Dashboard">
      <div className="surface-header">
        <div>
          <h2>Realtime Panels</h2>
          <p>Gauge, status, and trend placeholders ready for tag binding.</p>
        </div>
        <div className="surface-stat">
          <TrendingUp size={16} />
          {panels.length} panels
        </div>
      </div>

      <div className="dashboard-grid">
        {panels.map((panel) => (
          <article className="dashboard-card" key={panel.label}>
            <div className="dashboard-card-head">
              <span>{panel.label}</span>
              <Gauge size={16} />
            </div>
            <strong>{panel.value}</strong>
            <div className={`dashboard-state dashboard-state-${panel.tone}`}>
              <Activity size={14} />
              Realtime tag runtime
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
