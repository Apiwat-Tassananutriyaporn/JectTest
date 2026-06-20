# Design

## Design Intent

The visual system is a dark-first industrial product UI for a 3D SCADA / HMI
editor. It should feel close to a professional admin dashboard and editor
workspace, but the SCADA scene, tag binding, MQTT state, alarm severity, and
control actions must be the main visual priority.

The Figma reference "Free Dark Admin Dashboards Community" is useful for the
dark admin mood, panel layering, compact density, and dashboard rhythm. Use it
as a direction reference only. Do not copy the layout directly, and do not let
the product become a generic analytics dashboard.

## Theme Strategy

Support both dark and light themes from the start.

Dark theme is the default for editor and operator workflows because industrial
monitoring often happens in low-light or control-room environments. Light theme
is required for office review, configuration work, screenshots, documentation,
and bright workspaces.

Use semantic tokens instead of hardcoded colors in components. Components should
read from tokens such as `--surface-panel`, `--text-primary`, `--state-danger`,
and `--accent-primary`, not from raw hex values.

## Color Tokens

Use OKLCH tokens when implementing CSS. The values below define the intended
roles; they can be tuned during implementation after browser contrast checks.

### Dark Theme

```css
:root[data-theme="dark"] {
  --bg-app: oklch(18% 0.018 250);
  --bg-scene: oklch(15% 0.012 250);
  --surface-sidebar: oklch(21% 0.018 250);
  --surface-panel: oklch(24% 0.018 250);
  --surface-panel-raised: oklch(28% 0.018 250);
  --surface-input: oklch(30% 0.014 250);
  --border-subtle: oklch(38% 0.014 250);
  --border-strong: oklch(49% 0.018 250);

  --text-primary: oklch(94% 0.01 250);
  --text-secondary: oklch(77% 0.012 250);
  --text-muted: oklch(64% 0.014 250);
  --text-inverse: oklch(16% 0.014 250);

  --accent-primary: oklch(70% 0.145 230);
  --accent-primary-hover: oklch(76% 0.145 230);
  --accent-secondary: oklch(73% 0.12 185);

  --state-online: oklch(72% 0.17 150);
  --state-info: oklch(72% 0.13 235);
  --state-warning: oklch(78% 0.16 78);
  --state-danger: oklch(65% 0.20 28);
  --state-offline: oklch(60% 0.012 250);

  --scene-grid-major: oklch(43% 0.025 230 / 0.55);
  --scene-grid-minor: oklch(36% 0.018 230 / 0.32);
  --selection-outline: oklch(78% 0.15 220);
}
```

### Light Theme

```css
:root[data-theme="light"] {
  --bg-app: oklch(96% 0.006 250);
  --bg-scene: oklch(92% 0.008 250);
  --surface-sidebar: oklch(98% 0.004 250);
  --surface-panel: oklch(100% 0 0);
  --surface-panel-raised: oklch(97% 0.006 250);
  --surface-input: oklch(100% 0 0);
  --border-subtle: oklch(85% 0.012 250);
  --border-strong: oklch(70% 0.018 250);

  --text-primary: oklch(22% 0.018 250);
  --text-secondary: oklch(38% 0.016 250);
  --text-muted: oklch(52% 0.014 250);
  --text-inverse: oklch(98% 0.004 250);

  --accent-primary: oklch(55% 0.16 235);
  --accent-primary-hover: oklch(49% 0.17 235);
  --accent-secondary: oklch(53% 0.13 185);

  --state-online: oklch(52% 0.16 150);
  --state-info: oklch(52% 0.14 235);
  --state-warning: oklch(63% 0.15 78);
  --state-danger: oklch(55% 0.19 28);
  --state-offline: oklch(56% 0.012 250);

  --scene-grid-major: oklch(64% 0.024 230 / 0.55);
  --scene-grid-minor: oklch(76% 0.018 230 / 0.45);
  --selection-outline: oklch(56% 0.16 230);
}
```

## Semantic State Rules

- Connected / online: green plus a label or icon.
- Connecting / loading: blue/info plus progress or skeleton state.
- Warning: amber plus warning icon.
- Critical alarm: red plus icon and severity label.
- Disabled: reduced contrast, disabled cursor, and no hover promotion.
- Selected scene object: visible outline and handles, not only color.
- Editable mode: show property controls and transform handles.
- Controlable mode: show safe operator controls, hide edit handles.
- Watchable mode: read-only monitoring with disabled control affordances.

## Typography

Use one UI-first sans-serif family across the product. Recommended stack:

```css
font-family: Inter, "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
```

Use a compact product scale:

```css
--font-xs: 0.75rem;
--font-sm: 0.8125rem;
--font-md: 0.875rem;
--font-lg: 1rem;
--font-xl: 1.125rem;
--font-2xl: 1.375rem;
```

Do not use display fonts for UI labels, data tables, buttons, dashboard values,
or configuration forms.

## Layout

The main application should use an editor-style shell:

- Left sidebar for Views and Toolbox.
- Center workspace for the 3D scene, alarm log, or dashboard.
- Right configuration panel only when there is something selected or being
  configured.
- Top or local toolbar for scene controls, mode controls, save status, and MQTT
  connection state.
- Modal or drawer for Project Settings and MQTT broker configuration.

The interface should be dense but readable. Avoid oversized hero sections,
decorative marketing layouts, and repeated card grids that do not map to real
workflows.

## Component Style

Use a consistent component vocabulary:

- Border radius: 6px to 8px for panels, inputs, menus, and cards.
- Icon buttons: square, stable dimensions, with tooltip.
- Forms: compact labels, clear validation, visible focus state.
- Tables: dense rows, sticky header where useful, clear severity/status cells.
- Cards: only for repeated items, dashboard panels, modals, and framed tools.
- Nested cards: avoid.
- Shadows: minimal; prefer border and surface layering for dark theme.

## SCADA-Specific Surfaces

### Scene Editor

The scene viewport should feel like a technical workspace, not a decorative
preview. Grid lines, object selection, transform handles, camera controls, and
scene-level background controls must remain readable in both themes.

2D SCADA components placed in the scene should be world-anchored and scale with
the camera. Their selected state should be visible even when the scene
background changes.

### MQTT Broker Form

The MQTT broker form should follow the reference structure:

- Name
- Type
- Polling
- Enable
- Address
- Security mode accordion
- Client ID
- Username
- Password with show/hide control
- TLS Certificate accordion
- Cancel, OK, and Test Connection actions

Connection errors should be plain and operational, such as "Broker disconnected"
or "Cannot connect through mqtt:// from browser; use ws:// or wss:// for
Version 07."

### Dashboard

Dashboard panels should prioritize sensor readability, trend comparison, alarm
context, and live status. Charts and gauges should use semantic state colors
sparingly and consistently.

### Alarm Log

Alarm severity must be scannable by icon, label, and color. Critical states
should not rely on red alone. Alarm rows should support dense scanning across
timestamp, alarm name, status, source, value, condition, scene, and project.

## Motion

Use motion only to explain state changes:

- Panel open/close: 150-220ms.
- Hover/focus feedback: 100-160ms.
- Toast or status changes: 180-240ms.
- Dashboard value changes: subtle transition, no distracting loops.

Respect `prefers-reduced-motion: reduce`.

## Implementation Rules

- Use design tokens for colors, spacing, radius, typography, and z-index.
- Verify text contrast in both themes before considering a screen complete.
- Do not hardcode old PLC/ESP gateway UI into Version 07.
- Do not let UI components subscribe to MQTT directly; components read tag
  values from the tag/runtime layer.
- Keep design decisions aligned with `PRODUCT.md` and the active Version 07
  requirement.
