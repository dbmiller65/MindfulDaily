// Test script to verify enhanced tracking features
import storage from './src/utils/storage.js';

const testEnhancedFeatures = async () => {
  console.log('Testing Enhanced Activity Tracking Features...\n');

  // Test saving activities with enhanced data
  const testActivities = [
    {
      id: 'exercise',
      name: 'Exercise',
      icon: 'run',
      completed: true,
      duration: 45,
      type: 'Run',
      intensity: 'Vigorous'
    },
    {
      id: 'meditation',
      name: 'Meditation',
      icon: 'meditation',
      completed: true,
      hasTimer: true,
      targetDuration: 10,
      actualDuration: 15
    },
    {
      id: 'gratitude',
      name: 'Gratitude',
      icon: 'heart',
      completed: true,
      entries: ['Family health', 'Good weather', 'Productive day']
    },
    {
      id: 'outdoors',
      name: 'Outdoor Time',
      icon: 'tree',
      completed: true,
      duration: 30,
      activity: 'Hike'
    },
    {
      id: 'sleep',
      name: 'Sleep',
      icon: 'sleep',
      completed: true,
      bedtime: '22:30',
      waketime: '06:30',
      quality: 8,
      hours: 8
    }
  ];

  // Save test activities
  console.log('1. Saving enhanced activities...');
  const saved = await storage.saveTodayActivities(testActivities);
  console.log('   Saved:', saved ? '✓' : '✗');

  // Retrieve activities
  console.log('\n2. Retrieving today\'s activities...');
  const retrieved = await storage.getTodayActivities();
  if (retrieved) {
    console.log('   Retrieved', retrieved.length, 'activities');
    retrieved.forEach(activity => {
      console.log(`   - ${activity.name}: ${activity.completed ? '✓' : '✗'}`);
      if (activity.id === 'exercise' && activity.completed) {
        console.log(`     ${activity.type} • ${activity.duration} min • ${activity.intensity}`);
      }
      if (activity.id === 'sleep' && activity.completed) {
        console.log(`     ${activity.hours}h • Quality: ${activity.quality}/10`);
      }
      if (activity.id === 'gratitude' && activity.completed) {
        console.log(`     ${activity.entries.length} entries`);
      }
    });
  }

  // Test mood tracking
  console.log('\n3. Testing mood tracking...');
  const moodSaved = await storage.saveDailyMood(7);
  console.log('   Mood saved:', moodSaved ? '✓' : '✗');
  
  const mood = await storage.getTodayMood();
  if (mood) {
    console.log('   Today\'s mood:', mood.mood, '/10');
  }

  // Test streak calculation
  console.log('\n4. Testing streak tracking...');
  const streakResult = await storage.updateStreaks();
  if (streakResult) {
    console.log('   Current streak:', streakResult.currentStreak);
    console.log('   Best streak:', streakResult.bestStreak);
  }

  // Test weekly summary
  console.log('\n5. Testing weekly summary with enhanced data...');
  const summary = await storage.getWeeklySummary();
  if (summary) {
    console.log('   Completion rate:', summary.completionRate + '%');
    console.log('   Average exercise:', summary.averageExercise, 'min/day');
    console.log('   Average sleep:', summary.averageSleep, 'hours/night');
    console.log('   Average mood:', summary.averageMood, '/10');
    console.log('   Total exercise this week:', summary.totalExerciseMinutes, 'minutes');
    console.log('   Total meditation this week:', summary.totalMeditationMinutes, 'minutes');
  }

  console.log('\n✅ Enhanced features test complete!');
};

// Run the test
testEnhancedFeatures().catch(console.error);
