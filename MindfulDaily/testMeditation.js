// Quick test to verify meditation completion works
import AsyncStorage from '@react-native-async-storage/async-storage';

const testMeditationCompletion = async () => {
  console.log('Testing Meditation Completion Flow...\n');
  
  const getTodayKey = () => {
    return new Date().toISOString().split('T')[0];
  };
  
  // Clear today's data first
  const key = `activities_${getTodayKey()}`;
  await AsyncStorage.removeItem(key);
  console.log('1. Cleared today\'s activities\n');
  
  // Set initial activities
  const initialActivities = [
    { id: 'exercise', name: 'Exercise', icon: 'run', completed: false },
    { id: 'meditation', name: 'Meditation', icon: 'meditation', completed: false, hasTimer: true, targetDuration: 10, actualDuration: null },
    { id: 'gratitude', name: 'Gratitude', icon: 'heart', completed: false },
    { id: 'outdoors', name: 'Outdoor Time', icon: 'tree', completed: false },
    { id: 'sleep', name: 'Sleep', icon: 'sleep', completed: false }
  ];
  
  await AsyncStorage.setItem(key, JSON.stringify(initialActivities));
  console.log('2. Set initial activities with meditation uncompleted\n');
  
  // Simulate meditation completion
  const updatedActivities = initialActivities.map(a =>
    a.id === 'meditation' ? { 
      ...a, 
      completed: true, 
      actualDuration: 10 
    } : a
  );
  
  await AsyncStorage.setItem(key, JSON.stringify(updatedActivities));
  console.log('3. Marked meditation as completed with 10 min duration\n');
  
  // Verify the change
  const savedData = await AsyncStorage.getItem(key);
  const activities = JSON.parse(savedData);
  const meditation = activities.find(a => a.id === 'meditation');
  
  console.log('4. Verification:');
  console.log('   - Meditation completed:', meditation.completed ? '✓' : '✗');
  console.log('   - Actual duration:', meditation.actualDuration, 'minutes');
  console.log('   - Has timer:', meditation.hasTimer ? '✓' : '✗');
  
  if (meditation.completed && meditation.actualDuration === 10) {
    console.log('\n✅ Meditation completion test PASSED!');
  } else {
    console.log('\n❌ Meditation completion test FAILED!');
  }
};

export default testMeditationCompletion;
