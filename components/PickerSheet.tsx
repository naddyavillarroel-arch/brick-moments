import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { C } from '../lib/theme';

export type Option = { label: string; value: number | null };

type Props = {
  visible: boolean;
  title: string;
  options: Option[];
  selected: number | null;
  onSelect: (v: number | null) => void;
  onClose: () => void;
};

/** Hoja inferior con una cuadrícula de opciones (para elegir año o mes). */
export function PickerSheet({ visible, title, options, selected, onSelect, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={s.backdrop} onPress={onClose}>
        <Pressable style={s.sheet} onPress={() => {}}>
          <View style={s.handle} />
          <Text style={s.title}>{title}</Text>
          <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
            <View style={s.grid}>
              {options.map((o) => {
                const on = selected === o.value;
                return (
                  <Pressable key={String(o.value)} style={[s.item, on && s.itemOn]} onPress={() => { onSelect(o.value); onClose(); }}>
                    <Text style={[s.itemTxt, on && { fontWeight: '900' }]}>{o.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: C.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36, gap: 14 },
  handle: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: '#DCD5C3' },
  title: { fontSize: 18, fontWeight: '900', color: C.ink, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'flex-start' },
  item: { width: '31%', backgroundColor: '#fff', paddingVertical: 12, borderRadius: 14, alignItems: 'center' },
  itemOn: { backgroundColor: C.yellowP },
  itemTxt: { color: C.ink, fontSize: 15 },
});
