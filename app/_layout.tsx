import "../global.css";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
  
      <Stack.Screen 
        name="index" 
        options={{ headerShown: false }} />
    
      <Stack.Screen 
        name="Dashboard" 
        options={{ 
          headerShown: false,
          gestureEnabled: false 
        }} />
      

      <Stack.Screen 
        name="AddEmp" 
        options={{ 
          headerShown: false,
          presentation: 'modal' 
        }} />

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
 
    </Stack>
  );
}