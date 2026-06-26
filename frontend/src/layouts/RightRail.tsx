import { Settings, Tags } from "lucide-react";
import type { ActiveView } from "../app/App";
import { IconButton } from "../shared/ui";

type RightRailProps = {
  activeView: ActiveView;
  onChangeView: (view: ActiveView) => void;
};

export function RightRail({ activeView, onChangeView }: RightRailProps) {
  return (
    <aside className="right-rail" aria-label="Project tools">
      <IconButton
        active={activeView === "scene"}
        aria-label="Scene"
        onClick={() => onChangeView("scene")}
        variant="rail-button"
      >
        <Settings size={17} />
      </IconButton>
      <IconButton
        active={activeView === "alarm-log"}
        aria-label="Alarm Log"
        onClick={() => onChangeView("alarm-log")}
        variant="rail-button"
      >
        <Tags size={17} />
      </IconButton>
    </aside>
  );
}
