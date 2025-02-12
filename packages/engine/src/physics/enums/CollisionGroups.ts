/**
 * @author HydraFire <github.com/HydraFire>
 */

export enum CollisionGroups {
  None = 0,
  Default = 1 << 0,
  Avatars = 1 << 1,
  Car = 1 << 2,
  Portal = 1 << 3,
  Ground = 1 << 4,
  Trigger = 1 << 5
}

export const DefaultCollisionMask = CollisionGroups.Default | CollisionGroups.Avatars | CollisionGroups.Ground
