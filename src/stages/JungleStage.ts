import { Stage, StageAPI } from '../engine/Types.js';
import { makePlayer, rect, pickup, tree, stone, spider } from './common.js';

export class JungleStage implements Stage {
  info = { name: 'Jungle Maze', objective: 'Eat all jungle food to energize and pass the vines.', env:'jungle' } as const;
  private cleared = false;
  setup(api: StageAPI){
    api.addEntity(makePlayer(40, 260));
  api.addEntity(rect('vines', 400, 0, 40, 540, true, 'vines'));
  api.addEntity(pickup('jungle-food-1', 200, 100, 'stick'));
  api.addEntity(pickup('jungle-food-2', 260, 420, 'rock'));
    api.addEntity({ id:'goal', type:'goal', pos:{x:820,y:240}, w:60, h:120 });
  api.addEntity(tree('jTree1', 100, 80));
  api.addEntity(tree('jTree2', 300, 60));
  api.addEntity(stone('jStone1', 520, 420));
  api.addEntity(spider('spiderJ1', 720, 260));
  // Dogs vertical patrol
  api.addEntity({ id:'dogJ1', type:'enemy', appearance:'dog', pos:{x:500,y:80}, w:50,h:40, data:{ move:{ vx:0, vy:60, minX:500, maxX:500, minY:80, maxY:400 } } });
  api.addEntity({ id:'dogJ2', type:'enemy', appearance:'dog', pos:{x:660,y:100}, w:50,h:40, data:{ move:{ vx:0, vy:90, minX:660, maxX:660, minY:100, maxY:420 } } });
  }
  update(dt: number, api: StageAPI){
    if(!this.cleared && api.hasItem('jungle-food-1') && api.hasItem('jungle-food-2')){
      api.removeEntity('vines');
      this.cleared = true;
      api.status('The vines wilt after the feast!');
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
