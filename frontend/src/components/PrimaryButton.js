import React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { colors } from '../theme/theme';

export default function PrimaryButton({
  label,
  onPress,
  loading = false,
  variant = 'primary',
  disabled = false,
}) {
  const isSecondary = variant === 'secondary';
  const isDisabled = disabled || loading;

  return (
    <Button
      buttonColor={isSecondary ? colors.primarySoft : colors.primary}
      disabled={isDisabled}
      labelStyle={[styles.label, isSecondary ? styles.secondaryLabel : styles.primaryLabel]}
      mode="contained"
      onPress={onPress}
      style={[styles.button, isDisabled && styles.disabledButton]}
      contentStyle={styles.content}
      loading={loading}
    >
      {label}
    </Button>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
  },
  content: {
    minHeight: 54,
  },
  disabledButton: {
    opacity: 0.55,
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
