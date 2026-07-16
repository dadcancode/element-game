import { useGameStore } from './state/gameStore'
import { useDummyStore } from './state/dummyStore'
import { DUMMY_MAX_HP } from './config/dummy'

export function Hud() {
  const isRunning = useGameStore((state) => state.isRunning)
  const dummyHp = useDummyStore((state) => state.hp)
  const isDummyDefeated = useDummyStore((state) => state.isDefeated)

  return (
    <aside className="hud">
      <h1 className="hud__title">Element Game</h1>
      <p className="hud__controls">
        <span className="hud__key">WASD</span> or{' '}
        <span className="hud__key">Arrows</span> to move
        <br />
        <span className="hud__key">Space</span> to jump
        <br />
        <span className="hud__key">Click</span> to attack where you click
        <br />
        Drag to turn and look around
        <br />
        {isRunning ? 'Explore the wide oval' : 'Loading world...'}
        <br />
        {isDummyDefeated
          ? 'Dummy defeated — press R to reset'
          : `Dummy HP: ${dummyHp} / ${DUMMY_MAX_HP}`}
      </p>
    </aside>
  )
}
