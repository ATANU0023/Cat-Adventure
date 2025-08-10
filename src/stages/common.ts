import { Entity } from '../engine/Types.js';

export function makePlayer(x:number,y:number): Entity { return { id:'player', appearance:'cat', pos:{x,y}, w:44,h:40 }; }
export function rect(id:string,x:number,y:number,w:number,h:number, solid=true, appearance?:string): Entity { return { id, pos:{x,y}, w,h, solid, appearance }; }
export function tree(id:string,x:number,y:number): Entity { return { id, pos:{x,y}, w:60, h:90, solid:true, appearance:'tree' }; }
export function stone(id:string,x:number,y:number): Entity { return { id, pos:{x,y}, w:50, h:40, solid:true, appearance:'stone' }; }
export function spider(id:string,x:number,y:number, w=40,h=40): Entity { return { id, type:'enemy', appearance:'spider', pos:{x,y}, w, h, data:{ move:{ vx:0, vy:70, minX:x, maxX:x, minY:y-80, maxY:y+80 } } }; }
export function pickup(id:string,x:number,y:number, appearance?:string): Entity { return { id, pos:{x,y}, w:30,h:30, pickup:true, type:id, appearance: appearance||id }; }
