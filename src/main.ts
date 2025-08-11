import { Game } from './engine/Game.js';
import { RiverStage } from './stages/RiverStage.js';
import { JungleStage } from './stages/JungleStage.js';
import { MountainStage } from './stages/MountainStage.js';
import { VirtualJoystick } from './input/VirtualJoystick';
import { applyJoystickToKeyState } from './input/applyJoystickToKeys'; // existing function
// If using key state approach:
// import { applyJoystickToKeys } from './input/applyJoystickToKeys';

const home = document.getElementById('home') as HTMLDivElement | null;
const playBtn = document.getElementById('playBtn') as HTMLButtonElement | null;
const canvas = document.getElementById('game') as HTMLCanvasElement;
const stageNameEl = document.getElementById('stageName')!;
const objectiveEl = document.getElementById('objective')!;
const inventoryEl = document.getElementById('inventory')!;
const nextBtn = document.getElementById('nextBtn') as HTMLButtonElement;
const endBtn = document.getElementById('endBtn') as HTMLButtonElement | null;
// Modal overlay
let modal = document.createElement('div');
modal.style.position='fixed'; modal.style.inset='0'; modal.style.display='none'; modal.style.alignItems='center'; modal.style.justifyContent='center'; modal.style.background='rgba(0,0,0,0.6)';
const modalInner = document.createElement('div'); modalInner.style.background='#222'; modalInner.style.padding='24px 32px'; modalInner.style.border='2px solid #555'; modalInner.style.borderRadius='10px'; modalInner.style.textAlign='center'; modalInner.style.minWidth='260px';
const modalMsg = document.createElement('div'); modalMsg.style.marginBottom='16px'; modalMsg.style.fontSize='18px'; modalMsg.textContent='Stage Complete!';
const modalNextBtn = document.createElement('button'); modalNextBtn.textContent='Next Stage'; modalNextBtn.style.padding='8px 16px'; modalNextBtn.style.fontSize='16px';
modalInner.appendChild(modalMsg); modalInner.appendChild(modalNextBtn); modal.appendChild(modalInner); document.body.appendChild(modal);
let statusTimeout: any;
const statusEl = document.createElement('div');
statusEl.style.marginTop = '4px';
statusEl.style.color = '#9cf';
document.getElementById('ui')!.appendChild(statusEl);

let gameOver = false;
const game = new Game(canvas, {
  onStageInfo: (info: {name:string; objective:string}) => {
    stageNameEl.textContent = info.name;
    objectiveEl.textContent = 'Objective: ' + info.objective;
  },
  onInventoryUpdate: (items: string[]) => {
    inventoryEl.textContent = 'Inventory: ' + (items.length? items.join(', ') : 'Empty');
  },
  onStageComplete: () => {
    showStatus('Stage Complete!');
    openModal();
  },
  onStatus: (text: string, ttl=2) => showStatus(text, ttl),
  onGameOver: () => { if(!gameOver){ gameOver = true; openGameOver(); } },
  onEat: () => { if(eatSfx){ try { eatSfx.currentTime = 0; eatSfx.play(); } catch{} } }
});

let baseStages = [RiverStage, JungleStage, MountainStage];
let stages: any[] = [];
for(let i=0;i<1000;i++){ const S = baseStages[i % baseStages.length]; stages.push(new S()); }
let current = 0;
const eatSfx = document.getElementById('eatSfx') as HTMLAudioElement | null;

function loadCurrent(){
  nextBtn.style.display = 'none';
  game.loadStage(stages[current]);
}

nextBtn.addEventListener('click', () => {
  current++;
  if(current >= stages.length){
    alert('You helped the cat through every challenge!');
    current = 0;
  }
  loadCurrent();
});

modalNextBtn.addEventListener('click', () => {
  modal.style.display='none';
  nextBtn.click();
});

// Game Over modal creation
const goModal = document.createElement('div'); goModal.style.position='fixed'; goModal.style.inset='0'; goModal.style.display='none'; goModal.style.alignItems='center'; goModal.style.justifyContent='center'; goModal.style.background='rgba(0,0,0,0.7)';
const goInner = document.createElement('div'); goInner.style.background='#330'; goInner.style.padding='28px 40px'; goInner.style.border='2px solid #a00'; goInner.style.borderRadius='10px'; goInner.style.textAlign='center';
goInner.innerHTML = '<h2 style="margin-top:0;color:#f55;">You Lose</h2><p>The cat was caught.</p>';
const retryBtn = document.createElement('button'); retryBtn.textContent='Retry Stage'; retryBtn.style.margin='0 8px';
const homeBtn = document.createElement('button'); homeBtn.textContent='End & Home'; homeBtn.style.margin='0 8px';
goInner.appendChild(retryBtn); goInner.appendChild(homeBtn); goModal.appendChild(goInner); document.body.appendChild(goModal);

retryBtn.addEventListener('click', ()=>{ goModal.style.display='none'; gameOver=false; loadCurrent(); });
homeBtn.addEventListener('click', ()=>{ goModal.style.display='none'; gameOver=false; current=0; loadCurrent(); });

if(playBtn){
  playBtn.addEventListener('click', () => {
    if(home) home.style.display='none';
    canvas.style.display='block';
    const ui = document.getElementById('ui'); if(ui) ui.style.display='block';
    loadCurrent();
    game.start();
  });
}
if(endBtn){
  endBtn.addEventListener('click', () => {
    game.stop();
    canvas.style.display='none';
    const ui = document.getElementById('ui'); if(ui) ui.style.display='none';
    if(home) home.style.display='flex';
  });
}

if(!home){ // legacy auto-play fallback
  loadCurrent();
  game.start();
}

function showStatus(text: string, ttl = 2){
  statusEl.textContent = text;
  statusEl.style.opacity = '1';
  if(statusTimeout) clearTimeout(statusTimeout);
  statusTimeout = setTimeout(()=>{ statusEl.textContent=''; }, ttl*1000);
}

function openModal(){ modal.style.display='flex'; }
function openGameOver(){ goModal.style.display='flex'; }

// Virtual joystick integration
// Ensure global keyState exists, then assign to local variable
(globalThis as any).keyState = (globalThis as any).keyState || {};
const keyState: Record<string, boolean> = (globalThis as any).keyState;

let joystick: VirtualJoystick | null = null;
function initJoystick() {
  if (!joystick) {
    joystick = new VirtualJoystick();
    console.log('[Joystick] initialized');
  }
}
window.addEventListener('DOMContentLoaded', initJoystick);

// Call each frame (put inside your existing update loop):
function update(dt: number) {
  // ...existing code...
  if (joystick) applyJoystickToKeyState(joystick, keyState);
  // ...existing code...
}
