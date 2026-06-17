# 01 Requirement

## Project Overview
- Web 3D viewer for loading and displaying `.glb` and `.gltf` models
- Built with `Vite`, `React`, `Three.js`, and `@react-three/fiber`
- Includes a 3D viewport and a command panel for Blender MCP control

## Functional Requirements

### 3D Model Viewer
- Must support loading `.glb` and `.gltf` files
- Must support drag-and-drop file loading into the viewer area
- Must support file selection through a `Load Model` button
- Must render loaded models in the 3D scene
- Must support loading multiple models at the same time
- Must fit the camera to the loaded model size
- Must display the triangle count for each loaded model
- Must show a loaded model list in an overlay

### 3D Scene Behavior
- Must provide basic lighting in the scene
- Must support `OrbitControls` for rotate, zoom, and pan
- Must rotate models slightly over time
- Must show helper text when no model is loaded
- Must show loading state while parsing a model
- Must show an error message when model loading fails

### Command Panel
- Must provide a text input for natural language commands
- Must keep command history
- Must show Blender MCP connection status
- Must provide clickable command examples
- Must allow clearing history
- Must disable input while disconnected or processing

### Blender MCP Command Support
- Must parse commands for `cube`, `sphere`, `cylinder`, `plane`, and `torus`
- Must parse commands for `light` and `camera`
- Must support clearing the whole scene
- Must send commands to the Blender MCP backend
- Must store command history and command results

## Validation Requirements
- Must validate file extensions before loading
- Must handle parse and load errors
- Must calculate model bounds using `Box3`
- Must calculate triangle count from loaded geometry
- Must check Blender MCP connection on mount

## UI Requirements
- Must have a top bar with app title and load button
- Must have the viewer as the main page area
- Must have an overlay for loaded model information
- Must have visible loading and error states
- Must have a command panel separated from the viewer

## Non-Functional Requirements
- Must run as a web app powered by Vite
- Must work in major browsers
- Must respond interactively when loading models or changing values

## Notes
- This requirement set is extracted from the real files in `C:\3DWEB`
- It can be expanded later into `Functional`, `UI`, `Technical`, and `Acceptance Criteria` sections
