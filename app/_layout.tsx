import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import * as Expo from 'expo';
import { Stack } from 'expo-router';
import * as SQLite from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { BrandTitle } from '../components/BrandTitle';
import { db, sqlite } from '../db/momentsRepo';
import migrations from '../drizzle/migrations';
import { I18nProvider, useI18n } from '../lib/i18n';
import { C } from '../lib/theme';

function DbError({ error }: { error: Error }) {
  const cause = (error as any).cause;
  const detail = cause instanceof Error ? cause.message : cause ? String(cause) : '';

  const reset = () =>
    Alert.alert('Reiniciar base de datos', 'Se borrarán TODOS los momentos guardados en este teléfono. ¿Continuar?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Borrar y reiniciar', style: 'destructive',
        onPress: async () => {
          try { sqlite.closeSync(); await SQLite.deleteDatabaseAsync('brickmoments.db'); } catch {}
          try { await (Expo as any).reloadAppAsync(); } catch { Alert.alert('Cierra la app por completo y ábrela de nuevo.'); }
        },
      },
    ]);

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24, gap: 14 }}>
      <Text style={{ fontSize: 20, fontWeight: '900' }}>Error de base de datos</Text>
      <Text selectable style={{ color: C.red, fontWeight: '700' }}>{detail || error.message}</Text>
      <Text style={{ color: C.muted }}>
        Suele pasar cuando la carpeta drizzle/ se regeneró y la base del teléfono ya tenía las tablas. Si es solo una instalación de prueba, puedes reiniciar la base.
      </Text>
      <Pressable onPress={reset} style={{ backgroundColor: C.pinkP, padding: 14, borderRadius: 16, alignItems: 'center' }}>
        <Text style={{ fontWeight: '900', color: C.ink }}>Reiniciar base de datos (borra los datos)</Text>
      </Pressable>
    </ScrollView>
  );
}

function Root() {
  const { t } = useI18n();
  const { success, error } = useMigrations(db, migrations);

  if (error) return <DbError error={error} />;
  if (!success) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator size="large" color={C.red} /></View>;

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerStyle: { backgroundColor: C.header }, headerTintColor: C.ink, contentStyle: { backgroundColor: C.bg } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="day/[date]" options={{ title: '' }} />
        <Stack.Screen name="moment/[id]" options={{ title: '' }} />
        <Stack.Screen name="postcard/[id]" options={{ title: t('moment.share') }} />
        <Stack.Screen name="settings" options={{ headerTitle: () => <BrandTitle /> }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return <I18nProvider><Root /></I18nProvider>;
}
