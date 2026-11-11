import type { InputSource } from '../engine/input';

/**
 * What a button is called on each kind of control. Dialog text writes
 * `{svard}`, `{magi}` or `{hopp}` and gets the name the player sees: the
 * button on a phone, the key on a keyboard, the button on a gamepad.
 */
export const BUTTONS: Readonly<Record<string, Readonly<Record<InputSource, string>>>> = {
  svard: { touch: 'SVÄRD-knappen', keyboard: 'X-tangenten', gamepad: 'B-knappen' },
  magi: { touch: 'MAGI-knappen', keyboard: 'C-tangenten', gamepad: 'Y-knappen' },
  hopp: { touch: 'HOPPA-knappen', keyboard: 'Z-tangenten', gamepad: 'A-knappen' },
};

export const INPUT_SOURCES: readonly InputSource[] = ['touch', 'keyboard', 'gamepad'];

/** Fills in `{svard}`, `{magi}` and `{hopp}` for the way the player is playing. Unknown names are left as they are. */
export function fillButtons(text: string, source: InputSource): string {
  return text.replace(/\{(\w+)\}/g, (m, name: string) => BUTTONS[name]?.[source] ?? m);
}
