import { CapsuleCollider, RigidBody } from '@react-three/rapier'
import type { RapierRigidBody } from '@react-three/rapier'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Vector3 } from 'three'
import {
  PLAYER_CAPSULE_HALF_HEIGHT,
  PLAYER_GROUNDED_HEIGHT,
  PLAYER_JUMP_SPEED,
  PLAYER_MAX_GROUNDED_DOWNWARD_SPEED,
  PLAYER_RADIUS,
  PLAYER_SPAWN,
  PLAYER_SPEED,
} from '../config/player'
import { useGameStore } from '../state/gameStore'

type PlayerProps = {
  bodyRef: React.RefObject<RapierRigidBody | null>
}

type MovementInput = {
  forward: number
  jumpQueued: boolean
  right: number
}

const forward = new Vector3()
const right = new Vector3()
const direction = new Vector3()
const worldUp = new Vector3(0, 1, 0)

function useMovementInput() {
  const input = useRef<MovementInput>({
    forward: 0,
    jumpQueued: false,
    right: 0,
  })

  useEffect(() => {
    const updateInput = () => {
      const keys = pressedKeys.current
      input.current.forward = Number(keys.has('KeyW') || keys.has('ArrowUp')) -
        Number(keys.has('KeyS') || keys.has('ArrowDown'))
      input.current.right = Number(keys.has('KeyD') || keys.has('ArrowRight')) -
        Number(keys.has('KeyA') || keys.has('ArrowLeft'))
    }

    const pressedKeys = { current: new Set<string>() }
    const onKeyDown = (event: KeyboardEvent) => {
      pressedKeys.current.add(event.code)
      if (event.code === 'Space' && !event.repeat) {
        input.current.jumpQueued = true
      }
      updateInput()
    }
    const onKeyUp = (event: KeyboardEvent) => {
      pressedKeys.current.delete(event.code)
      updateInput()
    }
    const onBlur = () => {
      pressedKeys.current.clear()
      input.current.jumpQueued = false
      updateInput()
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [])

  return input
}

export function Player({ bodyRef }: PlayerProps) {
  const camera = useThree((state) => state.camera)
  const input = useMovementInput()
  const setIsRunning = useGameStore((state) => state.setIsRunning)

  useEffect(() => {
    setIsRunning(true)
    return () => setIsRunning(false)
  }, [setIsRunning])

  useFrame(() => {
    const body = bodyRef.current
    if (!body) {
      return
    }

    const movement = input.current
    const velocity = body.linvel()
    const position = body.translation()
    const isGrounded =
      position.y <= PLAYER_GROUNDED_HEIGHT &&
      velocity.y <= PLAYER_MAX_GROUNDED_DOWNWARD_SPEED

    if (movement.jumpQueued && isGrounded) {
      velocity.y = PLAYER_JUMP_SPEED
    }
    movement.jumpQueued = false

    let horizontalVelocityX = 0
    let horizontalVelocityZ = 0
    if (movement.forward !== 0 || movement.right !== 0) {
      camera.getWorldDirection(forward)
      forward.y = 0
      forward.normalize()
      right.crossVectors(forward, worldUp).normalize()
      direction
        .copy(forward)
        .multiplyScalar(movement.forward)
        .addScaledVector(right, movement.right)
        .normalize()

      horizontalVelocityX = direction.x * PLAYER_SPEED
      horizontalVelocityZ = direction.z * PLAYER_SPEED
      const heading = Math.atan2(direction.x, direction.z)
      body.setRotation(
        {
          x: 0,
          y: Math.sin(heading / 2),
          z: 0,
          w: Math.cos(heading / 2),
        },
        true,
      )
    }

    body.setLinvel(
      {
        x: horizontalVelocityX,
        y: velocity.y,
        z: horizontalVelocityZ,
      },
      true,
    )
  })

  return (
    <RigidBody
      angularDamping={10}
      canSleep={false}
      colliders={false}
      enabledRotations={[false, false, false]}
      linearDamping={8}
      position={PLAYER_SPAWN}
      ref={bodyRef}
    >
      <CapsuleCollider args={[PLAYER_CAPSULE_HALF_HEIGHT, PLAYER_RADIUS]} />
      <mesh castShadow position={[0, 0, 0]}>
        <capsuleGeometry args={[PLAYER_RADIUS, PLAYER_CAPSULE_HALF_HEIGHT * 2, 8, 16]} />
        <meshStandardMaterial color="#f4c95d" roughness={0.55} />
      </mesh>
      <mesh castShadow position={[0, 0.18, 0.34]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial color="#253343" emissive="#253343" />
      </mesh>
    </RigidBody>
  )
}
