# Game Development Roadmap

This document is the feature build order for the current game concept: a team-based
siege game where four elemental factions — **Fire**, **Earth**, **Air**, and **Water** —
fight to kill each other's stationary **King**. Each team spawns near its own castle,
where its King resides. A match has a time limit; the last King standing wins.

This roadmap is separate from `AGENTS.md` on purpose. `AGENTS.md` describes the
project's architecture and engineering standards, which stay stable. This file
describes *what to build next* for *this specific game*, and will change often as
milestones are completed and the design evolves.

## Why this order

Building a game you've never built before is easiest when you validate one small,
fun loop before adding the next layer of complexity. This roadmap deliberately
delays real networked multiplayer until the single-player version (with AI bots
standing in for every other player) is already fun. That way, mistakes in combat
feel, class balance, or the win condition are cheap to fix — they're just local
code changes, not something that also has to be re-synced across a network.

Each milestone should be playable and testable on its own before moving to the next.

## Milestones

### M0 — Movement foundation (complete)
Third-person camera, WASD/arrow movement, single jump, physics-backed player
capsule, and a large local arena with collision. This is the current state of the
project as described in `AGENTS.md`.

### M1 — Single combatant vs. a dummy target
Goal: prove basic combat feels good before anything else is layered on.
- One player, one class, one element (pick any single combo to start, e.g. Fire Melee).
- A single stationary "dummy King" target with hit points.
- A standard attack that damages the dummy on hit.
- Dummy death state (defeated) and a way to reset it for iteration.
- No teams, no classes/elements variety, no other players yet.

### M2 — Classes and elements
Goal: build out the full combat matrix (3 classes × 4 elements = 12 combos).
- Implement all three classes: Melee, Ranged, Magic — each with a standard attack
  and a power attack (power attack has a cooldown).
- Implement attack visuals/behavior themed per element (Fire, Earth, Air, Water)
  for both standard and power attacks.
- Player can select a class before spawning (a simple selection screen or debug
  menu is fine at this stage). Element is not player-chosen — it comes from
  random team assignment, added in M4; at this milestone, before teams exist, a
  debug toggle to preview each element's attack visuals is enough.
- Damage, range, and cooldown values live in `src/game/config/` per existing
  engineering standards — expect to rebalance these later.

### M3 — AI bots
Goal: get stand-ins for every other player so team gameplay can be prototyped
without needing real multiplayer yet.
- Bots that can move toward a target, attack when in range, and take damage/die.
- Bots select a class like a player would; a bot's element comes from whichever
  team it's assigned to, not from its own choice.
- Bots are simple on purpose (e.g. basic state machine: approach, attack, retreat/
  respawn) — depth can be added later once the core loop is proven fun.
- From this milestone onward, every "other player" slot (teammates and enemies)
  can be filled by a bot.

### M4 — Teams and castles
Goal: turn the single combat loop into the actual 4-faction siege setup.
- Four team factions (Fire/Earth/Air/Water), each with a home castle area and a
  stationary King inside it.
- Team assignment on load-in (random, matching the eventual multiplayer plan);
  each player/bot spawns at their team's castle.
- Players/bots on the same team don't damage each other; different teams do.
- King has hit points and a death/defeated state per team.

### M5 — Match loop
Goal: make a full match playable start to finish.
- Match timer.
- Win condition: last King standing when the timer expires, or immediately if
  only one King remains before time runs out.
- Player death → respawn after a delay, at their team's castle.
- Match start and match end/results states (even a simple full-screen message is
  fine at this stage).

### M6 — HUD and feedback
Goal: make match state legible without reading code.
- Player health, target/cooldown indicators for standard/power attacks.
- Status of all four Kings (alive/defeated) visible during the match.
- Kill/defeat feed or similar feedback for key events.
- Basic directional guidance toward an objective (e.g. compass or minimap marker
  toward the nearest enemy castle).

### M7 — Balance and polish pass (single-player prototype)
Goal: confirm the bots-filled prototype is actually fun before investing in
networking. This is a deliberate checkpoint, not just "more features."
- Tune damage, cooldowns, respawn delay, match length, and castle/King placement
  based on playtesting against bots.
- Fix the highest-impact "this feels bad" issues (movement during combat, attack
  feedback/hit registration, bot difficulty, pacing of a match).
- Do not proceed to M8 until this loop is genuinely enjoyable solo.

### M8 — Multiplayer networking
Goal: replace local AI bots with real networked human players, now that the
gameplay loop is proven.
- Decide and document the networking architecture (e.g. authoritative server vs.
  host-relay) as an explicit decision point — this is a significant scope increase
  and deserves its own focused design pass, not an incidental choice.
- Sync player state, attacks/hits, and King health across clients.
- Team assignment and matchmaking/lobby flow for real players (target: 4 teams of
  ~4 players, 16 total, matching the project's target match size).
- Basic server-side validation of hits/damage to reduce obvious cheating (does not
  need to be a full anti-cheat system at this stage).
- Bots remain available to fill empty slots when there aren't enough human players.

### M9 — Vertical slice content pass
Goal: make one full version of the game look and sound like a real game, not a
grey-box prototype.
- Temporary or CC0 art/animation per class and element (Kenney/Poly Haven or
  similar), sound effects and music, menus (team/class/element select, match
  results, settings).
- Enough polish on one map to demonstrate the intended final game experience.

### M10 — Open-world, production systems, and release
Goal: only pursue this once the 4-team siege loop is proven fun and stable.
Follow the general-purpose engineering phases already described in `AGENTS.md`
(open-world foundation, large-world support, production systems such as save
data/settings/accessibility, and eventual release to free static hosting), applied
to this game's map(s) as needed.

## Open decisions (intentionally deferred)

These are flagged so they aren't forgotten, but are not being decided now — they
belong to the milestone noted:
- Exact damage/cooldown/respawn/match-length numbers (M1–M2, revisited in M7).
- Castle/arena layout and number of maps (M4, expanded in M9–M10).
- Networking architecture choice: authoritative server vs. host-relay vs. other
  (M8).
- Whether team assignment is purely random or considers balancing/party grouping
  (M8, once real players exist).
