import { Stage, StageAPI } from '../engine/Types.js';
import { makePlayer, rect, pickup, tree, stone, spider } from './common.js';

export class MountainStage implements Stage {
  info = { name: 'Mountain Climb', objective: 'Eat all mountain snacks to leap over the cliff.', env:'mountain' } as const;
  private crafted = false;
  setup(api: StageAPI){
    api.addEntity(makePlayer(40, 300));
  api.addEntity(rect('cliff', 500, 0, 60, 540, true, 'cliff'));
  api.addEntity(pickup('mountain-food-1', 200, 200, 'stick'));
  api.addEntity(pickup('mountain-food-2', 260, 380, 'rock'));
  api.addEntity(pickup('mountain-food-3', 300, 100, 'log'));
    api.addEntity({ id:'goal', type:'goal', pos:{x:860,y:220}, w:60, h:120 });
  api.addEntity(stone('mStone1', 150, 440));
  api.addEntity(tree('mTree1', 400, 80));
  api.addEntity(spider('spiderM1', 720, 260));
  api.addEntity({ id:'dragon1', type:'enemy', appearance:'dragon', pos:{x:560,y:100}, w:70,h:50, data:{ move:{ vx:0, vy:80, minX:560, maxX:560, minY:100, maxY:380 } } });
  api.addEntity({ id:'dragon2', type:'enemy', appearance:'dragon', pos:{x:640,y:300}, w:70,h:50, data:{ move:{ vx:0, vy:110, minX:640, maxX:640, minY:140, maxY:430 } } });
  }
  update(dt: number, api: StageAPI){
    if(!this.crafted && api.hasItem('mountain-food-1') && api.hasItem('mountain-food-2') && api.hasItem('mountain-food-3')){
      api.removeEntity('cliff');
      this.crafted = true;
      api.status('Fueled up! The cat bounds past the cliff.');
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
