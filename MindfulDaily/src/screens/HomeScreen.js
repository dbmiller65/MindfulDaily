import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  Button,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import storage from '../utils/storageEnhanced';
import { format } from 'date-fns';
import { Picker } from '@react-native-picker/picker';

const HomeScreen = ({ navigation }) => {
  const [activities, setActivities] = useState([
    { 
      id: 'exercise', 
      name: 'Exercise', 
      icon: 'run', 
      completed: false,
      type: null,
      duration: null,
      intensity: null
    },
    { 
      id: 'meditation', 
      name: 'Meditation', 
      icon: 'meditation', 
      completed: false, 
      hasTimer: true,
      duration: 10,
      targetDuration: 10,
      actualDuration: null
    },
    { 
      id: 'gratitude', 
      name: 'Gratitude Journal', 
      icon: 'heart', 
      completed: false,
      items: []
    },
    { 
      id: 'outdoor', 
      name: 'Outdoor Time', 
      icon: 'tree', 
      completed: false,
      activity: null,
      actualDuration: null
    },
    { 
      id: 'sleep', 
      name: 'Sleep Tracking', 
      icon: 'sleep', 
      completed: false,
      bedtime: null,
      waketime: null,
      quality: null,
      hours: null
    }
  ]);

  const [refreshing, setRefreshing] = useState(false);
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    bestStreak: 0,
  });

  // Modal states
  const [exerciseModal, setExerciseModal] = useState(false);
  const [gratitudeModal, setGratitudeModal] = useState(false);
  const [sleepModal, setSleepModal] = useState(false);
  const [outdoorsModal, setOutdoorsModal] = useState(false);

  // Exercise tracking
  const [exerciseDuration, setExerciseDuration] = useState('30');
  const [exerciseType, setExerciseType] = useState('Walk');
  const [exerciseIntensity, setExerciseIntensity] = useState('Moderate');

  // Gratitude tracking
  const [gratitudeText, setGratitudeText] = useState('');

  // Sleep tracking
  const [bedtime, setBedtime] = useState('');
  const [waketime, setWaketime] = useState('');
  const [sleepQuality, setSleepQuality] = useState(5);

  // Outdoor tracking
  const [outdoorMinutes, setOutdoorMinutes] = useState('');
  const [outdoorActivity, setOutdoorActivity] = useState('Walk');

  useEffect(() => {
    loadData();
    
    // Reload data when screen comes into focus (e.g., returning from Timer)
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    
    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    const todayActivities = await storage.getTodayActivities();
    if (todayActivities && todayActivities.length > 0) {
      setActivities(todayActivities);
    } else {
      // If no saved activities, create and save the default ones
      const defaultActivities = [
        { id: 'exercise', name: 'Exercise', icon: 'run', completed: false, type: null, duration: null, intensity: null },
        { id: 'meditation', name: 'Meditation', icon: 'meditation', completed: false, hasTimer: true, targetDuration: 10, actualDuration: null },
        { id: 'gratitude', name: 'Gratitude Journal', icon: 'heart', completed: false, items: 0 },
        { id: 'outdoor', name: 'Outdoor Time', icon: 'tree', completed: false, activity: null, actualDuration: null },
        { id: 'sleep', name: 'Sleep Tracking', icon: 'sleep', completed: false, bedtime: null, waketime: null, quality: null, hours: null }
      ];
      setActivities(defaultActivities);
      await storage.saveTodayActivities(defaultActivities);
    }
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
    
    // Handle unchecking completed activities first
    if (activity && activity.completed) {
      const updatedActivities = activities.map(a =>
        a.id === activityId ? { ...a, completed: false } : a
      );
      setActivities(updatedActivities);
      await storage.saveTodayActivities(updatedActivities);
      await updateStreaks(updatedActivities);
      return;
    }

    // Handle meditation with timer
    if (activityId === 'meditation') {
      navigation.navigate('Timer', { activity });
      return;
    }

    // Handle activities with modals
    if (activityId === 'outdoor') {  // Fixed: should be 'outdoor' not 'outdoors'
      setOutdoorsModal(true);
      return;
    }
    
    if (activityId === 'exercise') {
      setExerciseModal(true);
      return;
    }
    
    if (activityId === 'gratitude') {
      setGratitudeModal(true);
      return;
    }
    
    if (activityId === 'sleep') {
      setSleepModal(true);
      return;
    }

    // Default: just mark as completed (should not reach here for our 5 activities)
    const updatedActivities = activities.map(a =>
      a.id === activityId ? { ...a, completed: true } : a
    );
    setActivities(updatedActivities);
    await storage.saveTodayActivities(updatedActivities);
    await updateStreaks();
  };

  const updateStreaks = async (updatedActivities = null) => {
    // Use the updated activities if provided, otherwise use current state
    const activitiesToCheck = updatedActivities || activities;
    const allCompleted = activitiesToCheck.every(a => a.completed);
    if (allCompleted) {
      await storage.updateStreaks();
      const streaks = await storage.getStreakData();
      setStreakData(streaks);
      Alert.alert('🎉 Congratulations!', 'You\'ve completed all activities for today!');
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
    await updateStreaks(updatedActivities);
    setExerciseModal(false);
  };

  const saveGratitude = async () => {
    if (gratitudeText.trim()) {
      const entries = gratitudeText.split('\n').filter(item => item.trim());
      if (entries.length < 3) {
        Alert.alert('Please enter 3 things you\'re grateful for (one per line)');
        return;
      }
      const updatedActivities = activities.map(a => 
        a.id === 'gratitude' ? { ...a, completed: true, items: entries.length } : a
      );
      setActivities(updatedActivities);
      await storage.saveTodayActivities(updatedActivities);
      await updateStreaks(updatedActivities);
      setGratitudeModal(false);
      setGratitudeText('');
    }
  };

  const saveSleep = async () => {
    if (bedtime && waketime) {
      // Calculate sleep hours including minutes
      const [bedHour, bedMin] = bedtime.split(':').map(Number);
      const [wakeHour, wakeMin] = waketime.split(':').map(Number);
      
      // Convert to minutes since midnight
      let bedMinutes = bedHour * 60 + bedMin;
      let wakeMinutes = wakeHour * 60 + wakeMin;
      
      // If wake time is before bed time, assume next day
      if (wakeMinutes <= bedMinutes) {
        wakeMinutes += 24 * 60;
      }
      
      // Calculate difference and convert to hours
      const totalMinutes = wakeMinutes - bedMinutes;
      const hours = Math.round((totalMinutes / 60) * 10) / 10; // Round to 1 decimal

      const updatedActivities = activities.map(a => 
        a.id === 'sleep' ? { 
          ...a, 
          completed: true, 
          bedtime, 
          waketime, 
          quality: sleepQuality,
          hours: hours
        } : a
      );
      setActivities(updatedActivities);
      await storage.saveTodayActivities(updatedActivities);
      await updateStreaks(updatedActivities);
      setSleepModal(false);
      setBedtime('');
      setWaketime('');
      setSleepQuality(5);
    } else {
      Alert.alert('Please enter both bedtime and wake time');
    }
  };

  const saveOutdoor = async () => {
    const updatedActivities = activities.map(a => 
      a.id === 'outdoorTime' ? { 
        ...a, 
        completed: true,
        outdoorType: outdoorType,
        actualDuration: parseInt(outdoorMinutes) || 20
      } : a
    );
    setActivities(updatedActivities);
    await storage.saveTodayActivities(updatedActivities);
    await updateStreaks(updatedActivities);
    setOutdoorModalVisible(false);
  };

  const completedCount = activities.filter(a => a.completed).length;
// ...
  const completionPercentage = activities.length > 0 
    ? Math.round((completedCount / activities.length) * 100)
    : 0;

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Daily Activities</Text>
            <Text style={styles.date}>{format(new Date(), 'EEEE, MMM d')}</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={() => navigation.navigate('Summary')} style={styles.headerIcon}>
              <MaterialCommunityIcons name="chart-bar" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.headerIcon}>
              <MaterialCommunityIcons name="cog" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.greeting}>How are you feeling today?</Text>

        {/* Streak Section */}
        <View style={styles.streakContainer}>
          <View style={styles.streakBox}>
            <MaterialCommunityIcons name="fire" size={24} color="#FF6B6B" />
            <Text style={styles.streakNumber}>{streakData.currentStreak}</Text>
            <Text style={styles.streakLabel}>Current</Text>
          </View>
          <View style={styles.streakBox}>
            <MaterialCommunityIcons name="trophy" size={24} color="#FFD93D" />
            <Text style={styles.streakNumber}>{streakData.bestStreak}</Text>
            <Text style={styles.streakLabel}>Best</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>Today's Progress: {completedCount}/{activities.length}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${completionPercentage}%` }]} />
          </View>
          <Text style={styles.progressPercentage}>{completionPercentage}%</Text>
        </View>

        {/* Activities List */}
        <View style={styles.activitiesContainer}>
          <Text style={styles.sectionTitle}>Daily Activities</Text>
          {activities.map((activity) => (
            <TouchableOpacity
              key={activity.id}
              style={[styles.activityItem, activity.completed && styles.activityCompleted]}
              onPress={() => toggleActivity(activity.id)}
            >
              <View style={styles.activityLeft}>
                <MaterialCommunityIcons
                  name={activity.icon}
                  size={24}
                  color={activity.completed ? '#4CAF50' : '#666'}
                />
                <View style={styles.activityInfo}>
                  <Text style={[styles.activityName, activity.completed && styles.activityNameCompleted]}>
                    {activity.name}
                  </Text>
                  {activity.completed && (
                    <Text style={styles.activityDetails}>
                      {activity.id === 'exercise' && activity.type && `${activity.type} • ${activity.duration} min • ${activity.intensity}`}
                      {activity.id === 'meditation' && `${activity.actualDuration || activity.targetDuration} minutes`}
                      {activity.id === 'gratitude' && activity.items && `${activity.items} items`}
                      {activity.id === 'outdoor' && activity.activity && `${activity.activity} • ${activity.actualDuration} min`}
                      {activity.id === 'sleep' && activity.hours && `${activity.hours}h • Quality: ${activity.quality}/10`}
                    </Text>
                  )}
                </View>
              </View>
              <MaterialCommunityIcons
                name={activity.completed ? 'check-circle' : 'circle-outline'}
                size={24}
                color={activity.completed ? '#4CAF50' : '#CCC'}
              />
            </TouchableOpacity>
          ))}
        </View>



      </ScrollView>

      {/* Exercise Modal */}
      <Modal
        visible={exerciseModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setExerciseModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log Your Exercise</Text>
            
            <Text style={styles.inputLabel}>Type of Exercise</Text>
            <Picker
              selectedValue={exerciseType}
              style={styles.picker}
              onValueChange={setExerciseType}
            >
              <Picker.Item label="Walk" value="Walk" />
              <Picker.Item label="Run" value="Run" />
              <Picker.Item label="Gym" value="Gym" />
              <Picker.Item label="Yoga" value="Yoga" />
              <Picker.Item label="Sports" value="Sports" />
              <Picker.Item label="Dance" value="Dance" />
              <Picker.Item label="Other" value="Other" />
            </Picker>

            <Text style={styles.inputLabel}>Duration (minutes)</Text>
            <TextInput
              style={styles.input}
              value={exerciseDuration}
              onChangeText={setExerciseDuration}
              keyboardType="numeric"
              placeholder="30"
            />

            <Text style={styles.inputLabel}>Intensity</Text>
            <Picker
              selectedValue={exerciseIntensity}
              style={styles.picker}
              onValueChange={setExerciseIntensity}
            >
              <Picker.Item label="Light" value="Light" />
              <Picker.Item label="Moderate" value="Moderate" />
              <Picker.Item label="Vigorous" value="Vigorous" />
            </Picker>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setExerciseModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveExercise}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Gratitude Modal */}
      <Modal
        visible={gratitudeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setGratitudeModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>What are you grateful for?</Text>
            <Text style={styles.modalSubtitle}>List 3 things (one per line)</Text>
            
            <TextInput
              style={[styles.input, styles.textArea]}
              value={gratitudeText}
              onChangeText={setGratitudeText}
              multiline={true}
              numberOfLines={4}
              placeholder="1. Morning coffee&#10;2. Good health&#10;3. Family support"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setGratitudeModal(false);
                  setGratitudeText('');
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
            
            <Text style={styles.inputLabel}>Bedtime (HH:MM)</Text>
            <TextInput
              style={styles.input}
              value={bedtime}
              onChangeText={setBedtime}
              placeholder="22:30"
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Wake Time (HH:MM)</Text>
            <TextInput
              style={styles.input}
              value={waketime}
              onChangeText={setWaketime}
              placeholder="06:30"
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Sleep Quality (1-10)</Text>
            <Picker
              selectedValue={sleepQuality}
              style={styles.picker}
              onValueChange={setSleepQuality}
            >
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <Picker.Item key={n} label={n.toString()} value={n} />
              ))}
            </Picker>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setSleepModal(false);
                  setBedtime('');
                  setWaketime('');
                  setSleepQuality(5);
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

      {/* Outdoors Modal */}
      <Modal
        visible={outdoorsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setOutdoorsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log Outdoor Time</Text>
            
            <Text style={styles.inputLabel}>Activity</Text>
            <Picker
              selectedValue={outdoorActivity}
              style={styles.picker}
              onValueChange={setOutdoorActivity}
            >
              <Picker.Item label="Walk" value="Walk" />
              <Picker.Item label="Hike" value="Hike" />
              <Picker.Item label="Bike" value="Bike" />
              <Picker.Item label="Garden" value="Garden" />
              <Picker.Item label="Sit in Nature" value="Sit in Nature" />
              <Picker.Item label="Other" value="Other" />
            </Picker>

            <Text style={styles.inputLabel}>Duration (minutes)</Text>
            <TextInput
              style={styles.input}
              value={outdoorMinutes}
              onChangeText={setOutdoorMinutes}
              keyboardType="numeric"
              placeholder="20"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setOutdoorsModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveOutdoor}
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
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 15,
  },
  headerIcon: {
    padding: 5,
  },
  date: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  streakContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#FFF',
    marginTop: 10,
  },
  streakBox: {
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 5,
  },
  streakLabel: {
    fontSize: 14,
    color: '#666',
  },
  progressContainer: {
    padding: 20,
    backgroundColor: '#FFF',
    marginTop: 10,
  },
  progressText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  progressBar: {
    height: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressPercentage: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'right',
  },
  activitiesContainer: {
    padding: 20,
    backgroundColor: '#FFF',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    marginBottom: 10,
  },
  activityCompleted: {
    backgroundColor: '#E8F5E9',
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityInfo: {
    marginLeft: 15,
    flex: 1,
  },
  activityName: {
    fontSize: 16,
    color: '#333',
  },
  activityNameCompleted: {
    color: '#4CAF50',
  },
  activityDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#FFF',
    marginTop: 10,
    marginBottom: 20,
  },
  actionButton: {
    alignItems: 'center',
    padding: 10,
  },
  actionText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    marginLeft: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
