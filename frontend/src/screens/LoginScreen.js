import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Surface, TextInput } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/theme';
import FormInput from '../components/FormInput';

import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
        <View style={styles.logoMark}>
          <Ionicons color={colors.primary} name="business-outline" size={24} />
        </View>
        <Text style={styles.kicker}>Society Connect</Text>
        <Text style={styles.title}>A Smarter Way to Manage Society Complaints</Text>
        <Text style={styles.subtitle}>Report, assign, and resolve issues without office visits.</Text>
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
          right={
            <TextInput.Icon
              icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
              onPress={() => setShowPassword(current => !current)}
            />
          }
          secureTextEntry={!showPassword}
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
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  logoMark: {
    width: 54,
    height: 54,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  kicker: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
    lineHeight: 34,
    textAlign: 'center',
    letterSpacing: -0.5,
    maxWidth: 320,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 300,
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
