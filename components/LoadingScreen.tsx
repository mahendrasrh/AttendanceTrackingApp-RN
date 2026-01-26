import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const LoadingScreen = () => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/login'); // navigate to dashboard
    }, 2500); // 2.5 sec splash

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={['#1e40af', '#3b82f6']}
      className="flex-1 items-center justify-center"
    >
      {/* App Icon - Eye */}
      <View className="bg-white/20 p-6 rounded-3xl mb-6">
        <Ionicons name="eye-outline" size={64} color="#fff" />
      </View>

      {/* App Name */}
      <Text className="text-white text-4xl font-extrabold tracking-wide">
       Work Trace
      </Text>

      {/* Tagline */}
      <Text className="text-blue-100 mt-2 text-base">
        Smart Attendance & Tracking
      </Text>

      {/* Loader */}
      <ActivityIndicator
        size="large"
        color="#ffffff"
        className="mt-10"
      />
    </LinearGradient>
  );
};

export default LoadingScreen;
