import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/theme';

export default function PrimaryButton({
  label,
  onPress,
  loading = false,
  variant = 'primary',
}) {
  const isSecondary = variant === 'secondary';

  return (
    <Pressable
      disabled={loading}
      onPress={onPress}
      style={[styles.button, isSecondary ? styles.secondaryButton : styles.primaryButton]}
    >
      {loading ? (
        <ActivityIndicator color={isSecondary ? colors.primary : '#ffffff'} />
      ) : (
        <Text style={[styles.label, isSecondary ? styles.secondaryLabel : styles.primaryLabel]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.primarySoft,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
  },
  primaryLabel: {
    color: '#ffffff',
  },
  secondaryLabel: {
    color: colors.primary,
  },
});
