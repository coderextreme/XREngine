import { BufferGeometry, Euler, ExtrudeGeometry, Mesh, MeshBasicMaterial, Quaternion, Vector3 } from 'three'
import { Body, BodyType, ShapeType, SHAPES, PhysXInstance } from 'three-physx'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { mergeBufferGeometries } from '../../common/classes/BufferGeometryUtils'
import { isClient } from '../../common/functions/isClient'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../ecs/functions/EntityFunctions'
import { ColliderComponent } from '../../physics/components/ColliderComponent'
import { CollisionGroups } from '../../physics/enums/CollisionGroups'
import { PhysicsSystem } from '../../physics/systems/PhysicsSystem'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { FontManager } from '../../xrui/classes/FontManager'
import { Object3DComponent } from '../components/Object3DComponent'
import { PortalComponent } from '../components/PortalComponent'

export type PortalProps = {
  locationName: string
  linkedPortalId: string
  displayText: string
  spawnPosition: Vector3
  spawnRotation: Quaternion
  spawnEuler: Euler
}

const vec3 = new Vector3()

export const createPortal = async (entity: Entity, args: PortalProps) => {
  console.log(args)
  const { locationName, linkedPortalId, displayText, spawnPosition } = args

  const spawnEuler = new Euler(args.spawnRotation.x, args.spawnRotation.y, args.spawnRotation.z, 'XYZ')
  const spawnRotation = new Quaternion().setFromEuler(spawnEuler)

  const transform = getComponent(entity, TransformComponent)

  // this is also not a great idea, we should load this either as a static asset or from the portal node arguments
  AssetLoader.load({ url: Engine.publicPath + '/models/common/portal_frame.glb' }, (gltf) => {
    const model = gltf.clone()
    const previewMesh = model.children[2] as Mesh
    const labelMesh = model.children[1] as Mesh

    model.position.copy(transform.position)
    model.quaternion.copy(transform.rotation)
    model.scale.copy(transform.scale)

    previewMesh.geometry.computeBoundingBox()
    previewMesh.geometry.boundingBox.getSize(vec3).multiplyScalar(0.5).setZ(0.1)

    const portalShape: ShapeType = {
      shape: SHAPES.Box,
      options: { boxExtents: vec3 },
      transform: { translation: previewMesh.position },
      config: {
        isTrigger: true,
        collisionLayer: CollisionGroups.Portal,
        collisionMask: CollisionGroups.Avatars
      }
    }

    const portalBody = PhysXInstance.instance.addBody(
      new Body({
        shapes: [portalShape],
        type: BodyType.STATIC,
        transform: {
          translation: transform.position,
          rotation: transform.rotation
        }
      })
    )

    PhysXInstance.instance.addBody(portalBody)

    portalBody.userData = { entity }

    addComponent(entity, ColliderComponent, { body: portalBody })

    if (isClient) {
      FontManager.instance.getDefaultFont().then((font) => {
        const fontResolution = 120

        const createText = (text, scale) => {
          const exitTextShapes = font.generateShapes(text, fontResolution)
          const geometry = new ExtrudeGeometry(exitTextShapes, { bevelEnabled: false })
          const invResolution = scale / fontResolution
          geometry.scale(invResolution, invResolution * 0.8, 1 / fontResolution)
          geometry.computeBoundingBox()
          const xMid = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x)
          geometry.translate(xMid, 0, 1)
          return geometry
        }

        let geometry: BufferGeometry = createText('EXIT', 2.5)

        if (args.displayText && args.displayText !== '') {
          const displayTextGeom = createText(args.displayText, 1)
          displayTextGeom.translate(0, -1.6, 0)
          geometry = mergeBufferGeometries([geometry, displayTextGeom])
        }

        const textSize = 0.15
        const text = new Mesh(geometry, new MeshBasicMaterial({ color: 0x000000 }))
        text.scale.setScalar(textSize)

        const textOtherSide = text.clone(true).rotateY(Math.PI)

        labelMesh.add(text)
        labelMesh.add(textOtherSide)
      })
    }

    addComponent(entity, Object3DComponent, { value: model })
  })

  addComponent(entity, PortalComponent, {
    location: locationName,
    linkedPortalId,
    displayText,
    spawnPosition,
    spawnRotation,
    spawnEuler,
    isPlayerInPortal: false,
    remoteSpawnPosition: new Vector3(),
    remoteSpawnRotation: new Quaternion(),
    remoteSpawnEuler: new Euler()
  })
}

export const setRemoteLocationDetail = (
  portal: ReturnType<typeof PortalComponent.get>,
  spawnPosition: Vector3,
  spawnRotation: Euler
): void => {
  portal.remoteSpawnPosition = new Vector3(spawnPosition.x, spawnPosition.y, spawnPosition.z)
  portal.remoteSpawnEuler = new Euler(spawnRotation.x, spawnRotation.y, spawnRotation.z, 'XYZ')
  portal.remoteSpawnRotation = new Quaternion().setFromEuler(portal.remoteSpawnEuler)
}

export const findProjectionScreen = (entity: Entity): any => {
  const obj = getComponent(entity, Object3DComponent)

  if (!obj || !obj.value) return null

  const mesh = obj.value

  const screen = mesh.getObjectByName('portalnextscenepreview')

  return screen
}
