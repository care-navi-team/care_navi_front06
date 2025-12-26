import React, { useEffect, useCallback, useRef, useState } from 'react';
import { StatusBar, AppState, AppStateStatus, View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './navigation/RootNavigator';
import LoginScreen from './screens/LoginScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import ErrorBoundary from './components/common/ErrorBoundary';
import { supabase } from './services/supabase';
import { useAuthStore } from './stores/useAuthStore';
import { useDailyStore } from './stores/useDailyStore';
import { useMissionStore } from './stores/useMissionStore';
import { useSurveyStore } from './stores/useSurveyStore';
import { checkAndResetIfNewDay } from './services/dailyResetService';

export default function App() {
  const { session, setSession, setLoading, isLoading: authLoading } = useAuthStore();
  const { dailyState, setDailyState } = useDailyStore();
  const { reset: resetMissions } = useMissionStore();
  const { hasCompleted: hasSurveyCompleted, fetchSurvey, isLoading: surveyLoading } = useSurveyStore();
  const appState = useRef(AppState.currentState);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingSurvey, setCheckingSurvey] = useState(true);

  // Check daily reset on app launch
  const checkDailyReset = useCallback(async () => {
    if (!session?.user?.id) return;

    const lastKnownDate = dailyState?.date;
    const result = await checkAndResetIfNewDay(session.user.id, lastKnownDate);

    if (result.wasReset && result.state) {
      console.log('Daily state reset for new day');
      setDailyState(result.state);
      // Reset missions when day changes
      resetMissions();
    }
  }, [session?.user?.id, dailyState?.date, setDailyState, resetMissions]);

  // Auth setup
  useEffect(() => {
    // Check initial session
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [setSession, setLoading]);

  // Check reset on app launch when session is available
  useEffect(() => {
    if (session?.user?.id) {
      checkDailyReset();
    }
  }, [session?.user?.id, checkDailyReset]);

  // Check survey completion status
  useEffect(() => {
    const checkSurvey = async () => {
      if (session?.user?.id) {
        setCheckingSurvey(true);
        await fetchSurvey(session.user.id);
        setCheckingSurvey(false);
      } else {
        setCheckingSurvey(false);
      }
    };
    checkSurvey();
  }, [session?.user?.id, fetchSurvey]);

  // Update showOnboarding based on survey status
  useEffect(() => {
    if (!checkingSurvey && session?.user?.id) {
      setShowOnboarding(!hasSurveyCompleted);
    }
  }, [checkingSurvey, hasSurveyCompleted, session?.user?.id]);

  const handleSurveyComplete = useCallback(() => {
    setShowOnboarding(false);
  }, []);

  // Check reset when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('App has come to foreground, checking daily reset...');
        checkDailyReset();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [checkDailyReset]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90D9" />
      </View>
    );
  }

  // Show login screen if not logged in
  if (!session?.user?.id) {
    return (
      <ErrorBoundary>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <LoginScreen />
        </GestureHandlerRootView>
      </ErrorBoundary>
    );
  }

  // Show loading while checking survey
  if (checkingSurvey) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90D9" />
      </View>
    );
  }

  // Show onboarding if survey not completed
  if (showOnboarding) {
    return (
      <ErrorBoundary>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <OnboardingScreen onComplete={handleSurveyComplete} />
        </GestureHandlerRootView>
      </ErrorBoundary>
    );
  }

  // Show main app
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" />
          <RootNavigator />
        </NavigationContainer>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
});
