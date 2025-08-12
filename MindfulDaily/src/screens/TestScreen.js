import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';

const TestScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚨 TEST SCREEN v2.3 🚨</Text>
      <Text style={styles.subtitle}>If you see this, the app is updating!</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => Alert.alert('Test', 'Button works!')}
      >
        <Text style={styles.buttonText}>Test Alert</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, {backgroundColor: 'green'}]}
        onPress={() => console.log('Console log test')}
      >
        <Text style={styles.buttonText}>Test Console</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFE5E5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: 'black',
    marginBottom: 30,
  },
  button: {
    backgroundColor: 'blue',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TestScreen;
