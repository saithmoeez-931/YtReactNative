import React, { useCallback, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Button, Chip, Searchbar, Surface } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { colors } from '../theme/theme';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';

const statusFilters = ['All', 'Active', 'Inactive'];

export default function WorkerListScreen({ navigation }) {
  const { token } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const loadWorkers = async () => {
    try {
      const data = await api.getWorkers(token);
      setWorkers(data.workers);
    } catch (error) {
      Alert.alert('Unable to load workers', error.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadWorkers();
    }, [token]),
  );

  const filteredWorkers = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return workers.filter(worker => {
      const active = worker.isActive !== false;
      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Active' && active) ||
        (statusFilter === 'Inactive' && !active);
      const matchesSearch = query
        ? [worker.name, worker.email, ...(worker.specialties || [])]
            .filter(Boolean)
            .some(value => value.toLowerCase().includes(query))
        : true;

      return matchesStatus && matchesSearch;
    });
  }, [searchText, statusFilter, workers]);

  return (
    <ScreenContainer>
      <Surface elevation={1} style={styles.card}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Workers</Text>
            <Text style={styles.subtitle}>{filteredWorkers.length} of {workers.length} shown</Text>
          </View>
          <PrimaryButton label="Create" onPress={() => navigation.navigate('WorkerForm')} />
        </View>
        <Searchbar
          inputStyle={styles.searchInput}
          onChangeText={setSearchText}
          placeholder="Search worker or specialty"
          style={styles.searchbar}
          value={searchText}
        />
        <View style={styles.chipRow}>
          {statusFilters.map(item => (
            <Chip key={item} selected={statusFilter === item} onPress={() => setStatusFilter(item)}>
              {item}
            </Chip>
          ))}
        </View>
      </Surface>

      {filteredWorkers.map(worker => {
        const active = worker.isActive !== false;

        return (
          <Surface elevation={1} key={worker._id} style={styles.workerCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{worker.name?.charAt(0)?.toUpperCase() || 'W'}</Text>
            </View>
            <View style={styles.identity}>
              <View style={styles.topRow}>
                <Text style={styles.name}>{worker.name}</Text>
                <Text style={[styles.status, active ? styles.active : styles.inactive]}>
                  {active ? 'Active' : 'Inactive'}
                </Text>
              </View>
              <Text style={styles.meta}>{worker.email}</Text>
              <Text style={styles.meta}>Specialties: {(worker.specialties || ['general']).join(', ')}</Text>
            </View>
            <View style={styles.actions}>
              <Button
                compact
                mode="contained-tonal"
                onPress={() => navigation.navigate('WorkerRecord', { worker, workerId: worker._id })}
              >
                Record
              </Button>
              <Button compact mode="outlined" onPress={() => navigation.navigate('WorkerDetails', { worker })}>
                Edit
              </Button>
            </View>
          </Surface>
        );
      })}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 24, padding: 20, gap: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  title: { color: colors.text, fontSize: 24, fontWeight: '900' },
  subtitle: { color: colors.textMuted, marginTop: 4 },
  searchbar: { backgroundColor: colors.surfaceMuted },
  searchInput: { color: colors.text },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  workerCard: { backgroundColor: colors.surface, borderRadius: 20, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.primary, fontWeight: '900', fontSize: 18 },
  identity: { flex: 1, gap: 4 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  name: { color: colors.text, fontWeight: '900', fontSize: 16 },
  meta: { color: colors.textMuted },
  status: { fontWeight: '900', fontSize: 12 },
  active: { color: colors.success },
  inactive: { color: colors.danger },
  actions: { gap: 8 },
});
