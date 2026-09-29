import { StyleSheet, Text, View } from 'react-native';

import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';

type Tone = 'neutral' | 'warning' | 'success' | 'danger';

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: string }) {
  return (
    <View style={[styles.base, toneStyles[tone]]}>
      <Text style={[styles.text, textToneStyles[tone]]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  text: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.xs,
  },
});

const toneStyles = StyleSheet.create({
  neutral: { backgroundColor: colors.stone[100] },
  warning: { backgroundColor: colors.amber[100] },
  success: { backgroundColor: colors.emerald[100] },
  danger: { backgroundColor: colors.rose[100] },
});

const textToneStyles = StyleSheet.create({
  neutral: { color: colors.stone[600] },
  warning: { color: colors.amber[700] },
  success: { color: colors.emerald[700] },
  danger: { color: colors.rose[700] },
});
