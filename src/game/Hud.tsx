import { useGameStore } from './state/gameStore'

export function Hud() {
  const isRunning = useGameStore((state) => state.isRunning)

  return (
    <aside className="hud">
      <h1 className="hud__title">Element Game</h1>
      <p className="hud__controls">
        <span className="hud__key">WASD</span> or{' '}
        <span className="hud__key">Arrows</span> to move
        <br />
        <span className="hud__key">Space</span> to jump
        <br />
        Drag to look around
        <br />
        {isRunning ? 'Explore the wide oval' : 'Loading world...'}
      </p>
    </aside>
  )
}
