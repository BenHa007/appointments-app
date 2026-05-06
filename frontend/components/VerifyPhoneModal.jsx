import React, { useState } from 'react';
import { View, Text, TextInput, Button, Modal, StyleSheet } from 'react-native';
import API from '../utils/api';

export default function VerifyPhoneModal({ visible, onClose, phone }) {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');

  const verifyCode = async () => {
    try {
      const res = await API.post('/api/auth/verify', { phone, code });
      setMessage(res.data.message);
      setTimeout(() => {
        setMessage('');
        onClose(); 
      }, 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Verification error');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Phone Number Verification</Text>
          <Text>Code sent to phone {phone}</Text>

          <TextInput
            value={code}
            onChangeText={setCode}
            placeholder="Enter 4 digits"
            keyboardType="numeric"
            style={styles.input}
          />

          <Button title="Verify" onPress={verifyCode} />
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <Button title="Close" color="gray" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    width: '80%',
    textAlign: 'center',
    marginVertical: 10,
    padding: 8,
    borderRadius: 6,
  },
  message: {
    color: '#e85d04',
    marginTop: 5,
  },
});