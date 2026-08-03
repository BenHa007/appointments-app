import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

export default function SetWorkHoursScreen() {
  const navigation = useNavigation();
  const [hours, setHours] = useState({
    Sunday: { open: '', close: '' },
    Monday: { open: '', close: '' },
    Tuesday: { open: '', close: '' },
    Wednesday: { open: '', close: '' },
    Thursday: { open: '', close: '' },
    Friday: { open: '', close: '' },
    Saturday: {open: '', close: ''}
  });

  useEffect(() => {
    const fetchHours = async () => {
      try {
        const res = await API.get('/api/work-hours');
        const workHours = res.data;

        const mappedHours = {};
        workHours.forEach(({ day, open, close }) => {
          mappedHours[day] = { open, close };
        });

        setHours(prev => ({ ...prev, ...mappedHours }));
      } catch (error) {
        console.error('Error fetching work hours:', error);
      }
    };

    fetchHours();
  }, []);

  const hourOptions = [
    '08:00', '08:30', '09:00', '09:30', '10:00',
    '10:30', '11:00', '11:30', '12:00', '12:30',
    '13:00', '13:30', '14:00', '14:30', '15:00',
    '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00',
  ];

  const handleChange = (day, type, value) => {
    setHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      await API.post('/api/work-hours', { hours });
      console.log('Saved hours:', hours);
      alert('Work hours saved successfully');
    } catch (error) {
      console.error('Error saving work hours:', error);
      alert('Failed to save work hours');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#e85d04" />
        <Text style={styles.backText}></Text>
      </TouchableOpacity>
      <Text style={styles.title}>Set Work Hours</Text>
      <Text style={styles.subtitle}>Set opening and closing hours for each day:</Text>

      {Object.entries(hours).map(([day, time]) => (
        <View key={day} style={styles.dayContainer}>
          <Text style={styles.dayTitle}>{day}</Text>
          <View style={styles.inputRow}>
            <Picker
              selectedValue={time.open}
              onValueChange={(itemValue) => handleChange(day, 'open', itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select open" value="" />
              {hourOptions.map(hour => (
                <Picker.Item key={hour} label={hour} value={hour} />
              ))}
            </Picker>
            <Picker
              selectedValue={time.close}
              onValueChange={(itemValue) => handleChange(day, 'close', itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select close" value="" />
              {hourOptions.map(hour => (
                <Picker.Item key={hour} label={hour} value={hour} />
              ))}
            </Picker>
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Work Hours</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#fff7ed',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 10,
  },
  backText: {
    color: '#e85d04',
    fontSize: 16,
    marginLeft: 5,
  },
  dayContainer: {
    marginBottom: 15,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  picker: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#e85d04',
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
    marginBottom: 40,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});