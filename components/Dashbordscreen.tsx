import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';

import { requestLocationPermissions } from '../services/locationPermission';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2;

type MenuItem = {
  id: number;
  title: string;
  icon: string;
  provider: any;
  color: string;
  route?: string;
};

const DashboardScreen = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');

  const menuItems: MenuItem[] = [
    { id: 1, title: 'Face Recognition', icon: 'face-recognition', provider: MaterialCommunityIcons, color: '#4f46e5', route: '/FaceRec' },
    { id: 2, title: 'Attendance', icon: 'calendar-check-outline', provider: MaterialCommunityIcons, color: '#0ea5e9', route: '/Attendance' },
    { id: 3, title: 'Update Geolocation', icon: 'map-marker-check-outline', provider: MaterialCommunityIcons, color: '#0ea5e9', route: '/update-geolocation' },
    { id: 4, title: 'Payroll', icon: 'cash-multiple', provider: MaterialCommunityIcons, color: '#10b981', route: '/Payroll' },
    { id: 5, title: 'Add Employee', icon: 'account-plus', provider: MaterialCommunityIcons, color: '#f59e0b', route: '/AddEmp' },
    { id: 6, title: 'Employees info', icon: 'account-group', provider: MaterialCommunityIcons, color: '#155e0b', route: '/EmpData' },
    { id: 7, title: 'User Info', icon: 'person-outline', provider: Ionicons, color: '#6366f1', route: '/UserInfo' },
    { id: 8, title: 'Settings', icon: 'settings-outline', provider: Ionicons, color: '#64748b', route: '/Settings' },
  ];

  // 🔐 Load user data
  useEffect(() => {
    const loadUserData = async () => {
      const storedUsername = await AsyncStorage.getItem('username');
      const storedRole = await AsyncStorage.getItem('role');
      if (storedUsername) setUsername(storedUsername);
      if (storedRole) setRole(storedRole);
    };
    loadUserData();
  }, []);

  // 📍 REQUEST LOCATION PERMISSION (ANDROID SAFE)
useEffect(() => {
  const initLocationPermission = async () => {
    const stored = await AsyncStorage.getItem('locationPermission');

    if (stored === 'granted') return;

    const granted = await requestLocationPermissions();

    if (!granted) {
      Alert.alert(
        'Permission Required',
        'Location permission is mandatory to use this application.'
      );
      return;
    }

    await AsyncStorage.setItem('locationPermission', 'granted');
  };

  initLocationPermission();
}, []);


  // Filter menu items for "user" role
 const visibleMenuItems =
  role === 'user'
    ? menuItems.filter(item => [1, 2, 3, 4, 7].includes(item.id))
    : role === 'admin'
    ? menuItems.filter(item => [1, 2,  4, 5, 6,7].includes(item.id))
    : [];

  const handleMenuPress = (route?: string) => {
    if (route) router.push(route as any);
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace('/');
  };

  return (
    <View className="flex-1 bg-white">
      {/* HEADER */}
      <LinearGradient colors={['#1e40af', '#3b82f6']} className="pt-12 pb-20 px-6">
        <View className="flex-row justify-between items-center">
          <View />
          <View className="flex-row items-center">
            <Text className="text-white text-base font-semibold mr-3">
              {username || 'User'}
            </Text>
            <TouchableOpacity className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
              <Image source={{ uri: 'https://i.pravatar.cc/100' }} className="w-full h-full" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="mt-8">
          <Text className="text-white text-4xl font-bold">Welcome</Text>
          <View className="h-1 w-8 bg-blue-300 rounded-full mt-2 opacity-50" />
        </View>
      </LinearGradient>

      {/* GRID */}
      <View className="flex-1 -mt-10 bg-white rounded-t-[40px] px-4 pt-8">
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="flex-row flex-wrap justify-between pb-24">
            {visibleMenuItems.map(item => {
              const isDisabled = [1, 2, 4, 7, 8].includes(item.id);

              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => !isDisabled && handleMenuPress(item.route)}
                  disabled={isDisabled}
                  className={`bg-white rounded-3xl mb-4 items-center justify-center `}
                  style={{
                    width: COLUMN_WIDTH,
                    height: COLUMN_WIDTH * 0.8,
                    elevation: 6,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    // shadowOpacity: 0.1,
                    // shadowRadius: 10,
                  }}
                >
                  <View
                    className="p-4 rounded-2xl mb-3"
                    style={{ backgroundColor: `${item.color}15` }}
                  >
                    <item.provider name={item.icon as any} size={32} color={item.color} />
                  </View>
                  <Text className="text-gray-600 font-medium text-center px-2">
                    {item.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* LOGOUT */}
      <SafeAreaView edges={['bottom']} className="bg-white">
        <View className="px-6 py-4 border-t border-gray-100">
          <TouchableOpacity
            className="flex-row items-center justify-center bg-red-50 py-4 rounded-2xl"
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color="#ef4444" />
            <Text className="ml-2 text-red-500 font-bold text-lg">Logout</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default DashboardScreen;
