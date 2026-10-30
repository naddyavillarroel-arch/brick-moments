import { Image } from 'expo-image';
import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { photoUri, type MomentWithPhotos } from '../db/momentsRepo';
import { useI18n } from '../lib/i18n';
import { C, softShadow } from '../lib/theme';

export function MomentCard({ item, showShare }: { item: MomentWithPhotos; showShare?: boolean }) {
  const { fmt, t } = useI18n();
  return (
    <Pressable style={s.card} onPress={() => router.push(`/moment/${item.id}`)}>
      {item.photos[0] ? (
        <Image source={{ uri: photoUri(item.photos[0].thumbPath) }} style={s.thumb} contentFit="cover" />
      ) : (
        <View style={[s.thumb, s.noPhoto]}><Text style={{ fontSize: 28 }}>🧱</Text></View>
      )}
      <View style={{ flex: 1 }}>
        {/* Fila del título: título a la izquierda, botón de compartir en la esquina derecha */}
        <View style={s.titleRow}>
          <Text style={s.title} numberOfLines={2}>{item.isFavorite ? '⭐ ' : ''}{item.title}</Text>
          {showShare && (
            <Pressable style={s.shareBtn} onPress={() => router.push(`/postcard/${item.id}`)} hitSlop={6}>
              <Text style={s.shareTxt}> {t('post.share')}</Text>
            </Pressable>
          )}
        </View>
        <Text style={s.date}>{fmt(item.date)}</Text>
        {!!item.note && <Text style={s.note} numberOfLines={2}>{item.note}</Text>}
      </View>
    </Pressable>
  );
}

export function MomentList({ items, empty, showShare }: { items: MomentWithPhotos[]; empty: string; showShare?: boolean }) {
  return (
    <FlatList
      data={items}
      keyExtractor={(m) => m.id}
      contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}
      ListEmptyComponent={<Text style={s.empty}>{empty}</Text>}
      renderItem={({ item }) => <MomentCard item={item} showShare={showShare} />}
    />
  );
}

const s = StyleSheet.create({
  card: { flexDirection: 'row', gap: 12, backgroundColor: C.card, borderRadius: 16, padding: 10, alignItems: 'flex-start', ...softShadow },
  thumb: { width: 72, height: 72, borderRadius: 12 },
  noPhoto: { backgroundColor: C.yellowP, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  title: { flex: 1, fontSize: 16, fontWeight: '800', color: C.ink },
  shareBtn: { backgroundColor: C.blueP, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16 },
  shareTxt: { fontSize: 13, fontWeight: '800', color: C.ink },
  date: { fontSize: 12, color: C.muted, marginTop: 2 },
  note: { fontSize: 13, color: C.ink, marginTop: 4 },
  empty: { textAlign: 'center', color: C.muted, marginTop: 60, fontSize: 15, paddingHorizontal: 24 },
});
