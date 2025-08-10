import { Stage, StageAPI } from '../engine/Types.js';
import { makePlayer, rect, pickup, tree, stone, spider } from './common.js';

export class RiverStage implements Stage {
  info = { name: 'River Crossing', objective: 'Eat all fish food then reach the far bank.', env:'river' } as const;
  private built = false;
  setup(api: StageAPI){
    api.addEntity(makePlayer(40, 220));
    // River represented by blocking rectangle (obstacle)
  api.addEntity(rect('river', 300, 0, 120, 540, true, 'river'));
  // Logs & rope to collect
  api.addEntity(pickup('fish-food-1', 140, 140, 'boat'));
  api.addEntity(pickup('fish-food-2', 180, 360, 'boat'));
  api.addEntity(pickup('fish-food-3', 220, 250, 'boat'));
  // scenery static obstacles
  api.addEntity(tree('tree1', 80, 60));
  api.addEntity(tree('tree2', 540, 40));
  api.addEntity(stone('stone1', 120, 420));
  api.addEntity(stone('stone2', 600, 100));
    // Goal position on far bank
    api.addEntity({ id:'goal', type:'goal', pos:{x:760,y:220}, w:60, h:100 });
  // Enemies dogs patrolling horizontally
  api.addEntity({ id:'dog1', type:'enemy', appearance:'dog', pos:{x:420,y:120}, w:50,h:40, data:{ move:{ vx:50, vy:0, minX:420, maxX:560, minY:120, maxY:120 } } });
  api.addEntity({ id:'dog2', type:'enemy', appearance:'dog', pos:{x:420,y:360}, w:50,h:40, data:{ move:{ vx:70, vy:0, minX:420, maxX:620, minY:360, maxY:360 } } });
  api.addEntity(spider('spiderR1', 680, 260));
  }
  update(dt: number, api: StageAPI){
    // If player has logs and rope, create a bridge (remove river obstacle) once.
    if(!this.built && api.hasItem('fish-food-1') && api.hasItem('fish-food-2') && api.hasItem('fish-food-3')){
  api.removeEntity('river');
      this.built = true;
      api.status('The cat is strong after eating! Path clears.');
    }
  }
  isComplete(api: StageAPI){
    const player = api.getEntities().find(e => e.id==='player');
    const goal = api.getEntities().find(e => e.id==='goal');
    if(player && goal){
      return player.pos.x + player.w > goal.pos.x;
    }
    return false;
  }
}
