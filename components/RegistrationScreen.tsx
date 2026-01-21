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
  Keyboard,
  Modal,
  Pressable
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons'; 
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';
import { registerTenantService } from '../services/auth.services';

const RegistrationScreen = () => {
  const router = useRouter();

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // FORM STATES
  const [institutionName, setInstitutionName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // SUCCESS MODAL STATES
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [registerResponse, setRegisterResponse] = useState<any>(null);

  /* =====================
     COPY TENANT ID
     ===================== */
  const copyTenantId = async () => {
    await Clipboard.setStringAsync(registerResponse?.tenant_id);

    Toast.show({
      type: 'success',
      text1: 'Copied 🎉',
      text2: 'Tenant ID copied to clipboard',
    });
  };

  /* =====================
     REGISTER HANDLER
     ===================== */
  const handleRegister = async () => {
    Keyboard.dismiss();

    if (!institutionName || !username || !password) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'All fields are required',
      });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        institution_name: institutionName,
        admin_username: username,
        admin_password: password,
      };

      const data = await registerTenantService(payload);

      // SHOW SUCCESS MODAL
      setRegisterResponse(data);
      setSuccessModalVisible(true);

    } catch (error: any) {
      console.error("🚨 REGISTER ERROR 👉", error);

      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: error?.message || 'Something went wrong',
      });

    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1 bg-white"
    >
      {/* HEADER */}
      <LinearGradient
        colors={["#00188F", "#4c1d95"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="h-72 px-10 pt-20"
      >
        <Text className="text-white text-4xl font-bold">
          Register Institution!
        </Text>
      </LinearGradient>

      {/* FORM */}
      <View className="flex-1 bg-white -mt-12 rounded-t-[60px] px-8 pt-12">
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* INSTITUTION NAME */}
          <View className="mb-5 flex-row items-center rounded-full bg-gray-50 px-6 py-4 border border-gray-100">
            <Ionicons name="business-outline" size={20} color="#6366f1" />
            <TextInput
              placeholder="Institution Name"
              placeholderTextColor="#94a3b8"
              value={institutionName}
              onChangeText={setInstitutionName}
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

          {/* REGISTER BUTTON */}
          <TouchableOpacity
            onPress={handleRegister}
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
                  REGISTER
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* LOGIN LINK */}
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

      {/* ✅ SUCCESS MODAL */}
      <Modal transparent visible={successModalVisible} animationType="slide">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="w-[90%] bg-white rounded-3xl p-6">

            <Text className="text-2xl font-bold text-center text-green-600">
              🎉 Registration Successful
            </Text>

            <Text className="text-center text-gray-600 mt-2">
              {registerResponse?.message}
            </Text>

            {/* TENANT ID */}
            <View className="mt-6 bg-gray-100 rounded-xl p-4 flex-row items-center justify-between">
              <View>
                <Text className="text-gray-500 text-sm">Tenant ID</Text>
                <Text className="text-xl font-bold text-gray-800">
                  {registerResponse?.tenant_id}
                </Text>
              </View>

              <Pressable onPress={copyTenantId}>
                <Ionicons name="copy-outline" size={24} color="#6366f1" />
              </Pressable>
            </View>

            <Text className="text-gray-500 text-center mt-4">
              {registerResponse?.login_instructions}
            </Text>

            <TouchableOpacity
              onPress={() => {
                setSuccessModalVisible(false);
                router.replace('/');
              }}
              className="mt-6 bg-indigo-600 py-4 rounded-full"
            >
              <Text className="text-white text-center font-bold text-lg">
                Go to Sign In
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
};

export default RegistrationScreen;
