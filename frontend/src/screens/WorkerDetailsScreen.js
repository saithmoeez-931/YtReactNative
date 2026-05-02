import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Button, Chip, Surface } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { colors } from '../theme/theme';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';

const specialtyOptions = ['electricity', 'water', 'waste', 'security', 'general'];

export default function WorkerDetailsScreen({ navigation, route }) {
  const { token } = useAuth();
  const worker = route.params?.worker;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: worker?.name || '',
    email: worker?.email || '',
    password: '',
    isActive: worker?.isActive !== false,
    specialties: worker?.specialties?.length ? worker.specialties : ['general'],
  });

  const updateField = (key, value) => setForm(current => ({ ...current, [key]: value }));

  const toggleSpecialty = specialty => {
    setForm(current => {
      const next = current.specialties.includes(specialty)
        ? current.specialties.filter(item => item !== specialty)
        : [...current.specialties, specialty];

      return { ...current, specialties: next.length ? next : ['general'] };
    });
  };

  const handleSave = async () => {
    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password.trim(),
      isActive: form.isActive,
      specialties: form.specialties,
    };

    if (!payload.name || !payload.email) {
      Alert.alert('Missing details', 'Name and email are required.');
      return;
    }

    if (!payload.password) {
      delete payload.password;
    }

    try {
      setLoading(true);
      await api.updateWorker(token, worker._id, payload);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Unable to save worker', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Surface elevation={1} style={styles.card}>
        <Text style={styles.title}>Edit worker</Text>
        <Text style={styles.subtitle}>Update worker profile, status, and complaint specialties.</Text>
        <FormInput label="Name" onChangeText={value => updateField('name', value)} value={form.name} />
        <FormInput label="Email" onChangeText={value => updateField('email', value)} value={form.email} />
        <FormInput label="New password (optional)" onChangeText={value => updateField('password', value)} secureTextEntry value={form.password} />
        <Button
          mode="outlined"
          onPress={() => updateField('isActive', !form.isActive)}
          textColor={form.isActive ? colors.danger : colors.success}
        >
          {form.isActive ? 'Deactivate worker' : 'Reactivate worker'}
        </Button>
        <Text style={styles.fieldLabel}>Specialties</Text>
        <View style={styles.chipRow}>
          {specialtyOptions.map(option => (
            <Chip key={option} selected={form.specialties.includes(option)} onPress={() => toggleSpecialty(option)}>
              {option}
            </Chip>
          ))}
        </View>
        <PrimaryButton label="Save worker" loading={loading} onPress={handleSave} />
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
