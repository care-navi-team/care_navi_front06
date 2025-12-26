import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, borderRadius, buttonSizes, shadows, typography } from '../../theme';
import Icon, { IconName } from './Icon';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const sizeConfig = buttonSizes[size];
  const isDisabled = disabled || loading;

  const getBackgroundColor = () => {
    if (isDisabled) return colors.border;
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.surfaceSecondary;
      case 'outline':
      case 'ghost':
        return 'transparent';
      default:
        return colors.primary;
    }
  };

  const getTextColor = () => {
    if (isDisabled) return colors.text.muted;
    switch (variant) {
      case 'primary':
        return colors.text.primary;
      case 'secondary':
        return colors.text.primary;
      case 'outline':
      case 'ghost':
        return colors.primary;
      default:
        return colors.text.primary;
    }
  };

  const getBorderStyle = () => {
    if (variant === 'outline') {
      return {
        borderWidth: 1,
        borderColor: isDisabled ? colors.border : colors.primary,
      };
    }
    return {};
  };

  const getShadowStyle = () => {
    if (variant === 'primary' && !isDisabled) {
      return shadows.glowLight;
    }
    return {};
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          height: sizeConfig.height,
          paddingHorizontal: sizeConfig.paddingHorizontal,
          backgroundColor: getBackgroundColor(),
          borderRadius: borderRadius.full,
        },
        getBorderStyle(),
        getShadowStyle(),
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Icon
              name={icon}
              size={sizeConfig.iconSize}
              color={getTextColor()}
              style={styles.iconLeft}
            />
          )}
          <Text
            style={[
              styles.text,
              {
                fontSize: sizeConfig.fontSize,
                color: getTextColor(),
                fontWeight: typography.fontWeight.bold,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Icon
              name={icon}
              size={sizeConfig.iconSize}
              color={getTextColor()}
              style={styles.iconRight}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

export default Button;
