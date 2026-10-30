import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { MomentList } from '../../components/MomentList';
import { getRecent, type MomentWithPhotos } from '../../db/momentsRepo';
import { useI18n } from '../../lib/i18n';

export default function Recent() {
  const { t } = useI18n();
  const [items, setItems] = useState<MomentWithPhotos[]>([]);
  useFocusEffect(useCallback(() => { getRecent(30).then(setItems); }, []));
  return <MomentList items={items} empty={t('recent.empty')} showShare />;
}
