export * from "./classes/ParticleEmitter"
export * from "./classes/ParticleMesh"
export * from "./components/Keyframe"
export * from "./components/ParticleEmitter"
export * from "./functions/Keyframes"
export * from "./systems/KeyframeSystem"
export * from "./systems/ParticleSystem"

import { isBrowser } from "../common/functions/isBrowser"
import { ParticleEmitter, ParticleEmitterState } from "./components/ParticleEmitter"
import { ParticleSystem } from "./systems/ParticleSystem"
import { World } from "../ecs/classes/World"

const DEFAULT_OPTIONS = {
  mouse: true,
  keyboard: true,
  touchscreen: true,
  gamepad: true,
  debug: false
}

export function initializeParticleSystem(world: World, options = DEFAULT_OPTIONS): void {
  if (options.debug) console.log("Initializing particle system...")

  if (!isBrowser) return console.error("Couldn't initialize particles, are you in a browser?")

  if (window && options.debug) (window as any).DEBUG_INPUT = true

  if (options.debug) {
    console.log("Registering particle system with the following options:")
    console.log(options)
  }

  world
    .registerSystem(ParticleSystem)
    .registerComponent(ParticleEmitterState)
    .registerComponent(ParticleEmitter)

  if (options.debug) console.log("INPUT: Registered particle system.")
}
