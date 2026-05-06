import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, TextInput, Image } from 'react-native';
import API from '../../utils/api'
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function ManageTeamScreen() {
  const navigation = useNavigation();
  const [team, setTeam] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);

const fetchManagers = async () => {
  try {
    const [managersRes, usersRes] = await Promise.all([
      API.get('/api/managers'),
      API.get('/api/auth/users'),
    ]);

    const managers = managersRes.data.map(manager => {
      const user = usersRes.data.find(user => user._id === (manager.user._id || manager.user));
      return {
        ...user,
        managerId: manager._id,
      };
    });

    setTeam(managers);
  } catch (err) {
    console.error('Failed to fetch staff:', err);
  }
};

useEffect(() => {
  fetchManagers();
}, []);

  useEffect(() => {
    const fetchUsers = async () => {
      if (showModal) {
        try {
          const res = await API.get('/api/auth/users');
          const managerUserIds = team.map(manager => manager._id);
          const nonManagers = res.data.filter(user => !managerUserIds.includes(user._id));
          setUsers(nonManagers);
        } catch (err) {
          console.error('Failed to fetch users:', err);
        }
      }
    };

    fetchUsers();
  }, [showModal]);

  const handleDelete = (managerId) => {
    Alert.alert(
      'Remove Team Member',
      'Are you sure you want to remove this person?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await API.delete(`/api/managers/${managerId}`);
              setTeam(prev => prev.filter(member => member.managerId !== managerId));
            } catch (err) {
              console.error('Failed to delete:', err.response?.data);
            }
          },
        },
      ]
    );
  };

  const handleDeleteUser = (id) => {
    Alert.alert(
      'Delete User',
      'Are you sure you want to delete this user completely? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const manager = team.find(member => member._id === id);
              if (manager) {
                try {
                  await API.delete(`/api/managers/${manager.managerId}`);
                } catch (err) {
                  if (err.response && err.response.status === 404) {
                  } else {
                    throw err;
                  }
                }
                setTeam(prev => prev.filter(member => member._id !== id));
              }
              await API.delete(`/api/auth/users/${id}`);
              setUsers(prev => prev.filter(user => user._id !== id));
            } catch (err) {
              console.error('Failed to delete user:', err.response?.data);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Image source={{ uri: item.profileImage }} style={styles.avatar} />
        <View>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.role}>manager</Text>
        </View>
      </View>
      <View style={{flexDirection: 'row'}}>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.managerId)}>
          <Text style={styles.deleteText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#e85d04" />
          <Text style={styles.backText}></Text>
        </TouchableOpacity>
      <Text style={styles.title}>Manage Team</Text>
      <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
        <Text style={styles.addButtonText}>+ Add Team Member</Text>
      </TouchableOpacity>
      <FlatList
        data={team}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ ...styles.list, flexGrow: 1 }}
      />
      {showModal && (
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Select User to Promote</Text>
          <FlatList
            data={users}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={async () => {
                const alreadyManager = team.some(manager => manager._id === item._id || manager.user === item._id);
                if (alreadyManager) {
                  Alert.alert('Already a Manager', 'This user is already a manager.');
                  return;
                }
                try {
                  const res = await API.post('/api/managers', { userId: item._id });
                  await fetchManagers();
                  setShowModal(false);
                } catch (err) {
                  console.error('Failed to promote user:', err.response?.data);
                }
              }}
            >
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.role}>{item.phone}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: '#ccc', marginTop: 10 }]}
            onPress={() => setShowModal(false)}
          >
            <Text style={styles.saveButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backText: {
    fontSize: 16,
    color: '#e85d04',
    marginLeft: 5,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff7f0',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e85d04',
    textAlign: 'center',
    marginBottom: 20,
  },
  addButton: {
    alignSelf: 'center',
    backgroundColor: '#e85d04',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  list: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#ffe5d0',
    padding: 15,
    marginBottom: 12,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  role: {
    color: '#555',
  },
  deleteButton: {
    backgroundColor: '#ff4d4d',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modal: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  imagePicker: {
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  imagePickerText: {
    color: '#555',
  },
  saveButton: {
    backgroundColor: '#e85d04',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});