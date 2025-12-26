import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ChatBubbleProps {
  type: 'character' | 'user' | 'system';
  content: string;
  testID?: string;
}

export default function ChatBubble({ type, content, testID }: ChatBubbleProps) {
  const isCharacter = type === 'character';
  const isUser = type === 'user';

  return (
    <View
      testID={testID}
      style={[
        styles.container,
        isCharacter && styles.characterContainer,
        isUser && styles.userContainer,
      ]}
    >
      {isCharacter && <Text style={styles.characterEmoji}>🐣</Text>}
      <View
        style={[
          styles.bubble,
          isCharacter && styles.characterBubble,
          isUser && styles.userBubble,
        ]}
      >
        <Text
          style={[
            styles.text,
            isCharacter && styles.characterText,
            isUser && styles.userText,
          ]}
        >
          {content}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 12,
  },
  characterContainer: {
    justifyContent: 'flex-start',
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  characterEmoji: {
    fontSize: 32,
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  characterBubble: {
    backgroundColor: '#E8F4FD',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#4A90D9',
    borderBottomRightRadius: 4,
    marginLeft: 'auto',
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  characterText: {
    color: '#333',
  },
  userText: {
    color: '#FFF',
  },
});
