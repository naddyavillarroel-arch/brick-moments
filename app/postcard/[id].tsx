import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { getMoment, photoUri, type MomentWithPhotos } from '../../db/momentsRepo';
import { useI18n } from '../../lib/i18n';
import { C } from '../../lib/theme';

// Paleta neutra y clara de la postal
const P = {
  outer: '#EFEBE2', // marco de la imagen exportada (evita esquinas transparentes)
  card: '#FCFAF6',
  ink: '#2B2926',
  muted: '#8C877D',
  line: '#E9E3D6',
  soft: '#F2EDE2',
  accent: '#F2C9A8', // durazno suave
};

const OUTER_W = Dimensions.get('window').width - 32;
const CARD_W = OUTER_W - 24;
const PHOTO_W = CARD_W - 32;

function Frame({ uri, h, style }: { uri: string; h: number; style?: object }) {
  return (
    <View style={[s.frame, style]}>
      <Image source={{ uri }} style={{ width: '100%', height: h, borderRadius: 8 }} contentFit="cover" />
    </View>
  );
}

export default function Postcard() {
  const { t, fmt } = useI18n();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [m, setM] = useState<MomentWithPhotos | null>(null);
  const ref = useRef<View>(null);
  useEffect(() => { getMoment(id).then((x) => setM(x ?? null)); }, [id]);

  const share = async () => {
    try {
      const uri = await captureRef(ref, { format: 'png', quality: 1 });
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'image/png' });
    } catch (e: any) { Alert.alert(t('post.fail'), e?.message ?? ''); }
  };

  if (!m) return null;
  const [main, ...rest] = m.photos;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 18, alignItems: 'center' }}>
      {/* Todo lo que está dentro de este View es lo que se exporta como imagen */}
      <View ref={ref} collapsable={false} style={s.capture}>
        <View style={s.card}>
          <View style={s.studs}>
            {Array.from({ length: 6 }).map((_, i) => <View key={i} style={s.stud} />)}
          </View>

          <View style={s.header}>
            <View style={{ flex: 1, gap: 8, alignItems: 'flex-start' }}>
              <Text style={s.date}>{fmt(m.date)}</Text>
              {!!m.setNumber && (
                <View style={s.chip}><Text style={s.chipTxt}>🧱  Set {m.setNumber}</Text></View>
              )}
            </View>
            {/**<View style={s.stamp}>
              <Image source={require('../../assets/logo.png')} style={{ width: 34, height: 34 }} contentFit="contain" />
            </View>*/}
          </View>

          {main ? (
            <Frame uri={photoUri(main.localPath)} h={PHOTO_W * 0.72} />
          ) : (
            <View style={[s.frame, s.empty, { height: PHOTO_W * 0.72 }]}><Text style={{ fontSize: 56 }}>🧱</Text></View>
          )}

          {rest.length > 0 && (
            <View style={s.row}>
              {rest.map((p) => (
                <Frame key={p.id} uri={photoUri(p.thumbPath)} h={PHOTO_W * 0.26} style={{ flex: 1 }} />
              ))}
            </View>
          )}

          <Text style={s.title}>{m.title}</Text>

          {!!m.note && (
            <View style={s.noteBox}>
              <Text style={s.note} numberOfLines={5}>{m.note}</Text>
            </View>
          )}

          <View style={s.footer}>
            <Image source={require('../../assets/logo.png')} style={{ width: 22, height: 22 }} contentFit="contain" />
            <Text style={s.brand}>Brick Moments</Text>
          </View>
        </View>
      </View>

      <Pressable style={s.btn} onPress={share}>
        <Text style={s.btnTxt}>{t('post.share')}</Text>
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  capture: { width: OUTER_W, backgroundColor: P.outer, padding: 12 },
  card: { width: CARD_W, backgroundColor: P.card, borderRadius: 18, padding: 16, gap: 14, borderWidth: 1, borderColor: P.line },

  studs: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  stud: { width: 22, height: 8, borderRadius: 4, backgroundColor: P.soft },

  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  date: { fontSize: 13, fontWeight: '700', color: P.muted, letterSpacing: 0.6, textTransform: 'uppercase' },
  chip: { backgroundColor: P.soft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  chipTxt: { fontSize: 12, fontWeight: '700', color: P.ink },
  stamp: {
    width: 52, height: 58, borderRadius: 6, backgroundColor: '#fff',
    borderWidth: 1.5, borderStyle: 'dashed', borderColor: P.accent,
    alignItems: 'center', justifyContent: 'center',
  },

  frame: { backgroundColor: '#fff', padding: 6, borderRadius: 14, borderWidth: 1, borderColor: P.line },
  empty: { alignItems: 'center', justifyContent: 'center', backgroundColor: P.soft },
  row: { flexDirection: 'row', gap: 10 },

  title: { fontSize: 26, fontWeight: '800', color: P.ink, lineHeight: 32, marginTop: 2 },
  noteBox: { borderLeftWidth: 3, borderLeftColor: P.accent, paddingLeft: 12 },
  note: { fontSize: 14, lineHeight: 21, color: '#57534C' },

  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderTopWidth: 1, borderTopColor: P.line, paddingTop: 12, marginTop: 2,
  },
  brand: { fontSize: 13, fontWeight: '800', color: P.muted, letterSpacing: 1 },

  btn: { backgroundColor: C.blueP, paddingHorizontal: 40, paddingVertical: 14, borderRadius: 30 },
  btnTxt: { color: C.ink, fontWeight: '900', fontSize: 16 },
});
