import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Surface } from 'react-native-paper';
import { colors } from '../theme/theme';

export default function StatCard({ label, value, accent = colors.primary }) {
  return (
    <Surface elevation={1} style={[styles.card, { borderTopColor: accent }]}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '47%',
    borderRadius: 22,
    padding: 18,
    borderTopWidth: 5,
    backgroundColor: colors.surface,
  },
  value: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  label: {
    marginTop: 6,
    fontSize: 14,
    color: colors.textMuted,
  },
});
