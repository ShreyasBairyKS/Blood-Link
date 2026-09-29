import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BLOOD_GROUPS, type BloodGroup } from '@/api/types';
import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';

interface Props {
  value: BloodGroup | null;
  onChange: (value: BloodGroup) => void;
}

export function BloodGroupPicker({ value, onChange }: Props) {
  return (
    <View style={styles.grid}>
      {BLOOD_GROUPS.map((group) => {
        const selected = group === value;
        return (
          <Pressable
            key={group}
            onPress={() => onChange(group)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{group}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  chip: {
    paddingVertical: spacing[2] + 2,
    paddingHorizontal: spacing[4],
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.stone[200],
    backgroundColor: colors.white,
  },
  chipSelected: {
    backgroundColor: colors.rose[600],
    borderColor: colors.rose[600],
  },
  chipText: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
    color: colors.stone[600],
  },
  chipTextSelected: {
    color: colors.white,
  },
});
