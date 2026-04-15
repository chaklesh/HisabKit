import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  refreshControl?: React.ReactElement<RefreshControl>;
  scrollEnabled?: boolean;
}

export const Screen = ({
  children,
  style,
  contentContainerStyle,
  refreshControl,
  scrollEnabled = true,
}: ScreenProps) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const containerStyle = [
    styles.container,
    { backgroundColor: theme.colors.background, paddingTop: insets.top },
    style,
  ];

  if (!scrollEnabled) {
    return <View style={containerStyle}>{children}</View>;
  }

  return (
    <ScrollView
      style={containerStyle}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }, contentContainerStyle]}
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
});
