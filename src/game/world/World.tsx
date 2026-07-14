import { RigidBody } from '@react-three/rapier'
import {
  ARENA_RADIUS_X,
  ARENA_RADIUS_Z,
  ARENA_WALL_HEIGHT,
  ARENA_WALL_SEGMENTS,
  ARENA_WALL_THICKNESS,
} from '../config/world'

const obstacles: Array<{
  position: [number, number, number]
  scale: [number, number, number]
  color: string
}> = [
  { position: [-80, 2, -40], scale: [4, 4, 4], color: '#59758b' },
  { position: [-38, 3, 36], scale: [6, 6, 6], color: '#40596b' },
  { position: [22, 1.5, -54], scale: [3, 3, 3], color: '#6c8b77' },
  { position: [72, 4, 42], scale: [5, 8, 5], color: '#4d6b58' },
  { position: [90, 2.5, -24], scale: [5, 5, 5], color: '#8c6e58' },
  { position: [-8, 2.5, 66], scale: [5, 5, 5], color: '#6a6388' },
]

const arenaWalls = Array.from({ length: ARENA_WALL_SEGMENTS }, (_, index) => {
  const angle = (index / ARENA_WALL_SEGMENTS) * Math.PI * 2
  const nextAngle = ((index + 1) / ARENA_WALL_SEGMENTS) * Math.PI * 2
  const x = ARENA_RADIUS_X * Math.cos(angle)
  const z = ARENA_RADIUS_Z * Math.sin(angle)
  const nextX = ARENA_RADIUS_X * Math.cos(nextAngle)
  const nextZ = ARENA_RADIUS_Z * Math.sin(nextAngle)
  const segmentLength = Math.hypot(nextX - x, nextZ - z) + ARENA_WALL_THICKNESS

  return {
    position: [x, ARENA_WALL_HEIGHT / 2, z] as [number, number, number],
    rotation: Math.atan2(nextZ - z, nextX - x),
    segmentLength,
  }
})

export function World() {
  return (
    <>
      <RigidBody colliders="trimesh" type="fixed">
        <mesh
          position={[0, -0.1, 0]}
          receiveShadow
          scale={[ARENA_RADIUS_X, 1, ARENA_RADIUS_Z]}
        >
          <cylinderGeometry args={[1, 1, 0.2, 64]} />
          <meshStandardMaterial color="#294451" roughness={0.95} />
        </mesh>
      </RigidBody>

      {arenaWalls.map((wall) => (
        <RigidBody
          colliders="cuboid"
          key={wall.rotation}
          position={wall.position}
          rotation={[0, -wall.rotation, 0]}
          type="fixed"
        >
          <mesh castShadow receiveShadow>
            <boxGeometry
              args={[
                wall.segmentLength,
                ARENA_WALL_HEIGHT,
                ARENA_WALL_THICKNESS,
              ]}
            />
            <meshStandardMaterial color="#56778b" roughness={0.75} />
          </mesh>
        </RigidBody>
      ))}

      {obstacles.map((obstacle) => (
        <RigidBody
          colliders="cuboid"
          key={obstacle.position.join('-')}
          position={obstacle.position}
          type="fixed"
        >
          <mesh castShadow receiveShadow scale={obstacle.scale}>
            <boxGeometry />
            <meshStandardMaterial color={obstacle.color} roughness={0.8} />
          </mesh>
        </RigidBody>
      ))}
    </>
  )
}
