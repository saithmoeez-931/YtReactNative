import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { colors } from '../theme/theme';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';
import { complaintCategories } from '../constants/complaintTaxonomy';
import { cleanText, hasErrors, isUsefulCode, isUsefulText } from '../utils/validation';

export default function SubmitComplaintScreen() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    houseNumber: user?.houseNumber || '',
    block: user?.block || '',
    category: complaintCategories[0],
    description: '',
  });

  const updateField = (key, value) => {
    setForm(current => ({ ...current, [key]: value }));
  };

  const submitComplaint = async () => {
    if (loading) {
      return;
    }

    const payload = {
      houseNumber: cleanText(form.houseNumber).toUpperCase(),
      block: cleanText(form.block).toUpperCase(),
      category: cleanText(form.category),
      description: cleanText(form.description),
    };
    const nextErrors = {};

    if (!isUsefulCode(payload.houseNumber)) {
      nextErrors.houseNumber = 'House number must contain useful letters or numbers.';
    }

    if (!isUsefulCode(payload.block)) {
      nextErrors.block = 'Block must contain useful letters or numbers.';
    }

    if (!complaintCategories.includes(payload.category)) {
      nextErrors.category = 'Select a valid complaint category.';
    }

    if (!isUsefulText(payload.description, 15)) {
      nextErrors.description = 'Description must be at least 15 meaningful characters.';
    }

    setErrors(nextErrors);

    if (hasErrors(nextErrors)) {
      return;
    }

    try {
      setLoading(true);
      const response = await api.createComplaint(token, payload);
      Alert.alert('Complaint submitted', response.message || 'Your complaint has been created successfully.');
      setForm(current => ({
        ...current,
        category: complaintCategories[0],
        description: '',
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
        <FormInput error={errors.houseNumber} label="House Number" onChangeText={value => updateField('houseNumber', value)} value={form.houseNumber} />
        <FormInput error={errors.block} label="Block" onChangeText={value => updateField('block', value)} value={form.block} />
        <View style={styles.categorySection}>
          <Text style={styles.fieldLabel}>Category</Text>
          <View style={styles.categoryList}>
            {complaintCategories.map(category => (
              <Pressable
                key={category}
                onPress={() => updateField('category', category)}
                style={[
                  styles.categoryChip,
                  form.category === category && styles.categoryChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    form.category === category && styles.categoryChipTextActive,
                  ]}
                >
                  {category}
                </Text>
              </Pressable>
            ))}
          </View>
          {errors.category ? <Text style={styles.errorText}>{errors.category}</Text> : null}
        </View>
        <FormInput
          label="Description"
          multiline
          onChangeText={value => updateField('description', value)}
          placeholder="Describe the issue clearly so the staff knows what to fix."
          value={form.description}
          error={errors.description}
        />
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
  categorySection: {
    gap: 10,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  categoryList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.surfaceMuted,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
  },
  categoryChipText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 13,
  },
  categoryChipTextActive: {
    color: '#ffffff',
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
  },
});
