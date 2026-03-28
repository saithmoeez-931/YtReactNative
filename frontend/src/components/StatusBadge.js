import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/theme';

const badgeStyles = {
  Pending: { backgroundColor: '#fff7ed', textColor: colors.warning },
  'In Progress': { backgroundColor: '#eff6ff', textColor: colors.secondary },
  Resolved: { backgroundColor: '#ecfdf5', textColor: colors.success },
};

export default function StatusBadge({ status }) {
  const palette = badgeStyles[status] || {
    backgroundColor: colors.surfaceMuted,
    textColor: colors.textMuted,
  };

  return (
    <View style={[styles.badge, { backgroundColor: palette.backgroundColor }]}>
      <Text style={[styles.label, { color: palette.textColor }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
});
