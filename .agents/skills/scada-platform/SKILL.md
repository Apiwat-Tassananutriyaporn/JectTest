---
name: scada-platform
description: Use when working on the C:\JectTest 3D SCADA Web Platform, including frontend implementation, architecture review, module/folder ownership, Version 07 requirement alignment, MQTT Direct Topic behavior, scene editor, tags, alarms, dashboard, roadmap changes, or project code documentation.
---

# SCADA Platform

Use this skill to keep work on the C:\JectTest 3D SCADA Web Platform aligned
with the active requirement, architecture, data model, and screen flow.

## Core Workflow

1. Identify the requested work area.
2. Read only the relevant reference files below.
3. Check the active requirement and phase boundary before changing code.
4. Keep implementation inside the owning feature/service folder.
5. Before final response, verify the change does not introduce out-of-scope
   Version 07 behavior.

## Reference Routing

- For project scope, module map, runtime summary, or onboarding: read
  `references/01-overview.md`.
- For folder structure, module boundaries, import rules, ownership, or review:
  read `references/02-architecture.md`.
- For TypeScript models, persisted project shape, stores, tags, scenes, alarms,
  dashboard panels, or migration concerns: read `references/03-data-model.md`.
- For MQTT connection, broker form, Test Connection, Direct MQTT Topic,
  subscribe/publish, tag runtime updates, or MQTT errors: read
  `references/04-mqtt-direct-topic.md`.
- For UI navigation, Project Settings, Scene Editor, sidebars, modals,
  dashboard, alarm log, or permission-based UI behavior: read
  `references/05-screen-flow.md`.
- For phase decisions, requirement version changes, PLC/ESP future planning,
  backend/database/auth timing, or doc update rules: read
  `references/06-roadmap.md`.

## Version 07 Guardrails

- Implement frontend-only prototype behavior first.
- Use Direct MQTT Topic with plaintext/raw payload for Version 07.
- Support real browser MQTT connection only through `ws://` or `wss://`.
- Do not implement backend, REST API, database, auth, server-side permission,
  MQTT TCP gateway, Modbus TCP/RTU, or PLC/ESP topic/payload integration in
  Version 07.
- PLC/ESP gateway integration is planned for a future spec-pending phase. Keep
  architecture extensible, but do not hardcode the old pattern.

## Folder Ownership Rules

- MQTT behavior belongs in `src/services/mqtt/`.
- Tag definitions and runtime tag values belong in `src/features/tags/`.
- Scene editor behavior belongs in `src/features/scene/`.
- SCADA component rendering/config belongs in `src/features/components/`.
- Dashboard behavior belongs in `src/features/dashboard/`.
- Alarm rules/events belong in `src/features/alarms/`.
- Project settings UI belongs in `src/features/project-settings/`.
- Persistence belongs in `src/services/persistence/`.

## Final Check

Before finishing work, confirm:

- The changed files match the owning module.
- UI components do not subscribe to MQTT directly.
- Dashboard, alarms, model actions, and scene components read tag values.
- Data shapes match `references/03-data-model.md`.
- Screen behavior matches `references/05-screen-flow.md`.
- Scope matches `references/06-roadmap.md`.
