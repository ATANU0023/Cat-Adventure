const JOYSTICK_STYLE_ID = 'vj-dynamic-style';

function injectStyles() {
  if (document.getElementById(JOYSTICK_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = JOYSTICK_STYLE_ID;
  style.textContent = `
  /* Virtual Joystick Core */
  #vj-root {
    position: fixed;
    left: env(safe-area-inset-left, 16px);
    bottom: env(safe-area-inset-bottom, 16px);
    touch-action: none;
    user-select: none;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.95;
    transition: opacity .25s;
  }
  #vj-root.vj-hidden { opacity: 0; pointer-events: none; }
  #vj-root .vj-base {
    position: relative;
    width: 100%; height: 100%;
    border-radius: 50%;
    background: radial-gradient(circle at 32% 32%, #444 0%, #1c1c1c 70%);
    border: 2px solid #666;
    box-shadow: 0 0 8px #000 inset, 0 4px 10px rgba(0,0,0,.4);
  }
  #vj-root .vj-knob {
    position: absolute;
    left: 50%; top: 50%;
    width: 40%; height: 40%;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, #bcbcbc 0%, #6d6d6d 70%);
    border: 3px solid #d0d0d0;
    transform: translate(-50%,-50%);
    transition: transform 90ms ease-out;
    box-shadow: 0 2px 6px rgba(0,0,0,.5);
  }
  /* Slightly larger on very small phones */
  @media (max-width: 420px) {
    #vj-root { left: 12px; bottom: 12px; }
  }
  `;
  document.head.appendChild(style);
}

export interface JoystickVector {
  x: number;  // -1..1
  y: number;  // -1..1
  active: boolean;
}

export class VirtualJoystick {
  readonly element: HTMLDivElement;
  private base: HTMLDivElement;
  private knob: HTMLDivElement;
  private radiusPx = 100;          // dynamic
  private knobMaxTravel = 0;        // set after layout
  private dragging = false;
  private center = { x: 0, y: 0 };
  private _value: JoystickVector = { x: 0, y: 0, active: false };
  private lastActiveTime = 0;
  private fadeDelayMs = 2500;
  private fadeTimer: number | null = null;

  get value(): JoystickVector { return this._value; }

  constructor() {
    injectStyles();
    this.element = document.createElement('div');
    this.element.id = 'vj-root';
    this.element.innerHTML = `<div class="vj-base"><div class="vj-knob"></div></div>`;
    this.base = this.element.querySelector('.vj-base') as HTMLDivElement;
    this.knob = this.element.querySelector('.vj-knob') as HTMLDivElement;
    document.body.appendChild(this.element);
    this.computeSizing();
    this.bindEvents();
    this.scheduleFade();
    window.addEventListener('resize', () => this.computeSizing());
    window.addEventListener('orientationchange', () => setTimeout(()=>this.computeSizing(), 150));
  }

  private computeSizing() {
    // Radius is a fraction of the smaller viewport side (cap within range).
    const s = Math.min(window.innerWidth, window.innerHeight);
    const target = Math.max(80, Math.min(140, Math.round(s * 0.18)));
    this.radiusPx = target;
    this.element.style.width = `${this.radiusPx * 2}px`;
    this.element.style.height = `${this.radiusPx * 2}px`;
    // Knob size determined by CSS (40%); compute travel (radius - knobRadius/2)
    const knobRect = this.knob.getBoundingClientRect();
    const baseRect = this.base.getBoundingClientRect();
    const knobRadius = knobRect.width / 2 || (this.radiusPx * 0.4 * 0.5);
    const baseRadius = baseRect.width / 2 || this.radiusPx;
    this.knobMaxTravel = baseRadius - knobRadius - 4;
    this.resetKnob();
  }

  private bindEvents() {
    const start = (x: number, y: number) => {
      this.dragging = true;
      const rect = this.base.getBoundingClientRect();
      this.center.x = rect.left + rect.width / 2;
      this.center.y = rect.top + rect.height / 2;
      this.updateVector(x, y);
      this.show();
    };
    const move = (x: number, y: number) => {
      if (!this.dragging) return;
      this.updateVector(x, y);
    };
    const end = () => {
      if (!this.dragging) return;
      this.dragging = false;
      this._value = { x: 0, y: 0, active: false };
      this.resetKnob();
      this.scheduleFade();
    };

    // Touch
    this.element.addEventListener('touchstart', e => {
      const t = (e as TouchEvent).changedTouches[0];
      start(t.clientX, t.clientY);
      e.preventDefault();
    }, { passive: false });
    window.addEventListener('touchmove', e => {
      if (!this.dragging) return;
      const t = (e as TouchEvent).changedTouches[0];
      move(t.clientX, t.clientY);
      e.preventDefault();
    }, { passive: false });
    window.addEventListener('touchend', end, { passive: false });
    window.addEventListener('touchcancel', end, { passive: false });

    // Pointer (for emulators / fallback)
    this.element.addEventListener('pointerdown', e => {
      if (!this.isTouchCapable() && e.pointerType === 'mouse') return;
      start(e.clientX, e.clientY);
    });
    window.addEventListener('pointermove', e => move(e.clientX, e.clientY));
    window.addEventListener('pointerup', end);
    window.addEventListener('pointerleave', end);
  }

  private updateVector(x: number, y: number) {
    const dx = x - this.center.x;
    const dy = y - this.center.y;
    const dist = Math.hypot(dx, dy);
    const maxDist = this.radiusPx;
    const clamped = Math.min(dist, maxDist);
    const nx = dx / maxDist;
    const ny = dy / maxDist;
    this._value = {
      x: Math.max(-1, Math.min(1, nx)),
      y: Math.max(-1, Math.min(1, ny)),
      active: true
    };
    const angle = Math.atan2(dy, dx);
    const travel = (clamped / maxDist) * this.knobMaxTravel;
    const kx = Math.cos(angle) * travel;
    const ky = Math.sin(angle) * travel;
    this.knob.style.transform = `translate(calc(-50% + ${kx}px), calc(-50% + ${ky}px))`;
    this.lastActiveTime = performance.now();
    this.show();
    this.scheduleFade();
  }

  private resetKnob() {
    this.knob.style.transform = 'translate(-50%, -50%)';
  }

  private isTouchCapable() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  private show() {
    this.element.classList.remove('vj-hidden');
  }

  private scheduleFade() {
    if (this.fadeTimer) window.clearTimeout(this.fadeTimer);
    this.fadeTimer = window.setTimeout(() => {
      if (!this._value.active) {
        this.element.classList.add('vj-hidden');
      }
    }, this.fadeDelayMs);
  }
}