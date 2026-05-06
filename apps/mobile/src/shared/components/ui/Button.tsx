import type React from "react";
import { StyleSheet, type TextStyle, type ViewStyle } from "react-native";
import {
  Button as PaperButton,
  type ButtonProps as PaperButtonProps,
  useTheme,
} from "react-native-paper";

interface ButtonProps {
  mode?: "text" | "outlined" | "contained" | "elevated" | "contained-tonal";
  onPress: () => void;
  children: React.ReactNode;
  icon?: PaperButtonProps["icon"];
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  contentStyle?: ViewStyle;
}

export const Button = ({
  mode = "contained",
  onPress,
  children,
  icon,
  loading,
  disabled,
  style,
  labelStyle,
  contentStyle,
}: ButtonProps) => {
  const theme = useTheme();

  return (
    <PaperButton
      mode={mode}
      onPress={onPress}
      icon={icon}
      loading={loading}
      disabled={disabled}
      style={[
        styles.button,
        mode === "contained" && { backgroundColor: theme.colors.primary },
        style,
      ]}
      labelStyle={[styles.label, labelStyle]}
      contentStyle={[styles.content, contentStyle]}
    >
      {children}
    </PaperButton>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    marginVertical: 4,
    elevation: 0,
  },
  content: {
    height: 54,
  },
  label: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
});
