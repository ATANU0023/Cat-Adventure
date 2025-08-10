export class Input {
  private keys = new Set<string>();
  key(code: string, down: boolean){
    if(down) this.keys.add(code); else this.keys.delete(code);
  }
  isDown(code: string){ return this.keys.has(code); }
}
