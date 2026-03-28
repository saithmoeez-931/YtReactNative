import React, { useCallback, useState } from 'react';
import { Alert, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
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
      <View style={styles.hero}>
        <Text style={styles.greeting}>Welcome back, {user?.name}</Text>
        <Text style={styles.helper}>
          {user?.role === 'admin'
            ? 'Track complaints, assign workers, and keep the society operations visible.'
            : user?.role === 'worker'
              ? 'Review assigned issues and close them with proof after the work is done.'
              : 'Submit new complaints and monitor progress without visiting the office.'}
        </Text>
      </View>

      <View style={styles.statsRow}>
        <StatCard accent={colors.primary} label="Total" value={summary.totalComplaints} />
        <StatCard accent={colors.warning} label="Pending" value={summary.pendingCount} />
        <StatCard accent={colors.secondary} label="In Progress" value={summary.inProgressCount} />
        <StatCard accent={colors.success} label="Resolved" value={summary.resolvedCount} />
      </View>

      <View style={styles.section}>
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
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 100,
  },
  hero: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    gap: 10,
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
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    gap: 14,
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
