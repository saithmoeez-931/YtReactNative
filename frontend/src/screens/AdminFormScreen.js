import React, { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { Surface } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { colors } from '../theme/theme';
import FormInput from '../components/FormInput';
import PasswordInput from '../components/PasswordInput';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';

export default function AdminFormScreen({ navigation, route }) {
  const { token } = useAuth();
  const admin = route.params?.admin;
  const editing = Boolean(admin);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: admin?.name || '',
    email: admin?.email || '',
    password: '',
  });

  const updateField = (key, value) => setForm(current => ({ ...current, [key]: value }));

  const handleSave = async () => {
    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password.trim(),
    };

    if (!payload.name || !payload.email || (!editing && !payload.password)) {
      Alert.alert('Missing details', 'Name, email, and password are required for new admins.');
      return;
    }

    if (editing && !payload.password) {
      delete payload.password;
    }

    try {
      setLoading(true);
      if (editing) {
        await api.updateAdmin(token, admin._id, payload);
      } else {
        await api.createAdmin(token, payload);
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Unable to save admin', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Surface elevation={1} style={styles.card}>
        <Text style={styles.title}>{editing ? 'Edit admin' : 'Create admin'}</Text>
        <Text style={styles.subtitle}>Admins can manage complaints but cannot create staff accounts.</Text>
        <FormInput label="Name" onChangeText={value => updateField('name', value)} value={form.name} />
        <FormInput label="Email" onChangeText={value => updateField('email', value)} value={form.email} />
        <PasswordInput
          label={editing ? 'New password (optional)' : 'Password'}
          onChangeText={value => updateField('password', value)}
          value={form.password}
        />
        <PrimaryButton label={editing ? 'Save admin' : 'Create admin'} loading={loading} onPress={handleSave} />
      </Surface>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 24, padding: 20, gap: 12 },
  title: { color: colors.text, fontSize: 24, fontWeight: '900' },
  subtitle: { color: colors.textMuted, lineHeight: 22 },
});
