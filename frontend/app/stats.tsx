import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface StreakStats {
  current_streak: number;
  best_streak: number;
  total_completions: number;
  today_completed: boolean;
}

export default function Stats() {
  const router = useRouter();
  const [stats, setStats] = useState<StreakStats>({
    current_streak: 0,
    best_streak: 0,
    total_completions: 0,
    today_completed: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/streak`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading stats...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={28} color="#2C3E30" />
        </TouchableOpacity>
        <Text style={styles.title}>Your Stats</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        {/* Current Streak */}
        <View style={[styles.statCard, styles.featuredCard]}>
          <View style={styles.iconCircle}>
            <Ionicons name="flame" size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.featuredStatNumber}>{stats.current_streak}</Text>
          <Text style={styles.featuredStatLabel}>Current Streak</Text>
          <Text style={styles.statDescription}>
            {stats.current_streak === 0
              ? 'Start your streak today!'
              : stats.current_streak === 1
              ? 'Keep it going!'
              : 'Amazing progress!'}
          </Text>
        </View>

        {/* Best Streak */}
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Ionicons name="trophy" size={32} color="#6B7C70" />
          </View>
          <Text style={styles.statNumber}>{stats.best_streak}</Text>
          <Text style={styles.statLabel}>Best Streak</Text>
        </View>

        {/* Total Completions */}
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Ionicons name="checkmark-circle" size={32} color="#6B7C70" />
          </View>
          <Text style={styles.statNumber}>{stats.total_completions}</Text>
          <Text style={styles.statLabel}>Total Days</Text>
        </View>

        {/* Today Status */}
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Ionicons
              name={stats.today_completed ? 'calendar-sharp' : 'calendar-outline'}
              size={32}
              color="#6B7C70"
            />
          </View>
          <Text style={styles.statNumber}>
            {stats.today_completed ? '✓' : '—'}
          </Text>
          <Text style={styles.statLabel}>Today's Status</Text>
        </View>
      </View>

      {/* Motivational Message */}
      <View style={styles.messageCard}>
        <Text style={styles.messageText}>
          {stats.current_streak >= 7
            ? '🎉 You\'re on fire! Keep the momentum going!'
            : stats.current_streak >= 3
            ? '💪 Great job! You\'re building a solid habit!'
            : stats.current_streak >= 1
            ? '🌟 Nice start! Keep showing up every day!'
            : '🚀 Ready to start your streak? Complete today\'s goal!'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3F0',
  },
  loadingText: {
    fontSize: 18,
    color: '#6B7C70',
    textAlign: 'center',
    marginTop: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C3E30',
    letterSpacing: -0.5,
  },
  placeholder: {
    width: 44,
  },
  statsContainer: {
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#6B7C70',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  featuredCard: {
    backgroundColor: '#6B7C70',
    paddingVertical: 40,
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statHeader: {
    marginBottom: 12,
  },
  featuredStatNumber: {
    fontSize: 64,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  featuredStatLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  statDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  statNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: '#2C3E30',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7C70',
  },
  messageCard: {
    marginHorizontal: 24,
    marginBottom: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#6B7C70',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  messageText: {
    fontSize: 16,
    color: '#2C3E30',
    textAlign: 'center',
    lineHeight: 24,
  },
});
