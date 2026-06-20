# 03 - Data Model

## Purpose

This document defines the canonical Version 07 data contracts for the 3D SCADA
Web Platform. Use these models as the source of truth when implementing stores,
services, persistence, UI forms, scene rendering, MQTT behavior, alarms, and
dashboard panels.

The real TypeScript types should be created from this document when
implementation starts.

## Principles

1. **One concept, one shape.** Avoid creating separate incompatible versions of
   `Project`, `Tag`, `SceneObject`, or `DashboardPanel` in different modules.
2. **Store references by id.** Cross-module relationships should use ids such
   as `tagId`, `sceneId`, `modelAssetId`, not duplicated nested objects.
3. **Keep runtime values separate from config.** Tag definitions are config;
   current tag values are runtime state.
4. **Version persisted data.** Every saved project snapshot must include
   `schemaVersion`.
5. **Version 07 uses Direct MQTT Topic only.** Do not add PLC gateway JSON key
   fields, ESP gateway topic templates, Modbus fields, or backend-only fields.

## Naming Conventions

- Use `id` for local object ids.
- Use `<entity>Id` for references, such as `projectId`, `sceneId`, `tagId`.
- Use `createdAt` and `updatedAt` as ISO datetime strings.
- Use `position`, `rotation`, and `scale` for 3D transforms.
- Use `width` and `height` for 2D component size.
- Use `enabled` for boolean toggles.
- Use string literal unions for enums.

## Core Primitive Types

```ts
type EntityId = string;
type ISODateTime = string;

type ProjectType = 'normal' | 'mqtt_client';
type PermissionRole = 'watchable' | 'controlable' | 'editable' | 'owner';
type MqttProtocol = 'ws' | 'wss' | 'mqtt';
type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';
type TagMode = 'publish' | 'subscribe' | 'pubsub';
type TagDataSourceType = 'direct_mqtt_topic';
type TagPayloadType = 'plaintext';
type SceneObjectType = 'model' | 'component';
type ScadaComponentType = 'text_label' | 'text_output' | 'text_input' | 'switch' | 'gauge' | 'image' | 'shape';
type AlarmSeverity = 'warning' | 'critical';
type AlarmStatus = 'active' | 'cleared';
type AlarmOperator = '<' | '<=' | '=' | '!=' | '>=' | '>';
type DashboardPanelType = 'gauge' | 'chart';
type ModelActionType = 'rotateX' | 'rotateY' | 'rotateZ' | 'stop';
```

## Vector and Transform Types

```ts
interface Vec3 {
  x: number;
  y: number;
  z: number;
}

interface Size2D {
  width: number;
  height: number;
}

interface Transform3D {
  position: Vec3;
  rotation: Vec3;
  scale: Vec3;
}

interface CameraState {
  position: Vec3;
  target: Vec3;
  zoom: number;
}
```

## Project

`Project` is the root config object for a SCADA workspace.

```ts
interface Project {
  id: EntityId;
  schemaVersion: number;
  name: string;
  type: ProjectType;
  settings: ProjectSettings;
  connection: MqttConnectionConfig | null;
  tags: TagDefinition[];
  scenes: Scene[];
  dashboards: Dashboard[];
  alarms: AlarmRule[];
  users: ProjectUser[];
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

interface ProjectSettings {
  defaultSceneId?: EntityId;
  defaultDashboardId?: EntityId;
  autosaveEnabled: boolean;
}

interface ProjectUser {
  id: EntityId;
  displayName: string;
  email?: string;
  role: PermissionRole;
}
```

Validation:

- `name` must not be empty.
- `type` is `mqtt_client` when the project uses MQTT connection settings.
- `connection` may be `null` for normal projects.
- `schemaVersion` must exist in every persisted project.

## MQTT Connection

`MqttConnectionConfig` stores the broker connecting form state.

```ts
interface MqttConnectionConfig {
  id: EntityId;
  name: string;
  type: 'MQTTclient';
  enabled: boolean;
  polling: MqttPollingOption;
  address: string;
  clientId: string;
  username: string;
  password: string;
  securityMode: MqttSecurityMode;
  tls: MqttTlsConfig;
}

type MqttPollingOption =
  | '50 ms'
  | '100 ms'
  | '200 ms'
  | '300 ms'
  | '500 ms'
  | '1 sec'
  | '1.5 sec'
  | '2 sec'
  | '3 sec'
  | '5 sec'
  | '30 sec'
  | '1 min';

type MqttSecurityMode = 'without_security_and_encryption';

interface MqttTlsConfig {
  enabled: boolean;
  certificateName?: string;
}

interface MqttConnectionRuntime {
  status: ConnectionStatus;
  connectedAt?: ISODateTime;
  disconnectedAt?: ISODateTime;
  lastError?: string;
}
```

Validation:

- `name` must not be empty.
- `address` must not be empty.
- Browser test connection supports only `ws://` and `wss://`.
- `mqtt://host:1883` may be stored only as future backend gateway config.
- `clientId` must not be empty when testing a connection.
- Password may be stored for prototype only; production must not store raw
  secrets in frontend persistence.

## Tag

`TagDefinition` is config. `TagRuntimeValue` is live state.

```ts
interface TagDefinition {
  id: EntityId;
  name: string;
  mode: TagMode;
  topicPath: string;
  unit: string;
  dataSourceType: TagDataSourceType;
  payloadType: TagPayloadType;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

interface TagRuntimeValue {
  tagId: EntityId;
  value: string | number | boolean | null;
  rawPayload: string | null;
  receivedAt?: ISODateTime;
  sourceTopic?: string;
  status: 'idle' | 'fresh' | 'stale' | 'error';
  error?: string;
}
```

Validation:

- `name` must not be empty.
- `topicPath` must not be empty.
- Tag names should be unique inside a project.
- Topic paths should not be duplicated accidentally.
- `dataSourceType` is always `direct_mqtt_topic` in Version 07.
- `payloadType` is always `plaintext` in Version 07.

## Scene

```ts
interface Scene {
  id: EntityId;
  name: string;
  backgroundColor: string;
  grid: SceneGridConfig;
  camera: CameraState;
  objects: SceneObject[];
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

interface SceneGridConfig {
  enabled: boolean;
  platformColor: string;
  majorLineColor: string;
  minorLineColor: string;
  edgeColor: string;
}

type SceneObject = ModelSceneObject | ComponentSceneObject;

interface BaseSceneObject {
  id: EntityId;
  type: SceneObjectType;
  name: string;
  transform: Transform3D;
  selected?: boolean;
  locked?: boolean;
  visible: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}
```

Validation:

- Scene name must not be empty.
- Background and grid colors must be valid CSS colors.
- Camera state must be saved per scene.

## Model Asset and Model Scene Object

```ts
interface ModelAsset {
  id: EntityId;
  name: string;
  fileName: string;
  fileUrl: string;
  format: 'glb' | 'gltf';
  category?: string;
  thumbnailUrl?: string;
  components: ModelComponentDefinition[];
  actionPresets: ModelActionPreset[];
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

interface ModelComponentDefinition {
  id: EntityId;
  name: string;
  sourceNodeName: string;
  material?: ModelMaterialConfig;
}

interface ModelMaterialConfig {
  color?: string;
  usePlainMaterial?: boolean;
}

interface ModelActionPreset {
  componentName: string;
  actions: ModelActionType[];
}

interface ModelSceneObject extends BaseSceneObject {
  type: 'model';
  modelAssetId: EntityId;
  componentMaterials: Record<string, ModelMaterialConfig>;
  tagBindings: ModelTagBinding[];
  actionRules: ModelActionRule[];
}

interface ModelTagBinding {
  id: EntityId;
  tagId: EntityId;
  targetComponentName?: string;
  purpose: 'status' | 'visual_state' | 'action' | 'alarm';
}

interface ModelActionRule {
  id: EntityId;
  tagId: EntityId;
  conditionValue: string;
  action: ModelActionType;
  targetComponentName?: string;
  enabled: boolean;
}
```

Validation:

- `format` should be `glb` or `gltf`.
- Prefer `glb` for imported assets.
- Model action rules must reference existing tags.
- Action should be limited by future `actionPresets` when available.

## SCADA Component

```ts
interface ComponentSceneObject extends BaseSceneObject {
  type: 'component';
  componentType: ScadaComponentType;
  size: Size2D;
  style: ComponentStyle;
  config: ScadaComponentConfig;
  tagBinding?: ComponentTagBinding;
}

interface ComponentStyle {
  textColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: number;
  fontFamily?: string;
  fontSize?: number;
}

interface ComponentTagBinding {
  tagId: EntityId;
}

type ScadaComponentConfig =
  | TextLabelConfig
  | TextOutputConfig
  | TextInputConfig
  | SwitchConfig
  | GaugeComponentConfig
  | ImageConfig
  | ShapeConfig;
```

### Text Label

```ts
interface TextLabelConfig {
  kind: 'text_label';
  text: string;
}
```

### Text Output

```ts
interface TextOutputConfig {
  kind: 'text_output';
  prefix?: string;
  suffix?: string;
  decimalPlaces?: number;
  emptyValueText: string;
}
```

### Text Input

```ts
interface TextInputConfig {
  kind: 'text_input';
  placeholder?: string;
  buttonText: string;
  inputType: 'text' | 'number';
}
```

### Switch

```ts
interface SwitchConfig {
  kind: 'switch';
  templateId: string;
  onValue: string;
  offValue: string;
  onColor: string;
  offColor?: string;
}
```

### Gauge Component

```ts
interface GaugeComponentConfig {
  kind: 'gauge';
  min: number;
  max: number;
  ranges: GaugeRange[];
}
```

### Image and Shape

```ts
interface ImageConfig {
  kind: 'image';
  src: string;
  alt?: string;
}

interface ShapeConfig {
  kind: 'shape';
  shape: 'rectangle' | 'circle' | 'line';
}
```

Validation:

- Components must be world-anchored in the 3D scene.
- Components must have positive `width` and `height`.
- Text Input and Switch can publish only through tags with `publish` or `pubsub`
  mode.
- Text Output should bind to tags with `subscribe` or `pubsub` mode.

## Alarm

```ts
interface AlarmRule {
  id: EntityId;
  name: string;
  tagId: EntityId;
  operator: AlarmOperator;
  threshold: string | number;
  unit: string;
  message: string;
  severity: AlarmSeverity;
  enabled: boolean;
  scope: AlarmScope;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

interface AlarmScope {
  projectId: EntityId;
  sceneId?: EntityId;
  sourceObjectId?: EntityId;
}

interface AlarmEvent {
  id: EntityId;
  alarmRuleId: EntityId;
  tagId: EntityId;
  status: AlarmStatus;
  severity: AlarmSeverity;
  timestamp: ISODateTime;
  alarmName: string;
  sourceName?: string;
  value: string | number | boolean | null;
  conditionText: string;
  message: string;
  sceneId?: EntityId;
  projectId: EntityId;
}
```

Validation:

- Alarm name must not be empty.
- Alarm must reference an existing tag.
- Condition operator must be one of `<`, `<=`, `=`, `!=`, `>=`, `>`.
- Severity should be shown with icon/color in the UI.

## Dashboard

```ts
interface Dashboard {
  id: EntityId;
  name: string;
  panels: DashboardPanel[];
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

type DashboardPanel = GaugeDashboardPanel | ChartDashboardPanel;

interface BaseDashboardPanel {
  id: EntityId;
  type: DashboardPanelType;
  name: string;
  layout: DashboardPanelLayout;
  tagId?: EntityId;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

interface DashboardPanelLayout {
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

interface GaugeDashboardPanel extends BaseDashboardPanel {
  type: 'gauge';
  unit: string;
  min: number;
  max: number;
  ranges: GaugeRange[];
}

interface GaugeRange {
  min: number;
  max: number;
  color: string;
  status: string;
}

interface ChartDashboardPanel extends BaseDashboardPanel {
  type: 'chart';
  unit: string;
  chartType: 'line' | 'bar' | 'area';
  timeRange: string;
  color: string;
}
```

Validation:

- Panel name must not be empty.
- Gauge `max` must be greater than `min`.
- Gauge ranges should not overlap unless explicitly allowed later.
- Dashboard panels must not subscribe to MQTT directly; they read tag values.

## Permission

```ts
interface PermissionState {
  currentRole: PermissionRole;
}

interface PermissionCapabilities {
  canWatch: boolean;
  canControl: boolean;
  canEdit: boolean;
  canManageProject: boolean;
}
```

Role behavior:

- `watchable` can view scene, dashboard, alarm log, and real-time values.
- `controlable` can watch and publish control/input values.
- `editable` can control and edit layout/config.
- `owner` can manage all project-level settings.

Version 07 permissions are client-side only. Server-side enforcement is future
scope.

## Project Snapshot

Persistence should save and load a full snapshot.

```ts
interface ProjectSnapshot {
  schemaVersion: number;
  savedAt: ISODateTime;
  project: Project;
}
```

Example:

```json
{
  "schemaVersion": 1,
  "savedAt": "2026-06-16T08:00:00.000Z",
  "project": {
    "id": "project_001",
    "schemaVersion": 1,
    "name": "Smart Factory",
    "type": "mqtt_client",
    "settings": {
      "defaultSceneId": "scene_main",
      "defaultDashboardId": "dashboard_main",
      "autosaveEnabled": true
    },
    "connection": {
      "id": "mqtt_001",
      "name": "mqtt",
      "type": "MQTTclient",
      "enabled": true,
      "polling": "5 sec",
      "address": "ws://broker.example.com:8083/mqtt",
      "clientId": "scada_client_001",
      "username": "user",
      "password": "",
      "securityMode": "without_security_and_encryption",
      "tls": {
        "enabled": false
      }
    },
    "tags": [
      {
        "id": "tag_temp",
        "name": "Temperature",
        "mode": "subscribe",
        "topicPath": "factory/line1/temp",
        "unit": "°C",
        "dataSourceType": "direct_mqtt_topic",
        "payloadType": "plaintext",
        "createdAt": "2026-06-16T08:00:00.000Z",
        "updatedAt": "2026-06-16T08:00:00.000Z"
      }
    ],
    "scenes": [],
    "dashboards": [],
    "alarms": [],
    "users": [],
    "createdAt": "2026-06-16T08:00:00.000Z",
    "updatedAt": "2026-06-16T08:00:00.000Z"
  }
}
```

## Module Ownership

| Model | Owner | Notes |
|---|---|---|
| `Project` | `frontend/src/features/project/` | Root project metadata and active project |
| `MqttConnectionConfig` | `frontend/src/services/mqtt/` + settings UI | Service owns behavior; settings owns form |
| `TagDefinition` | `frontend/src/features/tags/` | Canonical tag config |
| `TagRuntimeValue` | `frontend/src/features/tags/` | Runtime values from MQTT |
| `Scene` | `frontend/src/features/scene/` | Scene object graph and camera |
| `ModelAsset` | `frontend/src/features/models/` | Imported model metadata |
| `ComponentSceneObject` | `frontend/src/features/components/` + scene | Component config rendered in scene |
| `AlarmRule` / `AlarmEvent` | `frontend/src/features/alarms/` | Evaluation and log |
| `Dashboard` / `DashboardPanel` | `frontend/src/features/dashboard/` | Panel layout and config |
| `PermissionState` | `frontend/src/features/permissions/` | Client-side only in Version 07 |
| `ProjectSnapshot` | `frontend/src/services/persistence/` | Save/load boundary |

## Review Checklist

Before implementing or changing a data model:

- Does this concept already have a canonical model here?
- Is runtime state separated from persisted config?
- Are cross-module references stored as ids?
- Is the model free from removed PLC gateway fields?
- Is the model compatible with browser local persistence?
- Does the owner module match `02-architecture.md`?
- Are validation rules clear enough for UI and services to share?

## Cross-references

- Project map: [`01-overview.md`](01-overview.md)
- Architecture rules: [`02-architecture.md`](02-architecture.md)
- Product requirement: [`../req/07-requirement.md`](../req/07-requirement.md)
- MQTT Direct Topic behavior: `04-mqtt-direct-topic.md`
- UI screen flow: `05-screen-flow.md`
