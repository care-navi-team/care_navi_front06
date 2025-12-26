import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface LevelBadgeProps {
  level: number;
  testID?: string;
}

export default function LevelBadge({ level, testID }: LevelBadgeProps) {
  return (
    <View testID={testID} style={styles.container}>
      <Text style={styles.text}>Lv.{level}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  text: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
