import { Ionicons } from '@expo/vector-icons';
import { router, Tabs } from 'expo-router';
import { Pressable } from 'react-native';
import { BrandTitle } from '../../components/BrandTitle';
import { useI18n } from '../../lib/i18n';
import { C } from '../../lib/theme';

const icon = (name: keyof typeof Ionicons.glyphMap) => ({ color, size }: { color: string; size: number }) =>
  <Ionicons name={name} color={color} size={size} />;

export default function TabsLayout() {
  const { t } = useI18n();
  return (
    <Tabs screenOptions={{
      headerStyle: { backgroundColor: C.header }, headerTintColor: C.ink,
      headerTitleAlign: 'left',
      headerTitle: () => <BrandTitle />,
      headerRight: () => (
        <Pressable onPress={() => router.push('/settings')} hitSlop={12} style={{ paddingHorizontal: 16 }}>
          <Ionicons name="settings-outline" size={24} color={C.ink} />
        </Pressable>
      ),
      tabBarActiveTintColor: C.red, sceneStyle: { backgroundColor: C.bg },
    }}>
      <Tabs.Screen name="index" options={{ title: t('tab.calendar'), tabBarIcon: icon('calendar') }} />
      <Tabs.Screen name="recent" options={{ title: t('tab.recent'), tabBarIcon: icon('time') }} />
      <Tabs.Screen name="favorites" options={{ title: t('tab.favorites'), tabBarIcon: icon('star') }} />
      <Tabs.Screen name="report" options={{ title: t('tab.report'), tabBarIcon: icon('stats-chart') }} />
    </Tabs>
  );
}
