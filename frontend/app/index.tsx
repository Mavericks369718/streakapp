import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getCompletions, saveCompletions, getTodayString } from '../utils/storage';

export default function Index() {
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [rotateAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    checkTodayStatus();
  }, []);

  const checkTodayStatus = async () => {
    try {
      console.log('[Index] Checking today status...');
      const completions = await getCompletions();
      const today = getTodayString();
      
      console.log('[Index] Platform:', Platform.OS);
      console.log('[Index] Completions:', completions);
      console.log('[Index] Today:', today);
      console.log('[Index] Is today completed:', completions.includes(today));
      
      setIsCompleted(completions.includes(today));
    } catch (error) {
      console.error('[Index] Error checking status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleComplete = async () => {
    console.log('[Index] Button clicked! Current completed state:', isCompleted);
    
    if (isCompleted) {
      console.log('[Index] Already completed, ignoring click');
      return;
    }

    // Animate button press
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.85,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      console.log('[Index] Saving completion...');
      const completions = await getCompletions();
      const today = getTodayString();
      
      console.log('[Index] Current completions before save:', completions);
      
      if (!completions.includes(today)) {
        completions.push(today);
        await saveCompletions(completions);
        console.log('[Index] Saved completions:', completions);
        setIsCompleted(true);
        console.log('[Index] State updated to completed!');
      }
    } catch (error) {
      console.error('[Index] Error saving completion:', error);
      alert('Failed to save completion. Please try again.');
    }
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Daily Streak</Text>
        <Text style={styles.subtitle}>Complete your daily goal</Text>
      </View>

      {/* Main Button */}
      <View style={styles.mainContent}>
        <TouchableOpacity
          style={styles.buttonWrapper}
          onPress={handleToggleComplete}
          activeOpacity={0.7}
          disabled={isCompleted}
        >
          <Animated.View
            style={[
              styles.mainButton,
              isCompleted && styles.mainButtonCompleted,
              {
                transform: [
                  { scale: scaleAnim },
                  { rotate: rotation },
                ],
              },
            ]}
          >
            {isCompleted ? (
              <Ionicons name="checkmark" size={80} color="#FFFFFF" />
            ) : (
              <Ionicons name="add" size={80} color="#6B7C70" />
            )}
          </Animated.View>
        </TouchableOpacity>
        
        <Text style={styles.buttonLabel}>
          {isCompleted ? 'Completed Today!' : 'Tap to complete'}
        </Text>
      </View>

      {/* Navigation Buttons */}
      <View style={styles.navSection}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => {
            console.log('[Index] Navigating to stats');
            router.push('/stats');
          }}
          activeOpacity={0.7}
        >
          <View style={styles.navIconContainer}>
            <Ionicons name="stats-chart" size={28} color="#6B7C70" />
          </View>
          <Text style={styles.navButtonText}>View Stats</Text>
          <Ionicons name="chevron-forward" size={20} color="#A0ADA4" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => {
            console.log('[Index] Navigating to history');
            router.push('/history');
          }}
          activeOpacity={0.7}
        >
          <View style={styles.navIconContainer}>
            <Ionicons name="calendar" size={28} color="#6B7C70" />
          </View>
          <Text style={styles.navButtonText}>View History</Text>
          <Ionicons name="chevron-forward" size={20} color="#A0ADA4" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3F0',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 18,
    color: '#6B7C70',
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#2C3E30',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7C70',
    fontWeight: '400',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -80,
  },
  buttonWrapper: {
    marginBottom: 24,
  },
  mainButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6B7C70',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#E8E5E0',
  },
  mainButtonCompleted: {
    backgroundColor: '#6B7C70',
    borderColor: '#6B7C70',
  },
  buttonLabel: {
    fontSize: 18,
    color: '#6B7C70',
    fontWeight: '600',
    marginTop: 16,
  },
  navSection: {
    marginBottom: 40,
    gap: 16,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 20,
    shadowColor: '#6B7C70',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  navIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F3F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  navButtonText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E30',
  },
});
