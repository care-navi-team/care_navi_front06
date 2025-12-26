// T064: Character avatar component
import React from 'react';
import {View, Image, StyleSheet, ImageSourcePropType} from 'react-native';
import {CharacterStage} from '../../types';

interface CharacterAvatarProps {
  stage: CharacterStage;
  size?: number;
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
  testID,
}: CharacterAvatarProps) {
  return (
    <View
      testID={testID}
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}>
      <Image
        source={STAGE_IMAGES[stage]}
        style={{
          width: size * 0.85,
          height: size * 0.85,
        }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
});
