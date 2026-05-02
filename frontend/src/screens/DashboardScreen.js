import React, { useCallback, useState } from 'react';
import { Alert, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Chip, Surface } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { colors } from '../theme/theme';
import ScreenContainer from '../components/ScreenContainer';
import StatCard from '../components/StatCard';

const emptySummary = {
  totalComplaints: 0,
  pendingCount: 0,
  inProgressCount: 0,
  resolvedCount: 0,
  byCategory: [],
};

export default function DashboardScreen() {
  const { token, user } = useAuth();
  const [summary, setSummary] = useState(emptySummary);
  const [refreshing, setRefreshing] = useState(false);

  const loadSummary = async () => {
    if (!token) {
      return;
    }

    try {
      const data = await api.getDashboard(token);
      setSummary(data.summary);
    } catch (error) {
      Alert.alert('Dashboard error', error.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSummary();
    }, [token]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadSummary();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScreenContainer
      contentStyle={styles.content}
      refreshControl={<RefreshControl onRefresh={onRefresh} refreshing={refreshing} />}
      scroll
    >
      <Surface elevation={2} style={styles.hero}>
        <Chip compact style={styles.roleChip} textStyle={styles.roleChipText}>
          {user?.role === 'super_admin'
            ? 'Super Admin'
            : user?.role === 'admin'
              ? 'Administrator'
              : user?.role === 'worker'
                ? 'Worker Desk'
                : 'Resident'}
        </Chip>
        <Text style={styles.greeting}>Welcome back, {user?.name}</Text>
        <Text style={styles.helper}>
          {user?.role === 'super_admin'
            ? 'Manage society staff accounts and keep complaint operations under control.'
            : user?.role === 'admin'
            ? 'Track complaints, assign workers, and keep operations moving with clear visibility.'
            : user?.role === 'worker'
              ? 'Review assigned tasks, update progress, and close issues with proof.'
              : 'Report issues quickly and keep track of every update without visiting the office.'}
        </Text>
      </Surface>

      <View style={styles.statsRow}>
        <StatCard accent={colors.primary} label="Total" value={summary.totalComplaints} />
        <StatCard accent={colors.warning} label="Pending" value={summary.pendingCount} />
        <StatCard accent={colors.secondary} label="In Progress" value={summary.inProgressCount} />
        <StatCard accent={colors.success} label="Resolved" value={summary.resolvedCount} />
      </View>

      <Surface elevation={1} style={styles.section}>
        <Text style={styles.sectionTitle}>Category breakdown</Text>
        {summary.byCategory.length ? (
          summary.byCategory.map(item => (
            <View key={item._id} style={styles.categoryRow}>
              <Text style={styles.categoryName}>{item._id}</Text>
              <Text style={styles.categoryCount}>{item.count}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No complaints have been created yet.</Text>
        )}
      </Surface>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 100,
  },
  hero: {
    borderRadius: 24,
    padding: 20,
    gap: 10,
    backgroundColor: colors.surface,
  },
  roleChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
  },
  roleChipText: {
    color: colors.primary,
    fontWeight: '700',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  helper: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.textMuted,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  section: {
    borderRadius: 24,
    padding: 20,
    gap: 14,
    backgroundColor: colors.surface,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryName: {
    color: colors.text,
    fontWeight: '600',
  },
  categoryCount: {
    color: colors.textMuted,
  },
  emptyText: {
    color: colors.textMuted,
  },
});
