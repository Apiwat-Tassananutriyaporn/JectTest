import type { ReactNode } from "react";

type StatusPillProps = {
  children: ReactNode;
  title?: string;
  tone?: "online" | "info" | "warning" | "danger" | "offline";
};

export function StatusPill({ children, title, tone = "online" }: StatusPillProps) {
  return (
    <div className="status-pill" title={title}>
      <span className={`status-dot status-dot-${tone}`} aria-hidden="true" />
      {children}
    </div>
  );
}
