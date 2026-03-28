import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/theme';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';

export default function ProfileScreen() {
  const { logout, user } = useAuth();

  return (
    <ScreenContainer>
      <View style={styles.card}>
        <Text style={styles.title}>{user?.name}</Text>
        <Text style={styles.meta}>Email: {user?.email}</Text>
        <Text style={styles.meta}>Role: {user?.role}</Text>
        <Text style={styles.meta}>Block: {user?.block || 'Not provided'}</Text>
        <Text style={styles.meta}>House Number: {user?.houseNumber || 'Not provided'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>How this screen helps you learn</Text>
        <Text style={styles.helper}>
          This screen reads user data from the Auth Context. Context is React&apos;s way of sharing global state across many screens without manually passing props through every component.
        </Text>
      </View>

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
  meta: {
    color: colors.textMuted,
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
