import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const { width } = Dimensions.get('window');

interface HistoryData {
  dates: string[];
  total: number;
}

export default function History() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryData>({ dates: [], total: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/history`);
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    if (dateOnly.getTime() === today.getTime()) {
      return 'Today';
    } else if (dateOnly.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    }

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    };
    return date.toLocaleDateString('en-US', options);
  };

  const getDayOfWeek = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={28} color="#2C3E30" />
        </TouchableOpacity>
        <Text style={styles.title}>History</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryIconContainer}>
          <Ionicons name="calendar" size={32} color="#6B7C70" />
        </View>
        <Text style={styles.summaryNumber}>{history.total}</Text>
        <Text style={styles.summaryLabel}>
          {history.total === 1 ? 'Day Completed' : 'Days Completed'}
        </Text>
      </View>

      {/* History List */}
      <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
        {history.dates.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#C5CFC9" />
            <Text style={styles.emptyText}>No completions yet</Text>
            <Text style={styles.emptySubtext}>Start your streak today!</Text>
          </View>
        ) : (
          history.dates.map((date, index) => (
            <View key={date} style={styles.historyItem}>
              <View style={styles.checkmarkContainer}>
                <Ionicons name="checkmark-circle" size={32} color="#6B7C70" />
              </View>
              <View style={styles.dateInfo}>
                <Text style={styles.dateText}>{formatDate(date)}</Text>
                <Text style={styles.dayText}>{getDayOfWeek(date)}</Text>
              </View>
              <View style={styles.streakIndicator}>
                {index === 0 && (
                  <View style={styles.recentBadge}>
                    <Text style={styles.recentBadgeText}>Latest</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
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
  summaryCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#6B7C70',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  summaryIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F5F3F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: '#2C3E30',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7C70',
  },
  historyList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#6B7C70',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  checkmarkContainer: {
    marginRight: 16,
  },
  dateInfo: {
    flex: 1,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E30',
    marginBottom: 4,
  },
  dayText: {
    fontSize: 14,
    color: '#6B7C70',
  },
  streakIndicator: {
    minWidth: 60,
    alignItems: 'flex-end',
  },
  recentBadge: {
    backgroundColor: '#6B7C70',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  recentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6B7C70',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#A0ADA4',
  },
  bottomPadding: {
    height: 40,
  },
});
