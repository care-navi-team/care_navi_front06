import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Theme
import { colors, borderRadius, shadows } from '../theme';

// Screens
import HomeScreen from '../screens/HomeScreen';
import MissionScreen from '../screens/MissionScreen';
import HealthSummaryScreen from '../screens/HealthSummaryScreen';
import RecordScreen from '../screens/RecordScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type RootTabParamList = {
  Home: undefined;
  Mission: undefined;
  Health: undefined;
  Record: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

// Tab bar icon component
interface TabIconProps {
  name: string;
  focused: boolean;
  isCenter?: boolean;
}

const TabIcon: React.FC<TabIconProps> = ({ name, focused, isCenter }) => {
  const getIconName = () => {
    switch (name) {
      case 'Home':
        return 'home';
      case 'Mission':
        return 'flag';
      case 'Health':
        return 'assignment';
      case 'Record':
        return 'edit-calendar';
      case 'Profile':
        return 'person';
      default:
        return 'home';
    }
  };

  if (isCenter) {
    return (
      <View style={styles.centerTabButton}>
        <MaterialIcons
          name="pets"
          size={28}
          color={colors.primary}
        />
      </View>
    );
  }

  return (
    <MaterialIcons
      name={getIconName()}
      size={24}
      color={focused ? colors.primary : colors.text.muted}
    />
  );
};

export default function RootNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <TabIcon
            name={route.name}
            focused={focused}
            isCenter={route.name === 'Health'}
          />
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.muted,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingTop: 8,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          height: 60 + (insets.bottom > 0 ? insets.bottom : 8),
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      })}
      initialRouteName="Home"
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: '홈' }}
      />
      <Tab.Screen
        name="Mission"
        component={MissionScreen}
        options={{ tabBarLabel: '미션' }}
      />
      <Tab.Screen
        name="Health"
        component={HealthSummaryScreen}
        options={{
          tabBarLabel: '리포트',
          tabBarIconStyle: styles.centerTabIconStyle,
        }}
      />
      <Tab.Screen
        name="Record"
        component={RecordScreen}
        options={{ tabBarLabel: '기록' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: '마이' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  centerTabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.text.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    ...shadows.lg,
  },
  centerTabIconStyle: {
    marginTop: -16,
  },
});
