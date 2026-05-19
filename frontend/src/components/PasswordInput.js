import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme/theme';
import AppIcon from './AppIcon';

export default function PasswordInput({
  label,
  error,
  onChangeText,
  placeholder,
  value,
  style,
  ...props
}) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputShell, error && styles.inputShellError, style]}>
        <TextInput
          autoCapitalize="none"
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={!visible}
          style={styles.input}
          value={value}
          {...props}
        />
        <Pressable
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}
          accessibilityRole="button"
          hitSlop={10}
          onPress={() => setVisible(current => !current)}
          style={styles.iconButton}
        >
          <AppIcon
            color={colors.textMuted}
            name={visible ? 'eye-off-outline' : 'eye-outline'}
            size={22}
          />
        </Pressable>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  inputShell: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputShellError: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    minHeight: 54,
    paddingLeft: 14,
    paddingRight: 8,
    color: colors.text,
    fontSize: 16,
  },
  iconButton: {
    height: 54,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    color: colors.danger,
    fontSize: 12,
  },
});
