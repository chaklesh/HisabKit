import React from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export const Chip = ({ label, selected, onPress }: ChipProps) => {
  const theme = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? `${theme.colors.primary}15` : theme.colors.surface,
          borderColor: selected ? theme.colors.primary : theme.colors.outline,
        },
      ]}
    >
      <Text
        variant="labelSmall"
        style={{
          color: selected ? theme.colors.primary : theme.colors.outline,
          fontWeight: '800',
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
  },
});
