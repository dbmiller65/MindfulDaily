import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Vibration,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import storage from '../utils/storageEnhanced';

const TimerScreen = ({ route, navigation }) => {
  const { activity } = route.params;
  const duration = activity.targetDuration || activity.duration || 10; // Use targetDuration for meditation
  const [timeLeft, setTimeLeft] = useState(duration * 60); // Convert minutes to seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const intervalRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            Vibration.vibrate([500, 200, 500]);
            completeActivity();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

  useEffect(() => {
    // Breathing animation
    if (isRunning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRunning]);

  const completeActivity = async () => {
    console.log('=== Timer completeActivity called ===');
    
    // Get current activities from storage
    const activities = await storage.getTodayActivities();
    console.log('Activities from storage:', JSON.stringify(activities, null, 2));
    
    // Update meditation with completion and actual duration
    const actualMinutes = Math.floor((duration * 60 - timeLeft) / 60);
    console.log('Actual minutes:', actualMinutes);
    
    const updatedActivities = activities.map(a =>
      a.id === 'meditation' ? { 
        ...a, 
        completed: true, 
        actualDuration: actualMinutes > 0 ? actualMinutes : duration 
      } : a
    );
    console.log('Updated activities:', JSON.stringify(updatedActivities, null, 2));
    
    await storage.saveTodayActivities(updatedActivities);
    console.log('Activities saved to storage');
    
    // Update streaks
    await storage.updateStreaks();
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setTimeLeft(duration * 60);
    setIsRunning(false);
    setIsCompleted(false);
  };

  const skipTimer = async () => {
    setIsCompleted(true);
    await completeActivity();
    navigation.goBack();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{activity.name}</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        {/* Breathing Circle */}
        <Animated.View
          style={[
            styles.breathingCircle,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <View style={styles.innerCircle}>
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            {isRunning && (
              <Text style={styles.breathingText}>
                {pulseAnim._value > 1.1 ? 'Breathe In' : 'Breathe Out'}
              </Text>
            )}
          </View>
        </Animated.View>

        {/* Progress Ring */}
        <View style={styles.progressRing}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        {/* Instructions */}
        {!isRunning && !isCompleted && (
          <View style={styles.instructions}>
            <Text style={styles.instructionText}>Find a comfortable position</Text>
            <Text style={styles.instructionText}>Close your eyes when ready</Text>
            <Text style={styles.instructionText}>Focus on your breath</Text>
          </View>
        )}

        {isCompleted && (
          <View style={styles.completedContainer}>
            <MaterialCommunityIcons name="check-circle" size={60} color="#4CAF50" />
            <Text style={styles.completedText}>Great job! Meditation completed</Text>
          </View>
        )}

        {/* Controls */}
        <View style={styles.controls}>
          {!isCompleted ? (
            <>
              <TouchableOpacity
                style={[styles.controlButton, styles.secondaryButton]}
                onPress={resetTimer}
              >
                <MaterialCommunityIcons name="restart" size={24} color="#666" />
                <Text style={styles.secondaryButtonText}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.controlButton, styles.primaryButton]}
                onPress={toggleTimer}
              >
                <MaterialCommunityIcons
                  name={isRunning ? 'pause' : 'play'}
                  size={32}
                  color="#FFF"
                />
                <Text style={styles.primaryButtonText}>
                  {isRunning ? 'Pause' : 'Start'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.controlButton, styles.secondaryButton]}
                onPress={skipTimer}
              >
                <MaterialCommunityIcons name="check" size={24} color="#666" />
                <Text style={styles.secondaryButtonText}>Complete</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.controlButton, styles.primaryButton, styles.doneButton]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.primaryButtonText}>Done</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  breathingCircle: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  innerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '300',
    color: '#333',
  },
  breathingText: {
    fontSize: 16,
    color: '#4CAF50',
    marginTop: 8,
  },
  progressRing: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#E0E0E0',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  instructions: {
    marginBottom: 40,
  },
  instructionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  completedContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  completedText: {
    fontSize: 18,
    color: '#4CAF50',
    marginTop: 12,
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    minWidth: 120,
  },
  secondaryButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  doneButton: {
    minWidth: 200,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
  },
});

export default TimerScreen;
