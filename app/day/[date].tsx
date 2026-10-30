import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MomentList } from '../../components/MomentList';
import { getMomentsByDate, type MomentWithPhotos } from '../../db/momentsRepo';
import { useI18n } from '../../lib/i18n';
import { C } from '../../lib/theme';

export default function Day() {
  const { t, fmt } = useI18n();
  const { date } = useLocalSearchParams<{ date: string }>();
  const [items, setItems] = useState<MomentWithPhotos[]>([]);
  useFocusEffect(useCallback(() => { getMomentsByDate(date).then(setItems); }, [date]));

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: fmt(date) }} />
      <MomentList items={items} empty={t('day.empty')} />
      <Pressable style={s.fab} onPress={() => router.push(`/moment/new?date=${date}`)}>
        <Text style={s.fabTxt}>{t('day.add')}</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  fab: { position: 'absolute', bottom: 24, alignSelf: 'center', backgroundColor: C.pinkP, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 30, elevation: 3 },
  fabTxt: { color: C.ink, fontWeight: '900', fontSize: 16 },
});
