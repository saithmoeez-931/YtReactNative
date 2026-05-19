import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/theme';

export default function ScreenContainer({
  children,
  scroll = true,
  contentStyle,
  refreshControl,
}) {
  if (scroll) {
    return (
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, contentStyle]}
          refreshControl={refreshControl}
          style={styles.screen}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={[styles.screen, styles.fixedContent, contentStyle]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
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
