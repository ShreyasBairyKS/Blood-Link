import { useRef } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { colors, fontFamily, fontSize, radius } from '@/theme';

const LENGTH = 6;

export function OtpInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const inputs = useRef<Array<TextInput | null>>([]);

  function handleChangeDigit(index: number, digit: string) {
    const clean = digit.replace(/[^0-9]/g, '');
    const chars = value.split('');
    chars[index] = clean.slice(-1) ?? '';
    const next = chars.join('').slice(0, LENGTH);
    onChange(next);

    if (clean && index < LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  }

  function handleKeyPress(index: number, key: string) {
    if (key === 'Backspace' && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  return (
    <View style={styles.row}>
      {Array.from({ length: LENGTH }).map((_, index) => (
        <TextInput
          key={index}
          ref={(el) => {
            inputs.current[index] = el;
          }}
          style={styles.box}
          keyboardType="number-pad"
          maxLength={1}
          value={value[index] ?? ''}
          onChangeText={(digit) => handleChangeDigit(index, digit)}
          onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  box: {
    width: 48,
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.stone[200],
    backgroundColor: colors.white,
    textAlign: 'center',
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.xl,
    color: colors.stone[900],
  },
});
