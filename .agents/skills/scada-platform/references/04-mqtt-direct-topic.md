# 04 - MQTT Direct Topic

## Purpose

This document defines how Version 07 connects to MQTT, maps MQTT messages to
tags, publishes values from controls, and keeps the frontend architecture ready
for future protocol adapters.

Version 07 supports **Direct MQTT Topic** only. PLC/ESP gateway integration is a
future phase and must wait for a confirmed specification.

## Scope

In scope:

- MQTT broker connecting form
- MQTT over WebSocket from the browser
- `ws://` and `wss://`
- Direct MQTT Topic tags
- Plaintext/raw payload
- `publish`, `subscribe`, `pubsub` tag modes
- Test Connection
- Connection status and error handling
- Subscribe/publish integration with the Tags module

Out of scope for Version 07:

- Direct browser `mqtt://host:1883`
- Backend MQTT gateway
- MQTT TCP implementation
- Modbus TCP/RTU
- PLC/ESP gateway sensor topic
- PLC/ESP gateway command topic
- PLC/ESP gateway status topic
- JSON key mapping such as `X0`, `Y0`, `D200`, `M1`

Future note:

- PLC/ESP gateway integration is planned, not discarded.
- Do not hardcode the previous PLC/ESP MQTT topic/payload pattern.
- Keep the MQTT and tag architecture extensible so a future adapter can be
  added after the new PLC spec is confirmed.

## Ownership

| Concern | Owner | Notes |
|---|---|---|
| Broker config form | `src/features/project-settings/` | UI draft state and validation display |
| MQTT connection behavior | `src/services/mqtt/` | connect, disconnect, test, subscribe, publish |
| MQTT connection status | `src/services/mqtt/` | status lifecycle and last error |
| Tag definitions | `src/features/tags/` | name, mode, topic, unit, data source |
| Tag runtime values | `src/features/tags/` | latest value, raw payload, timestamp |
| Text Output binding | `src/features/components/` | reads tag value |
| Text Input publishing | `src/features/components/` | sends publish intent |
| Switch publishing/status | `src/features/components/` | sends publish intent and reads tag value |
| Alarms | `src/features/alarms/` | reads tag value, evaluates rules |
| Dashboard | `src/features/dashboard/` | reads tag value |

Important rule:

- Scene components, dashboard panels, alarms, and model actions must not
  subscribe to MQTT directly. They read tag values from the Tags module.

## Broker Connecting Form

The MQTT broker connecting form follows the Version 07 requirement image.

Fields:

- Name
- Type
- Polling
- Enable
- Address
- `Without Security and encryption mode` accordion
- Client ID
- Username
- Password
- `TLS Certificate` accordion
- Cancel action
- OK action
- Test Connection action

Default behavior:

- `Type` defaults to `MQTTclient`.
- `Polling` defaults to `5 sec`.
- `Enable` controls whether this config should auto-connect for the project.
- Security accordion is open by default.
- TLS Certificate accordion is collapsed by default.
- Password input must support show/hide.
- Client ID should support generate action.

Address rule:

- Real browser connection supports `ws://` and `wss://`.
- `mqtt://host:1883` may be displayed or saved for future backend gateway
  config, but Test Connection must reject it in Version 07.

## Connection Config

Canonical config is defined in
[`03-data-model.md`](03-data-model.md#mqtt-connection).

Example:

```json
{
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
}
```

Validation:

- `name` must not be empty.
- `address` must not be empty.
- `clientId` must not be empty for Test Connection.
- `address` must start with `ws://` or `wss://` for browser connection.
- Invalid protocol should show a clear message, not fail silently.

## Connection Lifecycle

```text
idle
→ connecting
→ connected
→ disconnected
```

Error path:

```text
idle
→ connecting
→ error
```

Runtime fields:

- `status`
- `connectedAt`
- `disconnectedAt`
- `lastError`

Status meanings:

- `idle`: no connection attempt yet
- `connecting`: client is attempting connection
- `connected`: broker connection is active
- `disconnected`: connection was closed intentionally or by broker
- `error`: last connection attempt or MQTT operation failed

Reconnect behavior:

- Version 07 may start with manual reconnect only.
- Automatic reconnect can be added later, but must not hide errors from the UI.

## Test Connection

Test Connection must:

1. Validate config.
2. Set status to `connecting`.
3. Create a temporary MQTT client.
4. Attempt browser WebSocket connection.
5. Set status to `connected` if successful.
6. Disconnect the temporary client unless user explicitly chooses to keep it.
7. Set status to `error` and show a clear error if failed.

Common errors:

- Empty address
- Unsupported protocol
- Empty client ID
- Broker unreachable
- Invalid WebSocket path
- Username/password rejected
- Client ID already in use
- Connection timeout
- Session taken over

UI requirement:

- Show `Connecting`.
- Show `Connected` on success.
- Show `Not Connected` or `Error` on failure.
- Include a readable error message.

## Tag Definition

Version 07 tag:

```json
{
  "id": "tag_temp",
  "name": "Temperature",
  "mode": "subscribe",
  "dataSourceType": "direct_mqtt_topic",
  "payloadType": "plaintext",
  "topicPath": "factory/line1/temp",
  "unit": "°C"
}
```

Rules:

- `dataSourceType` is `direct_mqtt_topic`.
- `payloadType` is `plaintext`.
- `topicPath` is the exact MQTT topic.
- No JSON parsing.
- No JSON key mapping.
- No gateway-specific topic templates.

## Subscribe Flow

```text
Project loads tags
→ Tags module finds subscribe/pubsub tags
→ MQTT service subscribes exact topicPath
→ broker message arrives
→ MQTT service forwards raw message metadata
→ Tags module finds tag by topicPath
→ Tags module updates TagRuntimeValue
→ scene/dashboard/alarm/model readers react to tag value
```

Subscribe rules:

- Subscribe only tags with mode `subscribe` or `pubsub`.
- Subscribe to exact `topicPath`.
- Multiple tags should not accidentally share the same topic unless the user
  intentionally configures them that way.
- Payload must be converted to raw string first.
- The Tags module may optionally coerce display value later, but the MQTT
  service should not apply business parsing.

Message shape passed from MQTT service to Tags:

```ts
interface MqttRawMessage {
  topic: string;
  payloadText: string;
  receivedAt: string;
}
```

Tag runtime update:

```ts
interface TagRuntimeValue {
  tagId: string;
  value: string | number | boolean | null;
  rawPayload: string | null;
  receivedAt?: string;
  sourceTopic?: string;
  status: 'idle' | 'fresh' | 'stale' | 'error';
  error?: string;
}
```

## Publish Flow

```text
User changes Text Input or Switch
→ component sends publish intent with tagId and value
→ Tags module validates tag mode and topicPath
→ MQTT service validates connection status
→ MQTT service publishes raw/plaintext value to exact topicPath
→ UI shows sent or error state
```

Publish rules:

- Publish only tags with mode `publish` or `pubsub`.
- Publish to exact `topicPath`.
- Value is sent as raw/plaintext.
- If MQTT is not connected, do not publish and show error.
- If tag mode is invalid for publish, block action and show error.
- If topic is missing, block action and show error.

Text Input:

- Button sends current input value.
- Number input may format to string before publish.
- Unit is display-only and must not be appended automatically unless explicitly
  configured later.

Switch:

- On click, switch toggles and publishes configured `onValue` or `offValue`.
- Incoming tag value should also update switch state.
- If incoming value equals `onValue`, show on.
- If incoming value equals `offValue`, show off.

## Payload Rules

Allowed payloads:

- string
- number converted to string
- boolean converted to string or configured on/off value
- raw text

Not allowed in Version 07:

- automatic JSON parsing
- JSONPath
- extracting nested fields
- PLC address key mapping
- binary payload handling

Recommended internal behavior:

- MQTT service converts payload bytes to `payloadText`.
- Tags module stores both `rawPayload` and display `value`.
- Component formatting is separate from transport.

## Error Handling

Errors must be clear and local to the operation.

Connection errors:

- Invalid broker address
- Unsupported protocol
- Connection timeout
- Authentication failed
- Client ID conflict
- Broker disconnected

Subscribe errors:

- MQTT not connected
- Topic path missing
- Subscribe rejected

Publish errors:

- MQTT not connected
- Topic path missing
- Tag mode does not allow publish
- Publish rejected

Tag errors:

- Tag not found
- Duplicate topic warning
- Runtime value stale

Error display:

- Project Settings should show connection-level errors.
- Component controls should show publish-level errors.
- Tag Config should show tag validation errors.

## Future Protocol Adapter Direction

When PLC/ESP spec is confirmed, do not modify every component to understand PLC.
Add a protocol/data-source layer instead.

Possible future shape:

```text
src/services/protocols/
├── mqtt-direct/
│   ├── adapter.ts
│   └── types.ts
└── plc-gateway/
    ├── adapter.ts       # future
    └── types.ts         # future
```

Future direction:

- Direct MQTT adapter updates tags by exact topic.
- PLC adapter may update tags by configured PLC mapping.
- Components still read tags only.
- Dashboard still reads tags only.
- Alarms still read tags only.
- Model actions still read tags only.

This keeps future PLC work contained and prevents Version 07 frontend UI from
depending on a not-yet-confirmed PLC topic/payload pattern.

## Implementation Checklist

For `src/services/mqtt/`:

- Has clear connect/disconnect/test API.
- Uses only browser-supported `ws://` and `wss://` for real connection.
- Rejects direct `mqtt://` browser connection with a clear message.
- Exposes connection status and last error.
- Subscribes to exact topic paths.
- Publishes raw/plaintext values.
- Does not import React UI components.
- Does not own tag definitions or tag values.

For `src/features/tags/`:

- Owns tag definitions.
- Owns tag runtime values.
- Updates tag by exact Direct MQTT Topic.
- Validates tag mode before publish/subscribe.
- Does not create MQTT clients.
- Does not parse gateway JSON payloads in Version 07.

For `src/features/components/`:

- Reads tag values from Tags module.
- Sends publish intent through Tags/MQTT flow.
- Does not subscribe to MQTT directly.

Before finishing MQTT-related work:

- Test connection success state.
- Test connection failure state.
- Test subscribe to a raw topic.
- Test Text Output update.
- Test Text Input publish.
- Test Switch publish and incoming state update.
- Confirm no PLC/ESP topic/payload pattern was introduced.

## Cross-references

- Project map: [`01-overview.md`](01-overview.md)
- Architecture rules: [`02-architecture.md`](02-architecture.md)
- Data model contracts: [`03-data-model.md`](03-data-model.md)
- Product requirement: [`../req/07-requirement.md`](../req/07-requirement.md)
- UI screen flow: `05-screen-flow.md`
