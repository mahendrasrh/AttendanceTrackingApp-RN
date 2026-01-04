import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  Alert, 
  ActivityIndicator,
  Keyboard 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons'; 
import { useRouter } from 'expo-router';
import { registerTenantService } from '../services/auth.services';

const RegistrationScreen = () => {
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form States
  const [tenantId, setTenantId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

 

const handleRegister = async () => {
  Keyboard.dismiss();

  if (!tenantId || !username || !password) {
    Alert.alert("Required Fields", "All fields are required");
    return;
  }

  const payload = {
    institution_name: tenantId,
    admin_username: username,
    admin_password: password,
  };

  setLoading(true);

  try {
    const data = await registerTenantService(payload);

    console.log("REGISTER RESPONSE 👉", data);

    Alert.alert(
      "Success",
      "Institution registered successfully",
      [{ text: "OK", onPress: () => router.replace('/') }]
    );

  } catch (error: any) {
    console.error("🚨 REGISTER ERROR 👉", error);
    Alert.alert("Registration Failed", error.message);
  } finally {
    setLoading(false);
  }
};





  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1 bg-white"
    >
      <LinearGradient
        colors={["#00188F", "#4c1d95"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="h-72 px-10 pt-20"
      >
        {/* <Text className="text-white text-5xl font-bold">Hello</Text> */}
        <Text className="text-white text-4xl font-bold">Register Institution!</Text>
      </LinearGradient>

      <View className="flex-1 bg-white -mt-12 rounded-t-[60px] px-8 pt-12">
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          <View className="mb-5 flex-row items-center rounded-full bg-gray-50 px-6 py-4 border border-gray-100">
            <Ionicons name="business-outline" size={20} color="#6366f1" />
            <TextInput
              placeholder="Tenant ID"
              placeholderTextColor="#94a3b8"
              value={tenantId}
              onChangeText={setTenantId}
              className="ml-3 flex-1 text-gray-800"
            />
          </View>

          <View className="mb-5 flex-row items-center rounded-full bg-gray-50 px-6 py-4 border border-gray-100">
            <Ionicons name="person-outline" size={20} color="#6366f1" />
            <TextInput
              placeholder="Username or Gmail"
              placeholderTextColor="#94a3b8"
              value={username}
              onChangeText={setUsername}
              className="ml-3 flex-1 text-gray-800"
            />
          </View>

          <View className="mb-2 flex-row items-center rounded-full bg-gray-50 px-6 py-4 border border-gray-100">
            <Ionicons name="lock-closed-outline" size={20} color="#6366f1" />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#94a3b8"
              secureTextEntry={!isPasswordVisible}
              value={password}
              onChangeText={setPassword}
              className="ml-3 flex-1 text-gray-800"
            />
            <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
              <Ionicons name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity className="items-end mb-10 mr-4">
            <Text className="text-gray-400 font-medium">Forgot password?</Text>
          </TouchableOpacity>

          {/* SIGN IN BUTTON */}
          <TouchableOpacity 
            onPress={handleRegister} 
            activeOpacity={0.7} 
            disabled={loading}
            className="rounded-full overflow-hidden shadow-lg"
          >
            <LinearGradient
              colors={["#00188F", "#EC008C"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="py-4 items-center justify-center"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-lg font-bold tracking-widest">SIGN IN</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

         <View className="mt-8 mb-10 items-center">
  <Text className="text-gray-400">Already have an account?</Text>
  <TouchableOpacity onPress={() => router.back()}>
    <Text className="text-[#6366f1] font-bold text-lg mt-1">
      Sign in
    </Text>
  </TouchableOpacity>
</View>

        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default RegistrationScreen;