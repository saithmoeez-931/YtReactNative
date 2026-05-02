import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Card, Chip } from 'react-native-paper';
import { colors } from '../theme/theme';
import StatusBadge from './StatusBadge';

export default function ComplaintCard({ complaint, onPress }) {
  const priorityStyle = priorityStyles[complaint.priority] || priorityStyles.Medium;
  const assigneeName = complaint.assignedTo?.name || 'Unassigned';

  return (
    <Card mode="elevated" onPress={onPress} style={styles.card}>
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleGroup}>
            <Chip compact style={styles.categoryPill} textStyle={styles.categoryText}>
              {complaint.category}
            </Chip>
            <Text style={[styles.priority, priorityStyle]}>Priority: {complaint.priority}</Text>
          </View>
          <StatusBadge status={complaint.status} />
        </View>

        <Text numberOfLines={2} style={styles.title}>
          {complaint.description}
        </Text>

        <View style={styles.infoGrid}>
          <InfoItem icon="business-outline" label={`Block ${complaint.block || 'N/A'}`} />
          <InfoItem icon="home-outline" label={`House ${complaint.houseNumber || 'N/A'}`} />
          <InfoItem icon="person-outline" label={assigneeName} />
          <InfoItem icon="calendar-outline" label={new Date(complaint.createdAt).toLocaleDateString()} />
        </View>
      </Card.Content>
    </Card>
  );
}

function InfoItem({ icon, label }) {
  return (
    <View style={styles.infoItem}>
      <Ionicons color={colors.textMuted} name={icon} size={15} />
      <Text numberOfLines={1} style={styles.infoText}>{label}</Text>
    </View>
  );
}

const priorityStyles = {
  Low: { color: colors.success, backgroundColor: colors.successSoft },
  Medium: { color: colors.warning, backgroundColor: colors.warningSoft },
  High: { color: colors.danger, backgroundColor: colors.dangerSoft },
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  content: {
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  titleGroup: {
    flex: 1,
    gap: 8,
    alignItems: 'flex-start',
  },
  categoryPill: {
    backgroundColor: colors.primarySoft,
  },
  categoryText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 24,
  },
  priority: {
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 12,
    fontWeight: '800',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  infoItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
});
