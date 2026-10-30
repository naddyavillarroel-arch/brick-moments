import { and, desc, eq, isNull, like } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as Crypto from 'expo-crypto';
// En SDK 54+ la API clásica vive en 'expo-file-system/legacy'.
// En SDKs anteriores usa: import * as FileSystem from 'expo-file-system';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import { openDatabaseSync } from 'expo-sqlite';
import { MAX_PHOTOS_PER_MOMENT, moments, photos } from './schema';
import * as schema from './schema';

const expo = openDatabaseSync('brickmoments.db');
export const sqlite = expo;
export const db = drizzle(expo, { schema });

const PHOTOS_DIR = 'photos/';
const THUMBS_DIR = 'photos/thumbs/';
const now = () => Date.now();

// ---------- Fotos: copia interna + compresión + miniatura ----------

async function ensureDirs() {
  for (const d of [PHOTOS_DIR, THUMBS_DIR]) {
    await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + d, {
      intermediates: true,
    }).catch(() => {}); // ya existe
  }
}

/** Copia la foto al almacenamiento de la app. Devuelve rutas RELATIVAS. */
async function storePhoto(sourceUri: string) {
  await ensureDirs();
  const id = Crypto.randomUUID();

  const full = await ImageManipulator.manipulateAsync(
    sourceUri,
    [{ resize: { width: 1600 } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
  );
  const thumb = await ImageManipulator.manipulateAsync(
    sourceUri,
    [{ resize: { width: 400 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );

  const localPath = `${PHOTOS_DIR}${id}.jpg`;
  const thumbPath = `${THUMBS_DIR}${id}.jpg`;
  const base = FileSystem.documentDirectory!;
  await FileSystem.copyAsync({ from: full.uri, to: base + localPath });
  await FileSystem.copyAsync({ from: thumb.uri, to: base + thumbPath });

  return { id, localPath, thumbPath, width: full.width, height: full.height };
}

/** Convierte ruta relativa en URI absoluta para <Image source={{uri}} /> */
export const photoUri = (relativePath: string) =>
  FileSystem.documentDirectory + relativePath;

// ---------- Crear ----------

export async function createMoment(input: {
  date: string; // 'YYYY-MM-DD'
  title: string;
  note?: string;
  setNumber?: string;
  theme?: string;
  photoUris?: string[]; // URIs de la galería (máx. 3)
}) {
  const id = Crypto.randomUUID();
  const t = now();

  await db.insert(moments).values({
    id,
    date: input.date,
    title: input.title.trim(),
    note: input.note ?? '',
    setNumber: input.setNumber,
    theme: input.theme,
    createdAt: t,
    updatedAt: t,
  });

  if (input.photoUris?.length) await addPhotos(id, input.photoUris);
  return id;
}

// ---------- Editar (título, detalle, etc.) ----------

export async function updateMoment(
  id: string,
  patch: Partial<{
    date: string;
    title: string;
    note: string;
    setNumber: string | null;
    theme: string | null;
  }>
) {
  await db
    .update(moments)
    .set({ ...patch, updatedAt: now() })
    .where(eq(moments.id, id));
}

export async function toggleFavorite(id: string, value: boolean) {
  await db
    .update(moments)
    .set({ isFavorite: value, updatedAt: now() })
    .where(eq(moments.id, id));
}

// ---------- Editar fotos: añadir hasta completar 3 ----------

export async function addPhotos(momentId: string, uris: string[]) {
  const current = await db.query.photos.findMany({
    where: and(eq(photos.momentId, momentId), isNull(photos.deletedAt)),
  });

  const freeSlots = MAX_PHOTOS_PER_MOMENT - current.length;
  if (freeSlots <= 0) return { added: 0, freeSlots: 0 };

  const toAdd = uris.slice(0, freeSlots);
  const usedPositions = new Set(current.map((p) => p.position));
  const t = now();

  for (const uri of toAdd) {
    const stored = await storePhoto(uri);
    let position = 0;
    while (usedPositions.has(position)) position++;
    usedPositions.add(position);

    await db.insert(photos).values({
      id: stored.id,
      momentId,
      localPath: stored.localPath,
      thumbPath: stored.thumbPath,
      width: stored.width,
      height: stored.height,
      position,
      createdAt: t,
      updatedAt: t,
    });
  }

  await db.update(moments).set({ updatedAt: t }).where(eq(moments.id, momentId));
  return { added: toAdd.length, freeSlots: freeSlots - toAdd.length };
}

export async function removePhoto(photoId: string) {
  const t = now();
  const [p] = await db.select().from(photos).where(eq(photos.id, photoId));
  if (!p) return;

  // Borrado lógico (para poder sincronizar el borrado luego)
  await db
    .update(photos)
    .set({ deletedAt: t, updatedAt: t })
    .where(eq(photos.id, photoId));
  await db.update(moments).set({ updatedAt: t }).where(eq(moments.id, p.momentId));

  // Borra los archivos locales para liberar espacio
  const base = FileSystem.documentDirectory!;
  await FileSystem.deleteAsync(base + p.localPath, { idempotent: true });
  await FileSystem.deleteAsync(base + p.thumbPath, { idempotent: true });
}

export async function deleteMoment(id: string) {
  const t = now();
  await db
    .update(moments)
    .set({ deletedAt: t, updatedAt: t })
    .where(eq(moments.id, id));
}

// ---------- Consultas ----------

const activePhotos = { where: isNull(photos.deletedAt), orderBy: photos.position };

/** Todos los momentos de un día (para la pantalla del día). */
export function getMomentsByDate(date: string) {
  return db.query.moments.findMany({
    where: and(eq(moments.date, date), isNull(moments.deletedAt)),
    with: { photos: activePhotos },
    orderBy: moments.createdAt,
  });
}

/** Un momento para editarlo. */
export function getMoment(id: string) {
  return db.query.moments.findFirst({
    where: eq(moments.id, id),
    with: { photos: activePhotos },
  });
}

/** Resumen del mes para el calendario: día -> {count, miniatura}. */
export async function getMonthSummary(yearMonth: string) {
  const rows = await db.query.moments.findMany({
    where: and(like(moments.date, `${yearMonth}-%`), isNull(moments.deletedAt)),
    with: { photos: activePhotos },
    orderBy: moments.createdAt,
  });

  const byDay: Record<string, { count: number; thumbPath: string | null }> = {};
  for (const m of rows) {
    const day = byDay[m.date] ?? (byDay[m.date] = { count: 0, thumbPath: null });
    day.count++;
    day.thumbPath ??= m.photos[0]?.thumbPath ?? null;
  }
  return byDay;
}

export function getRecent(limit = 20) {
  return db.query.moments.findMany({
    where: isNull(moments.deletedAt),
    with: { photos: activePhotos },
    orderBy: desc(moments.updatedAt),
    limit,
  });
}

export function getFavorites() {
  return db.query.moments.findMany({
    where: and(eq(moments.isFavorite, true), isNull(moments.deletedAt)),
    with: { photos: activePhotos },
    orderBy: desc(moments.date),
  });
}

export type MomentWithPhotos = NonNullable<Awaited<ReturnType<typeof getMoment>>>;
