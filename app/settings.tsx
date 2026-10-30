import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { exportAllPhotosToAlbum, exportBackup, importBackup } from '../lib/backup';
import { LANGS, useI18n } from '../lib/i18n';
import { getAutoAlbum, setAutoAlbum } from '../lib/settings';
import { C, softShadow } from '../lib/theme';

export default function Settings() {
  const { t, lang, setLang } = useI18n();
  const [busy, setBusy] = useState(false);
  const [auto, setAuto] = useState(getAutoAlbum());

  const run = async (fn: () => Promise<void>, errKey: 'set.exportErr' | 'set.importErr') => {
    setBusy(true);
    try { await fn(); } catch { Alert.alert(t(errKey)); } finally { setBusy(false); }
  };

  const doExport = () => run(exportBackup, 'set.exportErr');
  const doImport = () => run(async () => {
    const n = await importBackup();
    if (n !== null) Alert.alert(t('set.imported', { n }));
  }, 'set.importErr');
  const doAlbum = () => run(async () => {
    const n = await exportAllPhotosToAlbum();
    Alert.alert(n < 0 ? t('set.noPerm') : t('set.albumDone', { n }));
  }, 'set.exportErr');

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}>
      <Text style={s.h}>🌐 {t('set.lang')}</Text>
      <View style={s.chips}>
        {LANGS.map((l) => (
          <Pressable key={l.code} onPress={() => setLang(l.code)} style={[s.chip, lang === l.code && s.chipOn]}>
            <Text style={[s.chipTxt, lang === l.code && { fontWeight: '900' }]}>{l.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={[s.h, { marginTop: 16 }]}>💾 {t('set.backup')}</Text>
      <Text style={s.info}>{t('set.backupInfo')}</Text>
      <Pressable style={[s.btn, { backgroundColor: C.greenP }]} onPress={doExport} disabled={busy}><Text style={s.btnTxt}>{t('set.export')}</Text></Pressable>
      <Pressable style={[s.btn, { backgroundColor: C.blueP }]} onPress={doImport} disabled={busy}><Text style={s.btnTxt}>{t('set.import')}</Text></Pressable>

      <Text style={[s.h, { marginTop: 16 }]}>🖼️ {t('set.album')}</Text>
      <Text style={s.info}>{t('set.albumInfo')}</Text>
      <View style={s.switchRow}>
        <Text style={[s.btnTxt, { flex: 1 }]}>{t('set.autoAlbum')}</Text>
        <Switch value={auto} onValueChange={(v) => { setAuto(v); setAutoAlbum(v); }} />
      </View>
      <Pressable style={[s.btn, { backgroundColor: C.lilacP }]} onPress={doAlbum} disabled={busy}><Text style={s.btnTxt}>{t('set.exportAlbum')}</Text></Pressable>

      {busy && <ActivityIndicator size="large" color={C.red} style={{ marginTop: 12 }} />}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  h: { fontSize: 17, fontWeight: '900', color: C.ink },
  info: { color: C.muted, fontSize: 13, lineHeight: 19 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 18, ...softShadow },
  chipOn: { backgroundColor: C.yellowP },
  chipTxt: { color: C.ink, fontSize: 15 },
  btn: { padding: 14, borderRadius: 16, alignItems: 'center' },
  btnTxt: { color: C.ink, fontWeight: '800', fontSize: 15 },
  switchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 12, ...softShadow },
});
