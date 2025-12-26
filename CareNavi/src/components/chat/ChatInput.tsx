import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

interface ChatInputProps {
  onSubmit: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
}

export default function ChatInput({
  onSubmit,
  placeholder = '오늘 컨디션을 알려주세요...',
  disabled = false,
  loading = false,
}: ChatInputProps) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    const trimmedText = text.trim();
    if (!trimmedText || disabled) return;

    onSubmit(trimmedText);
    setText('');
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, disabled && styles.inputDisabled]}
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        multiline
        maxLength={500}
        editable={!disabled}
        returnKeyType="send"
        onSubmitEditing={handleSubmit}
      />
      <TouchableOpacity
        testID="submit-button"
        style={[
          styles.button,
          (!text.trim() || disabled) && styles.buttonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={!text.trim() || disabled}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>전송</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 8,
  },
  inputDisabled: {
    backgroundColor: '#E0E0E0',
  },
  button: {
    width: 60,
    height: 40,
    backgroundColor: '#4A90D9',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#CCC',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
