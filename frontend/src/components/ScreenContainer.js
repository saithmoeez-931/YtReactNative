import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { colors } from '../theme/theme';

export default function ScreenContainer({
  children,
  scroll = true,
  contentStyle,
  refreshControl,
}) {
  if (scroll) {
    return (
      <ScrollView
        contentContainerStyle={[styles.scrollContent, contentStyle]}
        refreshControl={refreshControl}
        style={styles.screen}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }

  return <View style={[styles.screen, styles.fixedContent, contentStyle]}>{children}</View>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  fixedContent: {
    padding: 20,
    gap: 16,
  },
});
