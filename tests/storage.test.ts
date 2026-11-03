import { describe, expect, it } from 'vitest';
import { requestPersistentStorage, type PersistentStorageApi } from '../src/engine/storage';

describe('keeping the save', () => {
  it('asks the browser to keep the storage when it is not kept yet', async () => {
    let asked = 0;
    const api: PersistentStorageApi = { persisted: async () => false, persist: async () => (asked++, true) };
    expect(await requestPersistentStorage(api)).toBe(true);
    expect(asked).toBe(1);
  });

  it('does not ask again when the storage is already kept', async () => {
    let asked = 0;
    const api: PersistentStorageApi = { persisted: async () => true, persist: async () => (asked++, true) };
    expect(await requestPersistentStorage(api)).toBe(true);
    expect(asked).toBe(0);
  });

  it('reports a refusal', async () => {
    expect(await requestPersistentStorage({ persisted: async () => false, persist: async () => false })).toBe(false);
  });

  it('never throws: old browsers without the API, or one that fails', async () => {
    expect(await requestPersistentStorage(undefined)).toBe(false);
    expect(await requestPersistentStorage({})).toBe(false);
    expect(await requestPersistentStorage({ persist: () => Promise.reject(new Error('nej')) })).toBe(false);
  });
});
