import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
  Linking,
} from 'react-native';

import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import {
  clockInService,
  clockOutService,
  pingLocationService,
} from '../services/auth.services';

/* 🔁 FOREGROUND PING TIMER */
let pingInterval: ReturnType<typeof setInterval> | null = null;

type Coords = {
  latitude: number;
  longitude: number;
};

const UpdateGeolocation = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  const [actionType, setActionType] =
    useState<'CLOCK_IN' | 'CLOCK_OUT' | null>(null);

  const [attendanceId, setAttendanceId] = useState<string | null>(null);

  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState<any>(null);

  /* 🗺️ MAP (DYNAMIC IMPORT) */
  const [MapComponents, setMapComponents] = useState<any>(null);

  useEffect(() => {
    import('react-native-maps')
      .then(maps => {
        setMapComponents({
          MapView: maps.default,
          Marker: maps.Marker,
          PROVIDER_GOOGLE: maps.PROVIDER_GOOGLE,
        });
      })
      .catch(() => {});
  }, []);

  /* 🔁 RESTORE ACTIVE SESSION */
  useEffect(() => {
    const restoreAttendance = async () => {
      const saved = await AsyncStorage.getItem('ACTIVE_ATTENDANCE');
      if (!saved) return;

      const parsed = JSON.parse(saved);
      setAttendanceId(parsed.attendanceId);

      startForegroundPing();

      // Do NOT block UI if background permission fails
      try {
        await startBackgroundTracking();
      } catch {}
    };

    restoreAttendance();
  }, []);

  /* 📍 GET LOCATION */
  const getLocation = async (type: 'CLOCK_IN' | 'CLOCK_OUT') => {
    try {
      setLoading(true);
      setActionType(type);

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location permission is required'
        );
        return;
      }

      // Fast cached location
      const cached = await Location.getLastKnownPositionAsync();
      if (cached) {
        setCoords({
          latitude: cached.coords.latitude,
          longitude: cached.coords.longitude,
        });
      }

      // Accurate location
      const fresh = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setCoords({
        latitude: fresh.coords.latitude,
        longitude: fresh.coords.longitude,
      });
    } catch {
      Alert.alert('Error', 'Unable to fetch location');
    } finally {
      setLoading(false);
    }
  };

  /* 📍 REVERSE GEOCODE */
  useEffect(() => {
    if (!coords) {
      setAddress(null);
      return;
    }

    const fetchAddress = async () => {
      try {
        const res = await Location.reverseGeocodeAsync(coords);
        if (!res.length) return;

        const p = res[0];
        const formatted = [
          p.name,
          p.street,
          p.city,
          p.region,
          p.postalCode,
        ]
          .filter(Boolean)
          .join(', ');

        setAddress(formatted);
      } catch {
        setAddress('Unable to fetch address');
      }
    };

    fetchAddress();
  }, [coords]);

  /* ▶️ BACKGROUND TRACKING (SAFE) */
  const startBackgroundTracking = async () => {
    const { status } =
      await Location.requestBackgroundPermissionsAsync();

    if (status !== 'granted') {
      throw new Error('Background permission denied');
    }

    const isRunning =
      await Location.hasStartedLocationUpdatesAsync(
        'BACKGROUND_LOCATION_TASK'
      );

    if (isRunning) return;

    await Location.startLocationUpdatesAsync(
      'BACKGROUND_LOCATION_TASK',
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 60000,
        distanceInterval: 0,
        foregroundService: {
          notificationTitle: 'Attendance Tracking',
          notificationBody: 'Location tracking active',
        },
      }
    );
  };

  const stopBackgroundTracking = async () => {
    const running =
      await Location.hasStartedLocationUpdatesAsync(
        'BACKGROUND_LOCATION_TASK'
      );

    if (running) {
      await Location.stopLocationUpdatesAsync(
        'BACKGROUND_LOCATION_TASK'
      );
    }
  };

  /* 📡 FOREGROUND PING */
  const startForegroundPing = () => {
    if (pingInterval) return;

    pingInterval = setInterval(async () => {
      try {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        await pingLocationService({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      } catch {}
    }, 10000);
  };

  const stopForegroundPing = () => {
    if (pingInterval) {
      clearInterval(pingInterval);
      pingInterval = null;
    }
  };

  /* ✅ SUBMIT */
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

        const id = res.attendance_id;
        setAttendanceId(id);

        await AsyncStorage.setItem(
          'ACTIVE_ATTENDANCE',
          JSON.stringify({
            attendanceId: id,
            startedAt: Date.now(),
          })
        );

        startForegroundPing();

        // Never block clock-in
        try {
          await startBackgroundTracking();
        } catch {}
      } else {
        res = await clockOutService(payload);

        setAttendanceId(null);
        await AsyncStorage.removeItem('ACTIVE_ATTENDANCE');

        stopForegroundPing();
        await stopBackgroundTracking();
      }

      setPopupData(res);
      setShowPopup(true);
    } catch (e: any) {
      Alert.alert(
        'Error',
        e?.response?.data?.message ||
          e?.message ||
          'Unexpected error'
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
      <LinearGradient
        colors={['#0047AB', '#0061C1']}
        className="h-40 px-6 pt-10"
      >
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
      </LinearGradient>

      <ScrollView className="-mt-12 mx-5 bg-white rounded-3xl p-5 shadow-lg">
        {/* BUTTONS */}
        <View className="flex-row mb-6">
          <TouchableOpacity
            disabled={!!attendanceId}
            onPress={() => getLocation('CLOCK_IN')}
            className={`flex-1 py-4 rounded-xl mr-2 items-center ${
              attendanceId ? 'bg-gray-400' : 'bg-green-600'
            }`}
          >
            <Text className="text-white font-bold">Clock In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={!attendanceId}
            onPress={() => getLocation('CLOCK_OUT')}
            className={`flex-1 py-4 rounded-xl ml-2 items-center ${
              !attendanceId ? 'bg-gray-400' : 'bg-red-600'
            }`}
          >
            <Text className="text-white font-bold">Clock Out</Text>
          </TouchableOpacity>
        </View>

        {/* MAP */}
        {coords && MapComponents && (
          <>
            <View style={{ height: 220 }} className="mb-4 rounded-2xl overflow-hidden">
              <MapComponents.MapView
                provider={MapComponents.PROVIDER_GOOGLE}
                style={{ flex: 1 }}
                initialRegion={{
                  ...coords,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
              >
                <MapComponents.Marker coordinate={coords} />
              </MapComponents.MapView>
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

        {/* ADDRESS */}
        {address && (
          <View className="bg-gray-100 rounded-xl p-3 mb-4">
            <Text className="text-xs text-gray-500 mb-1">
              📍 Current Location
            </Text>
            <Text className="text-sm font-semibold">
              {address}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* POPUP */}
      <Modal visible={showPopup} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-2xl p-5 w-full">
            <Text className="text-lg font-bold text-center mb-4">
              Attendance Status
            </Text>

            {popupData &&
              Object.entries(popupData).map(([k, v]) => (
                <View key={k} className="mb-2">
                  <Text className="text-xs text-gray-500">
                    {k.toUpperCase()}
                  </Text>
                  <Text className="font-semibold">
                    {String(v)}
                  </Text>
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
