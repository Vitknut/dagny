import { PALETTE } from '../../data/palettes';
import { STR } from '../../data/strings';
import { Pickup } from '../../entities/misc';
import { DialogOverlay } from '../dialog';
import { MAX_LIVES, addContainer, hasFlag, hpMax, mpMax, setFlag } from '../state';
import type { SideScene } from '../sidescene';

/** Things Dagny picks up: buns, keys, containers, dolls, lost things and treasures. */

export function collect(sc: SideScene, pk: Pickup): void {
  const s = sc.s;
  const g = sc.game;
  pk.taken = true;
  // Placed buns, thermoses and lingonberries (dropped ones have no id).
  if ((pk.kind === 'bulle' || pk.kind === 'termos' || pk.kind === 'lingon') && pk.pid) g.taken.add(pk.pid);
  switch (pk.kind) {
    case 'bulle':
      s.xp += 10;
      sc.sfx('xp');
      sc.particles.spawn({ x: pk.x - 4, y: pk.y - 6, vy: -0.5, life: 45, text: '+10', color: PALETTE.Y });
      break;
    case 'termos':
      s.mp = Math.min(mpMax(s), s.mp + 4);
      sc.sfx('pickup');
      break;
    case 'lingon':
      s.hp = Math.min(hpMax(s), s.hp + 4);
      sc.sfx('pickup');
      break;
    case 'key': {
      const t = sc.area.temple ?? 'none';
      s.keys[t] = (s.keys[t] ?? 0) + 1;
      if (pk.pid && !s.opened.includes(pk.pid)) s.opened.push(pk.pid);
      sc.sfx('key');
      g.toast(STR.gotKey);
      g.save();
      break;
    }
    case 'cat':
      if (!s.items.includes('murre')) s.items.push('murre');
      sc.sfx('pickup');
      g.pushOverlay(new DialogOverlay(g, 'murre_hittad'));
      g.save();
      break;
    case 'container': {
      const [kind, ...rest] = (pk.pid ?? '').split(':');
      const k = kind === 'magi' ? 'magi' : 'liv';
      if (addContainer(s, k, rest.join(':'))) {
        g.audio.jingle('fynd');
        g.pushOverlay(new DialogOverlay(g, k === 'liv' ? 'fick_livbehallare' : 'fick_magibehallare'));
        g.save();
      }
      break;
    }
    case 'life': {
      if (pk.pid && !s.opened.includes(pk.pid)) s.opened.push(pk.pid);
      s.lives = Math.min(MAX_LIVES, s.lives + 1);
      g.audio.jingle('fynd');
      sc.particles.spawn({ x: pk.x - 4, y: pk.y - 6, vy: -0.5, life: 60, text: '+1', color: PALETTE.Y });
      // The first doll explains itself; later ones just count.
      if (!hasFlag(s, 'naverdocka_sedd')) {
        setFlag(s, 'naverdocka_sedd');
        g.pushOverlay(new DialogOverlay(g, 'fick_naverdocka'));
      } else g.toast(STR.extraLife, 2.5);
      g.save();
      break;
    }
    case 'quest': {
      const id = pk.pid ?? '';
      if (id && !s.items.includes(id)) s.items.push(id);
      g.audio.jingle('fynd');
      g.pushOverlay(new DialogOverlay(g, `hittade_${id}`));
      g.save();
      break;
    }
    case 'treasure': {
      const id = pk.pid ?? '';
      if (id && !s.items.includes(id)) s.items.push(id);
      sc.game.audio.playMusic('seger');
      g.pushOverlay(
        new DialogOverlay(g, `fick_${id}`, () => {
          // The temple is restored: a piece of summer light returns.
          sc.flashT = 40;
          g.save();
        }),
      );
      break;
    }
  }
}
