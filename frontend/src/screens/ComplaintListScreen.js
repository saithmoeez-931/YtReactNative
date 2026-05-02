import React, { useCallback, useMemo, useState } from 'react';
import { Alert, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Chip, Searchbar, Surface } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { colors } from '../theme/theme';
import ComplaintCard from '../components/ComplaintCard';
import ScreenContainer from '../components/ScreenContainer';

const statusFilters = ['All', 'Pending', 'In Progress', 'Resolved'];

export default function ComplaintListScreen({ navigation, route }) {
  const { token } = useAuth();
  const role = route.params?.role || 'user';
  const [complaints, setComplaints] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const loadComplaints = async () => {
    try {
      const query = role === 'worker' ? '?assignedOnly=true' : '';
      const data = await api.getComplaints(token, query);
      setComplaints(data.complaints);
    } catch (error) {
      Alert.alert('Unable to load complaints', error.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadComplaints();
    }, [role, token]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadComplaints();
    } finally {
      setRefreshing(false);
    }
  };

  const filteredComplaints = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    return complaints.filter(complaint => {
      const matchesStatus = statusFilter === 'All' ? true : complaint.status === statusFilter;
      const matchesSearch = normalizedSearch
        ? [complaint.category, complaint.description, complaint.block, complaint.houseNumber]
            .filter(Boolean)
            .some(value => value.toLowerCase().includes(normalizedSearch))
        : true;

      return matchesStatus && matchesSearch;
    });
  }, [complaints, searchText, statusFilter]);

  return (
    <ScreenContainer
      contentStyle={styles.content}
      refreshControl={<RefreshControl onRefresh={onRefresh} refreshing={refreshing} />}
      scroll
    >
      <Surface elevation={2} style={styles.filterCard}>
        <View style={styles.filterHeader}>
          <View>
            <Text style={styles.filterTitle}>{role === 'worker' ? 'Assigned work' : 'Complaint queue'}</Text>
            <Text style={styles.filterSubtitle}>
              {filteredComplaints.length} of {complaints.length} shown
            </Text>
          </View>
          <View style={styles.countPill}>
            <Text style={styles.countText}>{complaints.length}</Text>
          </View>
        </View>
        <Searchbar
          inputStyle={styles.searchInput}
          onChangeText={setSearchText}
          placeholder="Search by category, block, house, or description"
          placeholderTextColor={colors.textMuted}
          style={styles.searchbar}
          value={searchText}
        />
        <View style={styles.statusRow}>
          {statusFilters.map(item => (
            <Chip
              compact
              key={item}
              mode={statusFilter === item ? 'flat' : 'outlined'}
              onPress={() => setStatusFilter(item)}
              selected={statusFilter === item}
              style={[styles.statusChip, statusFilter === item && styles.statusChipActive]}
              textStyle={[
                styles.statusChipText,
                statusFilter === item && styles.statusChipTextActive,
              ]}
            >
              {item}
            </Chip>
          ))}
        </View>
      </Surface>

      {filteredComplaints.length ? (
        filteredComplaints.map(complaint => (
          <ComplaintCard
            complaint={complaint}
            key={complaint._id}
            onPress={() => navigation.navigate('ComplaintDetails', { complaintId: complaint._id })}
          />
        ))
      ) : (
        <Surface elevation={1} style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No complaints found</Text>
          <Text style={styles.emptyText}>
            {complaints.length
              ? 'Try changing the search text or status filter.'
              : role === 'worker'
                ? 'Assigned complaints will appear here after the admin allocates work.'
                : 'Complaints will show up here once they are created.'}
          </Text>
        </Surface>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 100,
  },
  filterCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    gap: 14,
  },
  filterTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  filterSubtitle: {
    color: colors.textMuted,
    marginTop: 4,
  },
  countPill: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },
  searchbar: {
    backgroundColor: colors.surfaceMuted,
  },
  searchInput: {
    color: colors.text,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statusChip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  statusChipActive: {
    backgroundColor: colors.primarySoft,
  },
  statusChipText: {
    color: colors.text,
    fontWeight: '600',
  },
  statusChipTextActive: {
    color: colors.primary,
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
