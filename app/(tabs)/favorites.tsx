import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { MomentList } from '../../components/MomentList';
import { getFavorites, type MomentWithPhotos } from '../../db/momentsRepo';
import { useI18n } from '../../lib/i18n';

export default function Favorites() {
  const { t } = useI18n();
  const [items, setItems] = useState<MomentWithPhotos[]>([]);
  useFocusEffect(useCallback(() => { getFavorites().then(setItems); }, []));
  return <MomentList items={items} empty={t('fav.empty')} showShare />;
}
