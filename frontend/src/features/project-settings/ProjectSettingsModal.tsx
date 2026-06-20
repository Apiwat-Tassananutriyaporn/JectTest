import { FormEvent, useEffect, useState } from "react";
import { FolderCog, Tags, X } from "lucide-react";
import { Button, IconButton, SelectField, TextField } from "../../shared/ui";
import { defaultMqttConnection, useProjectStore } from "../project";
import type { ProjectSummary, ProjectType } from "../project";
import { TagConfigPanel } from "../tags";
import { MqttBrokerForm } from "./MqttBrokerForm";

type ProjectSettingsModalProps = {
  onClose: () => void;
  project: ProjectSummary;
};

type SettingsSection = "general" | "tags";

export function ProjectSettingsModal({ onClose, project }: ProjectSettingsModalProps) {
  const updateActiveProject = useProjectStore((state) => state.updateActiveProject);
  const [name, setName] = useState(project.name);
  const [type, setType] = useState<ProjectType>(project.type);
  const [mqttConfig, setMqttConfig] = useState(project.mqttConnection ?? defaultMqttConnection);
  const [tags, setTags] = useState(project.tags);
  const [activeSection, setActiveSection] = useState<SettingsSection>("general");
  const [error, setError] = useState("");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Project name is required.");
      return;
    }

    updateActiveProject({
      mqttConnection: type === "mqtt_client" ? mqttConfig : null,
      name: trimmedName,
      tags,
      type,
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <form
        aria-label="Project settings"
        aria-modal="true"
        className="settings-modal"
        onMouseDown={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
        role="dialog"
      >
        <div className="settings-modal-header">
          <div className="panel-title">
            <FolderCog size={17} />
            <h2>Project Settings</h2>
          </div>
          <IconButton aria-label="Close project settings" onClick={onClose}>
            <X size={16} />
          </IconButton>
        </div>

        <div className="settings-workspace">
          <aside className="settings-nav" aria-label="Project settings sections">
            <Button
              active={activeSection === "general"}
              className="settings-nav-button"
              onClick={() => setActiveSection("general")}
              variant="nav-item"
            >
              <FolderCog size={16} />
              <span>
                <strong>General</strong>
                <small>Project and MQTT broker</small>
              </span>
            </Button>
            <Button
              active={activeSection === "tags"}
              className="settings-nav-button"
              onClick={() => setActiveSection("tags")}
              variant="nav-item"
            >
              <Tags size={16} />
              <span>
                <strong>Tag Configuration</strong>
                <small>{tags.length} tag{tags.length === 1 ? "" : "s"} in this project</small>
              </span>
            </Button>
          </aside>

          <div className="settings-content">
            {activeSection === "general" ? (
              <>
                <div className="field-stack">
                  <TextField
                    label="Project Name"
                    onChange={(event) => setName(event.target.value)}
                    value={name}
                  />
                  <SelectField
                    label="Project Type"
                    onChange={(event) => setType(event.target.value as ProjectType)}
                    value={type}
                  >
                    <option value="mqtt_client">MQTTClient</option>
                    <option value="normal">Normal</option>
                  </SelectField>
                </div>

                {type === "mqtt_client" ? (
                  <MqttBrokerForm config={mqttConfig} onChange={setMqttConfig} />
                ) : (
                  <div className="settings-inline-panel">
                    <div>
                      <strong>Normal project</strong>
                      <p>MQTT broker configuration is available when Project Type is set to MQTTClient.</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="settings-inline-panel">
                  <div>
                    <strong>Direct MQTT Topic tags</strong>
                    <p>Manage tag name, mode, topic path, and unit in a dedicated page inside project settings.</p>
                  </div>
                </div>
                <TagConfigPanel onChange={setTags} showHeader={false} tags={tags} />
              </>
            )}
          </div>
        </div>

        {error ? <div className="form-error">{error}</div> : null}

        <div className="settings-modal-actions">
          <Button onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ProjectSettingsModal;
