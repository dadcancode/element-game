import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import type { Group } from 'three'
import { MathUtils, Vector3 } from 'three'
import {
  CAMERA_DISTANCE,
  CAMERA_FOLLOW_SMOOTHING,
  CAMERA_HEIGHT,
  CAMERA_MAX_PITCH,
  CAMERA_MIN_PITCH,
  CAMERA_ROTATION_SENSITIVITY,
} from '../config/player'

type ThirdPersonCameraProps = {
  playerVisual: React.RefObject<Group | null>
  yawRef: React.RefObject<number>
}

const target = new Vector3()
const desiredPosition = new Vector3()
const up = new Vector3(0, 1, 0)

export function ThirdPersonCamera({ playerVisual, yawRef }: ThirdPersonCameraProps) {
  const { camera, gl } = useThree()
  const pitch = useRef(0.15)
  const isDragging = useRef(false)

  useEffect(() => {
    const canvas = gl.domElement

    const onPointerDown = (event: PointerEvent) => {
      isDragging.current = true
      canvas.setPointerCapture(event.pointerId)
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!isDragging.current) {
        return
      }

      yawRef.current -= event.movementX * CAMERA_ROTATION_SENSITIVITY
      pitch.current = MathUtils.clamp(
        pitch.current - event.movementY * CAMERA_ROTATION_SENSITIVITY,
        CAMERA_MIN_PITCH,
        CAMERA_MAX_PITCH,
      )
    }

    const onPointerUp = (event: PointerEvent) => {
      isDragging.current = false
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId)
      }
    }

    const onContextMenu = (event: MouseEvent) => event.preventDefault()

    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointercancel', onPointerUp)
    canvas.addEventListener('contextmenu', onContextMenu)

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointercancel', onPointerUp)
      canvas.removeEventListener('contextmenu', onContextMenu)
    }
  }, [gl, yawRef])

  useFrame((_, delta) => {
    const visual = playerVisual.current
    if (!visual) {
      return
    }

    visual.getWorldPosition(target)
    target.y += 0.7

    const horizontalDistance = CAMERA_DISTANCE * Math.cos(pitch.current)
    desiredPosition
      .set(
        0,
        CAMERA_HEIGHT + CAMERA_DISTANCE * Math.sin(pitch.current),
        -horizontalDistance,
      )
      .applyAxisAngle(up, yawRef.current)
      .add(target)

    camera.position.lerp(
      desiredPosition,
      1 - Math.exp(-CAMERA_FOLLOW_SMOOTHING * delta),
    )
    camera.lookAt(target)
  })

  return null
}
