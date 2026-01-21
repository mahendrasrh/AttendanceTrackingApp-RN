import "../global.css";
import { Stack } from "expo-router";
import Toast from "react-native-toast-message";

export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen 
          name="index" 
          options={{ headerShown: false }} 
        />

        <Stack.Screen 
          name="Dashboard" 
          options={{ 
            headerShown: false,
            gestureEnabled: false 
          }} 
        />

        <Stack.Screen 
          name="AddEmp" 
          options={{ 
            headerShown: false,
            presentation: 'modal' 
          }} 
        />

        <Stack.Screen 
          name="EmpData" 
          options={{ 
            headerShown: false, 
            animation: 'slide_from_right'
          }} 
        />

        <Stack.Screen 
          name="register" 
          options={{ 
            headerShown: false, 
            animation: 'slide_from_right'
          }} 
        />

        <Stack.Screen 
          name="update-geolocation" 
          options={{ 
            headerShown: false, 
            animation: 'slide_from_right'
          }} 
        />
      </Stack>

      {/* 🔔 GLOBAL BEAUTIFUL TOAST */}
      <Toast />
    </>
  );
}
