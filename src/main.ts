import { Loop } from './engine/loop';
import { AudioEngine } from './engine/audio';
import { initSprites } from './engine/sprites';
import { requestPersistentStorage } from './engine/storage';
import { SPRITES } from './art';
import { SONGS } from './audio/songs';
import { SFX } from './audio/sfx';
import { Game } from './game/game';
import { TitleScene } from './game/title';
import { PauseOverlay } from './game/menus';
import { RotateScreen } from './game/rotate';
import { SPELL_ORDER } from './data/spells';
import { mpMax } from './game/state';
import { playCredits, playEnding, takeTrain } from './game/flow';

/** Boot: build the sprite cache, wire up the shell and start the 60 Hz loop. */
function boot(): void {
  const canvas = document.getElementById('screen') as HTMLCanvasElement;
  const controls = document.getElementById('controls') as HTMLElement;
  initSprites(SPRITES);
  const audio = new AudioEngine(SONGS, SFX);
  const game = new Game(canvas, controls, audio);
  game.rotateScreen = new RotateScreen();
  game.openPause = () => {
    if (game.state && game.scene && !game.modal && !game.transitioning) {
      game.audio.play('menu');
      game.pushOverlay(new PauseOverlay(game));
    }
  };

  // ?debug: all spells and skills, plenty of magic – handy for testing.
  const params = new URLSearchParams(location.search);
  if (params.has('debug')) {
    game.debug = true;
    const origSet = game.setScene.bind(game);
    game.setScene = (scene) => {
      const s = game.state;
      if (s) {
        for (const id of SPELL_ORDER) if (!s.spells.includes(id)) s.spells.push(id);
        s.selectedSpell ??= 'lakning';
        for (const sk of ['nedatstot', 'uppatstot'] as const) if (!s.skills.includes(sk)) s.skills.push(sk);
        s.mp = mpMax(s);
      }
      origSet(scene);
    };
  }

  game.onScene = (scene) => (scene === 'ending' ? playEnding(game) : playCredits(game));
  game.onTravel = (area) => takeTrain(game, area);

  game.setScene(new TitleScene(game));
  audio.tryAutoplay('titel');

  const loop = new Loop(
    () => game.update(),
    () => {
      game.fps = loop.fps;
      game.render();
    },
  );
  loop.start();

  // Pause automatically when the app is left (incoming call, app switch).
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      game.suspend();
      loop.stop();
    } else {
      loop.start();
      game.resumeFromBackground();
    }
  });
  // iOS only lets audio start (or restart after a call or the lock screen)
  // inside a touch: try again on every touch until it runs.
  const wake = (): void => {
    if (!game.paused) game.audio.unlock();
  };
  document.addEventListener('touchend', wake, { passive: true });
  document.addEventListener('pointerup', wake, { passive: true });
  document.addEventListener('keydown', wake, { passive: true });
  // Ask once, at the first tap or key press, that the save is never cleared by the browser.
  const keepSave = (): void => {
    for (const ev of ['pointerup', 'keydown'] as const) document.removeEventListener(ev, keepSave);
    void requestPersistentStorage();
  };
  document.addEventListener('pointerup', keepSave, { passive: true });
  document.addEventListener('keydown', keepSave, { passive: true });
  // Coming back from the back/forward cache counts as coming back from the background.
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) game.resumeFromBackground();
  });
  window.addEventListener('pagehide', () => game.save());
  window.addEventListener('blur', () => game.save());

  // Expose for debugging and automated tests – in development only.
  if (import.meta.env.DEV) (window as unknown as { dagny: Game }).dagny = game;

  // Service worker for offline play (production builds only).
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => undefined);
    });
  }
}

boot();
