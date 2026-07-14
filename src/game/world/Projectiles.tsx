import { BallCollider, RigidBody } from '@react-three/rapier'
import { useCallback, useEffect } from 'react'
import {
  PROJECTILE_LIFESPAN_MS,
  PROJECTILE_RADIUS,
  PROJECTILE_SPEED,
} from '../config/player'
import type { Projectile } from '../state/projectileStore'
import { useProjectileStore } from '../state/projectileStore'

function ProjectileBody({ projectile }: { projectile: Projectile }) {
  const removeProjectile = useProjectileStore((state) => state.removeProjectile)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      removeProjectile(projectile.id)
    }, PROJECTILE_LIFESPAN_MS)

    return () => window.clearTimeout(timeout)
  }, [projectile.id, removeProjectile])

  const handleCollision = useCallback(() => {
    removeProjectile(projectile.id)
  }, [projectile.id, removeProjectile])

  return (
    <RigidBody
      ccd
      colliders={false}
      gravityScale={0}
      linearVelocity={[
        projectile.direction[0] * PROJECTILE_SPEED,
        projectile.direction[1] * PROJECTILE_SPEED,
        projectile.direction[2] * PROJECTILE_SPEED,
      ]}
      onCollisionEnter={handleCollision}
      position={projectile.spawnPosition}
    >
      <BallCollider args={[PROJECTILE_RADIUS]} />
      <mesh castShadow>
        <sphereGeometry args={[PROJECTILE_RADIUS, 12, 12]} />
        <meshStandardMaterial
          color="#ffd166"
          emissive="#ff9f1c"
          emissiveIntensity={2}
        />
      </mesh>
    </RigidBody>
  )
}

export function Projectiles() {
  const projectiles = useProjectileStore((state) => state.projectiles)

  return (
    <>
      {projectiles.map((projectile) => (
        <ProjectileBody key={projectile.id} projectile={projectile} />
      ))}
    </>
  )
}
