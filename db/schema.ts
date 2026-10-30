import { relations } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const MAX_PHOTOS_PER_MOMENT = 3;

// Un día puede tener VARIOS momentos (misma `date`).
export const moments = sqliteTable(
  'moments',
  {
    id: text('id').primaryKey(), // UUID
    date: text('date').notNull(), // 'YYYY-MM-DD' (texto, sin zona horaria)
    title: text('title').notNull(), // "Mi primer set"
    note: text('note').notNull().default(''),
    setNumber: text('set_number'), // opcional: número de set
    theme: text('theme'), // opcional: Technic, City, Star Wars...
    isFavorite: integer('is_favorite', { mode: 'boolean' }).notNull().default(false),
    createdAt: integer('created_at').notNull(), // ms epoch
    updatedAt: integer('updated_at').notNull(), // se actualiza en cada edición
    deletedAt: integer('deleted_at'), // borrado lógico (útil para sync)
  },
  (t) => [
    index('moments_date_idx').on(t.date),
    index('moments_updated_idx').on(t.updatedAt),
  ]
);

export const photos = sqliteTable(
  'photos',
  {
    id: text('id').primaryKey(), // UUID
    momentId: text('moment_id')
      .notNull()
      .references(() => moments.id, { onDelete: 'cascade' }),
    localPath: text('local_path').notNull(), // relativa: 'photos/abc.jpg'
    thumbPath: text('thumb_path').notNull(), // relativa: 'photos/thumbs/abc.jpg'
    remoteKey: text('remote_key'), // clave en la nube (fase sync)
    position: integer('position').notNull().default(0), // 0..2
    width: integer('width'),
    height: integer('height'),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
    deletedAt: integer('deleted_at'),
  },
  (t) => [index('photos_moment_idx').on(t.momentId)]
);

export const momentsRelations = relations(moments, ({ many }) => ({
  photos: many(photos),
}));

export const photosRelations = relations(photos, ({ one }) => ({
  moment: one(moments, { fields: [photos.momentId], references: [moments.id] }),
}));

export type Moment = typeof moments.$inferSelect;
export type Photo = typeof photos.$inferSelect;
