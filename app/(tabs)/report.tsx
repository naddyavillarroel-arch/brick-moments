import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MomentCard } from '../../components/MomentList';
import { PickerSheet, type Option } from '../../components/PickerSheet';
import { getRecent, type MomentWithPhotos } from '../../db/momentsRepo';
import { useI18n } from '../../lib/i18n';
import { C, softShadow } from '../../lib/theme';

function Selector({ label, value, active, onPress }: { label: string; value: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[s.sel, active && s.selOn]} onPress={onPress}>
      <View style={{ flex: 1 }}>
        <Text style={s.selLabel}>{label}</Text>
        <Text style={s.selValue} numberOfLines={1}>{value}</Text>
      </View>
      <Text style={s.chev}>▾</Text>
    </Pressable>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[s.chip, active && s.chipOn]}>
      <Text style={[s.chipTxt, active && { fontWeight: '800' }]}>{label}</Text>
    </Pressable>
  );
}

export default function Report() {
  const { t, months, monthsShort } = useI18n();
  const [all, setAll] = useState<MomentWithPhotos[]>([]);
  const [year, setYear] = useState<number | null>(null);
  const [month, setMonth] = useState<number | null>(null);
  const [onlyFav, setOnlyFav] = useState(false);
  const [sheet, setSheet] = useState<'year' | 'month' | null>(null);

  useFocusEffect(useCallback(() => { getRecent(100000).then(setAll); }, []));

  const yearOf = (m: MomentWithPhotos) => Number(m.date.slice(0, 4));
  const monthOf = (m: MomentWithPhotos) => Number(m.date.slice(5, 7)) - 1;

  const years = useMemo(() => Array.from(new Set(all.map(yearOf))).sort((a, b) => b - a), [all]);
  const base = useMemo(() => all.filter((m) => !onlyFav || m.isFavorite), [all, onlyFav]);
  const byYear = useMemo(() => base.filter((m) => year === null || yearOf(m) === year), [base, year]);
  const perMonth = useMemo(() => {
    const a: number[] = Array(12).fill(0);
    byYear.forEach((m) => a[monthOf(m)]++);
    return a;
  }, [byYear]);
  const top = useMemo(() => {
    const c: Record<string, number> = {};
    byYear.forEach((m) => { const k = m.date.slice(0, 7); c[k] = (c[k] ?? 0) + 1; });
    const e = Object.entries(c).sort((a, b) => b[1] - a[1])[0];
    return e ? { y: Number(e[0].slice(0, 4)), m: Number(e[0].slice(5, 7)) - 1, n: e[1] } : null;
  }, [byYear]);
  const filtered = useMemo(
    () => byYear.filter((m) => month === null || monthOf(m) === month).sort((a, b) => b.date.localeCompare(a.date)),
    [byYear, month]
  );

  const stats = {
    total: filtered.length,
    days: new Set(filtered.map((m) => m.date)).size,
    photos: filtered.reduce((n, m) => n + m.photos.length, 0),
    fav: filtered.filter((m) => m.isFavorite).length,
  };

  const hasFilters = year !== null || month !== null || onlyFav;
  const clear = () => { setYear(null); setMonth(null); setOnlyFav(false); };
  const topActive = !!top && year === top.y && month === top.m;
  const applyTop = () => {
    if (!top) return;
    if (topActive) { setYear(null); setMonth(null); } else { setYear(top.y); setMonth(top.m); }
  };

  const yearOptions: Option[] = [{ label: t('rep.all'), value: null }, ...years.map((y) => ({ label: String(y), value: y }))];
  const monthOptions: Option[] = [{ label: t('rep.all'), value: null }, ...monthsShort.map((n, i) => ({ label: n, value: i }))];

  const max = Math.max(1, ...perMonth);
  const box = (n: number, label: string, color: string) => (
    <View style={[s.box, { backgroundColor: color }]}><Text style={s.n}>{n}</Text><Text style={s.l}>{label}</Text></View>
  );

  return (
    <>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}>
        <View style={s.grid}>
          {box(stats.total, t('rep.moments'), C.yellowP)}
          {box(stats.days, t('rep.days'), C.blueP)}
          {box(stats.photos, t('rep.photos'), C.pinkP)}
          {box(stats.fav, t('rep.favs'), C.greenP)}
        </View>

        <View style={s.filterCard}>
          <View style={s.filterHead}>
            <Text style={s.h}>{t('rep.filters')}</Text>
            {hasFilters && (
              <Pressable onPress={clear} hitSlop={10}><Text style={s.clear}>✕ {t('rep.clear')}</Text></Pressable>
            )}
          </View>
          <View style={s.selRow}>
            <Selector label={t('rep.year')} value={year === null ? t('rep.all') : String(year)} active={year !== null} onPress={() => setSheet('year')} />
            <Selector label={t('rep.month')} value={month === null ? t('rep.all') : months[month]} active={month !== null} onPress={() => setSheet('month')} />
          </View>
          <View style={s.chipRow}>
            <Chip label={t('rep.onlyFav')} active={onlyFav} onPress={() => setOnlyFav(!onlyFav)} />
            {top && <Chip label={t('rep.top')} active={topActive} onPress={applyTop} />}
          </View>
          {top && <Text style={s.topInfo}>🏆 {t('rep.topVal', { m: months[top.m], y: top.y, n: top.n })}</Text>}
        </View>

        <Text style={s.h}>{t('rep.byMonth')}</Text>
        {perMonth.map((c, i) => (
          <Pressable key={i} style={s.bar} onPress={() => setMonth(month === i ? null : i)}>
            <Text style={[s.mon, month === i && { color: C.ink, fontWeight: '900' }]}>{monthsShort[i]}</Text>
            <View style={[s.fill, { width: `${(c / max) * 70}%`, opacity: c ? 1 : 0.15, backgroundColor: month === i ? C.red : C.pinkP }]} />
            <Text style={s.cnt}>{c}</Text>
          </Pressable>
        ))}

        <Text style={s.h}>{t('rep.results', { n: filtered.length })}</Text>
        {filtered.length === 0 && <Text style={s.none}>{t('rep.none')}</Text>}
        {filtered.slice(0, 100).map((m) => <MomentCard key={m.id} item={m} />)}
      </ScrollView>

      <PickerSheet visible={sheet === 'year'} title={t('rep.year')} options={yearOptions} selected={year} onSelect={setYear} onClose={() => setSheet(null)} />
      <PickerSheet visible={sheet === 'month'} title={t('rep.month')} options={monthOptions} selected={month} onSelect={setMonth} onClose={() => setSheet(null)} />
    </>
  );
}

const s = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  box: { width: '48.5%', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12 },
  n: { fontSize: 22, fontWeight: '900', color: C.ink },
  l: { color: C.ink, fontWeight: '600', fontSize: 12 },
  h: { fontSize: 16, fontWeight: '900', color: C.ink },

  filterCard: { backgroundColor: '#fff', borderRadius: 18, padding: 14, gap: 12, ...softShadow },
  filterHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  clear: { color: C.red, fontWeight: '700', fontSize: 13 },
  selRow: { flexDirection: 'row', gap: 10 },
  sel: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 12 },
  selOn: { backgroundColor: C.yellowP },
  selLabel: { fontSize: 11, fontWeight: '700', color: C.muted },
  selValue: { fontSize: 16, fontWeight: '800', color: C.ink },
  chev: { fontSize: 16, color: C.ink, marginLeft: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: C.bg, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  chipOn: { backgroundColor: C.yellowP },
  chipTxt: { color: C.ink, fontSize: 13 },
  topInfo: { color: C.muted, fontWeight: '600', fontSize: 12 },

  bar: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mon: { width: 38, color: C.muted, fontWeight: '700', fontSize: 12 },
  fill: { height: 12, borderRadius: 6, minWidth: 6 },
  cnt: { color: C.ink, fontWeight: '700', fontSize: 12 },
  none: { color: C.muted, textAlign: 'center', marginVertical: 12 },
});
