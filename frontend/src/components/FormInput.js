import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { colors } from '../theme/theme';

export default function FormInput({
  label,
  error,
  multiline = false,
  style,
  ...props
}) {
  return (
    <View style={styles.wrapper}>
      <TextInput
        error={Boolean(error)}
        label={label}
        mode="outlined"
        multiline={multiline}
        outlineColor={colors.border}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, style]}
        textColor={colors.text}
        theme={{
          colors: {
            primary: colors.primary,
            outline: colors.border,
            onSurfaceVariant: colors.textMuted,
          },
        }}
        contentStyle={multiline ? styles.multilineContent : undefined}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  input: {
    backgroundColor: colors.surface,
  },
  multilineContent: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  error: {
    color: colors.danger,
    fontSize: 12,
  },
});
