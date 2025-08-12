import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import storage from '../utils/storageEnhanced';

const SettingsScreen = ({ navigation }) => {
  const [settings, setSettings] = useState({
    notificationTime: '09:00',
    notificationsEnabled: true,
    theme: 'light',
  });
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const savedSettings = await storage.getSettings();
    setSettings(savedSettings);
  };

  const handleNotificationToggle = async (value) => {
    const newSettings = { ...settings, notificationsEnabled: value };
    setSettings(newSettings);
    await storage.saveSettings(newSettings);

    if (value) {
      await scheduleNotifications(newSettings.notificationTime);
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  };

  const handleTimeChange = async (event, selectedDate) => {
    setShowTimePicker(false);
    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;
      
      const newSettings = { ...settings, notificationTime: timeString };
      setSettings(newSettings);
      await storage.saveSettings(newSettings);
      
      if (settings.notificationsEnabled) {
        await scheduleNotifications(timeString);
      }
    }
  };

  const scheduleNotifications = async (timeString) => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    const [hours, minutes] = timeString.split(':').map(Number);
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Time for your daily wellness check-in! 🌟",
        body: "Take a few minutes to complete your activities and maintain your streak.",
        sound: true,
      },
      trigger: {
        hour: hours,
        minute: minutes,
        repeats: true,
      },
    });
  };

  const resetAllData = () => {
    Alert.alert(
      'Reset All Data',
      'This will delete all your progress, streaks, and settings. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            // Clear all storage
            await storage.clearAllData();
            Alert.alert('Data Reset', 'All data has been cleared.');
            navigation.navigate('Home');
          },
        },
      ]
    );
  };

  const getTimeDisplay = () => {
    const [hours, minutes] = settings.notificationTime.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons name="bell-outline" size={24} color="#666" />
              <Text style={styles.settingLabel}>Daily Reminder</Text>
            </View>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: '#E0E0E0', true: '#81C784' }}
              thumbColor={settings.notificationsEnabled ? '#4CAF50' : '#F5F5F5'}
            />
          </View>

          {settings.notificationsEnabled && (
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => setShowTimePicker(true)}
            >
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons name="clock-outline" size={24} color="#666" />
                <Text style={styles.settingLabel}>Reminder Time</Text>
              </View>
              <View style={styles.timeDisplay}>
                <Text style={styles.timeText}>{getTimeDisplay()}</Text>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#999" />
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0 (MVP)</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Developer</Text>
            <Text style={styles.infoValue}>MindfulDaily Team</Text>
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity style={styles.supportButton}>
            <MaterialCommunityIcons name="help-circle-outline" size={24} color="#666" />
            <Text style={styles.supportText}>Help & FAQ</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.supportButton}>
            <MaterialCommunityIcons name="star-outline" size={24} color="#666" />
            <Text style={styles.supportText}>Rate App</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.supportButton}>
            <MaterialCommunityIcons name="email-outline" size={24} color="#666" />
            <Text style={styles.supportText}>Contact Us</Text>
          </TouchableOpacity>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <TouchableOpacity style={styles.supportButton}>
            <MaterialCommunityIcons name="export" size={24} color="#666" />
            <Text style={styles.supportText}>Export Data</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.supportButton, styles.dangerButton]}
            onPress={resetAllData}
          >
            <MaterialCommunityIcons name="delete-outline" size={24} color="#F44336" />
            <Text style={[styles.supportText, styles.dangerText]}>Reset All Data</Text>
          </TouchableOpacity>
        </View>

        {/* Motivational Message */}
        <View style={styles.motivationalCard}>
          <Text style={styles.motivationalText}>
            🌱 Remember: Small daily improvements lead to stunning results
          </Text>
        </View>
      </ScrollView>

      {showTimePicker && (
        <DateTimePicker
          value={(() => {
            const [hours, minutes] = settings.notificationTime.split(':');
            const date = new Date();
            date.setHours(parseInt(hours));
            date.setMinutes(parseInt(minutes));
            return date;
          })()}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={handleTimeChange}
        />
      )}
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
  },
  section: {
    backgroundColor: '#FFF',
    marginTop: 20,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    color: '#4CAF50',
    marginRight: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: '#333',
  },
  infoValue: {
    fontSize: 16,
    color: '#666',
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  supportText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  dangerButton: {
    marginTop: 8,
  },
  dangerText: {
    color: '#F44336',
  },
  motivationalCard: {
    backgroundColor: '#E8F5E9',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  motivationalText: {
    fontSize: 14,
    color: '#2E7D32',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default SettingsScreen;
