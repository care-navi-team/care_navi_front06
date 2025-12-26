// Reward popup modal for milestone achievements
import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import {Reward} from '../../types/reward';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

interface RewardPopupProps {
  visible: boolean;
  reward: Reward | null;
  onClaim: () => void;
}

export default function RewardPopup({
  visible,
  reward,
  onClaim,
}: RewardPopupProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
      sparkleAnim.setValue(0);

      // Start animations
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.loop(
            Animated.sequence([
              Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: true,
              }),
              Animated.timing(rotateAnim, {
                toValue: 0,
                duration: 2000,
                useNativeDriver: true,
              }),
            ]),
          ),
          Animated.loop(
            Animated.sequence([
              Animated.timing(sparkleAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
              }),
              Animated.timing(sparkleAnim, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
              }),
            ]),
          ),
        ]),
      ]).start();
    }
  }, [visible]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-5deg', '5deg'],
  });

  if (!reward) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClaim}>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{scale: scaleAnim}],
            },
          ]}>
          {/* Confetti effect */}
          <View style={styles.confettiContainer}>
            {['🎉', '🎊', '✨', '⭐', '🌟'].map((emoji, index) => (
              <Animated.Text
                key={index}
                style={[
                  styles.confetti,
                  {
                    left: `${15 + index * 17}%`,
                    opacity: sparkleAnim,
                    transform: [
                      {
                        translateY: sparkleAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -20],
                        }),
                      },
                    ],
                  },
                ]}>
                {emoji}
              </Animated.Text>
            ))}
          </View>

          {/* Title */}
          <Text style={styles.title}>{reward.title}</Text>

          {/* Coffee image placeholder */}
          <Animated.View
            style={[
              styles.imageContainer,
              {
                transform: [{rotate}],
              },
            ]}>
            <View style={styles.coffeeImage}>
              <Text style={styles.coffeeEmoji}>☕</Text>
            </View>
            <View style={styles.giftBadge}>
              <Text style={styles.giftBadgeText}>GIFT</Text>
            </View>
          </Animated.View>

          {/* Description */}
          <Text style={styles.description}>{reward.description}</Text>

          {/* Milestone badge */}
          <View style={styles.milestoneBadge}>
            <Text style={styles.milestoneText}>
              {reward.milestone} XP 달성!
            </Text>
          </View>

          {/* Claim button */}
          <TouchableOpacity style={styles.claimButton} onPress={onClaim}>
            <Text style={styles.claimButtonText}>받기</Text>
          </TouchableOpacity>

          {/* Note */}
          <Text style={styles.note}>
            * 기프티콘은 등록된 연락처로 발송됩니다
          </Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: SCREEN_WIDTH * 0.85,
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  confettiContainer: {
    position: 'absolute',
    top: -20,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: 'row',
  },
  confetti: {
    position: 'absolute',
    fontSize: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  coffeeImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5E6D3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#D4A574',
  },
  coffeeEmoji: {
    fontSize: 64,
  },
  giftBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    transform: [{rotate: '15deg'}],
  },
  giftBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  milestoneBadge: {
    backgroundColor: '#7EBDC3',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  milestoneText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  claimButton: {
    backgroundColor: '#FFB347',
    paddingHorizontal: 60,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: '#FFB347',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  claimButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  note: {
    marginTop: 16,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});
