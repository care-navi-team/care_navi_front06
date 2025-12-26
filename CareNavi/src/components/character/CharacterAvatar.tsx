import React from 'react';
import { View, Image, StyleSheet, ImageSourcePropType, Animated } from 'react-native';
import { CharacterStage } from '../../types';
import { colors, shadows } from '../../theme';

interface CharacterAvatarProps {
  stage: CharacterStage;
  size?: number;
  hasGlow?: boolean;
  animated?: boolean;
  testID?: string;
}

// Import character images
const STAGE_IMAGES: Record<CharacterStage, ImageSourcePropType> = {
  egg: require('../../assets/images/lv1.png'),
  chick: require('../../assets/images/lv2.png'),
  chicken: require('../../assets/images/lv3.png'),
  phoenix: require('../../assets/images/lv4.png'),
};

export default function CharacterAvatar({
  stage,
  size = 100,
  hasGlow = false,
  animated = false,
  testID,
}: CharacterAvatarProps) {
  // Animation for floating effect
  const floatAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (animated) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -8,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [animated, floatAnim]);

  const containerStyle = [
    styles.container,
    {
      width: size,
      height: size,
      borderRadius: size / 2,
    },
    hasGlow && styles.glowEffect,
  ];

  const imageStyle = {
    width: size * 0.85,
    height: size * 0.85,
  };

  const content = (
    <View testID={testID} style={containerStyle}>
      <Image
        source={STAGE_IMAGES[stage]}
        style={imageStyle}
        resizeMode="contain"
      />
    </View>
  );

  if (animated) {
    return (
      <Animated.View
        style={{
          transform: [{ translateY: floatAnim }],
        }}
      >
        {hasGlow && (
          <View
            style={[
              styles.glowBackground,
              {
                width: size * 1.2,
                height: size * 1.2,
                borderRadius: (size * 1.2) / 2,
                left: -size * 0.1,
                top: -size * 0.1,
              },
            ]}
          />
        )}
        {content}
      </Animated.View>
    );
  }

  return (
    <View>
      {hasGlow && (
        <View
          style={[
            styles.glowBackground,
            {
              width: size * 1.2,
              height: size * 1.2,
              borderRadius: (size * 1.2) / 2,
              left: -size * 0.1,
              top: -size * 0.1,
            },
          ]}
        />
      )}
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  glowEffect: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  glowBackground: {
    position: 'absolute',
    backgroundColor: `${colors.primary}20`,
    opacity: 0.6,
  },
});
