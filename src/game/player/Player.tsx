import {
  CapsuleCollider,
  RigidBody,
  useBeforePhysicsStep,
} from '@react-three/rapier'
import type { RapierRigidBody } from '@react-three/rapier'
import { useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import type { Group, Object3D } from 'three'
import { Raycaster, Vector2, Vector3 } from 'three'
import {
  PLAYER_CAPSULE_HALF_HEIGHT,
  PLAYER_GROUNDED_HEIGHT,
  PLAYER_JUMP_SPEED,
  PLAYER_MAX_GROUNDED_DOWNWARD_SPEED,
  PLAYER_RADIUS,
  PLAYER_SPAWN,
  PLAYER_SPEED,
  PROJECTILE_COOLDOWN_MS,
  PROJECTILE_MAX_AIM_DISTANCE,
  PROJECTILE_SPAWN_FORWARD_OFFSET,
  PROJECTILE_SPAWN_HEIGHT,
} from '../config/player'
import { useGameStore } from '../state/gameStore'
import { useProjectileStore } from '../state/projectileStore'

type PlayerProps = {
  bodyRef: React.RefObject<RapierRigidBody | null>
  visualRef: React.RefObject<Group | null>
  yawRef: React.RefObject<number>
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
const spawnPosition = new Vector3()
const shotDirection = new Vector3()
const aimTargetPoint = new Vector3()
const pointerNdc = new Vector2()
const aimRaycaster = new Raycaster()

function isDescendantOf(object: Object3D, ancestor: Object3D) {
  let node: Object3D | null = object
  while (node) {
    if (node === ancestor) {
      return true
    }
    node = node.parent
  }
  return false
}

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

export function Player({ bodyRef, visualRef, yawRef }: PlayerProps) {
  const camera = useThree((state) => state.camera)
  const gl = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)
  const input = useMovementInput()
  const setIsRunning = useGameStore((state) => state.setIsRunning)
  const spawnProjectile = useProjectileStore((state) => state.spawnProjectile)
  const lastShotAtRef = useRef(0)

  useEffect(() => {
    setIsRunning(true)
    return () => setIsRunning(false)
  }, [setIsRunning])

  useEffect(() => {
    const canvas = gl.domElement

    const onMouseDown = (event: MouseEvent) => {
      if (event.button !== 0) {
        return
      }

      const now = performance.now()
      if (now - lastShotAtRef.current < PROJECTILE_COOLDOWN_MS) {
        return
      }

      const visual = visualRef.current
      if (!visual) {
        return
      }

      lastShotAtRef.current = now

      const rect = canvas.getBoundingClientRect()
      pointerNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointerNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      aimRaycaster.setFromCamera(pointerNdc, camera)

      // Find the exact world point the player clicked on, ignoring their own
      // body, so the shot travels to whatever is actually visible there.
      const hits = aimRaycaster.intersectObjects(scene.children, true)
      const hit = hits.find((candidate) => !isDescendantOf(candidate.object, visual))

      if (hit) {
        aimTargetPoint.copy(hit.point)
      } else {
        aimTargetPoint
          .copy(aimRaycaster.ray.origin)
          .addScaledVector(aimRaycaster.ray.direction, PROJECTILE_MAX_AIM_DISTANCE)
      }

      visual.getWorldPosition(spawnPosition)
      spawnPosition.y = PROJECTILE_SPAWN_HEIGHT

      shotDirection.subVectors(aimTargetPoint, spawnPosition).normalize()
      spawnPosition.addScaledVector(shotDirection, PROJECTILE_SPAWN_FORWARD_OFFSET)

      spawnProjectile(
        [spawnPosition.x, spawnPosition.y, spawnPosition.z],
        [shotDirection.x, shotDirection.y, shotDirection.z],
      )
    }

    canvas.addEventListener('mousedown', onMouseDown)

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown)
    }
  }, [camera, gl, scene, spawnProjectile, visualRef])

  useBeforePhysicsStep(() => {
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

    // The character always faces the same way as the camera: turning the
    // camera turns the body, like a standard third-person shooter.
    const yaw = yawRef.current
    body.setRotation(
      {
        x: 0,
        y: Math.sin(yaw / 2),
        z: 0,
        w: Math.cos(yaw / 2),
      },
      true,
    )

    let horizontalVelocityX = 0
    let horizontalVelocityZ = 0
    if (movement.forward !== 0 || movement.right !== 0) {
      forward.set(Math.sin(yaw), 0, Math.cos(yaw))
      right.crossVectors(forward, worldUp).normalize()
      direction
        .copy(forward)
        .multiplyScalar(movement.forward)
        .addScaledVector(right, movement.right)
        .normalize()

      horizontalVelocityX = direction.x * PLAYER_SPEED
      horizontalVelocityZ = direction.z * PLAYER_SPEED
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
      <group ref={visualRef}>
        <mesh castShadow position={[0, 0, 0]}>
          <capsuleGeometry args={[PLAYER_RADIUS, PLAYER_CAPSULE_HALF_HEIGHT * 2, 8, 16]} />
          <meshStandardMaterial color="#f4c95d" roughness={0.55} />
        </mesh>
        <mesh castShadow position={[0, 0.18, 0.34]}>
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshStandardMaterial color="#253343" emissive="#253343" />
        </mesh>
      </group>
    </RigidBody>
  )
}
