import { Object3D, sRGBEncoding, Box3, Vector3 } from 'three'
import { Easing, Tween } from '@tweenjs/tween.js'
import { defineQuery, defineSystem, enterQuery, exitQuery, Not, System } from '../ecs/bitecs'
import { ECSWorld } from '../ecs/classes/World'

import { getComponent, hasComponent, addComponent, removeComponent } from '../ecs/functions/EntityFunctions'

import { AssetLoader } from '../assets/classes/AssetLoader'

import { Object3DComponent } from '../scene/components/Object3DComponent'
import { AvatarPendingComponent } from './components/AvatarPendingComponent'
import { AvatarComponent } from './components/AvatarComponent'
import { AvatarDissolveComponent } from './components/AvatarDissolveComponent'
import { AvatarEffectComponent } from './components/AvatarEffectComponent'
import { TweenComponent } from '../transform/components/TweenComponent'
import { DissolveEffect } from './DissolveEffect'
import { LocalInputReceiverComponent } from '../input/components/LocalInputReceiverComponent'
import { isEntityLocalClient } from '../networking/functions/isEntityLocalClient'

const lightScale = (y, r) => {
  return Math.min(1, Math.max(1e-3, y / r))
}

const lightOpacity = (y, r) => {
  return Math.min(1, Math.max(0, 1 - (y - r) * 0.5))
}

export const AvatarLoadingSystem = async (): Promise<System> => {
  const growQuery = defineQuery([AvatarEffectComponent, Object3DComponent, AvatarPendingComponent])
  const growAddQuery = enterQuery(growQuery)
  const growRemoveQuery = exitQuery(growQuery)

  const commonQuery = defineQuery([AvatarEffectComponent, Object3DComponent])
  const dissolveQuery = defineQuery([AvatarComponent, Object3DComponent, AvatarDissolveComponent])

  return defineSystem((world: ECSWorld) => {
    const { delta } = world

    for (const entity of growAddQuery(world)) {
      const object = getComponent(entity, Object3DComponent).value
      const plateComponent = getComponent(entity, AvatarEffectComponent)

      const pillar = new Object3D()
      pillar.name = 'pillar_obj'
      object.add(pillar)

      const apc = getComponent(entity, AvatarPendingComponent)
      const light = apc.light
      const plate = apc.plate

      const R = 0.6 * plate.geometry.boundingSphere.radius
      for (let i = 0, n = 5 + 10 * R * Math.random(); i < n; i += 1) {
        const ray = light.clone()
        ray.material = (<any>light.material).clone()
        ray.position.y -= 2 * ray.geometry.boundingSphere.radius * Math.random()

        var a = (2 * Math.PI * i) / n,
          r = R * Math.random()
        ray.position.x += r * Math.cos(a)
        ray.position.z += r * Math.sin(a)

        ray.rotation.y = Math.random() * 2 * Math.PI
        pillar.add(ray)
      }

      const pt = plate.clone()
      pt.name = 'plate_obj'
      pt.material = (<any>pt.material).clone()
      object.add(pt)
      pt.rotation.x = -0.5 * Math.PI

      if (isEntityLocalClient(entity)) {
        removeComponent(entity, LocalInputReceiverComponent)
      }

      addComponent(entity, TweenComponent, {
        tween: new Tween<any>(plateComponent)
          .to(
            {
              opacityMultiplier: 1
            },
            3000
          )
          .easing(Easing.Exponential.Out)
          .start()
          .onComplete(() => {
            removeComponent(entity, TweenComponent)
            // removeComponent(entity, AvatarPendingComponent)
            const object = getComponent(entity, Object3DComponent).value
            const bbox = new Box3().setFromObject(object.children[0])
            addComponent(entity, AvatarDissolveComponent, {
              effect: new DissolveEffect(object, bbox.min.y, bbox.max.y)
            })
          })
      })
    }

    for (const entity of growRemoveQuery(world)) {
      // const plateComponent = getComponent(entity, AvatarEffectComponent)
      // addComponent(entity, TweenComponent, {
      //   tween: new Tween<any>(plateComponent)
      //     .to(
      //       {
      //         opacityMultiplier: 0
      //       },
      //       2000
      //     )
      //     .start()
      //     .onComplete(async () => {
      //       removeComponent(entity, TweenComponent)
      //     })
      // })
    }

    for (const entity of commonQuery(world)) {
      const object = getComponent(entity, Object3DComponent).value
      const opacityMultiplier = getComponent(entity, AvatarEffectComponent).opacityMultiplier

      let pillar = null
      let plate = null

      const childrens = object.children
      for (let i = 0; i < childrens.length; i++) {
        if (childrens[i].name === 'pillar_obj') pillar = childrens[i]
        if (childrens[i].name === 'plate_obj') plate = childrens[i]
      }

      if (pillar !== null && plate !== null) {
        plate['material'].opacity = opacityMultiplier * (0.7 + 0.5 * Math.sin((Date.now() % 6283) * 5e-3))
        if (pillar !== undefined && plate !== undefined) {
          for (var i = 0, n = pillar.children.length; i < n; i++) {
            var ray = pillar.children[i]
            ray.position.y += 2 * delta
            ray.scale.y = lightScale(ray.position.y, ray['geometry'].boundingSphere.radius)
            ray['material'].opacity = lightOpacity(ray.position.y, ray['geometry'].boundingSphere.radius)

            if (ray['material'].opacity < 1e-3) {
              ray.position.y = plate.position.y
            }
            ray['material'].opacity *= opacityMultiplier
          }
        }
      }
    }

    for (const entity of dissolveQuery(world)) {
      // console.log("dissolve")
      const objecteffect = getComponent(entity, AvatarDissolveComponent).effect

      if (objecteffect.update(delta)) {
        removeComponent(entity, AvatarDissolveComponent)
        const object = getComponent(entity, Object3DComponent).value
        const plateComponent = getComponent(entity, AvatarEffectComponent)

        console.log(object, plateComponent.originMaterials)
        plateComponent.originMaterials.forEach(({ id, material }) => {
          object.traverse((obj) => {
            if (obj.uuid === id) {
              obj['material'] = material
            }
          })
        })

        addComponent(entity, TweenComponent, {
          tween: new Tween<any>(plateComponent)
            .to(
              {
                opacityMultiplier: 0
              },
              2000
            )
            .start()
            .onComplete(async () => {
              removeComponent(entity, TweenComponent)

              const object = getComponent(entity, Object3DComponent).value
              let pillar = null
              let plate = null

              const childrens = object.children
              for (let i = 0; i < childrens.length; i++) {
                if (childrens[i].name === 'pillar_obj') pillar = childrens[i]
                if (childrens[i].name === 'plate_obj') plate = childrens[i]
              }

              if (pillar !== null) {
                pillar.traverse(function (child) {
                  if (child['material']) child['material'].dispose()
                })

                pillar.parent.remove(pillar)
              }

              if (plate !== null) {
                plate.traverse(function (child) {
                  if (child['material']) child['material'].dispose()
                })

                plate.parent.remove(plate)
              }

              removeComponent(entity, AvatarEffectComponent)

              if (isEntityLocalClient(entity)) {
                addComponent(entity, LocalInputReceiverComponent, {})
              }
            })
        })
      }
    }

    return world
  })
}
