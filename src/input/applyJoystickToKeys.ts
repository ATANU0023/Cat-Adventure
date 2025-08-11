import { VirtualJoystick } from './VirtualJoystick';

export function applyJoystickToKeyState(j: VirtualJoystick, keyState: Record<string, boolean>) {
  const v = j.value;
  keyState['ArrowLeft']  = v.active && v.x < -0.25;
  keyState['ArrowRight'] = v.active && v.x >  0.25;
  keyState['ArrowUp']    = v.active && v.y < -0.25;
  keyState['ArrowDown']  = v.active && v.y >  0.25;
}