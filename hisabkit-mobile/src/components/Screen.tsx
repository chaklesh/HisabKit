import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, ScrollView, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ScreenProps {
  children: React.ReactNode;
  refreshControl?: React.ReactElement;
}

export function Screen({ children, refreshControl }: ScreenProps) {
  const { colors } = useTheme();

  return (
    <LinearGradient colors={[colors.backgroundAccent, colors.background]} style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <View style={styles.flex}>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            refreshControl={refreshControl}
          >
            {children}
          </ScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 40,
    gap: 16,
  },
});
