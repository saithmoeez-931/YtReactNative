import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/theme';

export default function StatCard({ label, value, accent = colors.primary }) {
  return (
    <View style={[styles.card, { borderLeftColor: accent }]}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 18,
    borderLeftWidth: 5,
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
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
