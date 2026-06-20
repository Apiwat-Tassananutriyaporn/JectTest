import { FolderOpen, Network, Plus, RadioTower } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Button, SelectField, StatusPill, TextField } from "../../shared/ui";
import { projectTypeLabels } from "./constants";
import { useProjectStore } from "./store/useProjectStore";
import type { ProjectType } from "./types";

export function ProjectEntryView() {
  const createProject = useProjectStore((state) => state.createProject);
  const openProject = useProjectStore((state) => state.openProject);
  const projects = useProjectStore((state) => state.projects);
  const [projectName, setProjectName] = useState("Smart Factory");
  const [projectType, setProjectType] = useState<ProjectType>("mqtt_client");
  const [error, setError] = useState("");

  const latestProject = useMemo(() => projects[0] ?? null, [projects]);

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = projectName.trim();

    if (!trimmedName) {
      setError("Project name is required.");
      return;
    }

    setError("");
    createProject(trimmedName, projectType);
  };

  return (
    <main className="project-entry" aria-label="Project entry">
      <section className="project-entry-sidebar" aria-label="Product summary">
        <div className="brand-row">
          <div className="brand-mark" aria-hidden="true">
            <Network size={18} />
          </div>
          <div>
            <div className="brand-name">3D SCADA</div>
            <div className="brand-subtitle">Frontend v07</div>
          </div>
        </div>

        <div className="project-entry-summary">
          <StatusPill>
            Frontend Demo
          </StatusPill>
          <h1>Project Workspace</h1>
          <p>
            Create or open a SCADA project before entering the scene editor,
            alarm log, and dashboard workspace.
          </p>
        </div>

        {latestProject ? (
          <button
            className="project-quick-open"
            onClick={() => openProject(latestProject.id)}
            type="button"
          >
            <FolderOpen size={16} />
            <span>
              Continue
              <strong>{latestProject.name}</strong>
            </span>
          </button>
        ) : null}
      </section>

      <section className="project-entry-main" aria-label="Project actions">
        <form className="project-create-panel" onSubmit={handleCreate}>
          <div className="surface-header">
            <div>
              <h2>Create Project</h2>
              <p>Start a local frontend prototype workspace.</p>
            </div>
            <RadioTower size={18} aria-hidden="true" />
          </div>

          <div className="field-stack">
            <TextField
              label="Project Name"
              onChange={(event) => setProjectName(event.target.value)}
              value={projectName}
            />
            <SelectField
              label="Project Type"
              onChange={(event) => setProjectType(event.target.value as ProjectType)}
              value={projectType}
            >
              <option value="mqtt_client">MQTTClient</option>
              <option value="normal">Normal</option>
            </SelectField>
          </div>

          {error ? <div className="form-error">{error}</div> : null}

          <div className="project-entry-actions">
            <Button type="submit">
              <Plus size={16} />
              Create Project
            </Button>
          </div>
        </form>

        <section className="recent-projects" aria-labelledby="recent-projects-title">
          <div className="surface-header">
            <div>
              <h2 id="recent-projects-title">Open Project</h2>
              <p>Use a mock project while the backend is still out of scope.</p>
            </div>
          </div>

          <div className="recent-project-list">
            {projects.map((project) => (
              <button
                className="recent-project-item"
                key={project.id}
                onClick={() => openProject(project.id)}
                type="button"
              >
                <FolderOpen size={16} />
                <span>
                  <strong>{project.name}</strong>
                  <small>{projectTypeLabels[project.type]} · Updated {project.updatedAt}</small>
                </span>
              </button>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
