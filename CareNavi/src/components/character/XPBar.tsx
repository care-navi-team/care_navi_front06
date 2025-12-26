import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface XPBarProps {
  currentXP: number;
  maxXP: number;
  testID?: string;
}

export default function XPBar({ currentXP, maxXP, testID }: XPBarProps) {
  const progress = maxXP > 0 ? (currentXP / maxXP) * 100 : 0;

  return (
    <View testID={testID} style={styles.container}>
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${Math.min(progress, 100)}%` }]} />
      </View>
      <Text style={styles.text}>
        {currentXP} / {maxXP} XP
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  barBackground: {
    width: '100%',
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 6,
  },
  text: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});
