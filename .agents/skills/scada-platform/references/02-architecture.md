# 02 - Architecture

## Principles

1. **Organize by feature module first.** Product areas such as project, scene,
   tags, alarms, dashboard, and settings own their UI, state, hooks, and local
   helpers.
2. **Keep shared infrastructure outside feature modules.** MQTT, persistence,
   platform state, shared UI primitives, and cross-feature utilities live in
   `src/services/`, `src/shared/`, or `src/types/`.
3. **State has one owner.** A concept must have one canonical store/model. Other
   modules read it through public selectors, hooks, or service APIs.
4. **Rendering is not business logic.** React components render UI and forward
   user intent. Parsing, validation, mapping, persistence, MQTT behavior, alarm
   evaluation, and model action decisions belong in stores/services/helpers.
5. **Version 07 is frontend-only.** Do not add backend, REST API, database,
   authentication, MQTT TCP gateway, Modbus TCP/RTU, or the removed PLC gateway
   MQTT topic/payload pattern.
6. **Prefer vertical slices.** Implement a small user-visible flow end to end
   before expanding horizontally across every module.

## Dependency Rules

| Layer | Folder | May depend on | Must NOT |
|---|---|---|---|
| App composition | `src/app/` | layouts, feature route/page entry points, services initialization | contain feature business logic |
| Layouts | `src/layouts/` | shared UI, feature navigation entry points | own domain state |
| Feature UI | `src/features/<feature>/components/` | local hooks/store, shared UI, local types | import other feature internals directly |
| Feature hooks | `src/features/<feature>/hooks/` | local store, services, local helpers | mutate another feature store directly |
| Feature store | `src/features/<feature>/store/` | local types, shared types, services if needed | import React components |
| Feature logic | `src/features/<feature>/lib/` | local/shared types, pure helpers | access DOM, MQTT client, localStorage directly |
| Services | `src/services/` | shared/types, external libraries | import feature UI components |
| Shared UI | `src/shared/ui/` | shared types, styling utilities | depend on feature modules |
| Shared types | `src/types/` | TypeScript only | import runtime code |

Key rules:

- Feature modules may expose a small public API through `index.ts`.
- Other modules should import from `src/features/<feature>` only, not from deep
  internal paths such as `src/features/tags/store/tagStore`.
- Shared services must be UI-agnostic.
- MQTT behavior belongs in `src/services/mqtt/`, while tag value ownership
  belongs in `src/features/tags/`.
- Persistence writes project snapshots; it should not know how to render scenes
  or evaluate alarms.
- Alarm evaluation reads tag values but does not own tag definitions.
- Dashboard panels bind to tags; they do not subscribe to MQTT directly.
- Scene components bind to tags; they do not subscribe to MQTT directly.

## Target Repo Layout

```text
<project>/
├── doc/
│   ├── req/
│   └── code-docs/
├── .agents/
│   └── skills/
│       └── scada-platform/
│           ├── SKILL.md
│           ├── references/
│           ├── scripts/
│           └── assets/
├── public/
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── providers/
│   │   └── routes/
│   ├── layouts/
│   │   ├── AppShell.tsx
│   │   └── EditorLayout.tsx
│   ├── features/
│   │   ├── project/
│   │   ├── project-settings/
│   │   ├── scene/
│   │   ├── models/
│   │   ├── components/
│   │   ├── tags/
│   │   ├── alarms/
│   │   ├── dashboard/
│   │   └── permissions/
│   ├── services/
│   │   ├── mqtt/
│   │   └── persistence/
│   ├── shared/
│   │   ├── ui/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── constants/
│   ├── types/
│   ├── styles/
│   └── main.tsx
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Feature Module Shape

Each feature should follow this shape when it is large enough to need it:

```text
src/features/<feature>/
├── components/     # React components owned by this feature
├── hooks/          # feature-specific hooks
├── store/          # Zustand store or store slice
├── lib/            # pure helpers, validation, mapping
├── types.ts        # feature-local types
├── constants.ts    # feature-local constants
└── index.ts        # public exports for other modules
```

Small features may start with fewer files, but they should grow toward this
shape instead of spreading logic into unrelated folders.

## Module Responsibilities

### App Shell - `src/app/`, `src/layouts/`

Owns high-level app composition, providers, routes, and layout frame.

Should contain:

- Root app component
- Global providers
- Main layout composition
- Route/page registration

Should not contain:

- Tag parsing
- MQTT connection implementation
- Scene object manipulation logic
- Alarm evaluation

### Project - `src/features/project/`

Owns project list, active project selection, project metadata, and project type.

Should contain:

- Project creation/opening/editing flow
- Active project state
- Project-level metadata
- Project snapshot coordination with persistence

Should not contain:

- MQTT client implementation
- Scene renderer code
- Dashboard panel rendering

### Project Settings - `src/features/project-settings/`

Owns the project settings modal and settings-specific UI composition.

Should contain:

- Project name/type controls
- MQTT broker connecting form entry point
- Save/cancel behavior for settings drafts
- Form-level validation messages

Should not contain:

- Low-level MQTT client calls
- Tag value store
- Persistence storage implementation

### Scene Editor - `src/features/scene/`

Owns the 3D editing surface and scene object operations.

Should contain:

- Canvas/React Three Fiber scene composition
- Grid, camera, orbit/pan/zoom controls
- Scene object selection
- Transform/move/resize/delete/copy/paste behavior
- World-anchored 2D component placement
- Scene background controls

Should not contain:

- MQTT subscribe/publish code
- Alarm rule evaluation
- Dashboard layout code

### Models - `src/features/models/`

Owns model assets, imported GLB metadata, model placement, material config, and
model action configuration UI.

Should contain:

- Model library
- Model import metadata
- Model action rule configuration
- Material/color settings

Should not contain:

- Tag store implementation
- MQTT connection logic

### Components - `src/features/components/`

Owns reusable SCADA component definitions and world-anchored component rendering.

Should contain:

- Text Output
- Text Input
- Switch
- Label
- Gauge component rendering if used inside scene
- Component property editor pieces

Should not contain:

- Dashboard panel grid layout
- MQTT client logic
- Project persistence implementation

### Tags - `src/features/tags/`

Owns tag definitions, tag values, tag binding metadata, units, modes, and tag UI.

Should contain:

- Tag config table/form
- Tag store
- Tag value update API
- Tag validation
- Direct MQTT Topic metadata

Should not contain:

- MQTT connection lifecycle
- Scene rendering
- Dashboard rendering

### MQTT - `src/services/mqtt/`

Owns MQTT broker configuration, browser WebSocket connection, test connection,
subscribe, publish, disconnect, and connection status.

Should contain:

- MQTT client adapter
- Connection status lifecycle
- Subscribe/unsubscribe API
- Publish API
- Test connection behavior
- Direct MQTT Topic payload handling as raw/plaintext transport

Should not contain:

- React UI components
- Tag ownership
- Alarm logic
- Scene rendering

### Alarms - `src/features/alarms/`

Owns alarm rules, alarm evaluation, active/cleared state, severity, and alarm log.

Should contain:

- Alarm rule config
- Condition evaluation
- Alarm event creation
- Alarm log table integration

Should not contain:

- MQTT subscriptions
- Dashboard panel layout
- Persistence storage adapter

### Dashboard - `src/features/dashboard/`

Owns dashboard pages, panel layout, gauges, charts, and tag-bound panel state.

Should contain:

- React Grid Layout integration
- Gauge panel
- Chart panel
- Panel config UI
- Tag binding for panels

Should not contain:

- MQTT subscriptions
- Alarm rule ownership
- Scene object transform logic

### Permissions - `src/features/permissions/`

Owns client-side role/capability checks for Version 07.

Should contain:

- watchable/controlable/editable role model
- Capability helpers
- UI guard helpers

Should not contain:

- Server-side enforcement
- Login/signup
- Token/session logic

### Persistence - `src/services/persistence/`

Owns prototype save/load to browser local state, localStorage, or IndexedDB.

Should contain:

- Project snapshot serialization
- Schema version
- Migration helpers when needed
- Load/save/delete APIs

Should not contain:

- Feature rendering
- MQTT client logic
- Alarm decisions

## Runtime Data Flow

### Load project

```text
App start
→ persistence service loads project snapshot
→ project store sets active project
→ feature stores hydrate tags, scenes, alarms, dashboards, settings
→ UI renders editor/dashboard/alarm log
```

### MQTT receive

```text
MQTT client receives raw payload
→ MQTT service normalizes message metadata
→ tags store updates tag value by exact Direct MQTT Topic
→ bound scene components update
→ model action rules evaluate
→ alarm rules evaluate
→ dashboard panels update
```

### MQTT publish

```text
User changes Text Input or Switch
→ component sends intent to tag action/helper
→ tag mode and topic are validated
→ MQTT service publishes raw/plaintext value
→ UI reflects pending/sent/error state
```

### Save project

```text
User edits project/scene/tag/alarm/dashboard/settings
→ owning feature store updates canonical state
→ persistence service saves project snapshot
→ later app load hydrates the same snapshot
```

## State Ownership

| State | Owner | Readers |
|---|---|---|
| Active project id/name/type | Project | App shell, settings, persistence |
| MQTT connection config | MQTT service/settings | Project settings, persistence |
| MQTT connection status | MQTT service | Project settings, device status UI |
| Tag definitions | Tags | Scene, components, dashboard, alarms, persistence |
| Current tag values | Tags | Scene, models, dashboard, alarms |
| Scene objects | Scene | Persistence, property panel |
| Model assets/actions | Models | Scene, persistence |
| Component configs | Components/Scene | Scene, persistence |
| Alarm rules/events | Alarms | Alarm log, persistence |
| Dashboard panels | Dashboard | Persistence |
| Permission role | Permissions | UI guards, editor actions |

## Version 07 MQTT Boundary

Allowed:

- `ws://`
- `wss://`
- Direct MQTT Topic
- Plaintext/raw payload
- `publish`, `subscribe`, `pubsub`
- Test Connection from the browser

Not allowed in Version 07 implementation:

- Direct browser `mqtt://host:1883`
- MQTT TCP gateway implementation
- JSON payload mapping for PLC gateway
- ESP gateway topic templates
- Modbus TCP/RTU
- Backend MQTT service

## Review Checklist

Before accepting a module change:

- Does the code live in the folder that owns the behavior?
- Does the module expose only necessary public exports through `index.ts`?
- Does UI code avoid business logic that belongs in store/service/lib?
- Does service code avoid importing feature UI?
- Is tag state updated only through the Tags module public API?
- Do scene/dashboard/components read tag values instead of subscribing to MQTT?
- Does MQTT code stay limited to connection, subscribe, publish, and status?
- Does persistence save/load snapshots without owning feature decisions?
- Does the change avoid out-of-scope Version 07 items?
- Is the changed behavior covered by a focused test or at least a manual
  verification note?

## Cross-references

- Project map: [`01-overview.md`](01-overview.md)
- Product requirement: [`../req/07-requirement.md`](../req/07-requirement.md)
- Data model contracts: `03-data-model.md`
- MQTT Direct Topic behavior: `04-mqtt-direct-topic.md`
- UI screen flow: `05-screen-flow.md`
