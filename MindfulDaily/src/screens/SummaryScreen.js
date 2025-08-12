import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import storage from '../utils/storageEnhanced';

const SummaryScreen = ({ navigation }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    setLoading(true);
    const weekData = await storage.getWeeklySummary();
    setSummary(weekData);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Weekly Summary</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Weekly Summary</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Overall Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>This Week's Performance</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{summary?.completionRate || 0}%</Text>
              <Text style={styles.statLabel}>Completion Rate</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{summary?.completedActivities || 0}</Text>
              <Text style={styles.statLabel}>Activities Done</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {summary?.days?.filter(d => d.allCompleted).length || 0}
              </Text>
              <Text style={styles.statLabel}>Perfect Days</Text>
            </View>
          </View>
        </View>

        {/* Daily Breakdown */}
        <Text style={styles.sectionTitle}>Daily Breakdown</Text>
        <View style={styles.weekChart}>
          {summary?.days?.map((day, index) => (
            <View key={index} style={styles.dayColumn}>
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${(day.completed / day.total) * 100}%`,
                      backgroundColor: day.allCompleted ? '#4CAF50' : '#FFC107',
                    },
                  ]}
                />
              </View>
              <Text style={styles.dayLabel}>{day.dayName}</Text>
              <Text style={styles.dayScore}>
                {day.completed}/{day.total}
              </Text>
            </View>
          ))}
        </View>

        {/* Insights */}
        <View style={styles.insightsCard}>
          <Text style={styles.insightsTitle}>
            <MaterialCommunityIcons name="lightbulb-outline" size={20} color="#FFC107" />
            {' '}Insights
          </Text>
          {summary?.completionRate >= 80 ? (
            <Text style={styles.insightText}>
              🌟 Excellent week! You're maintaining great consistency with your wellness routine.
            </Text>
          ) : summary?.completionRate >= 60 ? (
            <Text style={styles.insightText}>
              💪 Good progress! Try to complete just one more activity each day to boost your streak.
            </Text>
          ) : (
            <Text style={styles.insightText}>
              🌱 Keep going! Small steps lead to big changes. Focus on completing your top 3 activities daily.
            </Text>
          )}
          
          {summary?.days && summary.days[6] && summary.days[6].allCompleted && (
            <Text style={styles.insightText}>
              🎯 Perfect finish! You completed all activities today. Keep the momentum going!
            </Text>
          )}
        </View>

        {/* Activity Performance */}
        <Text style={styles.sectionTitle}>Activity Trends</Text>
        <View style={styles.trendsCard}>
          <View style={styles.trendItem}>
            <MaterialCommunityIcons name="run-fast" size={24} color="#4CAF50" />
            <Text style={styles.trendText}>Exercise consistency improving</Text>
          </View>
          <View style={styles.trendItem}>
            <MaterialCommunityIcons name="meditation" size={24} color="#9C27B0" />
            <Text style={styles.trendText}>Meditation streak building</Text>
          </View>
          <View style={styles.trendItem}>
            <MaterialCommunityIcons name="heart" size={24} color="#E91E63" />
            <Text style={styles.trendText}>Gratitude practice strong</Text>
          </View>
        </View>

        {/* Motivational Quote */}
        <View style={styles.quoteCard}>
          <Text style={styles.quoteText}>
            "The secret of change is to focus all of your energy not on fighting the old, but on building the new."
          </Text>
          <Text style={styles.quoteAuthor}>- Socrates</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  statsCard: {
    backgroundColor: '#FFF',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  weekChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    height: 100,
    width: 30,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },
  dayLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  dayScore: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  insightsCard: {
    backgroundColor: '#FFFBF0',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  insightText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  trendsCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  trendText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  quoteCard: {
    backgroundColor: '#F0F4FF',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  quoteText: {
    fontSize: 16,
    color: '#333',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
  },
  quoteAuthor: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
});

export default SummaryScreen;
