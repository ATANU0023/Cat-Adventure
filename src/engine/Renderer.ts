import { Entity, StageInfo } from './Types.js';

export class Renderer {
  private time = 0;
  constructor(private ctx: CanvasRenderingContext2D, private canvas: HTMLCanvasElement){}
  setTime(t:number){ this.time = t; }

  drawBackground(color: string, info?: StageInfo){
    const ctx = this.ctx;
    ctx.fillStyle = color;
    ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
    if(info?.env === 'river') this.drawRiverBackdrop();
    if(info?.env === 'jungle') this.drawJungleBackdrop();
    if(info?.env === 'mountain') this.drawMountainBackdrop();
  }

  private drawRiverBackdrop(){
    const ctx = this.ctx; const w=this.canvas.width, h=this.canvas.height;
    ctx.fillStyle = '#1b3a57'; ctx.fillRect(w*0.3,0,w*0.4,h); // wide river tint
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    for(let i=0;i<25;i++){ const y=Math.random()*h; ctx.fillRect(w*0.3+Math.random()*w*0.4,y, 40,2); }
  }
  private drawJungleBackdrop(){
    // Static layered jungle (no per-frame randomness)
    const ctx = this.ctx; const w=this.canvas.width, h=this.canvas.height;
    // background foliage gradient
    const grad = ctx.createLinearGradient(0,0,0,h);
    grad.addColorStop(0,'#0d2612');
    grad.addColorStop(1,'#13351a');
    ctx.fillStyle = grad; ctx.fillRect(0,0,w,h);
    // distant tree band silhouettes
    ctx.fillStyle = '#1b4722';
    for(let i=0;i<18;i++){
      const x = (i/18)*w;
      const trunkW = 14;
      ctx.fillRect(x, h*0.35, trunkW, h*0.65);
      // canopy ellipse
      ctx.beginPath();
      ctx.ellipse(x+trunkW/2, h*0.32, 48, 26, 0, 0, Math.PI*2);
      ctx.fill();
    }
    // foreground darker trunks
    ctx.fillStyle = '#113b1c';
    for(let i=0;i<8;i++){
      const x = (i/8)*w + (i%2)*10;
      ctx.fillRect(x, h*0.25, 22, h*0.75);
    }
  }
  private drawMountainBackdrop(){
    const ctx=this.ctx; const w=this.canvas.width, h=this.canvas.height;
    ctx.fillStyle = '#0d0d18'; ctx.fillRect(0,0,w,h);
    ctx.fillStyle = '#3a3a55';
    for(let i=0;i<3;i++){ ctx.beginPath(); const baseY=h*0.95; const peakX=w*(0.2+i*0.25); const peakY=h*0.35; ctx.moveTo(peakX,peakY); ctx.lineTo(peakX-160,baseY); ctx.lineTo(peakX+160,baseY); ctx.closePath(); ctx.fill(); }
  }

  drawEntity(e: Entity){
  if(e.appearance === 'cat') return this.drawCat(e);
  if(e.appearance === 'dog') return this.drawDog(e);
  if(e.appearance === 'dragon') return this.drawDragon(e);
  if(e.appearance === 'tree') return this.drawTree(e);
  if(e.appearance === 'stone') return this.drawStone(e);
  if(e.appearance === 'spider') return this.drawSpider(e);
    this.ctx.save();
    this.ctx.fillStyle = this.getColor(e);
    if(e.appearance === 'log') this.drawLog(e);
    else if(e.appearance === 'rock') this.drawRock(e);
    else if(e.appearance === 'boat') this.drawBoat(e);
    else if(e.appearance === 'stick') this.drawStick(e);
    else this.ctx.fillRect(e.pos.x, e.pos.y, e.w, e.h);
    this.ctx.restore();
  }

  private drawCat(e: Entity){
    const {ctx} = this; const {x,y} = e.pos; const w=e.w, h=e.h; ctx.save(); ctx.translate(x,y);
    const phase = this.walkPhase(e);
    ctx.fillStyle = '#ffcc33';
    ctx.fillRect(w*0.1, h*0.35, w*0.8, h*0.5); // body
    ctx.fillRect(w*0.55, h*0.05, w*0.35, h*0.4); // head
    // legs (4) animate
    ctx.fillStyle='#d8b03a';
    for(let i=0;i<4;i++){
      const offset = Math.sin(phase + i*Math.PI/2)*3;
      const lx = w*0.15 + i*(w*0.17);
      ctx.fillRect(lx, h*0.85 + offset*0.15, w*0.1, h*0.15);
    }
    // ears
    ctx.fillStyle='#ffcc33';
    ctx.beginPath(); ctx.moveTo(w*0.6, h*0.05); ctx.lineTo(w*0.65, 0); ctx.lineTo(w*0.7, h*0.05); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(w*0.85, h*0.05); ctx.lineTo(w*0.9, 0); ctx.lineTo(w*0.95, h*0.05); ctx.closePath(); ctx.fill();
    // tail sway
    ctx.save(); ctx.translate(0, h*0.45); ctx.rotate(Math.sin(phase)*0.2); ctx.fillRect(0, 0, w*0.15, h*0.15); ctx.restore();
    // eyes
    ctx.fillStyle = '#222'; ctx.fillRect(w*0.68, h*0.18, w*0.05, h*0.07); ctx.fillRect(w*0.8, h*0.18, w*0.05, h*0.07);
    ctx.restore();
  }

  private drawDog(e: Entity){
    const {ctx} = this; const {x,y}=e.pos; const w=e.w,h=e.h; ctx.save(); ctx.translate(x,y);
    const phase = this.walkPhase(e);
    ctx.fillStyle='#c38e59'; ctx.fillRect(w*0.1,h*0.4,w*0.7,h*0.4); ctx.fillRect(w*0.6,h*0.2,w*0.3,h*0.35);
    // legs
    ctx.fillStyle='#9d703f';
    for(let i=0;i<4;i++){
      const offset = Math.sin(phase + i*Math.PI/2)*3;
      const lx = w*0.15 + i*(w*0.16);
      ctx.fillRect(lx, h*0.78 + offset*0.15, w*0.09, h*0.22);
    }
    // eyes
    ctx.fillStyle='#000'; ctx.fillRect(w*0.75,h*0.3,w*0.07,h*0.07); ctx.fillRect(w*0.63,h*0.3,w*0.07,h*0.07);
    // tail wag
    ctx.save(); ctx.translate(0,h*0.45); ctx.rotate(Math.sin(phase*2)*0.5); ctx.fillStyle='#c38e59'; ctx.fillRect(0,0,w*0.15,h*0.15); ctx.restore();
    ctx.restore();
  }
  private drawDragon(e: Entity){
    const {ctx}=this; const {x,y}=e.pos; const w=e.w,h=e.h; ctx.save(); ctx.translate(x,y);
    const phase = this.walkPhase(e);
    ctx.fillStyle='#5c8d4d'; ctx.fillRect(w*0.05,h*0.35,w*0.9,h*0.45); ctx.fillRect(w*0.6,0,w*0.35,h*0.5);
    // legs (4 pairs stylized)
    ctx.fillStyle='#49723b';
    for(let i=0;i<4;i++){
      const offset = Math.sin(phase + i*Math.PI/2)*4;
      const lx = w*0.15 + i*(w*0.18);
      ctx.fillRect(lx, h*0.78 + offset*0.15, w*0.08, h*0.22);
    }
    // wings flap simplified
    ctx.save();
    ctx.translate(w*0.3,h*0.35);
    const wingA = Math.sin(phase)*0.4;
    ctx.rotate(-wingA); ctx.fillStyle='#6fa55d'; ctx.fillRect(0,0,w*0.35,h*0.15);
    ctx.restore();
    ctx.save();
    ctx.translate(w*0.55,h*0.35);
    ctx.rotate(wingA); ctx.fillStyle='#6fa55d'; ctx.fillRect(0,0,w*0.35,h*0.15);
    ctx.restore();
    ctx.fillStyle='#2d3'; ctx.fillRect(w*0.2,h*0.15,w*0.5,h*0.1); // crest
    ctx.fillStyle='#111'; ctx.fillRect(w*0.68,h*0.18,w*0.08,h*0.1); ctx.fillRect(w*0.8,h*0.18,w*0.08,h*0.1);
    // fire breath
    const dir = (e.data?.vx||0) < 0 ? -1 : 1;
    const baseX = dir>0 ? w*0.95 : w*0.05;
    const baseY = h*0.25;
    const flicker = (Math.sin(this.time*18 + e.pos.x*0.1) + 1)*0.5; // 0..1
    const len = w*0.35 + flicker*w*0.15;
    const spread = h*0.25 + flicker*h*0.08;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    // outer flame
    let grad = ctx.createLinearGradient(baseX, baseY, baseX + dir*len, baseY);
    grad.addColorStop(0,'rgba(255,220,120,0.9)');
    grad.addColorStop(0.3,'rgba(255,140,20,0.85)');
    grad.addColorStop(0.7,'rgba(255,60,0,0.55)');
    grad.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(baseX, baseY - h*0.06);
    ctx.lineTo(baseX + dir*(len*0.4), baseY - spread*0.35);
    ctx.lineTo(baseX + dir*len, baseY);
    ctx.lineTo(baseX + dir*(len*0.4), baseY + spread*0.35);
    ctx.lineTo(baseX, baseY + h*0.06);
    ctx.closePath();
    ctx.fill();
    // inner flame
    const innerLen = len*0.55;
    grad = ctx.createLinearGradient(baseX, baseY, baseX + dir*innerLen, baseY);
    grad.addColorStop(0,'rgba(255,255,180,0.95)');
    grad.addColorStop(0.4,'rgba(255,190,60,0.85)');
    grad.addColorStop(1,'rgba(255,120,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(baseX, baseY - h*0.035);
    ctx.lineTo(baseX + dir*(innerLen*0.5), baseY - spread*0.18);
    ctx.lineTo(baseX + dir*innerLen, baseY);
    ctx.lineTo(baseX + dir*(innerLen*0.5), baseY + spread*0.18);
    ctx.lineTo(baseX, baseY + h*0.035);
    ctx.closePath();
    ctx.fill();
    // sparks
    ctx.fillStyle='rgba(255,200,80,0.8)';
    for(let i=0;i<4;i++){
      const t = (this.time*10 + i*1.7 + e.pos.x*0.05);
      const px = baseX + dir*(innerLen*0.4 + (Math.sin(t)*0.5+0.5)*innerLen*0.55);
      const py = baseY + Math.sin(t*2 + i)*spread*0.15;
      const r = 3 + (Math.sin(t*3 + i)*0.5+0.5)*3;
      ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();
    ctx.restore();
  }

  private drawSpider(e: Entity){
    const {ctx}=this; const {x,y}=e.pos; const w=e.w,h=e.h; ctx.save(); ctx.translate(x,y);
    const phase = this.walkPhase(e);
    ctx.fillStyle='#222'; ctx.beginPath(); ctx.arc(w*0.5,h*0.55,w*0.3,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#333'; ctx.beginPath(); ctx.arc(w*0.5,h*0.3,w*0.2,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#f44'; ctx.fillRect(w*0.42,h*0.25,w*0.08,h*0.05); ctx.fillRect(w*0.5,h*0.25,w*0.08,h*0.05);
    ctx.strokeStyle='#222'; ctx.lineWidth=2;
    for(let i=0;i<8;i++){
      const ang = -Math.PI/2 + i*(Math.PI/7);
      const len = 18 + Math.sin(phase*2 + i)*4;
      ctx.beginPath(); ctx.moveTo(w*0.5,h*0.6); ctx.lineTo(w*0.5 + Math.cos(ang)*len, h*0.6 + Math.sin(ang)*len); ctx.stroke();
    }
    ctx.restore();
  }

  private walkPhase(e: Entity){
    const speed = Math.sqrt((e.data?.vx||0)**2 + (e.data?.vy||0)**2);
    return this.time * (speed>5 ? 6 : 3);
  }

  private drawTree(e: Entity){
    const {ctx}=this; const {x,y}=e.pos; const w=e.w,h=e.h; ctx.save();
    // trunk
    ctx.fillStyle = '#5d3b1e'; ctx.fillRect(x + w*0.42, y + h*0.45, w*0.16, h*0.55);
    // foliage
    ctx.fillStyle = '#2f6d2f';
    ctx.beginPath(); ctx.ellipse(x + w*0.5, y + h*0.35, w*0.45, h*0.35, 0, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }
  private drawStone(e: Entity){
    const {ctx}=this; const {x,y}=e.pos; const w=e.w,h=e.h; ctx.save();
    ctx.fillStyle = '#707070';
    ctx.beginPath(); ctx.moveTo(x+w*0.1,y+h*0.9); ctx.lineTo(x+w*0.2,y+h*0.2); ctx.lineTo(x+w*0.55,y+h*0.05); ctx.lineTo(x+w*0.85,y+h*0.4); ctx.lineTo(x+w*0.9,y+h*0.9); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  private drawLog(e: Entity){
    const {ctx} = this; const {x,y} = e.pos; ctx.fillStyle = '#7b4b21'; ctx.fillRect(x,y,e.w,e.h);
    ctx.strokeStyle = '#4d2d10'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x+4,y+ e.h/2); ctx.lineTo(x+e.w-4,y+ e.h/2); ctx.stroke();
  }
  private drawRock(e: Entity){
    const {ctx} = this; const {x,y} = e.pos; ctx.fillStyle = '#777'; ctx.beginPath();
    ctx.moveTo(x+2,y+e.h-2); ctx.lineTo(x+e.w*0.3,y+2); ctx.lineTo(x+e.w*0.7,y+4); ctx.lineTo(x+e.w-2,y+e.h-3); ctx.closePath(); ctx.fill();
  }
  private drawBoat(e: Entity){
    const {ctx} = this; const {x,y} = e.pos; ctx.fillStyle = '#8c5a2b';
    ctx.beginPath(); ctx.moveTo(x,y+e.h); ctx.lineTo(x+e.w*0.15,y+e.h*0.2); ctx.lineTo(x+e.w*0.85,y+e.h*0.2); ctx.lineTo(x+e.w,y+e.h); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#ddd'; ctx.fillRect(x+e.w*0.48,y, e.w*0.04, e.h*0.3); // mast
    ctx.fillStyle='#f5f5f5'; ctx.beginPath(); ctx.moveTo(x+e.w*0.52,y+e.h*0.3); ctx.lineTo(x+e.w*0.85,y+e.h*0.35); ctx.lineTo(x+e.w*0.52,y+e.h*0.55); ctx.closePath(); ctx.fill();
  }
  private drawStick(e: Entity){
    const {ctx} = this; const {x,y} = e.pos; ctx.strokeStyle='#caa472'; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(x+2,y+e.h-2); ctx.lineTo(x+e.w-4,y+2); ctx.stroke();
  }

  private getColor(e: Entity){
  if(e.id === 'player') return '#ffcc33'; // fallback cat color
    if(e.pickup) return '#44aaee';
    if(e.type === 'goal') return '#66dd66';
  if(e.id === 'river') return '#2266aa';
  if(e.id === 'vines') return '#228833';
  if(e.id === 'cliff') return '#555555';
    return '#888';
  }
}
