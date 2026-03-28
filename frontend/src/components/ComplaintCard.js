import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/theme';
import StatusBadge from './StatusBadge';

export default function ComplaintCard({ complaint, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.categoryPill}>
          <Text style={styles.categoryText}>{complaint.category}</Text>
        </View>
        <StatusBadge status={complaint.status} />
      </View>

      <Text numberOfLines={2} style={styles.title}>
        {complaint.description}
      </Text>

      <Text style={styles.meta}>
        Block {complaint.block} | Priority: {complaint.priority}
      </Text>

      <Text style={styles.meta}>
        House: {complaint.houseNumber || 'N/A'} | Created:{' '}
        {new Date(complaint.createdAt).toLocaleDateString()}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 18,
    gap: 12,
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  categoryPill: {
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  categoryText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  meta: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
