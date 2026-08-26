import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';

import { useApp } from '@/context/AppContext';

import { getCoachingTeacherProfile } from '@/factory/coaching-studio/coachingTeacherService';
import CoachingStudioHomeScreen from './CoachingStudioHomeScreen';
import CoachingTeacherRegistrationScreen from './CoachingTeacherRegistrationScreen';

export default function CoachingStudioScreen() {
  const { firebaseUid } = useApp();

  const [isLoading, setIsLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkRegistration = async () => {
      if (!firebaseUid) {
        if (mounted) {
          setIsRegistered(false);
          setIsLoading(false);
        }
        return;
      }

      try {
        const profile =
          await getCoachingTeacherProfile(firebaseUid);

        if (!mounted) return;

        setIsRegistered(!!profile);
      } catch (error) {
        console.error(
          'COACHING REGISTRATION CHECK ERROR:',
          error
        );

        if (mounted) {
          setIsRegistered(false);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkRegistration();

    return () => {
      mounted = false;
    };
  }, [firebaseUid]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#2563eb"
        />
      </View>
    );
  }

  if (isRegistered) {
    return <CoachingStudioHomeScreen />;
  }

  return <CoachingTeacherRegistrationScreen />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
