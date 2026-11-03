/**
 * localStorage wrapper that never throws. If storage is missing or blocked
 * (private mode, disabled cookies, quota) we fall back to an in-memory map so
 * the game keeps working for the current session.
 */
export interface KeyValueStore {
  get(key: string): string | null;
  set(key: string, value: string): boolean;
  remove(key: string): void;
}

export class MemoryStore implements KeyValueStore {
  private readonly map = new Map<string, string>();
  get(key: string): string | null {
    return this.map.has(key) ? (this.map.get(key) as string) : null;
  }
  set(key: string, value: string): boolean {
    this.map.set(key, value);
    return true;
  }
  remove(key: string): void {
    this.map.delete(key);
  }
}

export class SafeLocalStore implements KeyValueStore {
  private readonly fallback = new MemoryStore();
  private readonly ls: Storage | null;

  constructor() {
    let ls: Storage | null = null;
    try {
      ls = typeof localStorage !== 'undefined' ? localStorage : null;
      if (ls) {
        const probe = '__dagny_probe__';
        ls.setItem(probe, '1');
        ls.removeItem(probe);
      }
    } catch {
      ls = null;
    }
    this.ls = ls;
  }

  get available(): boolean {
    return this.ls !== null;
  }

  get(key: string): string | null {
    try {
      if (this.ls) return this.ls.getItem(key);
    } catch {
      /* fall through */
    }
    return this.fallback.get(key);
  }

  set(key: string, value: string): boolean {
    this.fallback.set(key, value);
    try {
      if (this.ls) {
        this.ls.setItem(key, value);
        return true;
      }
    } catch {
      /* quota or blocked – memory copy is kept */
    }
    return false;
  }

  remove(key: string): void {
    this.fallback.remove(key);
    try {
      this.ls?.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}

/** The part of `navigator.storage` used here (missing in older browsers). */
export interface PersistentStorageApi {
  persisted?(): Promise<boolean>;
  persist?(): Promise<boolean>;
}

/**
 * Asks the browser to keep the game's storage instead of clearing it when
 * space runs low or the site hasn't been visited for a while (iOS Safari, for
 * one, clears it after seven days unless the game is on the home screen).
 * Asks only if the storage is not already kept. Returns whether it is kept;
 * never throws. Call it from a tap or key press: Firefox may ask the player.
 */
export async function requestPersistentStorage(
  api: PersistentStorageApi | undefined = typeof navigator !== 'undefined' ? navigator.storage : undefined,
): Promise<boolean> {
  try {
    if (!api?.persist) return false;
    if (await api.persisted?.()) return true;
    return await api.persist();
  } catch {
    return false;
  }
}
