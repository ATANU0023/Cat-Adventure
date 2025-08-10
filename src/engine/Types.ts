export interface Vec2 { x:number; y:number; }
export interface Entity {
  id: string;
  pos: Vec2;
  w: number; h: number;
  solid?: boolean;
  pickup?: boolean;
  type?: string;
  appearance?: string; // visual hint e.g. 'cat','log','rock','boat','stick'
  data?: Record<string, any>;
}

export interface StageInfo {
  name: string;
  objective: string;
  env?: 'river' | 'jungle' | 'mountain';
}

export interface Stage {
  info: StageInfo;
  setup(stageApi: StageAPI): void;
  update(dt: number, stageApi: StageAPI): void;
  isComplete(stageApi: StageAPI): boolean;
}

export interface StageAPI {
  addEntity(e: Entity): void;
  getEntities(): Entity[];
  removeEntity(id: string): void;
  inventory: string[];
  addInventory(item: string): void;
  hasItem(item: string): boolean;
  completeFlag: boolean;
  status(text: string, ttl?: number): void;
}
