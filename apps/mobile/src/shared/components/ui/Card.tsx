import type React from "react";
import { StyleSheet, type ViewStyle } from "react-native";
import { Card as PaperCard, Text, useTheme } from "react-native-paper";

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  onPress?: () => void;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

export const Card = ({ children, title, subtitle, onPress, style, contentStyle }: CardProps) => {
  const theme = useTheme();

  return (
    <PaperCard
      onPress={onPress}
      style={[styles.card, { backgroundColor: theme.colors.surface }, style]}
    >
      {(title || subtitle) && (
        <PaperCard.Title
          title={title}
          subtitle={subtitle}
          titleVariant="titleLarge"
          subtitleVariant="bodyMedium"
        />
      )}
      <PaperCard.Content style={contentStyle}>{children}</PaperCard.Content>
    </PaperCard>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    marginVertical: 4,
    elevation: 0,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    overflow: "hidden",
  },
});
