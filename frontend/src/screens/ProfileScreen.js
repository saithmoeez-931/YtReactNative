import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Divider, Surface } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/theme';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';

export default function ProfileScreen() {
  const { logout, user } = useAuth();

  return (
    <ScreenContainer>
      <Surface elevation={2} style={styles.card}>
        <Text style={styles.title}>{user?.name}</Text>
        <Text style={styles.rolePill}>{String(user?.role || '').toUpperCase()}</Text>
        <Divider style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{user?.email}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Block</Text>
          <Text style={styles.infoValue}>{user?.block || 'Not provided'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>House Number</Text>
          <Text style={styles.infoValue}>{user?.houseNumber || 'Not provided'}</Text>
        </View>
      </Surface>

      <Surface elevation={1} style={styles.card}>
        <Text style={styles.sectionTitle}>Account summary</Text>
        <Text style={styles.helper}>
          Your role controls what you can access in the app. Residents submit and track complaints, admins manage requests, and workers handle assigned tasks.
        </Text>
      </Surface>

      <PrimaryButton label="Logout" onPress={logout} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    gap: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  rolePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  divider: {
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  infoRow: {
    gap: 4,
  },
  infoLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    color: colors.text,
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  helper: {
    lineHeight: 24,
    color: colors.textMuted,
  },
});
