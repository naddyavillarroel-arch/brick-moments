import { eq, isNull } from 'drizzle-orm';
import * as DocumentPicker from 'expo-document-picker';
// En SDK 57 la API clásica está en 'expo-file-system/legacy' y 'expo-media-library/legacy'
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library/legacy';
import * as Sharing from 'expo-sharing';
import JSZip from 'jszip';
import { db } from '../db/momentsRepo';
import { moments, photos } from '../db/schema';
import { getAlbumDone, setAlbumDone } from './settings';

const BASE = FileSystem.documentDirectory!;
const B64 = { encoding: FileSystem.EncodingType.Base64 };
const ALBUM = 'Brick Moments';

/** Crea un ZIP (data.json + fotos) y abre el menú de compartir/guardar. */
export async function exportBackup() {
  const ms = await db.select().from(moments).where(isNull(moments.deletedAt));
  const ps = await db.select().from(photos).where(isNull(photos.deletedAt));

  const zip = new JSZip();
  zip.file('data.json', JSON.stringify({ app: 'brick-moments', version: 1, exportedAt: Date.now(), moments: ms, photos: ps }));
  for (const p of ps) {
    for (const rel of [p.localPath, p.thumbPath]) {
      try {
        const b64 = await FileSystem.readAsStringAsync(BASE + rel, B64);
        zip.file(rel, b64, { base64: true });
      } catch {}
    }
  }
  const out = await zip.generateAsync({ type: 'base64', compression: 'STORE' }); // los JPG ya están comprimidos
  const stamp = new Date().toISOString().slice(0, 10);
  const uri = `${FileSystem.cacheDirectory}BrickMoments-${stamp}.zip`;
  await FileSystem.writeAsStringAsync(uri, out, B64);
  await Sharing.shareAsync(uri, { mimeType: 'application/zip', UTI: 'public.zip-archive', dialogTitle: 'Brick Moments' });
}

/** Restaura desde un ZIP. Es aditivo: no sobrescribe momentos que ya existen. Devuelve cuántos se añadieron (null = cancelado). */
export async function importBackup(): Promise<number | null> {
  const r = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
  if (r.canceled) return null;

  const b64 = await FileSystem.readAsStringAsync(r.assets[0].uri, B64);
  const zip = await JSZip.loadAsync(b64, { base64: true });
  const dataFile = zip.file('data.json');
  if (!dataFile) throw new Error('invalid backup');
  const data = JSON.parse(await dataFile.async('string'));
  if (data.app !== 'brick-moments') throw new Error('invalid backup');

  for (const d of ['photos/', 'photos/thumbs/']) {
    await FileSystem.makeDirectoryAsync(BASE + d, { intermediates: true }).catch(() => {});
  }

  let added = 0;
  for (const m of data.moments as (typeof moments.$inferInsert)[]) {
    const exists = await db.query.moments.findFirst({ where: eq(moments.id, m.id) });
    if (exists) continue;
    await db.insert(moments).values({ ...m, deletedAt: null });
    for (const p of (data.photos as (typeof photos.$inferInsert)[]).filter((x) => x.momentId === m.id)) {
      for (const rel of [p.localPath, p.thumbPath]) {
        const f = zip.file(rel);
        if (f) await FileSystem.writeAsStringAsync(BASE + rel, await f.async('base64'), B64);
      }
      await db.insert(photos).values({ ...p, remoteKey: null, deletedAt: null }).onConflictDoNothing();
    }
    added++;
  }
  return added;
}

async function ensurePermission() {
  const perm = await MediaLibrary.requestPermissionsAsync();
  return perm.granted;
}

async function addToAlbum(uris: string[]) {
  for (const uri of uris) {
    const asset = await MediaLibrary.createAssetAsync(uri);
    const album = await MediaLibrary.getAlbumAsync(ALBUM);
    if (album) await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
    else await MediaLibrary.createAlbumAsync(ALBUM, asset, false);
  }
}

/** Guarda archivos en el álbum "Brick Moments" de la galería. Devuelve false si no hay permiso. */
export async function saveToAlbum(uris: string[]): Promise<boolean> {
  if (!(await ensurePermission())) return false;
  await addToAlbum(uris);
  return true;
}

/** Copia todas las fotos de la app al álbum (omite las ya copiadas antes). Devuelve cuántas; -1 = sin permiso. */
export async function exportAllPhotosToAlbum(): Promise<number> {
  if (!(await ensurePermission())) return -1;
  const ps = await db.select().from(photos).where(isNull(photos.deletedAt));
  const done = new Set(getAlbumDone());
  const todo = ps.filter((p) => !done.has(p.id));
  for (const p of todo) {
    await addToAlbum([BASE + p.localPath]);
    done.add(p.id);
    setAlbumDone(Array.from(done));
  }
  return todo.length;
}
