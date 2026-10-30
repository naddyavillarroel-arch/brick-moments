import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Keyboard, Platform, View } from 'react-native';

/** Sube el contenido sobre el teclado (funciona con Android edge-to-edge e iOS). */
export function KeyboardSafe({ children }: { children: ReactNode }) {
  const ref = useRef<View>(null);
  const [pad, setPad] = useState(0);

  useEffect(() => {
    const ios = Platform.OS === 'ios';
    const show = Keyboard.addListener(ios ? 'keyboardWillShow' : 'keyboardDidShow', (e) => {
      ref.current?.measureInWindow((_x, y, _w, h) => {
        setPad(Math.max(0, y + h - e.endCoordinates.screenY));
      });
    });
    const hide = Keyboard.addListener(ios ? 'keyboardWillHide' : 'keyboardDidHide', () => setPad(0));
    return () => { show.remove(); hide.remove(); };
  }, []);

  return (
    <View ref={ref} collapsable={false} style={{ flex: 1, paddingBottom: pad }}>
      {children}
    </View>
  );
}
