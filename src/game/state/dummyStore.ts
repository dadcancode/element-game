import { create } from 'zustand'
import { DUMMY_MAX_HP } from '../config/dummy'

type DummyState = {
  hp: number
  isDefeated: boolean
  takeDamage: (amount: number) => void
  reset: () => void
}

export const useDummyStore = create<DummyState>((set) => ({
  hp: DUMMY_MAX_HP,
  isDefeated: false,
  takeDamage: (amount) =>
    set((state) => {
      if (state.isDefeated) {
        return state
      }

      const hp = Math.max(0, state.hp - amount)
      return { hp, isDefeated: hp <= 0 }
    }),
  reset: () => set({ hp: DUMMY_MAX_HP, isDefeated: false }),
}))
