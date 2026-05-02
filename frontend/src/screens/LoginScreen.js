import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Surface } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/theme';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);

  const updateField = (key, value) => {
    setForm(current => ({ ...current, [key]: value }));
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      await login(form);
    } catch (error) {
      Alert.alert('Login failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer contentStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Society Connect</Text>
        <Text style={styles.title}>Society issues, organized professionally.</Text>
        <Text style={styles.subtitle}>
          A cleaner residential support workflow for residents, admins, and maintenance staff.
        </Text>
      </View>

      <Surface elevation={2} style={styles.card}>
        <FormInput
          autoCapitalize="none"
          label="Email or User ID"
          onChangeText={value => updateField('identifier', value)}
          placeholder="sara.admin@societyconnect.com"
          value={form.identifier}
        />
        <FormInput
          label="Password"
          onChangeText={value => updateField('password', value)}
          placeholder="Enter your password"
          secureTextEntry
          value={form.password}
        />
        <PrimaryButton label="Login" loading={loading} onPress={handleLogin} />
        <Text style={styles.helperText}>
          Use a seeded demo account or sign up as a resident to test the flow.
        </Text>
        <PrimaryButton
          label="Create new account"
          onPress={() => navigation.navigate('Register')}
          variant="secondary"
        />
      </Surface>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  hero: {
    gap: 10,
    marginBottom: 18,
  },
  kicker: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    color: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    fontWeight: '700',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 42,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.textMuted,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    gap: 16,
    backgroundColor: colors.surface,
  },
  helperText: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
  },
});
