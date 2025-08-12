import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper to get today's date key
const getTodayKey = () => {
  return new Date().toISOString().split('T')[0];
};

const storage = {
  // Save today's activities with enhanced data
  saveTodayActivities: async (activities) => {
    try {
      const key = `activities_${getTodayKey()}`;
      await AsyncStorage.setItem(key, JSON.stringify(activities));
      return true;
    } catch (error) {
      console.error('Error saving activities:', error);
      return false;
    }
  },

  // Get today's activities
  getTodayActivities: async () => {
    try {
      const key = `activities_${getTodayKey()}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting activities:', error);
      return null;
    }
  },

  // Save daily mood
  saveDailyMood: async (mood) => {
    try {
      const key = `mood_${getTodayKey()}`;
      await AsyncStorage.setItem(key, JSON.stringify({ mood, timestamp: new Date().toISOString() }));
      return true;
    } catch (error) {
      console.error('Error saving mood:', error);
      return false;
    }
  },

  // Get today's mood
  getTodayMood: async () => {
    try {
      const key = `mood_${getTodayKey()}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting mood:', error);
      return null;
    }
  },

  // Update streaks
  updateStreaks: async () => {
    try {
      const activities = await storage.getTodayActivities();
      if (!activities) return;

      const allCompleted = activities.every(a => a.completed);
      if (!allCompleted) return;

      const streakData = await storage.getStreakData();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = yesterday.toISOString().split('T')[0];
      const yesterdayActivities = await storage.getActivitiesForDate(yesterday);
      
      let newCurrentStreak = 1;
      if (yesterdayActivities && yesterdayActivities.every(a => a.completed)) {
        newCurrentStreak = streakData.currentStreak + 1;
      }

      const newBestStreak = Math.max(newCurrentStreak, streakData.bestStreak);

      await AsyncStorage.setItem('streakData', JSON.stringify({
        currentStreak: newCurrentStreak,
        bestStreak: newBestStreak,
        lastCompletedDate: getTodayKey(),
      }));

      return { currentStreak: newCurrentStreak, bestStreak: newBestStreak };
    } catch (error) {
      console.error('Error updating streaks:', error);
      return null;
    }
  },

  // Get streak data
  getStreakData: async () => {
    try {
      const data = await AsyncStorage.getItem('streakData');
      return data ? JSON.parse(data) : { currentStreak: 0, bestStreak: 0 };
    } catch (error) {
      console.error('Error getting streak data:', error);
      return { currentStreak: 0, bestStreak: 0 };
    }
  },

  // Get activities for a specific date
  getActivitiesForDate: async (date) => {
    try {
      const key = `activities_${date.toISOString().split('T')[0]}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting activities for date:', error);
      return null;
    }
  },

  // Get settings
  getSettings: async () => {
    try {
      const data = await AsyncStorage.getItem('settings');
      return data ? JSON.parse(data) : {
        notificationTime: '09:00',
        notificationsEnabled: true,
        theme: 'light',
      };
    } catch (error) {
      console.error('Error getting settings:', error);
      return {
        notificationTime: '09:00',
        notificationsEnabled: true,
        theme: 'light',
      };
    }
  },

  // Save settings
  saveSettings: async (settings) => {
    try {
      await AsyncStorage.setItem('settings', JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  },

  // Get weekly summary with enhanced data
  getWeeklySummary: async () => {
    try {
      const summary = {
        days: [],
        completionRate: 0,
        totalActivities: 0,
        completedActivities: 0,
        averageExercise: 0,
        averageSleep: 0,
        averageMood: 0,
        totalExerciseMinutes: 0,
        totalMeditationMinutes: 0,
      };

      let exerciseDays = 0;
      let sleepDays = 0;
      let moodDays = 0;
      let totalSleepHours = 0;
      let totalMood = 0;

      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const activities = await storage.getActivitiesForDate(date);
        const mood = await AsyncStorage.getItem(`mood_${date.toISOString().split('T')[0]}`);
        
        if (activities) {
          const completed = activities.filter(a => a.completed).length;
          
          // Track exercise minutes
          const exercise = activities.find(a => a.id === 'exercise');
          if (exercise && exercise.completed && exercise.duration) {
            summary.totalExerciseMinutes += exercise.duration;
            exerciseDays++;
          }

          // Track meditation minutes
          const meditation = activities.find(a => a.id === 'meditation');
          if (meditation && meditation.completed) {
            summary.totalMeditationMinutes += meditation.actualDuration || meditation.targetDuration || 10;
          }

          // Track sleep hours
          const sleep = activities.find(a => a.id === 'sleep');
          if (sleep && sleep.completed && sleep.hours) {
            totalSleepHours += parseFloat(sleep.hours);
            sleepDays++;
          }

          summary.days.push({
            date: date.toISOString().split('T')[0],
            dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
            completed,
            total: activities.length,
            allCompleted: completed === activities.length,
            exercise: exercise?.duration || 0,
            sleep: sleep?.hours || 0,
          });
          summary.totalActivities += activities.length;
          summary.completedActivities += completed;
        }

        // Track mood
        if (mood) {
          const moodData = JSON.parse(mood);
          totalMood += moodData.mood;
          moodDays++;
        }
      }

      summary.completionRate = summary.totalActivities > 0 
        ? Math.round((summary.completedActivities / summary.totalActivities) * 100)
        : 0;

      summary.averageExercise = exerciseDays > 0 
        ? Math.round(summary.totalExerciseMinutes / exerciseDays)
        : 0;

      summary.averageSleep = sleepDays > 0
        ? (totalSleepHours / sleepDays).toFixed(1)
        : 0;

      summary.averageMood = moodDays > 0
        ? (totalMood / moodDays).toFixed(1)
        : 0;

      return summary;
    } catch (error) {
      console.error('Error getting weekly summary:', error);
      return null;
    }
  },

  // Clear all data
  clearAllData: async () => {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  },
};

export default storage;
