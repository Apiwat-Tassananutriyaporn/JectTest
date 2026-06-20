# 01 - Overview

## Purpose

This document orients a new engineer or AI agent to the 3D SCADA Web Platform:
what it does, what Version 07 includes, how the main modules relate to each
other, and where to look when changing or debugging a feature.

This is the map. The full product requirement is in
[`../req/07-requirement.md`](../req/07-requirement.md).

## What this platform is

This project is a web-based 3D SCADA / HMI editor for building industrial
monitoring and control screens without writing code. Users can create projects,
edit 3D scenes, import models, place 2D SCADA components in a 3D world, bind
components to MQTT tags, configure alarms, and build dashboards.

Version 07 is a frontend-only prototype built around:

- React + Vite + TypeScript
- Three.js / React Three Fiber for the 3D scene
- Zustand for client/editor state
- MQTT over WebSocket from the browser
- Direct MQTT Topic tags with plaintext/raw payloads
- localStorage or IndexedDB for prototype persistence

## Architecture in one paragraph

The codebase should be organized by feature module, not by generic technical
folders. Each major product area should own its UI, state, domain logic, and
local helpers where practical. Shared infrastructure such as MQTT connection,
persistence, permissions, and common UI belongs in shared service or platform
folders. Runtime data flows from project configuration into stores, from MQTT
messages into tag values, and from tag values into scene components, model
actions, alarms, and dashboard panels. Version 07 must avoid backend, database,
auth, MQTT TCP gateway, and PLC-specific topic/payload logic.

## Version 07 Scope

In scope:

- Project management
- Project settings
- 3D scene editor
- Model library
- Component library
- Tag configuration
- Direct MQTT Topic tags
- MQTT broker connecting form
- MQTT over WebSocket connection and test connection
- Alarm configuration and alarm log
- Dashboard with gauge/chart panels
- Permission model: watchable, controlable, editable
- Browser local persistence

Out of scope:

- Backend / NestJS
- REST API implementation
- Database persistence
- Prisma ORM
- PostgreSQL
- TimescaleDB
- Login / signup
- Server-side permission enforcement
- MQTT TCP gateway from the browser
- Modbus TCP/RTU
- PLC data through the previous ESP gateway MQTT topic/payload pattern

## Main Modules

Keep this table current. It is the fastest way for an engineer or AI agent to
find the right folder before making a change.

| Module | Responsibility | Suggested folder | Status |
|---|---|---|---|
| App Shell | App layout, navigation, page routing, high-level composition | `frontend/src/app/`, `frontend/src/layouts/` | planned |
| Project | Create, open, edit, save project metadata and project type | `frontend/src/features/project/` | planned |
| Project Settings | Settings modal, project name, type, connection config entry point | `frontend/src/features/project-settings/` | planned |
| Scene Editor | 3D editor, grid, camera, selection, placement, transform controls | `frontend/src/features/scene/` | planned |
| Model Library | Imported GLB assets, model metadata, model placement | `frontend/src/features/models/` | planned |
| Component Library | 2D SCADA components placed in the 3D world | `frontend/src/features/components/` | planned |
| Tags | Tag CRUD, tag binding metadata, unit, mode, current value | `frontend/src/features/tags/` | planned |
| MQTT | MQTT broker config, browser WebSocket connection, subscribe/publish | `frontend/src/services/mqtt/` | planned |
| Alarms | Alarm rules, evaluation, active/cleared events, alarm log | `frontend/src/features/alarms/` | planned |
| Dashboard | Dashboard layout, panels, gauges, charts | `frontend/src/features/dashboard/` | planned |
| Permissions | watchable/controlable/editable client-side capability model | `frontend/src/features/permissions/` | planned |
| Persistence | localStorage/IndexedDB save/load, schema versioning | `frontend/src/services/persistence/` | planned |

## Runtime Flow

Happy path:

1. User opens the app and selects or creates a project.
2. The project store loads project settings, scenes, tags, dashboard, alarms,
   and MQTT configuration from browser persistence.
3. If the project type is `MQTTClient` and connection is enabled, the MQTT
   service connects through `ws://` or `wss://`.
4. MQTT subscriptions update Direct MQTT Topic tag values as raw/plaintext
   payloads.
5. Tag value changes update bound scene components, text output, switch state,
   gauges, model actions, and alarm evaluation.
6. User edits scene, tags, alarms, dashboard, or settings.
7. Persistence saves the prototype project state locally.

## MQTT Model

Version 07 supports Direct MQTT Topic only.

- A tag subscribes or publishes to the exact topic path entered by the user.
- Payloads are treated as plaintext/raw values.
- JSON parsing and gateway-specific payload mapping are not part of Version 07.
- Browser-side real connection supports `ws://` and `wss://`.
- `mqtt://host:1883` can be stored as future backend gateway configuration, but
  it must not be used directly from the browser.

The MQTT broker connecting UI must include:

- Name
- Type
- Polling
- Enable
- Address
- `Without Security and encryption mode` accordion
- Client ID
- Username
- Password with show/hide control
- `TLS Certificate` accordion
- Cancel / OK actions
- Test Connection behavior

## Data Ownership

Use one canonical data model for project state. Avoid duplicating the same
concept in multiple modules.

Suggested ownership:

- Project metadata belongs to Project.
- MQTT connection config belongs to MQTT, referenced by Project Settings.
- Tag definitions and current tag values belong to Tags.
- Scene objects belong to Scene Editor.
- Model assets belong to Model Library.
- Component definitions belong to Component Library.
- Alarm rules and alarm events belong to Alarms.
- Dashboard panels belong to Dashboard.
- Saved project snapshots belong to Persistence.

## Debug Map

Use this section to quickly find the right area when something breaks.

| Symptom | Inspect first | Then inspect |
|---|---|---|
| MQTT cannot connect | `frontend/src/services/mqtt/` | Project Settings, connection form validation |
| Test Connection fails | MQTT service error handling | broker URL, protocol, client ID |
| Tag value does not update | Tags store | MQTT subscription mapping |
| Text Output shows wrong unit | Tags model | component tag binding |
| Switch does not publish | Component behavior | tag mode, MQTT publish path |
| Model action does not run | Model action rules | tag value update flow |
| Alarm does not trigger | Alarm engine | tag value and condition parser |
| Dashboard gauge is stale | Dashboard panel binding | tag store subscription |
| Scene object cannot be selected | Scene selection state | renderer/object registry |
| Project data disappears | Persistence service | schema version/localStorage key |

## Glossary

- **Project** - A saved SCADA workspace containing settings, scenes, tags,
  alarms, dashboards, and connection config.
- **Scene** - A 3D editing surface where models and world-anchored 2D SCADA
  components are placed.
- **Tag** - A logical variable that connects MQTT data to components, model
  actions, alarms, and dashboard panels.
- **Direct MQTT Topic** - A tag data source that reads/writes raw payloads from
  the exact MQTT topic entered by the user.
- **Component** - A 2D SCADA UI element placed in the 3D world, such as text
  output, text input, switch, label, or gauge.
- **Model Action** - A rule that changes a 3D model behavior based on a tag
  value, such as rotate or stop.
- **Alarm Rule** - A condition evaluated against a tag value to create active or
  cleared alarm events.
- **Dashboard Panel** - A gauge, chart, or status widget arranged in a dashboard
  layout.
- **Prototype Persistence** - Browser local state, localStorage, or IndexedDB
  storage used before real backend/database persistence exists.

## Where to go next

- Product requirement and acceptance criteria:
  [`../req/07-requirement.md`](../req/07-requirement.md)
- Architecture rules and target folder layout:
  `02-architecture.md`
- Data model contracts:
  `03-data-model.md`
- MQTT Direct Topic behavior:
  `04-mqtt-direct-topic.md`
- UI screen flow:
  `05-screen-flow.md`
- Roadmap and phase boundaries:
  `06-roadmap.md`
