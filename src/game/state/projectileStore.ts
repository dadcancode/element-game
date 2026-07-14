import { create } from 'zustand'

export type Projectile = {
  id: number
  spawnPosition: [number, number, number]
  direction: [number, number, number]
  spawnedAt: number
}

type ProjectileState = {
  projectiles: Projectile[]
  spawnProjectile: (
    spawnPosition: [number, number, number],
    direction: [number, number, number],
  ) => void
  removeProjectile: (id: number) => void
}

let nextProjectileId = 0

export const useProjectileStore = create<ProjectileState>((set) => ({
  projectiles: [],
  spawnProjectile: (spawnPosition, direction) =>
    set((state) => ({
      projectiles: [
        ...state.projectiles,
        {
          id: nextProjectileId++,
          spawnPosition,
          direction,
          spawnedAt: performance.now(),
        },
      ],
    })),
  removeProjectile: (id) =>
    set((state) => ({
      projectiles: state.projectiles.filter((projectile) => projectile.id !== id),
    })),
}))
