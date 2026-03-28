import React, { useCallback, useState } from 'react';
import { Alert, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { colors } from '../theme/theme';
import ComplaintCard from '../components/ComplaintCard';
import ScreenContainer from '../components/ScreenContainer';

export default function ComplaintListScreen({ navigation, route }) {
  const { token } = useAuth();
  const role = route.params?.role || 'user';
  const [complaints, setComplaints] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

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

  return (
    <ScreenContainer
      contentStyle={styles.content}
      refreshControl={<RefreshControl onRefresh={onRefresh} refreshing={refreshing} />}
      scroll
    >
      {complaints.length ? (
        complaints.map(complaint => (
          <ComplaintCard
            complaint={complaint}
            key={complaint._id}
            onPress={() => navigation.navigate('ComplaintDetails', { complaintId: complaint._id })}
          />
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No complaints found</Text>
          <Text style={styles.emptyText}>
            {role === 'worker'
              ? 'Assigned complaints will appear here after the admin allocates work.'
              : 'Complaints will show up here once they are created.'}
          </Text>
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 100,
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
