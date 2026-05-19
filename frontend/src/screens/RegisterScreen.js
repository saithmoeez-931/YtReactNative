import React, { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { Surface } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/theme';
import FormInput from '../components/FormInput';
import PasswordInput from '../components/PasswordInput';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';
import {
  hasErrors,
  isUsefulCode,
  validateAccountForm,
} from '../utils/validation';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    houseNumber: '',
    block: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const updateField = (key, value) => {
    setForm(current => ({ ...current, [key]: value }));
  };

  const handleRegister = async () => {
    if (loading) {
      return;
    }

    const validation = validateAccountForm(form, { passwordRequired: true });
    const payload = {
      ...validation.payload,
      houseNumber: String(form.houseNumber || '').trim().toUpperCase(),
      block: String(form.block || '').trim().toUpperCase(),
    };
    const nextErrors = { ...validation.errors };

    if (!isUsefulCode(payload.houseNumber)) {
      nextErrors.houseNumber = 'House number must contain useful letters or numbers.';
    }

    if (!isUsefulCode(payload.block)) {
      nextErrors.block = 'Block must contain useful letters or numbers.';
    }

    setErrors(nextErrors);

    if (hasErrors(nextErrors)) {
      return;
    }

    try {
      setLoading(true);
      await register({ ...payload, role: 'user' });
    } catch (error) {
      Alert.alert('Registration failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.subtitle}>
        Residents can register here and begin reporting issues in their society immediately.
      </Text>

      <Surface elevation={2} style={styles.card}>
        <FormInput error={errors.name} label="Full Name" onChangeText={value => updateField('name', value)} value={form.name} />
        <FormInput
          autoCapitalize="none"
          keyboardType="email-address"
          label="Email"
          onChangeText={value => updateField('email', value)}
          value={form.email}
          error={errors.email}
        />
        <PasswordInput
          error={errors.password}
          label="Password"
          onChangeText={value => updateField('password', value)}
          value={form.password}
        />
        <FormInput error={errors.houseNumber} label="House Number" onChangeText={value => updateField('houseNumber', value)} value={form.houseNumber} />
        <FormInput error={errors.block} label="Block" onChangeText={value => updateField('block', value)} value={form.block} />
        <PrimaryButton label="Register" loading={loading} onPress={handleRegister} />
        <PrimaryButton label="Back to login" onPress={() => navigation.goBack()} variant="secondary" />
      </Surface>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    gap: 16,
    backgroundColor: colors.surface,
  },
});
