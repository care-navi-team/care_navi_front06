import React from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, iconSizes } from '../../theme';

// Icon name mapping for Material Icons
const materialIconMap = {
  // Navigation & Actions
  home: 'home',
  back: 'arrow-back',
  forward: 'arrow-forward',
  close: 'close',
  menu: 'menu',
  more: 'more-vert',
  settings: 'settings',
  search: 'search',
  check: 'check',
  add: 'add',
  remove: 'remove',
  edit: 'edit',
  delete: 'delete',

  // User & Profile
  person: 'person',
  personOutline: 'person-outline',
  notifications: 'notifications',
  notificationsOutline: 'notifications-none',

  // Health & Wellness
  favorite: 'favorite',
  favoriteOutline: 'favorite-border',
  water: 'water-drop',
  sleep: 'bedtime',
  walk: 'directions-walk',
  run: 'directions-run',
  heart: 'monitor-heart',
  mood: 'mood',

  // Missions & Tasks
  flag: 'flag',
  assignment: 'assignment',
  play: 'play-arrow',
  pause: 'pause',
  done: 'done',
  schedule: 'schedule',

  // Character & Fun
  pets: 'pets',
  toys: 'toys',
  restaurant: 'restaurant',
  star: 'star',
  starOutline: 'star-border',
  bolt: 'bolt',
  trending: 'trending-up',

  // Charts & Data
  barChart: 'bar-chart',
  timeline: 'timeline',
  insights: 'insights',

  // Misc
  info: 'info',
  infoOutline: 'info-outline',
  help: 'help',
  helpOutline: 'help-outline',
  visibility: 'visibility',
  visibilityOff: 'visibility-off',
  tag: 'tag',
  editNote: 'edit-note',
  fire: 'local-fire-department',
  selfImprovement: 'self-improvement',
  ecgHeart: 'ecg',
} as const;

// Icon names that need MaterialCommunityIcons
const communityIconMap = {
  // Additional icons from Material Community
  paw: 'paw',
  bone: 'bone',
  foodApple: 'food-apple',
  pill: 'pill',
  sleep: 'sleep',
  run: 'run',
  walk: 'walk',
} as const;

type MaterialIconName = keyof typeof materialIconMap;
type CommunityIconName = keyof typeof communityIconMap;
type IconName = MaterialIconName | CommunityIconName;
type IconSize = keyof typeof iconSizes | number;

interface IconProps {
  name: IconName;
  size?: IconSize;
  color?: string;
  style?: object;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  color = colors.text.primary,
  style,
}) => {
  const iconSize = typeof size === 'number' ? size : iconSizes[size];

  // Check if it's a community icon
  if (name in communityIconMap) {
    return (
      <MaterialCommunityIcons
        name={communityIconMap[name as CommunityIconName]}
        size={iconSize}
        color={color}
        style={style}
      />
    );
  }

  // Default to Material Icons
  const iconName = materialIconMap[name as MaterialIconName] || name;
  return (
    <MaterialIcons
      name={iconName}
      size={iconSize}
      color={color}
      style={style}
    />
  );
};

export default Icon;
export type { IconName, IconSize, IconProps };
