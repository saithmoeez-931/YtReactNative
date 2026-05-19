import React, { useCallback, useState } from 'react';
import { Alert, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Chip, Surface } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { colors } from '../theme/theme';
import AppIcon from '../components/AppIcon';
import ScreenContainer from '../components/ScreenContainer';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

const emptyRecord = {
  totalAssigned: 0,
  pendingCount: 0,
  inProgressCount: 0,
  resolvedCount: 0,
  recentComplaints: [],
};

export default function WorkerRecordScreen({ route }) {
  const { token } = useAuth();
  const workerId = route.params?.workerId;
  const [worker, setWorker] = useState(route.params?.worker || null);
  const [record, setRecord] = useState(emptyRecord);
  const [refreshing, setRefreshing] = useState(false);

  const loadRecord = async () => {
    try {
      const data = await api.getWorkerRecord(token, workerId);
      setWorker(data.worker);
      setRecord(data.record);
    } catch (error) {
      Alert.alert('Unable to load worker record', error.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRecord();
    }, [token, workerId]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadRecord();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScreenContainer
      refreshControl={<RefreshControl onRefresh={onRefresh} refreshing={refreshing} />}
      scroll
    >
      <Surface elevation={2} style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{worker?.name?.charAt(0)?.toUpperCase() || 'W'}</Text>
        </View>
        <View style={styles.profileBody}>
          <Text style={styles.title}>{worker?.name || 'Worker'}</Text>
          <Text style={styles.meta}>{worker?.email || 'No email'}</Text>
          <View style={styles.chipRow}>
            <Chip compact style={worker?.isActive === false ? styles.inactiveChip : styles.activeChip}>
              {worker?.isActive === false ? 'Inactive' : 'Active'}
            </Chip>
            {(worker?.specialties?.length ? worker.specialties : ['general']).map(specialty => (
              <Chip compact key={specialty} style={styles.specialtyChip}>
                {specialty}
              </Chip>
            ))}
          </View>
        </View>
      </Surface>

      <View style={styles.statsRow}>
        <StatCard accent={colors.primary} label="Assigned" value={record.totalAssigned} />
        <StatCard accent={colors.warning} label="Pending" value={record.pendingCount} />
        <StatCard accent={colors.secondary} label="In Progress" value={record.inProgressCount} />
        <StatCard accent={colors.success} label="Resolved" value={record.resolvedCount} />
      </View>

      <Surface elevation={1} style={styles.section}>
        <Text style={styles.sectionTitle}>Recent assigned complaints</Text>
        {record.recentComplaints.length ? (
          record.recentComplaints.map(complaint => (
            <View key={complaint._id} style={styles.complaintRow}>
              <View style={styles.complaintIcon}>
                <AppIcon color={colors.primary} name="document-text-outline" size={18} />
              </View>
              <View style={styles.complaintBody}>
                <View style={styles.complaintHeader}>
                  <Text style={styles.complaintCategory}>{complaint.category}</Text>
                  <StatusBadge status={complaint.status} />
                </View>
                <Text numberOfLines={2} style={styles.complaintText}>
                  {complaint.description}
                </Text>
                <Text style={styles.meta}>
                  Block {complaint.block || 'N/A'} | House {complaint.houseNumber || 'N/A'} | Priority {complaint.priority}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No complaints have been assigned to this worker yet.</Text>
        )}
      </Surface>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    flexDirection: 'row',
    gap: 14,
    borderRadius: 26,
    padding: 18,
    backgroundColor: colors.surface,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '900',
  },
  profileBody: {
    flex: 1,
    gap: 7,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  meta: {
    color: colors.textMuted,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activeChip: {
    backgroundColor: colors.successSoft,
  },
  inactiveChip: {
    backgroundColor: colors.dangerSoft,
  },
  specialtyChip: {
    backgroundColor: colors.surfaceMuted,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  section: {
    borderRadius: 24,
    padding: 18,
    gap: 14,
    backgroundColor: colors.surface,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  complaintRow: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 14,
  },
  complaintIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  complaintBody: {
    flex: 1,
    gap: 6,
  },
  complaintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  complaintCategory: {
    color: colors.text,
    fontWeight: '900',
  },
  complaintText: {
    color: colors.text,
    lineHeight: 21,
  },
  emptyText: {
    color: colors.textMuted,
    lineHeight: 22,
  },
});
