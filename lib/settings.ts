import Storage from 'expo-sqlite/kv-store';

export const getAutoAlbum = (): boolean => {
  try { return Storage.getItemSync('autoAlbum') === '1'; } catch { return false; }
};
export const setAutoAlbum = (v: boolean) => {
  try { Storage.setItemSync('autoAlbum', v ? '1' : '0'); } catch {}
};
export const getAlbumDone = (): string[] => {
  try { return JSON.parse(Storage.getItemSync('albumDone') ?? '[]'); } catch { return []; }
};
export const setAlbumDone = (ids: string[]) => {
  try { Storage.setItemSync('albumDone', JSON.stringify(ids)); } catch {}
};
