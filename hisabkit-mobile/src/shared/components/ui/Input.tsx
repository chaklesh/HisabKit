import React from 'react';
import { TextInput as PaperInput, useTheme, HelperText } from 'react-native-paper';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  style?: ViewStyle;
  left?: React.ReactNode;
  right?: React.ReactNode;
}

export const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  error,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  style,
  left,
  right,
}: InputProps) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, style]}>
      <PaperInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        error={!!error}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        mode="outlined"
        outlineStyle={{ borderRadius: 16, borderWidth: 1.5 }}
        style={styles.input}
        left={left}
        right={right}
      />
      {error && (
        <HelperText type="error" visible={!!error} style={styles.helper}>
          {error}
        </HelperText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  input: {
    backgroundColor: 'white',
    fontSize: 16,
  },
  helper: {
    paddingHorizontal: 12,
  },
});
