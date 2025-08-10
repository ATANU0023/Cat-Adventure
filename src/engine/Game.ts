import { Entity, Stage, StageAPI } from './Types.js';
import { Input } from './Input.js';
import { Physics } from './Physics.js';
import { Renderer } from './Renderer.js';

interface Hooks {
  onStageInfo(info:{name:string; objective:string;}): void;
  onInventoryUpdate(items: string[]): void;
  onStageComplete(): void;
  onStatus?(text: string, ttl?: number): void;
  onGameOver?(): void;
  onEat?(): void;
}

export class Game implements StageAPI {
  private ctx: CanvasRenderingContext2D;
  private entities: Entity[] = [];
  private stage?: Stage;
  private stageInfo?: {name:string; objective:string; env?: 'river' | 'jungle' | 'mountain'};
  private inventoryItems: string[] = [];
  private lastTime = 0;
  private elapsed = 0;
  private running = false;
  completeFlag = false;

  private input = new Input();
  private physics = new Physics();
  private renderer: Renderer;

  constructor(private canvas: HTMLCanvasElement, private hooks: Hooks){
    const ctx = canvas.getContext('2d');
    if(!ctx) throw new Error('No 2d context');
    this.ctx = ctx;
    this.renderer = new Renderer(ctx, canvas);
    this.bindEvents();
  }

  private bindEvents(){
    window.addEventListener('keydown', e => this.input.key(e.code, true));
    window.addEventListener('keyup', e => this.input.key(e.code, false));
  }

  addEntity(e: Entity){
    this.entities.push(e);
  }
  getEntities(){ return this.entities; }
  removeEntity(id: string){ this.entities = this.entities.filter(e => e.id !== id); }
  addInventory(item: string){ if(!this.inventoryItems.includes(item)){ this.inventoryItems.push(item); this.hooks.onInventoryUpdate(this.inventoryItems); } }
  hasItem(item: string){ return this.inventoryItems.includes(item); }
  get inventory(){ return this.inventoryItems; }

  loadStage(stage: Stage){
    this.stage = stage;
    this.entities = [];
    this.completeFlag = false;
    // Reset inventory for each stage start (comment out if you want persistence)
    this.inventoryItems = [];
  stage.setup(this);
    this.hooks.onStageInfo(stage.info);
  this.stageInfo = stage.info;
    this.hooks.onInventoryUpdate(this.inventoryItems);
  }

  start(){
    this.running = true;
    requestAnimationFrame(t => this.loop(t));
  }
  stop(){ this.running = false; }

  private loop(t: number){
    if(!this.running) return;
  if(this.lastTime === 0) this.lastTime = t; // skip large first frame
  const dt = Math.min(0.05, (t - this.lastTime)/1000); // clamp dt
  this.elapsed += dt;
  this.lastTime = t;
    this.update(dt);
    this.render();
    requestAnimationFrame(tt => this.loop(tt));
  }

  private update(dt: number){
    // Player movement
  const player = this.entities.find(e => e.id === 'player');
    if(player){
      const speed = 160;
      let vx = 0, vy = 0;
      if(this.input.isDown('ArrowLeft') || this.input.isDown('KeyA')) vx -= 1;
      if(this.input.isDown('ArrowRight') || this.input.isDown('KeyD')) vx += 1;
      if(this.input.isDown('ArrowUp') || this.input.isDown('KeyW')) vy -= 1;
      if(this.input.isDown('ArrowDown') || this.input.isDown('KeyS')) vy += 1;
      if(vx !==0 && vy !==0){ const inv = 1/Math.sqrt(2); vx*=inv; vy*=inv; }
  const oldX = player.pos.x; const oldY = player.pos.y;
  player.pos.x += vx * speed * dt;
  if(this.physics.anySolidOverlap(player, this.entities)) player.pos.x = oldX;
  player.pos.y += vy * speed * dt;
  if(this.physics.anySolidOverlap(player, this.entities)) player.pos.y = oldY;
  // Clamp to canvas bounds
  player.pos.x = Math.max(0, Math.min(this.canvas.width - player.w, player.pos.x));
  player.pos.y = Math.max(0, Math.min(this.canvas.height - player.h, player.pos.y));
  (player.data ||= {}).vx = (player.pos.x - oldX) / dt;
  (player.data ||= {}).vy = (player.pos.y - oldY) / dt;
    }

    // Simple pickup logic
  for(const e of [...this.entities]){
      if(e.pickup && player && this.physics.aabbOverlap(player, e)){
        // Only allow cat food type items
        if((e.type||'').includes('food')){
          this.addInventory(e.type || e.id);
          this.removeEntity(e.id);
          this.hooks.onStatus?.('Ate ' + (e.type || e.id), 2);
      this.hooks.onEat?.();
        } else {
          this.hooks.onStatus?.('Cat ignores ' + (e.type || e.id), 1.5);
        }
      }
    }

    if(this.stage){
      this.stage.update(dt, this);
      if(!this.completeFlag && this.stage.isComplete(this)){
        this.completeFlag = true;
        this.hooks.onStageComplete();
      }
    }

    // Enemies movement & collision
    const pRef = this.entities.find(e=>e.id==='player');
    if(pRef){
  for(const enemy of this.entities.filter(e=>e.type==='enemy')){
        const mv = enemy.data?.move;
        if(mv){
      const exOld = enemy.pos.x; const eyOld = enemy.pos.y;
          enemy.pos.x += mv.vx * dt; enemy.pos.y += mv.vy * dt;
          if(enemy.pos.x < mv.minX || enemy.pos.x > mv.maxX) mv.vx*=-1;
          if(enemy.pos.y < mv.minY || enemy.pos.y > mv.maxY) mv.vy*=-1;
      (enemy.data ||= {}).vx = (enemy.pos.x - exOld) / dt;
      (enemy.data ||= {}).vy = (enemy.pos.y - eyOld) / dt;
        }
  if(this.physics.aabbOverlap(pRef, enemy)){
          this.hooks.onStatus?.('The cat was caught!', 3);
          this.hooks.onGameOver?.();
          return; // stop further updates
        }
      }
    }
  }

  private render(){
    this.renderer.setTime(this.elapsed);
    this.renderer.drawBackground('#1d1d1d', this.stageInfo);
    for(const e of this.entities){
      this.renderer.drawEntity(e);
    }
    // UI overlay maybe built-in later.
  }

  status(text: string, ttl = 2){ this.hooks.onStatus?.(text, ttl); }
}
