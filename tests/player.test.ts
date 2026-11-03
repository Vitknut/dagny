import { describe, expect, it } from 'vitest';
import { Kind, type TileGrid } from '../src/engine/collision';
import { Player, type PlayerControls } from '../src/entities/player';

function flat(w = 30, h = 12): TileGrid {
  const kinds = new Uint8Array(w * h);
  for (let x = 0; x < w; x++) kinds[(h - 1) * w + x] = Kind.Solid;
  return { w, h, kinds, wallLeft: true, wallRight: true };
}

const none: PlayerControls = { left: false, right: false, up: false, down: false, jumpHeld: false, jumpPressed: false, swordPressed: false };

function settle(p: Player, g: TileGrid): void {
  for (let i = 0; i < 60; i++) p.update(none, g);
}

function jumpHeight(holdFrames: number): number {
  const g = flat();
  const p = new Player();
  p.place(100, 100);
  settle(p, g);
  const ground = p.y;
  let top = p.y;
  for (let i = 0; i < 120; i++) {
    p.update({ ...none, jumpPressed: i === 0, jumpHeld: i < holdFrames }, g);
    top = Math.min(top, p.y);
  }
  return ground - top;
}

describe('Dagny movement', () => {
  it('a held jump clears three tiles', () => {
    expect(jumpHeight(60)).toBeGreaterThanOrEqual(48);
  });

  it('jump height depends on how long the button is held', () => {
    expect(jumpHeight(8)).toBeLessThan(jumpHeight(60) * 0.8);
    expect(jumpHeight(4)).toBeLessThan(jumpHeight(60) * 0.7);
  });

  it('a quick tap on glass still gives a proper hop (two tiles), not a skip', () => {
    expect(jumpHeight(1)).toBeGreaterThanOrEqual(30);
    expect(jumpHeight(1)).toBe(jumpHeight(4));
  });

  it('a strike started a moment before turning still turns to meet the other way', () => {
    const g = flat();
    const p = new Player();
    p.place(100, 100);
    settle(p, g);
    expect(p.facing).toBe(1);
    p.update({ ...none, swordPressed: true }, g);
    p.update({ ...none, left: true }, g);
    expect(p.attacking).toBe(true);
    expect(p.facing).toBe(-1);
    // But once the blade is out, the strike holds its direction.
    const q = new Player();
    q.place(100, 100);
    settle(q, g);
    q.update({ ...none, swordPressed: true }, g);
    for (let i = 0; i < 5; i++) q.update(none, g);
    q.update({ ...none, left: true }, g);
    expect(q.facing).toBe(1);
  });

  it('a sword press during a swing is kept and strikes again', () => {
    const g = flat();
    const p = new Player();
    p.place(100, 100);
    settle(p, g);
    p.update({ ...none, swordPressed: true }, g);
    expect(p.attacking).toBe(true);
    let again = false;
    for (let i = 0; i < 20; i++) {
      p.update({ ...none, swordPressed: i === 8 }, g);
      if (i > 12 && p.attacking) again = true;
    }
    expect(again).toBe(true);
  });

  it('a sword press while frozen for a hit is not lost', () => {
    const g = flat();
    const p = new Player();
    p.place(100, 100);
    settle(p, g);
    p.queue({ ...none, swordPressed: true });
    p.queue(none);
    p.update(none, g);
    expect(p.attacking).toBe(true);
  });

  it('coyote time allows a jump just after leaving a ledge', () => {
    const w = 30, h = 12;
    const kinds = new Uint8Array(w * h);
    for (let x = 0; x < 10; x++) kinds[(h - 1) * w + x] = Kind.Solid;
    const g: TileGrid = { w, h, kinds, wallLeft: true, wallRight: true };
    const p = new Player();
    p.place(140, 100);
    settle(p, g);
    // Walk off the ledge.
    let frames = 0;
    while (p.onGround && frames++ < 200) p.update({ ...none, right: true }, g);
    expect(p.onGround).toBe(false);
    p.update({ ...none, right: true }, g);
    p.update({ ...none, right: true, jumpPressed: true, jumpHeld: true }, g);
    expect(p.vy).toBeLessThan(0);
  });

  it('a jump pressed just before landing is buffered', () => {
    const g = flat();
    const p = new Player();
    p.place(100, 100);
    // Fall, press jump a few frames before touching down.
    let jumped = false;
    for (let i = 0; i < 120; i++) {
      const near = !p.onGround && p.y + p.h > 11 * 16 - 8 && p.vy > 0;
      p.update({ ...none, jumpPressed: near && !jumped, jumpHeld: true }, g);
      if (near) jumped = true;
      if (jumped && p.vy < 0) return;
    }
    throw new Error('buffered jump never happened');
  });

  it('ducking lowers the hitbox and the sword strikes low', () => {
    const g = flat();
    const p = new Player();
    p.place(100, 100);
    settle(p, g);
    const standTop = p.y;
    p.update({ ...none, down: true }, g);
    expect(p.ducking).toBe(true);
    expect(p.y).toBeGreaterThan(standTop);
    expect(p.shieldHeight).toBe('low');
    p.update({ ...none, down: true, swordPressed: true }, g);
    p.update({ ...none, down: true }, g);
    p.update({ ...none, down: true }, g);
    expect(p.swordActive).toBe(true);
    const box = p.swordBox({ x: 0, y: 0, w: 0, h: 0 });
    expect(box.y).toBeGreaterThan(standTop + 8);
  });

  it('gets about a second of invulnerability when hurt', () => {
    const g = flat();
    const p = new Player();
    p.place(100, 100);
    settle(p, g);
    p.hurt(0);
    expect(p.invuln).toBeGreaterThanOrEqual(55);
    expect(p.vx).toBeGreaterThan(0);
  });
});

describe('being hurt', () => {
  it('knocks Dagny back about a tile, not across the room', () => {
    const g = flat();
    const p = new Player();
    p.place(200, 100);
    settle(p, g);
    const x0 = p.x;
    p.hurt(p.x + 20);
    for (let i = 0; i < 60; i++) p.update(none, g);
    const moved = Math.abs(p.x - x0);
    expect(moved).toBeGreaterThan(8);
    expect(moved).toBeLessThanOrEqual(24);
  });
});
