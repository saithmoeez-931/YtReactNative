import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/theme';

const toneMap = {
  success: {
    backgroundColor: colors.successSoft,
    borderColor: colors.success,
    textColor: colors.success,
  },
  info: {
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondary,
    textColor: colors.secondary,
  },
  warning: {
    backgroundColor: colors.warningSoft,
    borderColor: colors.warning,
    textColor: colors.warning,
  },
};

export default function FeedbackBanner({ message, tone = 'success' }) {
  if (!message) {
    return null;
  }

  const palette = toneMap[tone] || toneMap.success;

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: palette.backgroundColor,
          borderColor: palette.borderColor,
        },
      ]}
    >
      <Text style={[styles.text, { color: palette.textColor }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
});
