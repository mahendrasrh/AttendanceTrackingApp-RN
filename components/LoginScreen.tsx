import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator,
  Keyboard 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons'; 
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { loginService } from '../services/auth.services';

const LoginScreen = () => {
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const [tenantId, setTenantId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  /* =====================
     LOGIN HANDLER
     ===================== */
  const handleLogin = async () => {
    Keyboard.dismiss();

    if (!tenantId || !username || !password) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'All fields are required',
        position: 'top',
      });
      return;
    }

    setLoading(true);

    try {
      const data = await loginService({
        tenant_id: tenantId,
        username,
        password,
      });

      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('role', data.role);
      await AsyncStorage.setItem('tenant_id', data.tenant_id);
      await AsyncStorage.setItem('username', data.username);

      // ✅ SUCCESS TOAST
      Toast.show({
        type: 'success',
        text1: 'Login Successful 🎉',
        text2: `Welcome ${data.username}`,
        position: 'top',
        visibilityTime: 2000,
      });

      setTimeout(() => {
        router.replace('/Dashboard');
      }, 800);

    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Invalid credentials';

      // ❌ ERROR TOAST
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: errorMessage,
        position: 'top',
        visibilityTime: 3000,
      });

    } finally {
      setLoading(false);
    }
  };

  return (
   <KeyboardAvoidingView
  behavior="padding"
  keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 60}
  className="flex-1 bg-white"
>
      {/* HEADER */}
      <LinearGradient
        colors={["#00188F", "#4c1d95"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="h-72 px-10 pt-20"
      >
        <Text className="text-white text-4xl font-bold">Sign in!</Text>
      </LinearGradient>

      {/* FORM */}
      <View className="flex-1 bg-white -mt-12 rounded-t-[60px] px-8 pt-12">
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* TENANT ID */}
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

          {/* USERNAME */}
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

          {/* PASSWORD */}
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
              <Ionicons
                name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#94a3b8"
              />
            </TouchableOpacity>
          </View>

          {/* SIGN IN BUTTON */}
          <TouchableOpacity
            onPress={handleLogin}
            activeOpacity={0.7}
            disabled={loading}
            className="rounded-full overflow-hidden shadow-lg mt-6"
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
                <Text className="text-white text-lg font-bold tracking-widest">
                  SIGN IN
                </Text>
              )}
            </LinearGradient>
            
          </TouchableOpacity>
{/* NOT REGISTERED LINK */}
<View className="mt-8 mb-10 flex-row justify-center items-center">
  <Text className="text-gray-400 mr-1">
    Not registered?
  </Text>

  <TouchableOpacity onPress={() => router.push('/register')}>
    <Text className="text-[#6366f1] font-bold">
      Register here
    </Text>
  </TouchableOpacity>
</View>

        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
