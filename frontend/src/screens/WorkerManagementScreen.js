import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { Surface } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { colors } from '../theme/theme';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';

export default function WorkerManagementScreen({ navigation }) {
  const { token } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [workers, setWorkers] = useState([]);

  const loadStaff = async () => {
    try {
      const [adminData, workerData] = await Promise.all([
        api.getAdmins(token),
        api.getWorkers(token),
      ]);
      setAdmins(adminData.admins);
      setWorkers(workerData.workers);
    } catch (error) {
      Alert.alert('Unable to load staff', error.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadStaff();
    }, [token]),
  );

  const activeWorkers = workers.filter(worker => worker.isActive !== false).length;
  const inactiveWorkers = workers.length - activeWorkers;

  return (
    <ScreenContainer>
      <Surface elevation={2} style={styles.hero}>
        <Text style={styles.eyebrow}>Super admin</Text>
        <Text style={styles.title}>Staff Control Center</Text>
        <Text style={styles.subtitle}>
          Manage operational admins and specialized workers from focused screens.
        </Text>
      </Surface>

      <View style={styles.statsGrid}>
        <StaffStat icon="shield-checkmark-outline" label="Admins" value={admins.length} />
        <StaffStat icon="people-outline" label="Active Workers" value={activeWorkers} />
        <StaffStat icon="pause-circle-outline" label="Inactive" value={inactiveWorkers} />
      </View>

      <Surface elevation={1} style={styles.actionCard}>
        <Text style={styles.sectionTitle}>Admin accounts</Text>
        <Text style={styles.helper}>Admins handle complaints but cannot manage staff setup.</Text>
        <PrimaryButton label="View admins" onPress={() => navigation.navigate('AdminList')} />
        <PrimaryButton
          label="Create admin"
          onPress={() => navigation.navigate('AdminForm')}
          variant="secondary"
        />
      </Surface>

      <Surface elevation={1} style={styles.actionCard}>
        <Text style={styles.sectionTitle}>Worker accounts</Text>
        <Text style={styles.helper}>Workers receive complaints based on their specialties.</Text>
        <PrimaryButton label="View workers" onPress={() => navigation.navigate('WorkerList')} />
        <PrimaryButton
          label="Create worker"
          onPress={() => navigation.navigate('WorkerForm')}
          variant="secondary"
        />
      </Surface>
    </ScreenContainer>
  );
}

function StaffStat({ icon, label, value }) {
  return (
    <Surface elevation={1} style={styles.statCard}>
      <Ionicons color={colors.primary} name={icon} size={24} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Surface>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 28,
    padding: 22,
    gap: 8,
    backgroundColor: colors.surface,
  },
  eyebrow: {
    color: colors.primary,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textMuted,
    lineHeight: 22,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 22,
    padding: 14,
    gap: 8,
    backgroundColor: colors.surface,
  },
  statValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  actionCard: {
    borderRadius: 24,
    padding: 20,
    gap: 12,
    backgroundColor: colors.surface,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  helper: {
    color: colors.textMuted,
    lineHeight: 22,
  },
});
