import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/theme';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
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
        <Text style={styles.title}>Manage complaints with clarity.</Text>
        <Text style={styles.subtitle}>
          Residents report issues, admins coordinate work, and staff close tasks from one shared app.
        </Text>
      </View>

      <View style={styles.card}>
        <FormInput
          autoCapitalize="none"
          keyboardType="email-address"
          label="Email"
          onChangeText={value => updateField('email', value)}
          placeholder="resident@example.com"
          value={form.email}
        />
        <FormInput
          label="Password"
          onChangeText={value => updateField('password', value)}
          placeholder="Enter your password"
          secureTextEntry
          value={form.password}
        />
        <PrimaryButton label="Login" loading={loading} onPress={handleLogin} />
        <PrimaryButton
          label="Create new account"
          onPress={() => navigation.navigate('Register')}
          variant="secondary"
        />
      </View>
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
    marginBottom: 12,
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
    fontSize: 34,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.textMuted,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    gap: 16,
  },
});
