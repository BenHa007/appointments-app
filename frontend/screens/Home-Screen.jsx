import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Linking, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { decode } from 'base-64';
import InstagramIcon from '../assets/icons/icons8-instagram-50.png';
import PhoneIcon from '../assets/icons/icons8-phone-50.png';
import AddressIcon from '../assets/icons/location.png';
import { SALON_ADDRESS, SALON_BIO, SALON_INSTAGRAM, SALON_NAME, SALON_PHONE ,INSTAGRAM_URL, ADDRESS_URL, PHONE_URL} from '../utils/constants';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState();
  const [isManager, setIsManager] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const base64Payload = token.split('.')[1];
          const decodedPayload = JSON.parse(decode(base64Payload));
          setUserName(decodedPayload.name || 'User');
          setIsManager(decodedPayload.isManager || false);
        }
      } catch (err) {
        console.log('Failed to decode token', err);
      }
    };

    checkLoginStatus();
  }, []);

  const handleProfileNavigation = () => {
    navigation.navigate('Profile');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleMenuToggle}>
            <Text style={styles.menuButton}>≡</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Menu</Text>
          <TouchableOpacity
            onPress={handleProfileNavigation}
            style={styles.headerLoginButton}
          >
            <Text style={styles.userText}>{userName == null ? 'Guest' : `welcome ${userName}`}</Text>
          </TouchableOpacity>
        </View>

        {!menuOpen && (
          <Text style={styles.greetingText}>
            {getGreeting()}, {userName || 'Guest'}!
          </Text>
        )}

        {menuOpen && (
          <View style={styles.sideMenu}>
            {userName == null ? (
              <>
                <TouchableOpacity onPress={() => { setMenuOpen(false); navigation.navigate('Login'); }} style={{ padding: 10, alignItems: 'center' }}>
                  <Text style={{ color: '#e85d04', fontWeight: 'bold', fontSize: 16 }}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setMenuOpen(false); navigation.navigate('Register'); }} style={{ padding: 10, alignItems: 'center' }}>
                  <Text style={{ color: '#e85d04', fontWeight: 'bold', fontSize: 16 }}>Register</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity onPress={() => navigation.navigate('BookAppointment')} style={{ padding: 10, alignItems: 'center' }}>
                  <Text style={{ color: '#e85d04', fontWeight: 'bold', fontSize: 16 }}>Book Appointment</Text>
                </TouchableOpacity>
                {isManager && (
                  <TouchableOpacity onPress={() => navigation.navigate('AdminDashboard')} style={{ padding: 10, alignItems: 'center' }}>
                    <Text style={{ color: '#e85d04', fontWeight: 'bold', fontSize: 16 }}>Admin Dashboard</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        )}

        <View style={styles.infoSection}>
          <Text style={styles.salonHeader}>{SALON_NAME}</Text>
          <Text style={styles.salonDescription}>{SALON_BIO}</Text>
        </View>

        <View style={styles.businessDetails}>
          <Text style={styles.businessDetailsTitle}>Business Info</Text>
          <View style={styles.iconRow}>
            <View style={styles.iconColumn}>
              <TouchableOpacity onPress={() => Linking.openURL(INSTAGRAM_URL)}>
                <Image source={InstagramIcon} style={styles.iconImage} />
              </TouchableOpacity>
              <Text style={styles.iconLabel}>{SALON_INSTAGRAM || 'Instagram'}</Text>
            </View>

            <View style={styles.iconColumn}>
              <TouchableOpacity onPress={() => Linking.openURL(ADDRESS_URL)}>
                <Image source={AddressIcon} style={styles.iconImage} />
              </TouchableOpacity>
              <Text style={styles.iconLabel}>{SALON_ADDRESS || 'Address'}</Text>
            </View>

            {/* <View style={styles.iconColumn}>
              <TouchableOpacity onPress={() => Linking.openURL(PHONE_URL)}>
                <Image source={PhoneIcon} style={styles.iconImage} />
              </TouchableOpacity>
              <Text style={styles.iconLabel}>{SALON_PHONE || 'Phone'}</Text>
            </View> */}
          </View>
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    height: 60,
    backgroundColor: '#ff8c42',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    marginLeft: 15,
    fontWeight: 'bold',
  },
  menuButton: {
    fontSize: 28,
    color: '#fff',
  },
  sideMenu: {
    backgroundColor: '#ffeadb',
    padding: 10,
    borderRightWidth: 1,
    borderColor: '#ff8c42',
  },
  infoSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 10,
    color: '#e85d04',
    textAlign: 'center',
  },
  salonHeader: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#e85d04',
    marginBottom: 15,
    textAlign: 'center',
  },
  salonDescription: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  businessDetails: {
    paddingVertical: 15,
    paddingHorizontal: 1,
    paddingBottom: 55,
    borderTopWidth: 1,
    borderColor: '#ff8c42',
    backgroundColor: '#fff7f0',
    alignItems: 'center',
  },
  businessDetailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  iconColumn: {
    alignItems: 'center',
    width: 80,
  },
  iconLabel: {
    marginTop: 5,
    fontSize: 12,
    color: '#333',
  },
  iconImage: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  userText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 'auto',
    fontWeight: 'bold',
  },
  headerLoginButton: {
    marginLeft: 'auto',
    paddingHorizontal: 10,
  },
});
