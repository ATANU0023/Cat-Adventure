import { Entity } from './Types.js';
export class Physics {
  aabbOverlap(a: Entity, b: Entity){
    return a.pos.x < b.pos.x + b.w && a.pos.x + a.w > b.pos.x && a.pos.y < b.pos.y + b.h && a.pos.y + a.h > b.pos.y;
  }
  anySolidOverlap(target: Entity, entities: Entity[]){
    return entities.some(e => e !== target && e.solid && this.aabbOverlap(target, e));
  }
}
