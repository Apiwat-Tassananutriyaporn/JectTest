# 05 - Screen Flow

## Purpose

This document maps the Version 07 user experience into screens, modal flows,
sidebars, states, and owning frontend folders. Use it when implementing UI,
reviewing navigation, or debugging where a user action should be handled.

## Principles

1. **The app opens into the product experience, not a marketing page.**
2. **Each screen maps to a feature folder.** UI should be easy to trace from a
   user action to the owning module.
3. **Scene tools appear only when the Scene Editor is active.**
4. **Config Sidebar appears only when an object is selected.**
5. **Background Color is scene-level and stays separate from selected-object
   config.**
6. **MQTT Direct Topic is the only active data-source flow in Version 07.**

## Navigation Map

```text
App
└── Project Workspace
    ├── Left Sidebar
    │   ├── Views
    │   │   ├── Project
    │   │   │   ├── Scene
    │   │   │   ├── Alarm Log
    │   │   │   └── Dashboard
    │   └── Toolbox
    │       ├── General
    │       └── Model
    ├── Main Workspace
    │   ├── Scene Editor
    │   ├── Alarm Log
    │   └── Dashboard
    ├── Right Config Sidebar
    └── Project Settings Modal
        └── MQTT Broker Connecting Form
```

## Folder Mapping

| UI area | Owning folder |
|---|---|
| App boot and routes | `frontend/src/app/` |
| Main shell and editor layout | `frontend/src/layouts/` |
| Project list/open/create | `frontend/src/features/project/` |
| Project settings modal | `frontend/src/features/project-settings/` |
| Scene editor viewport | `frontend/src/features/scene/` |
| Right config sidebar | `frontend/src/features/scene/` plus selected feature editors |
| Model library UI | `frontend/src/features/models/` |
| Toolbox component library | `frontend/src/features/components/` |
| Tag configuration | `frontend/src/features/tags/` |
| MQTT broker form behavior | UI in `project-settings`, behavior in `frontend/src/services/mqtt/` |
| Alarm log and alarm config | `frontend/src/features/alarms/` |
| Dashboard screen | `frontend/src/features/dashboard/` |
| Permission guards | `frontend/src/features/permissions/` |

## App Start Flow

```text
Open app
→ load saved project snapshots from persistence
→ if projects exist, show workspace/project selection
→ if no project exists, show empty project state
→ user creates or opens a project
→ hydrate project stores
→ open default scene if available
```

Empty state must offer:

- Create Project
- Import/load existing project later when supported

## Project Create/Open Flow

Create project:

```text
Click create project
→ enter project name
→ choose project type: Normal or MQTTClient
→ create project snapshot
→ open workspace
→ show Scene as default workspace area
```

Open project:

```text
Select project
→ load project snapshot
→ hydrate stores
→ open default scene/dashboard if configured
→ otherwise open first scene
```

Validation:

- Project name must not be empty.
- Project type must be `Normal` or `MQTTClient`.

## Left Sidebar Flow

Left Sidebar has two tabs:

- Views
- Toolbox

### Views Tab

Views shows project navigation.

Expected tree:

```text
PROJECT1
├── Scene
├── Alarm Log
└── Dashboard
```

Scene click:

```text
Click Scene
→ Main Workspace shows Scene Editor
→ show Background Color Control at top-right
→ show scene tools
→ hide Right Config Sidebar unless an object is selected
```

Alarm Log click:

```text
Click Alarm Log
→ Main Workspace shows Alarm Log
→ hide 3D viewport tools
→ hide Background Color Control
→ hide object Config Sidebar
```

Dashboard click:

```text
Click Dashboard
→ Main Workspace shows Dashboard
→ show Add Panel button top-right
→ hide 3D viewport tools
→ hide Background Color Control
```

### Toolbox Tab

Toolbox is used only for placing items into the scene.

General category:

- Select
- Text Label
- Text Output
- Text Input
- Switch
- Image
- Rectangle
- Circle

Model category:

- Imported models from Model Library

Toolbox item behavior:

- Use icon + short label.
- Hover shows visual feedback.
- If component has templates, hover may show template picker.
- Drag item into Scene Editor to create a scene object.

## Scene Editor Flow

Scene Editor is the primary workspace for building the 3D SCADA/HMI screen.

Scene open:

```text
Open Scene
→ render 3D canvas
→ render platform/grid
→ restore camera state
→ restore scene background
→ render models and world-anchored 2D components
```

Scene tools:

- Orbit
- Pan
- Zoom
- Preset view: front, top, left, right, isometric
- Reset camera
- Background Color Control

Background Color Control:

- Scene-level control.
- Stays top-right of scene.
- Does not appear inside Right Config Sidebar.

## Drag/Drop Flow

```text
Drag item from Toolbox or Model Library
→ hover over 3D scene grid
→ compute drop position on grid
→ create scene object
→ select new object
→ open Right Config Sidebar
→ persist scene update
```

Drop behavior:

- New object should appear at mouse target on grid.
- New object should be selected immediately.
- Config Sidebar should open immediately.

## Selection Flow

Selectable objects:

- Model
- Model component/sub-part when supported
- Text Label
- Text Output
- Text Input
- Switch
- Image
- Shape

Select object:

```text
Click object
→ update selectedObjectId
→ show selection outline
→ show resize handles for 2D components
→ open Right Config Sidebar
→ render object-specific config sections
```

Deselect object:

```text
Click empty scene area or press Escape
→ clear selectedObjectId
→ hide selection outline
→ hide Right Config Sidebar
```

## Right Config Sidebar Flow

Right Config Sidebar edits the selected object only.

Sections:

- Basic
- Transform
- Style
- Tag
- Action
- Advanced

Behavior:

- Hidden when no object is selected.
- Visible when a component/model is selected.
- Floats on the right side of Scene Editor.
- Has internal scroll when content is long.
- Does not own background color.

Folder ownership:

- Shell/sidebar composition: `frontend/src/features/scene/`
- Component-specific editors: `frontend/src/features/components/`
- Model-specific editors: `frontend/src/features/models/`
- Tag selector: `frontend/src/features/tags/`
- Action config: `frontend/src/features/models/`

## Project Settings Modal Flow

Open:

```text
Click project settings icon
→ open modal
→ load current project settings draft
```

Fields:

- Project name
- Project type: Normal or MQTTClient

If project type is `MQTTClient`:

- Show MQTT connection config.
- Show Tag Configuration entry point or section.

Modal behavior:

- Must not overflow viewport.
- Has max height.
- Uses internal scroll.
- Password input must be visible and usable.
- Save/Cancel buttons must stay easy to access.

Cancel:

```text
Click Cancel
→ discard draft
→ close modal
```

Save/OK:

```text
Click OK/Save
→ validate settings
→ save settings to project store
→ persist project snapshot
→ close modal
```

## MQTT Broker Connecting Flow

Fields:

- Name
- Type
- Polling
- Enable
- Address
- Without Security and encryption mode
- Client ID
- Username
- Password
- TLS Certificate

Test Connection:

```text
Click Test Connection
→ validate address/client id
→ reject direct mqtt:// for browser test
→ set status Connecting
→ MQTT service attempts ws/wss connection
→ show Connected or Error
```

OK:

```text
Click OK
→ save broker config
→ if enabled, project may connect when workspace loads
```

Important:

- UI lives in Project Settings.
- MQTT behavior lives in `frontend/src/services/mqtt/`.
- Tag values live in `frontend/src/features/tags/`.

## Tag Configuration Flow

Tag list:

```text
Open Tag Configuration
→ show existing tags
→ allow add/edit/delete
```

Tag fields:

- Tag Name
- Mode: publish, subscribe, pubsub
- Topic Path
- Unit
- Data Source Type: Direct MQTT Topic
- Payload Type: Plaintext / Raw Value

Save tag:

```text
Edit tag fields
→ validate name/topic/mode
→ save tag definition
→ update MQTT subscriptions if needed
→ persist project snapshot
```

Validation:

- Name must not be empty.
- Topic Path must not be empty.
- Duplicate topic should show warning if not intentional.
- Version 07 does not show JSON key mapping.

## Component Binding Flow

Text Output:

```text
Select Text Output
→ open Config Sidebar
→ choose tag
→ read tag value
→ display value + unit
```

Text Input:

```text
Select Text Input
→ choose publish/pubsub tag
→ user enters value
→ click Send
→ publish raw/plaintext value to tag topic
```

Switch:

```text
Select Switch
→ choose publish/pubsub tag
→ configure on/off values
→ click switch
→ publish on/off value
→ incoming tag value updates switch state
```

Gauge:

```text
Select Gauge
→ choose subscribe/pubsub tag
→ configure min/max/ranges
→ display current tag value, unit, status, color range
```

## Model Action Flow

```text
Select model or model component
→ open Config Sidebar
→ open Action Config
→ add action rule
→ choose tag
→ set condition value
→ choose action: Rotate X, Rotate Y, Rotate Z, Stop
→ save
→ incoming tag value evaluates action rule
```

Rule:

- Model actions read tag values.
- Model actions do not subscribe to MQTT directly.

## Alarm Flow

Alarm config:

```text
Open Alarm Config
→ create alarm rule
→ choose tag
→ choose condition operator
→ set threshold
→ set severity
→ save rule
```

Runtime:

```text
Tag value changes
→ Alarm engine evaluates enabled rules
→ create active/cleared alarm event
→ Alarm Log updates
```

Alarm Log screen:

- Full workspace screen.
- Uses table layout.
- Shows severity icon/color.
- Shows timestamp, alarm name, status, source/device, value, condition,
  scene/project.

## Dashboard Flow

Open Dashboard:

```text
Click Dashboard in Views
→ render dashboard page
→ show Add Panel button top-right
→ render saved panels with React Grid Layout
```

Add Panel:

```text
Click Add Panel
→ choose Chart or Gauge
→ create panel
→ open panel settings
→ choose tag/config
→ save panel
```

Gauge panel:

- Name
- Setting button
- Semicircle gauge
- Current value
- Unit
- Needle
- Status
- Tick numbers
- Range colors

Chart panel:

- Panel name
- Tag
- Unit
- Chart type
- Time range
- Color

Rule:

- Dashboard panels read tag values.
- Dashboard panels do not subscribe to MQTT directly.

## Permission-based UI Behavior

Watchable:

- Can view scene, dashboard, alarm log, and real-time tag values.
- Cannot control, edit, move, resize, or change config.

Controlable:

- Can do Watchable actions.
- Can click switch, press control buttons, send Text Input values, and
  acknowledge alarms if enabled.
- Cannot edit layout/config.

Editable:

- Can do Controlable actions.
- Can edit scene, components, tags, alarms, dashboards, model actions, and MQTT
  config.

Owner:

- Future-ready role for full project management.

Version 07 permissions are client-side UI guards only.

## Empty, Loading, Error States

Project empty:

- Show Create Project action.

Scene empty:

- Show empty grid and toolbox.
- User can drag components/models into scene.

Tag empty:

- Show Add Tag action.

MQTT connecting:

- Show Connecting state.

MQTT error:

- Show readable error message.
- Keep form values for correction.

Dashboard empty:

- Show Add Panel action.

Alarm log empty:

- Show empty state, not an error.

## Review Checklist

Before accepting UI flow work:

- Does the screen map to the correct owning folder?
- Does the flow match Version 07 scope?
- Are Scene-only controls hidden outside Scene Editor?
- Is Config Sidebar hidden when no object is selected?
- Is Background Color treated as scene-level?
- Does MQTT form reject browser `mqtt://` Test Connection?
- Do components read tags instead of subscribing to MQTT directly?
- Do Dashboard and Alarm flows read tags instead of MQTT directly?
- Are permission guards applied to edit/control actions?
- Are empty/error/loading states handled?

## Cross-references

- Project map: [`01-overview.md`](01-overview.md)
- Architecture rules: [`02-architecture.md`](02-architecture.md)
- Data model contracts: [`03-data-model.md`](03-data-model.md)
- MQTT Direct Topic behavior: [`04-mqtt-direct-topic.md`](04-mqtt-direct-topic.md)
- Product requirement: [`../req/07-requirement.md`](../req/07-requirement.md)
- Roadmap and phase boundaries: `06-roadmap.md`
