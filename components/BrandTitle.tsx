import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import { C } from '../lib/theme';

export function BrandTitle() {
  return (
    <View style={s.row}>
      <Image source={require('../assets/logo.png')} style={s.logo} contentFit="contain" />
      <Text style={s.txt}>Brick Moments</Text>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { width: 34, height: 34 },
  txt: { fontSize: 20, fontWeight: '900', color: C.ink, letterSpacing: 0.3 },
});
