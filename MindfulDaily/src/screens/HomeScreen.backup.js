import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import storage from '../utils/storage';
import { format } from 'date-fns';

const HomeScreen = ({ navigation }) => {
  const [activities, setActivities] = useState([
    { 
      id: 'exercise', 
      name: 'Exercise', 
      icon: 'run', 
      completed: false, 
      streak: 0,
      requiresDetails: true,
      duration: null,
      type: null,
      intensity: null
    },
    { 
      id: 'meditation', 
      name: 'Meditation', 
      icon: 'meditation', 
      completed: false, 
      hasTimer: true, 
      duration: 10,
      actualDuration: null 
    },
    { 
      id: 'gratitude', 
      name: 'Gratitude', 
      icon: 'heart', 
      completed: false, 
      requiresInput: true,
      entries: [] 
    },
    { 
      id: 'outdoors', 
      name: 'Outdoor Time', 
      icon: 'tree', 
      completed: false,
      requiresDetails: true,
      duration: null,
      activity: null 
    },
    { 
      id: 'sleep', 
      name: 'Sleep', 
      icon: 'sleep', 
      completed: false, 
      requiresTimeInput: true,
      bedtime: null,
      waketime: null,
      quality: null 
    },
  ]);
  const [refreshing, setRefreshing] = useState(false);
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    bestStreak: 0,
  });
  const [gratitudeModal, setGratitudeModal] = useState(false);
  const [gratitudeText, setGratitudeText] = useState('');
  const [sleepModal, setSleepModal] = useState(false);
  const [bedtime, setBedtime] = useState('');
  const [waketime, setWaketime] = useState('');
  const [sleepQuality, setSleepQuality] = useState(5);
  const [exerciseModal, setExerciseModal] = useState(false);
  const [exerciseDuration, setExerciseDuration] = useState('');
  const [exerciseType, setExerciseType] = useState('');
  const [exerciseIntensity, setExerciseIntensity] = useState('');
  const [outdoorsModal, setOutdoorsModal] = useState(false);
  const [outdoorsDuration, setOutdoorsDuration] = useState('');
  const [outdoorsActivity, setOutdoorsActivity] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const todayActivities = await storage.getTodayActivities();
    setActivities(todayActivities);
    
    const streaks = await storage.getStreakData();
    setStreakData(streaks);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const toggleActivity = async (activityId) => {
    const activity = activities.find(a => a.id === activityId);
    
    // Handle special cases
    if (activity.id === 'exercise' && !activity.completed) {
      setExerciseModal(true);
      return;
    }
    
    if (activity.id === 'outdoors' && !activity.completed) {
      setOutdoorsModal(true);
      return;
    }
    
    if (activity.requiresInput && !activity.completed) {
      setGratitudeModal(true);
      return;
    }
    
    if (activity.requiresTimeInput && !activity.completed) {
      setSleepModal(true);
      return;
    }
    
    if (activity.hasTimer && !activity.completed) {
      navigation.navigate('Timer', { activity });
      return;
    }
    
    // Toggle regular activity
    const updatedActivities = activities.map(a =>
      a.id === activityId ? { ...a, completed: !a.completed } : a
    );
    
    setActivities(updatedActivities);
    await storage.saveTodayActivities(updatedActivities);
    
    // Check if all activities are completed
    const allCompleted = updatedActivities.every(a => a.completed);
    if (allCompleted) {
      await storage.updateStreaks();
      const streaks = await storage.getStreakData();
      setStreakData(streaks);
      Alert.alert('🎉 Congratulations!', 'You\'ve completed all activities for today!');
    }
  };

  const saveGratitude = async () => {
    if (gratitudeText.trim()) {
      const entries = gratitudeText.split('\n').filter(e => e.trim());
      const updatedActivities = activities.map(a => 
        a.id === 'gratitude' ? { ...a, completed: true, entries, data: gratitudeText } : a
      );
      setActivities(updatedActivities);
      await storage.saveTodayActivities(updatedActivities);
      await updateStreaks();
      setGratitudeModal(false);
      setGratitudeText('');
    } else {
      Alert.alert('Please fill in all 3 gratitude items');
    }
  };

  const saveExercise = async () => {
    const updatedActivities = activities.map(a => 
      a.id === 'exercise' ? { 
        ...a, 
        completed: true, 
        duration: parseInt(exerciseDuration),
        type: exerciseType,
        intensity: exerciseIntensity 
      } : a
    );
    setActivities(updatedActivities);
    await storage.saveTodayActivities(updatedActivities);
    await updateStreaks();
    setExerciseModal(false);
  };

  const saveOutdoors = async () => {
    const updatedActivities = activities.map(a => 
      a.id === 'outdoors' ? { 
        ...a, 
        completed: true, 
        duration: parseInt(outdoorsDuration),
        activity: outdoorsActivity 
      } : a
    );
    setActivities(updatedActivities);
    await storage.saveTodayActivities(updatedActivities);
    await updateStreaks();
    setOutdoorsModal(false);
  };

  const saveSleep = async () => {
    if (bedtime && waketime) {
      const updatedActivities = activities.map(a => 
        a.id === 'sleep' ? { ...a, completed: true, bedtime, waketime, quality: sleepQuality } : a
      );
      setActivities(updatedActivities);
      await storage.saveTodayActivities(updatedActivities);
      await updateStreaks();
      setSleepModal(false);
      setBedtime('');
      setWaketime('');
      setSleepQuality(5);
    } else {
      Alert.alert('Please enter both bedtime and wake time');
    }
  };

  const completedCount = activities.filter(a => a.completed).length;
  const completionPercentage = activities.length > 0 
    ? Math.round((completedCount / activities.length) * 100)
    : 0;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.dateText}>{format(new Date(), 'EEEE, MMMM d')}</Text>
          <Text style={styles.greeting}>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}! 👋</Text>
        </View>

        {/* Streak Card */}
        <View style={styles.streakCard}>
          <View style={styles.streakItem}>
            <MaterialCommunityIcons name="fire" size={32} color="#FF6B6B" />
            <Text style={styles.streakNumber}>{streakData.currentStreak}</Text>
            <Text style={styles.streakLabel}>Current Streak</Text>
          </View>
          <View style={styles.streakDivider} />
          <View style={styles.streakItem}>
            <MaterialCommunityIcons name="trophy" size={32} color="#FFD93D" />
            <Text style={styles.streakNumber}>{streakData.bestStreak}</Text>
            <Text style={styles.streakLabel}>Best Streak</Text>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Today's Progress</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${completionPercentage}%` }]} />
          </View>
          <Text style={styles.progressText}>{completedCount} of {activities.length} completed</Text>
        </View>

        {/* Activities */}
        <Text style={styles.sectionTitle}>Daily Activities</Text>
        {activities.map((activity) => (
          <TouchableOpacity
            key={activity.id}
            style={[styles.activityCard, activity.completed && styles.activityCompleted]}
            onPress={() => toggleActivity(activity.id)}
          >
            <View style={styles.activityLeft}>
              <MaterialCommunityIcons
                name={activity.icon}
                size={28}
                color={activity.completed ? '#4CAF50' : '#666'}
              />
              <View style={styles.activityInfo}>
                <Text style={[styles.activityName, activity.completed && styles.activityNameCompleted]}>
                  {activity.name}
                </Text>
                <Text style={styles.activityDescription}>{activity.description}</Text>
              </View>
            </View>
            <MaterialCommunityIcons
              name={activity.completed ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
              size={28}
              color={activity.completed ? '#4CAF50' : '#CCC'}
            />
          </TouchableOpacity>
        ))}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Summary')}
          >
            <MaterialCommunityIcons name="chart-line" size={24} color="#666" />
            <Text style={styles.actionText}>Weekly Summary</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <MaterialCommunityIcons name="cog" size={24} color="#666" />
            <Text style={styles.actionText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Gratitude Modal */}
      <Modal
        visible={gratitudeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setGratitudeModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>What are you grateful for today?</Text>
            {gratitudeItems.map((item, index) => (
              <TextInput
                key={index}
                style={styles.gratitudeInput}
                placeholder={`Gratitude ${index + 1}`}
                value={item}
                onChangeText={(text) => {
                  const newItems = [...gratitudeItems];
                  newItems[index] = text;
                  setGratitudeItems(newItems);
                }}
              />
            ))}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setGratitudeModal(false);
                  setGratitudeItems(['', '', '']);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveGratitude}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Sleep Modal */}
      <Modal
        visible={sleepModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSleepModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Track Your Sleep</Text>
            <TextInput
              style={styles.gratitudeInput}
              placeholder="Bedtime (e.g., 10:30 PM)"
              value={bedtime}
              onChangeText={setBedtime}
            />
            <TextInput
              style={styles.gratitudeInput}
              placeholder="Wake time (e.g., 6:30 AM)"
              value={wakeTime}
              onChangeText={setWakeTime}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setSleepModal(false);
                  setBedtime('');
                  setWakeTime('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveSleep}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  streakCard: {
    flexDirection: 'row',
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
  streakItem: {
    flex: 1,
    alignItems: 'center',
  },
  streakDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 20,
  },
  streakNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  streakLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  progressCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityCompleted: {
    backgroundColor: '#F0FFF4',
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityInfo: {
    marginLeft: 12,
    flex: 1,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  activityNameCompleted: {
    color: '#4CAF50',
  },
  activityDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  actionButton: {
    alignItems: 'center',
    padding: 12,
  },
  actionText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  gratitudeInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    marginLeft: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
});

export default HomeScreen;
