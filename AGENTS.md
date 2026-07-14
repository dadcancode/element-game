# Element Game Agent Instructions

## Purpose

This is a free, browser-based third-person 3D game prototype. The current goal is a small playable foundation that can grow into an open-world game without prematurely adding paid services, multiplayer, production art, or complex backend systems.

## Technology

| Concern | Choice |
| --- | --- |
| Application | Vite, React, TypeScript |
| 3D rendering | Three.js through React Three Fiber |
| Physics | Rapier through `@react-three/rapier` |
| Shared game state | Zustand |
| Future free assets | Kenney and Poly Haven CC0 assets |

## Current Playable State

- Third-person camera: drag the canvas to look around.
- Movement: WASD or arrow keys.
- Jump: Space, grounded single jump only.
- Player: physics-backed capsule placeholder.
- World: a 256-unit-wide by 192-unit-deep oval arena, with matching terrain collision, a visible collision perimeter, and sparse landmarks.
- There is no multiplayer, persistence, mobile input, combat, animation, or generated terrain yet.

## Code Structure

| Location | Responsibility |
| --- | --- |
| `src/game/Game.tsx` | Canvas, lighting, fog, and physics-provider configuration |
| `src/game/player/Player.tsx` | Keyboard input, player physics, movement, and jumping |
| `src/game/player/ThirdPersonCamera.tsx` | Smoothed third-person camera behavior |
| `src/game/world/World.tsx` | Terrain, arena perimeter, and static landmarks |
| `src/game/config/player.ts` | Player and camera tuning constants |
| `src/game/config/world.ts` | World scale, boundary, fog, and camera range constants |
| `src/game/state/gameStore.ts` | Shared Zustand game state |
| `src/game/Hud.tsx` | On-screen control instructions |

## Engineering Standards

- Use TypeScript and keep game tuning values in `src/game/config/`; do not scatter magic numbers through components.
- Use React Three Fiber components for scene composition and Rapier for player/world collision.
- Apply player velocity and other physics mutations in `useBeforePhysicsStep`, not React Three Fiber's render-loop callback. This keeps physics fixed-step and movement smooth.
- Keep `<Physics interpolate>` enabled when using the default fixed Rapier timestep.
- Preserve the `1 unit = 1 metre` world-scale convention.
- Use free/open-source libraries and CC0-compatible assets until a budget is intentionally established.
- Avoid `colliders="trimesh"` for flat/near-flat ground generated from a subdivided visual mesh (e.g. a cylinder fan). Sliding capsules catch on triangle seams and stutter. Prefer a simple `CuboidCollider` (or other primitive) for flat ground; use visible perimeter walls to enforce non-rectangular play areas instead of relying on precise ground-mesh collision.
- Never read a moving RigidBody's raw physics transform (e.g. `body.translation()`/`body.rotation()`) every render frame for camera or other visual-following logic. Physics steps at a fixed timestep independent of display refresh rate, so raw reads cause visible jitter even with `<Physics interpolate>`. Instead, attach a `ref` to an inner Three.js `Object3D`/`group` rendered inside the `RigidBody` (which inherits the RigidBody's automatically-interpolated transform) and read its `getWorldPosition()`/`getWorldQuaternion()` each frame.
- Keep the first playable experience desktop-first: keyboard and mouse before mobile support.
- Use Bash for all terminal actions.
- Do not stage, commit, reset, or otherwise change Git history unless explicitly requested.
- Update this file whenever the architecture, active gameplay features, development standards, or user directives materially change.

## Running Locally

Run these commands in Bash from the project root:

```bash
npm run dev
npm run lint
npm run build
```

## Development Roadmap

1. **Movement foundation — complete:** third-person camera, movement, collision, jump, and a larger local arena.
2. **Core gameplay:** decide the game's main player activity; add interaction, a clear objective, a basic HUD, and a simple fail/success loop.
3. **Vertical slice:** create one polished biome/area with temporary or CC0 art, sound, menus, and enough gameplay to demonstrate the intended game.
4. **Open-world foundation:** replace the single arena with streamed terrain tiles, nearby collision loading, instanced props, fog/culling, and level-of-detail models.
5. **Large-world support:** add floating origin before travel distances become large; measure memory and frame time on target devices as tile density increases.
6. **Production systems:** add save data, settings, accessibility options, content tools, telemetry only if appropriate, and automated tests for gameplay-critical logic.
7. **Multiplayer decision:** design networking only after the local single-player loop performs well and is fun. A Fortnite-sized online game is a separate major architecture effort.
8. **Release:** playtest regularly, fix the highest-impact issues, optimize target devices, and deploy to free static hosting such as GitHub Pages or Cloudflare Pages.

## Large Map Guidance

A Fortnite-scale feeling is possible in a browser, but not by scaling one mesh. The current 256 by 192-unit local prototype is the scale-validation step. Larger maps need tile streaming, object pooling, low-poly or instanced props, LOD, distance culling, fog, streamed collisions, and eventually a floating-origin system.
