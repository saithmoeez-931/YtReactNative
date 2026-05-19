import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Chip, Surface } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { colors } from '../theme/theme';
import FormInput from '../components/FormInput';
import PasswordInput from '../components/PasswordInput';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';
import { workerSpecialties } from '../constants/complaintTaxonomy';
import { hasErrors, validateAccountForm } from '../utils/validation';

export default function WorkerFormScreen({ navigation }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', specialties: [] });
  const [errors, setErrors] = useState({});

  const updateField = (key, value) => setForm(current => ({ ...current, [key]: value }));

  const toggleSpecialty = specialty => {
    setForm(current => ({
      ...current,
      specialties: current.specialties.includes(specialty)
        ? current.specialties.filter(item => item !== specialty)
        : [...current.specialties, specialty],
    }));
  };

  const handleCreate = async () => {
    if (loading) {
      return;
    }

    const validation = validateAccountForm(form, { passwordRequired: true });
    const payload = {
      ...validation.payload,
      specialties: form.specialties.length ? form.specialties : ['general'],
    };

    setErrors(validation.errors);

    if (hasErrors(validation.errors)) {
      return;
    }

    try {
      setLoading(true);
      await api.createWorker(token, payload);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Unable to create worker', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Surface elevation={1} style={styles.card}>
        <Text style={styles.title}>Create worker</Text>
        <Text style={styles.subtitle}>Specialties decide which complaints can be auto-assigned.</Text>
        <FormInput error={errors.name} label="Worker name" onChangeText={value => updateField('name', value)} value={form.name} />
        <FormInput error={errors.email} label="Email" onChangeText={value => updateField('email', value)} value={form.email} />
        <PasswordInput error={errors.password} label="Password" onChangeText={value => updateField('password', value)} value={form.password} />
        <Text style={styles.fieldLabel}>Specialties</Text>
        <View style={styles.chipRow}>
          {workerSpecialties.map(option => (
            <Chip key={option} selected={form.specialties.includes(option)} onPress={() => toggleSpecialty(option)}>
              {option}
            </Chip>
          ))}
        </View>
        <PrimaryButton label="Create worker" loading={loading} onPress={handleCreate} />
      </Surface>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 24, padding: 20, gap: 12 },
  title: { color: colors.text, fontSize: 24, fontWeight: '900' },
  subtitle: { color: colors.textMuted, lineHeight: 22 },
  fieldLabel: { color: colors.text, fontWeight: '800' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
