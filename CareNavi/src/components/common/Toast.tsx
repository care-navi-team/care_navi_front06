import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  visible: boolean;
  duration?: number;
  onDismiss: () => void;
  testID?: string;
}

const TYPE_CONFIG: Record<ToastType, { emoji: string; bgColor: string }> = {
  success: { emoji: '✅', bgColor: '#4CAF50' },
  error: { emoji: '❌', bgColor: '#F44336' },
  info: { emoji: 'ℹ️', bgColor: '#2196F3' },
  warning: { emoji: '⚠️', bgColor: '#FF9800' },
};

export default function Toast({
  message,
  type = 'info',
  visible,
  duration = 3000,
  onDismiss,
  testID,
}: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!visible) return null;

  const config = TYPE_CONFIG[type];

  return (
    <Animated.View
      testID={testID}
      style={[
        styles.container,
        { backgroundColor: config.bgColor, opacity, transform: [{ translateY }] },
      ]}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={handleDismiss}
        activeOpacity={0.8}
      >
        <Text style={styles.emoji}>{config.emoji}</Text>
        <Text style={styles.message}>{message}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    borderRadius: 12,
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  emoji: {
    fontSize: 20,
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#FFF',
  },
});
