# Product

## Register

product

## Users

The primary users are engineers, system integrators, technicians, and operators
who build, monitor, and control industrial SCADA/HMI projects from a web
interface.

They work with machines, sensors, actuators, MQTT data sources, alarms,
dashboards, and 3D scenes. They need a tool that lets them assemble monitoring
and control screens without writing code, while still feeling precise enough for
industrial use.

## Product Purpose

This product is a web-based 3D SCADA / HMI platform for creating industrial
monitoring and control projects.

The platform lets users create projects, edit 3D scenes, import models, place
2D SCADA components in a 3D world, bind those components to tags, connect to an
MQTT broker, configure alarms, and build dashboards.

Version 07 is a frontend-only prototype. It must prove the core editing,
monitoring, MQTT Direct Topic, alarm, and dashboard workflows before backend,
database, authentication, PLC gateway, or production persistence work begins.

Success means a user can open the app, create a project, configure an MQTT over
WebSocket connection, create tags, place scene components, bind values, view
live data, trigger alarms, and build dashboard panels from the frontend.

## Brand Personality

Precise, calm, technical.

The interface should feel like an industrial engineering tool: focused,
trustworthy, dense enough for real work, and visually composed. It should avoid
marketing-page energy and avoid decorative UI that distracts from monitoring,
editing, and control.

## Anti-references

This product should not look like:

- A generic SaaS analytics landing page.
- A card-heavy admin template with no SCADA-specific editing surface.
- A purely decorative dark dashboard that hides readability problems.
- A game-like 3D editor where controls feel playful instead of operational.
- A one-color interface dominated by only blue, purple, beige, brown, or slate.
- A UI where alarms, MQTT state, and control actions are visually ambiguous.

## Design Principles

1. Keep the tool oriented around the work.
   The first screen should feel like a usable editor or project workspace, not a
   marketing page.

2. Make system state obvious.
   MQTT connection, tag value freshness, permission state, alarm severity, and
   save status must be visible without forcing the user to inspect logs.

3. Separate editing from monitoring.
   Editing controls, operator controls, and read-only monitoring states must
   have clear visual differences so users understand what is safe to change.

4. Prefer modular clarity over visual novelty.
   Scene, tags, alarms, dashboard, MQTT, and project settings should each feel
   like owned modules with predictable layout and behavior.

5. Design for future protocols without showing unfinished complexity.
   Version 07 supports Direct MQTT Topic only, but the product shape should not
   block future PLC/ESP gateway, backend gateway, Modbus, auth, or database
   phases.

## Accessibility & Inclusion

Target at least WCAG 2.2 AA contrast for normal text and controls.

The UI must not rely on color alone for critical states such as connected,
disconnected, warning, critical alarm, disabled controls, or selected objects.
Use icons, labels, shape, or text where state matters.

Motion should be short and purposeful. Provide reduced-motion behavior for
transitions, animated panels, scene UI overlays, and dashboard updates.

Dark theme is the preferred working mode for operators and engineers in control
room or low-light contexts. Light theme must remain available for office,
documentation, and bright-environment use.
