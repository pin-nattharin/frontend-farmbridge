import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps, Platform } from 'react-native';

// กำหนด Props สำหรับ TextInput
interface RoundedInputProps extends TextInputProps {
  label: string;
}

const RoundedInput: React.FC<RoundedInputProps> = ({ label, style, ...props }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor="#A0AEC0" // สีของ placeholder
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20, // ระยะห่างระหว่าง Input fields
  },
  label: {
    fontSize: 14,
    color: '#4A5568', // สีป้าย (label)
    marginBottom: 5,
  },
  input: {
    height: 50,
    backgroundColor: '#EDF4FE',
    borderRadius: 10, // มุมโค้งมน
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0', // สีขอบอ่อนๆ
    // สำหรับเงา (Shadow)
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
});

export default RoundedInput;