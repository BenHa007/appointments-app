import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { decode as atob } from 'base-64';
import API from '../../utils/api';


export default function ProfileScreen() {
  const navigation = useNavigation();

  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUser({ name: payload.name, phone: payload.phone });
          const res = await API.get('/api/appointments/my');
          setAppointments(res.data);
        }
      } catch (err) {
        console.error('Failed to load user:', err);
      }
    };
    fetchUser();
  }, []);


  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#e85d04" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.buttonText}>Log in</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSave = async () => {
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!user.name || !nameRegex.test(user.name)) {
      Alert.alert('Invalid Name', 'Please enter a valid name without numbers.');
      return;
    }

    try {
      const res = await API.put('/api/auth/user', { name: user.name, phone: user.phone });

      if (res.status === 200) {
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully. Please login again.', [
          {
            text: 'OK',
            onPress: async () => {
              await AsyncStorage.removeItem('token');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            },
          },
        ]);
      } else {
        console.error('Update failed:', res.data.message);
        Alert.alert('Error', res.data.message || 'Failed to update profile.');
      }
    } catch (err) {
      console.error('Failed to update user:', err);
      Alert.alert('Error', err?.response?.data?.message || 'Network error.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#e85d04" />
      </TouchableOpacity>
      {!isEditing && (
        <TouchableOpacity style={styles.editIcon} onPress={() => setIsEditing(true)}>
          <Ionicons name="create-outline" size={22} color="#e85d04" />
        </TouchableOpacity>
      )}
      <Text style={styles.title}>Profile</Text>

      {isEditing ? (
        <>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Name:</Text>
            <TextInput
              style={styles.input}
              value={user.name}
              onChangeText={(text) => setUser({ ...user, name: text })}
            />
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Phone:</Text>
            <TextInput
              style={styles.input}
              value={user.phone}
              keyboardType="phone-pad"
              onChangeText={(text) => setUser({ ...user, phone: text })}
            />
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelEditButton}
            onPress={() => setIsEditing(false)}
          >
            <Text style={styles.cancelEditButtonText}>Cancel</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{user.name}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>{user.phone}</Text>
          </View>

        </>
      )}

      <Text style={styles.sectionTitle}>Your Appointments:</Text>
      {appointments.map((appt) => {
        console.log('🔎 Appointment date:', appt.dateTime);
        const apptDate = new Date(appt.dateTime);
        const now = new Date();
        const canCancel = (apptDate - now) / (1000 * 60 * 60 * 24) > 1;
        return (
          <View key={appt._id} style={styles.appointmentBox}>
            <Text style={styles.appointmentText}>
              {apptDate.toLocaleDateString()} at {apptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} with {appt.manager?.user?.name || 'Unknown'}
            </Text>
            {canCancel && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() =>
                  Alert.alert(
                    'Cancel Appointment',
                    'Are you sure you want to cancel this appointment?',
                    [
                      { text: 'No', style: 'cancel' },
                      {
                        text: 'Yes',
                        onPress: async () => {
                          try {
                            await API.delete(`/api/appointments/${appt._id}`);
                            setAppointments(appointments.filter(a => a._id !== appt._id));
                          } catch (err) {
                            console.error('Failed to cancel appointment:', err);
                          }
                        },
                      },
                    ]
                  )
                }
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}

<TouchableOpacity
  style={styles.logoutButton}
  onPress={() => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('token');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (err) {
              console.error('Logout failed:', err);
              Alert.alert('Error', 'Failed to log out.');
            }
          },
        },
      ]
    );
  }}
>
  <Text style={styles.logoutButtonText}>Logout</Text>
</TouchableOpacity>
  </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff7f0',
    padding: 20,
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff7f0',
  },
  button: {
    backgroundColor: '#ff8c42',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#e85d04',
    marginBottom: 30,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffe5d0',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
    width: 90,
  },
  value: {
    color: '#333',
    flex: 1,
    marginLeft: 10,
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  saveButton: {
    backgroundColor: '#e85d04',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 10,
    color: '#e85d04',
  },
  appointmentBox: {
    backgroundColor: '#ffe5d0',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
  },
  appointmentText: {
    color: '#333',
  },
  cancelButton: {
    marginTop: 5,
    backgroundColor: '#ff4d4d',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  editIcon: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 8,
  },
  logoutButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'red',
    borderRadius: 6,
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelEditButton: {
    backgroundColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  cancelEditButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
});
