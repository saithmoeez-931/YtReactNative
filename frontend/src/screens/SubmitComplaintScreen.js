import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { colors } from '../theme/theme';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';

const categories = ['Electricity', 'Water', 'Waste', 'Security', 'Other'];

export default function SubmitComplaintScreen() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    houseNumber: user?.houseNumber || '',
    block: user?.block || '',
    category: categories[0],
    description: '',
    image: '',
  });

  const updateField = (key, value) => {
    setForm(current => ({ ...current, [key]: value }));
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow gallery access to attach an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length) {
      updateField('image', result.assets[0].uri);
    }
  };

  const submitComplaint = async () => {
    try {
      setLoading(true);
      await api.createComplaint(token, form);
      Alert.alert('Complaint submitted', 'Your complaint has been created successfully.');
      setForm(current => ({
        ...current,
        category: categories[0],
        description: '',
        image: '',
      }));
    } catch (error) {
      Alert.alert('Submission failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Submit a complaint</Text>
      <Text style={styles.subtitle}>
        Residents can report issues with details that help admins and workers act faster.
      </Text>

      <View style={styles.card}>
        <FormInput label="House Number" onChangeText={value => updateField('houseNumber', value)} value={form.houseNumber} />
        <FormInput label="Block" onChangeText={value => updateField('block', value)} value={form.block} />
        <FormInput label="Category" onChangeText={value => updateField('category', value)} value={form.category} />
        <Text style={styles.categories}>Suggested categories: {categories.join(', ')}</Text>
        <FormInput
          label="Description"
          multiline
          onChangeText={value => updateField('description', value)}
          placeholder="Describe the issue clearly so the staff knows what to fix."
          value={form.description}
        />
        <PrimaryButton
          label={form.image ? 'Change image attachment' : 'Attach image'}
          onPress={pickImage}
          variant="secondary"
        />
        {form.image ? <Text style={styles.imagePath}>Selected image: {form.image}</Text> : null}
        <PrimaryButton label="Submit complaint" loading={loading} onPress={submitComplaint} />
      </View>
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
    color: colors.textMuted,
    lineHeight: 22,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    gap: 14,
  },
  categories: {
    color: colors.textMuted,
    fontSize: 13,
  },
  imagePath: {
    color: colors.textMuted,
    fontSize: 12,
  },
});
