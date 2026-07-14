import { create } from 'zustand'

type GameState = {
  isRunning: boolean
  setIsRunning: (isRunning: boolean) => void
}

export const useGameStore = create<GameState>((set) => ({
  isRunning: false,
  setIsRunning: (isRunning) => set({ isRunning }),
}))
