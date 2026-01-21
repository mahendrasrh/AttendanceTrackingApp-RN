import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import {
  clockInService,
  clockOutService,
} from '../services/auth.services';

import './backgroundLocation'

/* ---------------- BACKGROUND TASK NAME ---------------- */
const LOCATION_TASK_NAME = 'BACKGROUND_LOCATION_TASK';

type Coords = {
  latitude: number;
  longitude: number;
};

const UpdateGeolocation = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [actionType, setActionType] =
    useState<'CLOCK_IN' | 'CLOCK_OUT' | null>(null);
  const [tracking, setTracking] = useState(false);
  const [attendanceId, setAttendanceId] = useState<string | null>(null);

  /* 🔔 POPUP STATE */
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState<any>(null);

  /* ---------------- LOCATION FETCH ---------------- */
  const getLocation = async (type: 'CLOCK_IN' | 'CLOCK_OUT') => {
    try {
      setLoading(true);
      setActionType(type);

      const fg = await Location.requestForegroundPermissionsAsync();
      const bg = await Location.requestBackgroundPermissionsAsync();

      if (fg.status !== 'granted' || bg.status !== 'granted') {
        Alert.alert('Permission Required', 'Location access is required');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setCoords({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Unable to fetch location');
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- BACKGROUND TRACKING ---------------- */
  const startBackgroundTracking = async () => {
    const started = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);

    if (!started) {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        timeInterval: 300000, // 20 seconds
        distanceInterval: 0,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: 'Attendance Tracking',
          notificationBody: 'Tracking location in background',
        },
      });
      console.log('✅ Background tracking started');
    }

    setTracking(true);
  };

  const stopBackgroundTracking = async () => {
    const started = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);

    if (started) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      console.log('✅ Background tracking stopped');
    }

    setTracking(false);
  };

  /* ---------------- APPROVE ACTION ---------------- */
  const approveLocation = async () => {
    if (!coords || !actionType) return;

    try {
      setLoading(true);

      const payload = {
        latitude: coords.latitude,
        longitude: coords.longitude,
      };

      let res;

      if (actionType === 'CLOCK_IN') {
        res = await clockInService(payload);
        setAttendanceId(res.attendance_id);
        await startBackgroundTracking();
      } else {
        res = await clockOutService(payload);
        await stopBackgroundTracking();
        setAttendanceId(null);
      }

      console.log('📥 API RESPONSE 👉', res);

      setPopupData(res);
      setShowPopup(true);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Something went wrong'
      );
    } finally {
      setLoading(false);
      setCoords(null);
      setActionType(null);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <SafeAreaView className="flex-1 bg-[#F4F7FC]">
      <LinearGradient colors={['#0047AB', '#0061C1']} className="h-40 px-6 pt-10">
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute left-4 top-10 p-2"
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text className="text-white text-xl font-bold text-center">
          Clock In / Clock Out
        </Text>

        {attendanceId && (
          <Text className="text-yellow-300 text-xs text-center mt-1">
            🕒 Session Active
          </Text>
        )}

        {tracking && (
          <Text className="text-green-300 text-xs text-center mt-1">
            ● Background tracking active
          </Text>
        )}
      </LinearGradient>

      <ScrollView className="-mt-12 mx-5 bg-white rounded-3xl p-5 shadow-lg">
        {/* ACTION BUTTONS */}
        <View className="flex-row mb-6">
          <TouchableOpacity
            disabled={!!attendanceId}
            onPress={() => getLocation('CLOCK_IN')}
            className={`flex-1 py-4 rounded-xl mr-2 items-center ${
              attendanceId ? 'bg-gray-400' : 'bg-green-600'
            }`}
          >
            {loading && actionType === 'CLOCK_IN' ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold">Clock In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            disabled={!attendanceId}
            onPress={() => getLocation('CLOCK_OUT')}
            className={`flex-1 py-4 rounded-xl ml-2 items-center ${
              !attendanceId ? 'bg-gray-400' : 'bg-red-600'
            }`}
          >
            {loading && actionType === 'CLOCK_OUT' ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold">Clock Out</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* MAP */}
        {coords && (
          <>
            <View style={{ height: 220 }} className="rounded-2xl overflow-hidden mb-4">
              <MapView
                provider={PROVIDER_GOOGLE}
                style={{ flex: 1 }}
                initialRegion={{
                  latitude: coords.latitude,
                  longitude: coords.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
              >
                <Marker coordinate={coords} />
              </MapView>
            </View>

            <TouchableOpacity
              onPress={approveLocation}
              className="bg-[#0061C1] py-4 rounded-xl items-center mb-4"
            >
              <Text className="text-white font-bold">
                Approve {actionType?.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* 🔔 POPUP MODAL */}
      <Modal visible={showPopup} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-2xl p-5 w-full">
            <Text className="text-lg font-bold text-center mb-4 text-[#0061C1]">
              Attendance Status
            </Text>

            {popupData &&
              Object.entries(popupData).map(([key, value]) => (
                <View key={key} className="mb-2">
                  <Text className="text-xs text-gray-500">
                    {key.replace('_', ' ').toUpperCase()}
                  </Text>
                  <Text className="font-semibold">{String(value)}</Text>
                </View>
              ))}

            <TouchableOpacity
              onPress={() => setShowPopup(false)}
              className="mt-4 bg-[#0061C1] py-3 rounded-xl items-center"
            >
              <Text className="text-white font-bold">OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default UpdateGeolocation;
