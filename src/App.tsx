import { Game } from './game/Game'
import { Hud } from './game/Hud'
import './App.css'

function App() {
  return (
    <main className="game-app">
      <Game />
      <Hud />
    </main>
  )
}

export default App
