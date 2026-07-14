import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { useRef } from 'react'
import type { RapierRigidBody } from '@react-three/rapier'
import { CAMERA_FAR_PLANE, WORLD_FOG_FAR, WORLD_FOG_NEAR } from './config/world'
import { Player } from './player/Player'
import { ThirdPersonCamera } from './player/ThirdPersonCamera'
import { World } from './world/World'

function Scene() {
  const playerBody = useRef<RapierRigidBody>(null)

  return (
    <>
      <color args={['#8ecae6']} attach="background" />
      <fog args={['#8ecae6', WORLD_FOG_NEAR, WORLD_FOG_FAR]} attach="fog" />
      <hemisphereLight args={['#d8f3ff', '#253f36', 2]} />
      <directionalLight
        castShadow
        intensity={2.5}
        position={[8, 12, 5]}
        shadow-mapSize-height={2048}
        shadow-mapSize-width={2048}
      />
      <Physics gravity={[0, -20, 0]}>
        <World />
        <Player bodyRef={playerBody} />
      </Physics>
      <ThirdPersonCamera playerBody={playerBody} />
    </>
  )
}

export function Game() {
  return (
    <Canvas
      camera={{ fov: 55, near: 0.1, far: CAMERA_FAR_PLANE }}
      className="game-canvas"
      dpr={[1, 2]}
      shadows
    >
      <Scene />
    </Canvas>
  )
}
