import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView, StyleSheet } from 'react-native';
import * as storage from '../utils/storageEnhanced';

export default function DebugScreen() {
  const [activities, setActivities] = useState([]);
  const [rawData, setRawData] = useState('');

  const loadActivities = async () => {
    const data = await storage.getTodayActivities();
    setActivities(data);
    setRawData(JSON.stringify(data, null, 2));
  };

  const testMeditationComplete = async () => {
    const current = await storage.getTodayActivities();
    const updated = current.map(a => 
      a.id === 'meditation' ? { ...a, completed: true, actualDuration: 10 } : a
    );
    await storage.saveTodayActivities(updated);
    await loadActivities();
  };

  const testGratitudeComplete = async () => {
    const current = await storage.getTodayActivities();
    const updated = current.map(a => 
      a.id === 'gratitude' ? { ...a, completed: true, items: 3 } : a
    );
    await storage.saveTodayActivities(updated);
    await loadActivities();
  };

  const testOutdoorComplete = async () => {
    const current = await storage.getTodayActivities();
    const updated = current.map(a => 
      a.id === 'outdoor' ? { ...a, completed: true, actualDuration: 30, activity: 'Walk' } : a
    );
    await storage.saveTodayActivities(updated);
    await loadActivities();
  };

  const clearAll = async () => {
    const current = await storage.getTodayActivities();
    const updated = current.map(a => ({ ...a, completed: false }));
    await storage.saveTodayActivities(updated);
    await loadActivities();
  };

  useEffect(() => {
    loadActivities();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Debug Storage Test</Text>
      
      <View style={styles.buttonRow}>
        <Button title="Reload" onPress={loadActivities} />
        <Button title="Clear All" onPress={clearAll} />
      </View>

      <View style={styles.buttonRow}>
        <Button title="Complete Meditation" onPress={testMeditationComplete} />
        <Button title="Complete Gratitude" onPress={testGratitudeComplete} />
        <Button title="Complete Outdoor" onPress={testOutdoorComplete} />
      </View>

      <Text style={styles.subtitle}>Current Activities:</Text>
      {activities.map(a => (
        <View key={a.id} style={styles.activity}>
          <Text>{a.id}: {a.completed ? '✅' : '⭕'}</Text>
          {a.completed && (
            <Text style={styles.details}>
              {a.actualDuration && `Duration: ${a.actualDuration}`}
              {a.items && `Items: ${a.items}`}
              {a.activity && `Activity: ${a.activity}`}
            </Text>
          )}
        </View>
      ))}

      <Text style={styles.subtitle}>Raw Data:</Text>
      <Text style={styles.raw}>{rawData}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  subtitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 },
  activity: { padding: 10, backgroundColor: 'white', marginVertical: 5, borderRadius: 5 },
  details: { fontSize: 12, color: '#666', marginTop: 5 },
  raw: { fontSize: 10, fontFamily: 'monospace', backgroundColor: 'white', padding: 10 }
});
