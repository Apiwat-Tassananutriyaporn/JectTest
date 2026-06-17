# 06 - Roadmap

## Purpose

This document defines phase boundaries, future work, requirement versioning, and
the doc update process for the 3D SCADA Web Platform.

Use it to prevent scope creep and to keep implementation, requirements, code
docs, and future agent references aligned.

## Active Requirement

Active requirement:

- [`../req/07-requirement.md`](../req/07-requirement.md)

Active code docs:

- [`01-overview.md`](01-overview.md)
- [`02-architecture.md`](02-architecture.md)
- [`03-data-model.md`](03-data-model.md)
- [`04-mqtt-direct-topic.md`](04-mqtt-direct-topic.md)
- [`05-screen-flow.md`](05-screen-flow.md)
- [`06-roadmap.md`](06-roadmap.md)

Current active phase:

- **Phase 07 - Frontend-only SCADA prototype**

## Phase 07 - Frontend-only SCADA Prototype

Status:

- Active

Goal:

- Build the frontend product shape first so the project, scene editor, tag
  system, MQTT Direct Topic flow, alarms, and dashboard become visible and
  reviewable before deeper PLC/backend integration is added.

In scope:

- React + Vite + TypeScript frontend
- Project management
- Project settings
- MQTT broker connecting form
- MQTT over WebSocket from the browser
- Direct MQTT Topic tags
- Plaintext/raw payload handling
- Tag configuration
- 3D Scene Editor
- Model Library
- Component Library
- World-anchored 2D SCADA components
- Text Label
- Text Output
- Text Input
- Switch
- Model action rules based on tag values
- Alarm configuration
- Alarm Log
- Dashboard with gauge/chart panels
- Permission roles: watchable, controlable, editable
- Browser local persistence with local state, localStorage, or IndexedDB

Out of scope:

- Backend / NestJS
- REST API implementation
- Backend WebSocket Gateway
- Prisma ORM
- PostgreSQL
- TimescaleDB
- Production database persistence
- Login / signup
- Server-side permission enforcement
- MQTT TCP gateway
- Direct browser `mqtt://host:1883`
- Modbus TCP/RTU
- PLC/ESP gateway topic/payload implementation

Acceptance summary:

- User can create/open a project.
- User can open and edit a 3D scene.
- User can import/place models.
- User can place, move, resize, delete, copy, and paste SCADA components.
- Camera orbit/pan/zoom works.
- User can configure MQTT WebSocket connection.
- Test Connection works for `ws://` or `wss://`.
- User can add Direct MQTT Topic tags.
- Text Output displays subscribed tag values.
- Text Input publishes values to a tag topic.
- Switch publishes and reflects on/off tag values.
- Model action rules react to tag values.
- Alarm rules create alarm events.
- Alarm Log displays severity, timestamp, name, status, source, value,
  condition, and scene/project.
- Dashboard can add gauge/chart panels.
- Gauge binds to tag and displays value/unit/status/range color.
- Prototype state can be saved locally.

## Phase 08 - PLC/ESP Gateway Integration Redesign

Status:

- Planned
- Spec pending
- Not implemented in Phase 07

Goal:

- Add PLC/ESP gateway integration after the desired topic/payload, mapping,
  config, command, and status behavior is confirmed.

Why delayed:

- The previous PLC/ESP MQTT topic/payload pattern may not match the final
  product need.
- Implementing it too early risks hardcoding the wrong integration.
- The frontend should first become reviewable through Direct MQTT Topic and
  visible UI flows.

Expected future topics to define:

- PLC/ESP data source type
- Sensor/read mapping
- Command mapping
- Gateway status
- Topic template strategy
- Payload format
- Error handling
- UI config flow
- Data model changes
- Whether the integration is frontend-only, backend-mediated, or both

Phase 08 design rule:

- Add PLC/ESP as a protocol/data-source adapter.
- Do not make scene components, dashboard panels, alarms, or model actions
  understand PLC directly.
- They should continue to read canonical tag values.

Possible future folder direction:

```text
src/services/protocols/
├── mqtt-direct/
└── plc-gateway/
```

Expected docs to update when Phase 08 starts:

- New requirement version, likely `doc/req/08-requirement.md`
- `01-overview.md`
- `02-architecture.md`
- `03-data-model.md`
- `04-mqtt-direct-topic.md` or a new data-source/protocol doc
- `05-screen-flow.md`
- this roadmap
- skill references, if already created

## Phase 09 - Backend Gateway

Status:

- Future

Goal:

- Add a backend gateway for production-grade MQTT TCP, future PLC protocols,
  server-side realtime fanout, and safer secret handling.

Possible stack:

- NestJS
- TypeScript
- WebSocket Gateway
- MQTT client
- REST API

Potential responsibilities:

- Connect to MQTT TCP brokers.
- Hide broker credentials from the frontend.
- Fan out realtime tag updates to frontend clients.
- Normalize future protocol data into canonical tag values.
- Provide API endpoints for project persistence.
- Prepare for auth and permission enforcement.

Still out of scope until Phase 09:

- Production backend implementation
- Real API calls
- Server-side permission checks

## Phase 10 - Database, Auth, and Production Persistence

Status:

- Future

Goal:

- Move from prototype local persistence to production persistence and real user
  access control.

Possible stack:

- PostgreSQL
- TimescaleDB
- Prisma ORM
- Authentication
- Project-level authorization

Potential responsibilities:

- Store projects.
- Store scenes.
- Store dashboard panels.
- Store tag config.
- Store alarm config and history.
- Store time-series values.
- Store users and permissions.
- Enforce owner/watchable/controlable/editable roles server-side.

## Later Product Features

Candidates:

- Alarm Popup Designer with Canva-like editing
- Model action preset metadata
- Model thumbnail generator
- Component template marketplace
- Real-time collaboration
- Alarm notifications through Telegram, Web Push, or email
- Historical dashboard charts
- Data historian
- Export/import project files
- Project version history
- Mobile responsive viewer mode

## Requirement Versioning Rule

Use a new requirement version when a change affects architecture, data model,
module boundaries, or multiple screens.

Examples:

- `doc/req/07-requirement.md`
- `doc/req/08-requirement.md`
- `doc/req/09-requirement.md`

Do not silently overwrite the active requirement when the change is large.

Small clarifications may update the current active requirement if they do not
change scope or architecture.

## Documentation Update Rule

When requirement changes, update docs in this order:

1. Create or update the requirement version.
2. Update `01-overview.md` for scope and runtime summary.
3. Update `02-architecture.md` for module boundary changes.
4. Update `03-data-model.md` for type/data changes.
5. Update protocol docs such as `04-mqtt-direct-topic.md`.
6. Update `05-screen-flow.md` for UI flow changes.
7. Update `06-roadmap.md` for phase/scope decisions.
8. Update `.agents/skills/scada-platform/references/` if references have been
   published there.
9. Update `.agents/skills/scada-platform/SKILL.md` if the agent workflow
   changes.

## Migration Policy

When a model or persistence shape changes:

- Add a new `schemaVersion`.
- Document what changed.
- Provide migration guidance before modifying saved project data.
- Keep old data readable when reasonable during prototype development.

When a protocol changes:

- Document whether it replaces or adds to the existing data source.
- Update tag data source types.
- Keep components bound to canonical tags, not directly to protocol-specific
  payloads.

When UI flow changes:

- Update `05-screen-flow.md`.
- Update owning folder references.
- Update review checklist if new states are introduced.

## Risk List

| Risk | Impact | Mitigation |
|---|---|---|
| Implementing PLC/ESP too early | Wrong integration gets hardcoded | Keep Phase 08 spec-pending |
| Direct MQTT code spreads into UI components | Hard to replace data source later | Keep MQTT in `src/services/mqtt/` |
| Tag models diverge between modules | Dashboard/scene/alarm bugs | Use `03-data-model.md` as source of truth |
| Scene editor grows into one large file | Hard to maintain | Follow feature/module boundaries |
| Persistence shape changes without versioning | Saved projects break | Use `schemaVersion` |
| Frontend stores secrets unsafely | Production security risk | Treat stored password as prototype-only |
| Scope creep into backend/auth/database | Phase 07 slows down | Keep roadmap phase boundaries |

## Decision Log

| Date | Decision | Reason |
|---|---|---|
| 2026-06-16 | Version 07 is frontend-only | Build visible product shape first |
| 2026-06-16 | Direct MQTT Topic is active data source for Version 07 | Simple realtime path for prototype |
| 2026-06-16 | PLC/ESP gateway integration is future Phase 08 | Current desired pattern is not confirmed |
| 2026-06-16 | Browser connection supports only `ws://` and `wss://` | Browser cannot directly use MQTT TCP |
| 2026-06-16 | Use localStorage/IndexedDB/local state for prototype persistence | Backend/database are future phases |

## Cross-references

- Project map: [`01-overview.md`](01-overview.md)
- Architecture rules: [`02-architecture.md`](02-architecture.md)
- Data model contracts: [`03-data-model.md`](03-data-model.md)
- MQTT Direct Topic behavior: [`04-mqtt-direct-topic.md`](04-mqtt-direct-topic.md)
- UI screen flow: [`05-screen-flow.md`](05-screen-flow.md)
- Product requirement: [`../req/07-requirement.md`](../req/07-requirement.md)
