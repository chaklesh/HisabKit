import type React from "react";
import { StyleSheet, type TextStyle, View, type ViewStyle } from "react-native";
import { HelperText, TextInput as PaperInput, useTheme } from "react-native-paper";

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  style?: ViewStyle;
  inputStyle?: TextStyle;
  autoFocus?: boolean;
  left?: React.ReactNode;
  right?: React.ReactNode;
  icon?: string;
  multiline?: boolean;
  numberOfLines?: number;
}

export const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  error,
  keyboardType = "default",
  autoCapitalize = "sentences",
  style,
  inputStyle,
  autoFocus,
  left,
  right,
  icon,
  multiline,
  numberOfLines,
}: InputProps) => {
  const _theme = useTheme();

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
        autoFocus={autoFocus}
        mode="outlined"
        outlineStyle={{ borderRadius: 16, borderWidth: 1.5 }}
        style={[styles.input, inputStyle]}
        left={
          left || (icon ? <PaperInput.Icon icon={icon} color="#94a3b8" size={20} /> : undefined)
        }
        right={right}
        multiline={multiline}
        numberOfLines={numberOfLines}
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
    backgroundColor: "white",
    fontSize: 16,
  },
  helper: {
    paddingHorizontal: 12,
  },
});
