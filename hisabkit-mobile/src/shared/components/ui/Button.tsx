import React from 'react';
import { Button as PaperButton, useTheme } from 'react-native-paper';
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  mode?: 'text' | 'outlined' | 'contained' | 'elevated' | 'contained-tonal';
  onPress: () => void;
  children: React.ReactNode;
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
}

export const Button = ({ 
  mode = 'contained', 
  onPress, 
  children, 
  icon, 
  loading, 
  disabled, 
  style,
  labelStyle 
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
        mode === 'contained' && { backgroundColor: theme.colors.primary },
        style
      ]}
      labelStyle={[styles.label, labelStyle]}
      contentStyle={styles.content}
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
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
