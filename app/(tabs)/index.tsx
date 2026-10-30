import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getMonthSummary, photoUri } from '../../db/momentsRepo';
import { pad, todayStr, ymd } from '../../lib/dates';
import { useI18n } from '../../lib/i18n';
import { C } from '../../lib/theme';

export default function Home() {
  const { t, weekdays, monthTitle } = useI18n();
  const now = new Date();
  const [y, setY] = useState(now.getFullYear());
  const [m, setM] = useState(now.getMonth());
  const [summary, setSummary] = useState<Record<string, { count: number; thumbPath: string | null }>>({});
  const today = todayStr();

  useFocusEffect(useCallback(() => {
    getMonthSummary(`${y}-${pad(m + 1)}`).then(setSummary);
  }, [y, m]));

  const shift = (d: number) => {
    const dt = new Date(y, m + d, 1);
    if (dt > new Date(now.getFullYear(), now.getMonth(), 1)) return; // no meses futuros
    setY(dt.getFullYear());
    setM(dt.getMonth());
  };

  const offset = (new Date(y, m, 1).getDay() + 6) % 7; // semana inicia en lunes
  const total = new Date(y, m + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];

  const open = (d: number) => {
    const date = ymd(y, m, d);
    if (date > today) return;
    router.push(summary[date]?.count ? `/day/${date}` : `/moment/new?date=${date}`);
  };

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <View style={s.header}>
        <Pressable onPress={() => shift(-1)} hitSlop={12}><Text style={s.arrow}>‹</Text></Pressable>
        <Text style={s.month}>{monthTitle(y, m)}</Text>
        <Pressable onPress={() => shift(1)} hitSlop={12}><Text style={s.arrow}>›</Text></Pressable>
      </View>
      <View style={s.row}>{weekdays.map((w, i) => <Text key={i} style={s.week}>{w}</Text>)}</View>
      <View style={s.row}>
        {cells.map((d, i) => {
          if (!d) return <View key={i} style={s.cell} />;
          const date = ymd(y, m, d);
          const info = summary[date];
          const future = date > today;
          return (
            <Pressable key={i} style={s.cell} onPress={() => open(d)} disabled={future}>
              <View style={[s.day, date === today && s.today, info && s.has, future && { opacity: 0.35 }]}>
                {info?.thumbPath && <Image source={{ uri: photoUri(info.thumbPath) }} style={StyleSheet.absoluteFill} contentFit="cover" />}
                <Text style={[s.num, info?.thumbPath && s.numOnPhoto]}>{d}</Text>
                {info && info.count > 1 && <View style={s.badge}><Text style={s.badgeTxt}>×{info.count}</Text></View>}
              </View>
            </Pressable>
          );
        })}
      </View>
      <Text style={s.hint}>{t('home.hint')} 🧱</Text>
    </View>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 12 },
  arrow: { fontSize: 36, fontWeight: '800', color: C.red, paddingHorizontal: 12 },
  month: { fontSize: 22, fontWeight: '900', color: C.ink },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  week: { width: '14.285%', textAlign: 'center', fontWeight: '800', color: C.muted, marginBottom: 6 },
  cell: { width: '14.285%', aspectRatio: 1, padding: 2 },
  day: { flex: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: C.card, borderWidth: 1.5, borderColor: '#E3DCC8', overflow: 'hidden' },
  today: { borderColor: C.red, borderWidth: 3 },
  has: { backgroundColor: C.yellow, borderColor: C.ink },
  num: { fontWeight: '800', color: C.ink },
  numOnPhoto: { color: '#fff', textShadowColor: '#000', textShadowRadius: 4 },
  badge: { position: 'absolute', right: 2, bottom: 2, backgroundColor: C.red, borderRadius: 8, paddingHorizontal: 4 },
  badgeTxt: { color: '#fff', fontSize: 10, fontWeight: '800' },
  hint: { textAlign: 'center', color: C.muted, marginTop: 20 },
});
