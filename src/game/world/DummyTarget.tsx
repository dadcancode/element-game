import { CapsuleCollider, RigidBody } from '@react-three/rapier'
import type { CollisionEnterPayload } from '@react-three/rapier'
import { Billboard } from '@react-three/drei'
import { useCallback, useEffect } from 'react'
import { PROJECTILE_DAMAGE } from '../config/player'
import {
  DUMMY_HALF_HEIGHT,
  DUMMY_HP_BAR_HEIGHT,
  DUMMY_HP_BAR_WIDTH,
  DUMMY_HP_BAR_Y_OFFSET,
  DUMMY_MAX_HP,
  DUMMY_POSITION,
  DUMMY_RADIUS,
  DUMMY_RESET_KEY,
} from '../config/dummy'
import { useDummyStore } from '../state/dummyStore'

export function DummyTarget() {
  const hp = useDummyStore((state) => state.hp)
  const isDefeated = useDummyStore((state) => state.isDefeated)
  const takeDamage = useDummyStore((state) => state.takeDamage)
  const reset = useDummyStore((state) => state.reset)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === DUMMY_RESET_KEY) {
        reset()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [reset])

  const handleCollision = useCallback(
    (event: CollisionEnterPayload) => {
      if (event.other.rigidBodyObject?.userData?.type === 'projectile') {
        takeDamage(PROJECTILE_DAMAGE)
      }
    },
    [takeDamage],
  )

  const hpRatio = hp / DUMMY_MAX_HP

  return (
    <RigidBody
      colliders={false}
      onCollisionEnter={handleCollision}
      position={DUMMY_POSITION}
      type="fixed"
    >
      <CapsuleCollider args={[DUMMY_HALF_HEIGHT, DUMMY_RADIUS]} />
      <mesh castShadow position={[0, isDefeated ? -DUMMY_HALF_HEIGHT * 0.6 : 0, 0]}>
        <capsuleGeometry args={[DUMMY_RADIUS, DUMMY_HALF_HEIGHT * 2, 8, 16]} />
        <meshStandardMaterial
          color={isDefeated ? '#4a4a4a' : '#c1443c'}
          roughness={0.6}
        />
      </mesh>

      <group position={[0, DUMMY_HP_BAR_Y_OFFSET, 0]}>
        <Billboard>
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[DUMMY_HP_BAR_WIDTH, DUMMY_HP_BAR_HEIGHT]} />
            <meshBasicMaterial color="#1a1a1a" />
          </mesh>
          <mesh
            position={[
              -(DUMMY_HP_BAR_WIDTH * (1 - Math.max(hpRatio, 0))) / 2,
              0,
              0,
            ]}
            scale={[Math.max(hpRatio, 0), 1, 1]}
          >
            <planeGeometry args={[DUMMY_HP_BAR_WIDTH, DUMMY_HP_BAR_HEIGHT]} />
            <meshBasicMaterial color={isDefeated ? '#555555' : '#4bd05c'} />
          </mesh>
        </Billboard>
      </group>
    </RigidBody>
  )
}
