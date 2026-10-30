import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardSafe } from '../../components/KeyboardSafe';
import { addPhotos, createMoment, deleteMoment, getMoment, photoUri, removePhoto, toggleFavorite, updateMoment } from '../../db/momentsRepo';
import { MAX_PHOTOS_PER_MOMENT, type Photo } from '../../db/schema';
import { saveToAlbum } from '../../lib/backup';
import { todayStr } from '../../lib/dates';
import { useI18n } from '../../lib/i18n';
import { getAutoAlbum } from '../../lib/settings';
import { C, softShadow } from '../../lib/theme';

export default function MomentScreen() {
  const { t, fmt } = useI18n();
  const { id, date: dateParam } = useLocalSearchParams<{ id: string; date?: string }>();
  const isNew = id === 'new';
  const scroll = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets(); // alto de la barra de navegación del sistema
  const [date, setDate] = useState(dateParam ?? todayStr());
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [setNumber, setSetNumber] = useState('');
  const [fav, setFav] = useState(false);
  const [saved, setSaved] = useState<Photo[]>([]);
  const [pending, setPending] = useState<string[]>([]);

  const load = async () => {
    const m = await getMoment(id);
    if (!m) return;
    setDate(m.date); setTitle(m.title); setNote(m.note);
    setSetNumber(m.setNumber ?? ''); setFav(m.isFavorite); setSaved(m.photos);
  };
  useEffect(() => { if (!isNew) load(); }, [id]);

  const slots = MAX_PHOTOS_PER_MOMENT - saved.length - pending.length;
  const scrollDown = () => setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 300);

  const pick = async () => {
    if (slots <= 0) return;
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsMultipleSelection: true, selectionLimit: slots, quality: 1,
    });
    if (!r.canceled) setPending((p) => [...p, ...r.assets.map((a) => a.uri)].slice(0, MAX_PHOTOS_PER_MOMENT - saved.length));
  };

  const takePhoto = async () => {
    if (slots <= 0) return;
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return Alert.alert(t('moment.camPerm'));
    const r = await ImagePicker.launchCameraAsync({ quality: 1 });
    if (r.canceled) return;
    const uri = r.assets[0].uri;
    setPending((p) => [...p, uri]);
    if (getAutoAlbum()) saveToAlbum([uri]).catch(() => {});
  };

  const dropSaved = (p: Photo) =>
    Alert.alert(t('moment.rmPhoto'), t('moment.rmPhotoMsg'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: async () => { await removePhoto(p.id); load(); } },
    ]);

  const save = async () => {
    if (!title.trim()) return Alert.alert(t('moment.needName'), t('moment.needNameMsg'));
    if (isNew) {
      const newId = await createMoment({ date, title, note, setNumber: setNumber.trim() || undefined, photoUris: pending });
      if (fav) await toggleFavorite(newId, true);
    } else {
      await updateMoment(id, { title: title.trim(), note, setNumber: setNumber.trim() || null });
      if (pending.length) await addPhotos(id, pending);
    }
    router.back();
  };

  const onFav = async () => {
    setFav(!fav);
    if (!isNew) await toggleFavorite(id, !fav);
  };

  const remove = () =>
    Alert.alert(t('moment.delTitle'), t('moment.delMsg'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: async () => {
        for (const p of saved) await removePhoto(p.id);
        await deleteMoment(id); router.back();
      } },
    ]);

  return (
    <KeyboardSafe>
      <ScrollView ref={scroll} contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 + insets.bottom }} keyboardShouldPersistTaps="handled">
        <Stack.Screen options={{
          title: isNew ? t('moment.new') : t('moment.edit'),
          headerRight: () => (
            <Pressable onPress={onFav} hitSlop={12} style={[s.hdrStar, fav && s.hdrStarOn]}>
              <Text style={{ fontSize: 22 }}>{fav ? '⭐' : '☆'}</Text>
            </Pressable>
          ),
        }} />
        <Text style={s.date}>📅 {fmt(date)}</Text>

        <Text style={s.label}>{t('moment.name')}</Text>
        <TextInput style={s.input} value={title} onChangeText={setTitle} placeholder={t('moment.namePh')} placeholderTextColor="#B5AE9C" maxLength={80} />

        <Pressable style={[s.favBtn, fav && s.favOn]} onPress={onFav}>
          <View style={s.favIconWrap}><Text style={s.favIcon}>{fav ? '⭐' : '☆'}</Text></View>
          <Text style={s.favTxt}>{fav ? t('moment.isFav') : t('moment.fav')}</Text>
        </Pressable>

        <Text style={s.label}>{t('moment.photos')} ({saved.length + pending.length}/{MAX_PHOTOS_PER_MOMENT})</Text>
        <View style={s.photos}>
          {saved.map((p) => (
            <Pressable key={p.id} onPress={() => dropSaved(p)}>
              <Image source={{ uri: photoUri(p.thumbPath) }} style={s.photo} contentFit="cover" />
              <Text style={s.x}>✕</Text>
            </Pressable>
          ))}
          {pending.map((u) => (
            <Pressable key={u} onPress={() => setPending((p) => p.filter((x) => x !== u))}>
              <Image source={{ uri: u }} style={s.photo} contentFit="cover" />
              <Text style={s.x}>✕</Text>
            </Pressable>
          ))}
        </View>
        {slots > 0 && (
          <View style={s.photoBtns}>
            <Pressable style={[s.smallBtn, { backgroundColor: C.peachP }]} onPress={takePhoto}><Text style={s.smallTxt}>📷 {t('moment.camera')}</Text></Pressable>
            <Pressable style={[s.smallBtn, { backgroundColor: C.lilacP }]} onPress={pick}><Text style={s.smallTxt}>🖼️ {t('moment.gallery')}</Text></Pressable>
          </View>
        )}

        <Text style={s.label}>{t('moment.detail')}</Text>
        <TextInput style={[s.input, { minHeight: 110, textAlignVertical: 'top' }]} value={note} onChangeText={setNote} multiline
          placeholder={t('moment.detailPh')} placeholderTextColor="#B5AE9C" onFocus={scrollDown} />

        <Text style={s.label}>{t('moment.setNum')}</Text>
        <TextInput style={s.input} value={setNumber} onChangeText={setSetNumber} placeholder={t('moment.setPh')}
          placeholderTextColor="#B5AE9C" onFocus={scrollDown} />

        <Pressable style={[s.btn, { backgroundColor: C.pinkP }]} onPress={save}><Text style={s.btnTxt}>{t('moment.save')}</Text></Pressable>
        {!isNew && (
          <>
            <Pressable style={[s.btn, { backgroundColor: C.blueP }]} onPress={() => router.push(`/postcard/${id}`)}><Text style={s.btnTxt}>{t('moment.share')}</Text></Pressable>
            <Pressable onPress={remove}><Text style={s.del}>{t('moment.delete')}</Text></Pressable>
          </>
        )}
      </ScrollView>
    </KeyboardSafe>
  );
}

const s = StyleSheet.create({
  date: { fontSize: 15, fontWeight: '700', color: C.muted },
  label: { fontWeight: '800', color: C.ink },
  input: { backgroundColor: '#fff', borderRadius: 14, padding: 14, fontSize: 16, color: C.ink, ...softShadow },
  favBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14, ...softShadow },
  favOn: { backgroundColor: C.yellowP },
  favIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  favIcon: { fontSize: 22 },
  hdrStar: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.55)', alignItems: 'center', justifyContent: 'center' },
  hdrStarOn: { backgroundColor: '#fff' },
  favTxt: { fontSize: 16, fontWeight: '800', color: C.ink },
  photos: { flexDirection: 'row', gap: 10 },
  photo: { width: 100, height: 100, borderRadius: 14 },
  photoBtns: { flexDirection: 'row', gap: 10 },
  smallBtn: { flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: 'center' },
  smallTxt: { fontWeight: '800', color: C.ink },
  x: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.55)', color: '#fff', width: 22, height: 22, textAlign: 'center', borderRadius: 11, overflow: 'hidden', fontWeight: '800' },
  btn: { padding: 15, borderRadius: 16, alignItems: 'center' },
  btnTxt: { color: C.ink, fontWeight: '900', fontSize: 16 },
  del: { color: C.red, textAlign: 'center', fontWeight: '700', marginTop: 6 },
});
