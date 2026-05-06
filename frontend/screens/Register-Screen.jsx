import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import API from '../utils/api';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpAttempts, setOtpAttempts] = useState(0);
  const navigation = useNavigation();

  const handleRegister = async () => {
    if (!name || !phone || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await API.post('/api/auth/send-code', { phone });
      setCodeSent(true);
      setOtp('');
      setOtpAttempts(0);
    } catch (error) {
      console.log('Send code error:', error?.response?.data || error.message);
      Alert.alert('Error', 'Failed to send verification code. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      await API.post('/api/auth/send-code', { phone });
      setOtp('');
      setOtpAttempts(0);
      Alert.alert('Success', 'Verification code resent');
    } catch (err) {
      Alert.alert('Error', 'Failed to resend code. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!otp || otp.length !== 4) {
      Alert.alert('Error', 'Please enter the 4-digit code');
      return;
    }

    if (otpAttempts >= 3) {
      Alert.alert('Error', 'Too many incorrect attempts. Please request a new code.');
      return;
    }

    setLoading(true);
    try {
      const verifyRes = await API.post('/api/auth/verify', { phone, code: otp });
      if (verifyRes.status === 200) {
        const res = await API.post('/api/auth/register', { name, phone, password });
        if (res.status === 201) {
          Alert.alert('Success', 'Registration and verification completed successfully!', [
            { text: 'OK', onPress: () => navigation.navigate('Home') }
          ]);
        } else {
          Alert.alert('Error', 'Registration failed');
        }
      }
    } catch (err) {
      if (err.response?.status === 403) {
        Alert.alert('Error', 'Too many attempts. Your account was deleted. Please register again.');
        setCodeSent(false);
        setOtpAttempts(0);
      } else if (err.response?.status === 400) {
        const newAttempts = otpAttempts + 1;
        setOtpAttempts(newAttempts);
        if (newAttempts >= 3) {
          Alert.alert('Error', 'Too many incorrect attempts. Please request a new code.');
        } else {
          Alert.alert('Error', `Incorrect code. ${3 - newAttempts} attempt(s) remaining.`);
        }
      } else {
        Alert.alert('Error', 'Server error, please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.backButtonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#e85d04" />
        </TouchableOpacity>
      </View>
      <Text style={styles.header}>Register</Text>

      {!codeSent ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            <Text style={styles.buttonText}>
              {loading ? 'Sending code...' : 'Register'}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.infoText}>
            A verification code was sent to {phone}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter 4-digit code"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={4}
          />
          <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
            <Text style={styles.buttonText}>
              {loading ? 'Verifying...' : 'Confirm'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resendButton} onPress={handleResendCode} disabled={loading}>
            <Text style={styles.resendText}>Resend Code</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff7f0',
    justifyContent: 'center',
    padding: 20,
  },
  backButtonContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#e85d04',
    textAlign: 'center',
  },
  infoText: {
    textAlign: 'center',
    color: '#555',
    marginBottom: 20,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ff8c42',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
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
  resendButton: {
    alignItems: 'center',
    marginTop: 15,
  },
  resendText: {
    color: '#e85d04',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
