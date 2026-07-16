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

- Third-person camera: drag the canvas to turn — the camera stays locked behind the character, and turning the camera turns the character's body (like a standard third-person shooter). There is no independent camera orbit.
- Movement: WASD or arrow keys, always relative to the character's current facing.
- Jump: Space, grounded single jump only.
- Player: physics-backed capsule placeholder.
- Standard attack: click anywhere in view to fire a projectile toward the exact clicked point (raycast against the visible scene), not just the character's facing direction. Cooldown-gated.
- Dummy King target: a stationary capsule target with hit points, an always-camera-facing floating HP bar, and a defeated state; takes damage from the player's projectile and can be reset with R.
- World: a 256-unit-wide by 192-unit-deep oval arena, with matching terrain collision, a visible collision perimeter, and sparse landmarks.
- There is no multiplayer, persistence, mobile input, melee/magic classes, elements, teams, AI bots, animation, or generated terrain yet.

## Code Structure

| Location | Responsibility |
| --- | --- |
| `src/game/Game.tsx` | Canvas, lighting, fog, and physics-provider configuration |
| `src/game/player/Player.tsx` | Keyboard input, player physics, movement, jumping, and projectile attack firing |
| `src/game/player/ThirdPersonCamera.tsx` | Smoothed third-person camera behavior |
| `src/game/world/World.tsx` | Terrain, arena perimeter, and static landmarks |
| `src/game/world/Projectiles.tsx` | Renders active projectiles and removes them on lifespan expiry or collision |
| `src/game/world/DummyTarget.tsx` | Stationary dummy King target: collision damage, HP bar, defeated state, reset key |
| `src/game/config/player.ts` | Player, camera, and projectile tuning constants |
| `src/game/config/world.ts` | World scale, boundary, fog, and camera range constants |
| `src/game/config/dummy.ts` | Dummy target position, HP, and reset key constants |
| `src/game/state/gameStore.ts` | Shared Zustand game state |
| `src/game/state/projectileStore.ts` | Zustand store of active projectiles |
| `src/game/state/dummyStore.ts` | Zustand store of dummy target HP and defeated state |
| `src/game/Hud.tsx` | On-screen control instructions and dummy HP/defeated status |

## Engineering Standards

- Use TypeScript and keep game tuning values in `src/game/config/`; do not scatter magic numbers through components.
- Use React Three Fiber components for scene composition and Rapier for player/world collision.
- Apply player velocity and other physics mutations in `useBeforePhysicsStep`, not React Three Fiber's render-loop callback. This keeps physics fixed-step and movement smooth.
- Keep `<Physics interpolate>` enabled when using the default fixed Rapier timestep.
- Preserve the `1 unit = 1 metre` world-scale convention.
- Use free/open-source libraries and CC0-compatible assets until a budget is intentionally established.
- Avoid `colliders="trimesh"` for flat/near-flat ground generated from a subdivided visual mesh (e.g. a cylinder fan). Sliding capsules catch on triangle seams and stutter. Prefer a simple `CuboidCollider` (or other primitive) for flat ground; use visible perimeter walls to enforce non-rectangular play areas instead of relying on precise ground-mesh collision.
- Never read a moving RigidBody's raw physics transform (e.g. `body.translation()`/`body.rotation()`) every render frame for camera or other visual-following logic. Physics steps at a fixed timestep independent of display refresh rate, so raw reads cause visible jitter even with `<Physics interpolate>`. Instead, attach a `ref` to an inner Three.js `Object3D`/`group` rendered inside the `RigidBody` (which inherits the RigidBody's automatically-interpolated transform) and read its `getWorldPosition()`/`getWorldQuaternion()` each frame.
- The camera's yaw is the single source of truth for the character's facing (shared via a plain `useRef<number>` created in `Game.tsx` and passed to both `ThirdPersonCamera` and `Player`). `ThirdPersonCamera` mutates it on drag; `Player` applies it to the RigidBody's rotation inside `useBeforePhysicsStep` every tick, and derives movement-relative forward/right vectors from it directly instead of from `camera.getWorldDirection()`. Do not reintroduce independent camera-orbit-vs-character-facing state.
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

See `ROADMAP.md` for the current feature development roadmap (the elemental
team-siege game concept and its milestone build order).

## Large Map Guidance

A Fortnite-scale feeling is possible in a browser, but not by scaling one mesh. The current 256 by 192-unit local prototype is the scale-validation step. Larger maps need tile streaming, object pooling, low-poly or instanced props, LOD, distance culling, fog, streamed collisions, and eventually a floating-origin system.
