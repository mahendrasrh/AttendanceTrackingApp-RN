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
  Pressable,
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

  const [institutionName, setInstitutionName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [registerResponse, setRegisterResponse] = useState<any>(null);

  const copyTenantId = async () => {
    await Clipboard.setStringAsync(registerResponse?.tenant_id);
    Toast.show({
      type: 'success',
      text1: 'Copied 🎉',
      text2: 'Tenant ID copied',
    });
  };

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

    try {
      setLoading(true);
      const data = await registerTenantService({
        institution_name: institutionName,
        admin_username: username,
        admin_password: password,
      });

      setRegisterResponse(data);
      setSuccessModalVisible(true);
    } catch (error: any) {
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
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {/* HEADER (not inside KeyboardAvoidingView) */}
      <LinearGradient
        colors={['#00188F', '#4c1d95']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="h-72 px-10 pt-20"
      >
        <Text className="text-white text-4xl font-bold">
          Register Institution!
        </Text>
      </LinearGradient>

      {/* FORM */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View className="flex-1 bg-white -mt-12 rounded-t-[60px] px-8 pt-12">
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 140 }}
          >
            {/* Institution */}
            <View className="mb-5 flex-row items-center rounded-full bg-gray-50 px-6 py-4 border border-gray-100">
              <Ionicons name="business-outline" size={20} color="#6366f1" />
              <TextInput
                placeholder="Institution Name"
                value={institutionName}
                onChangeText={setInstitutionName}
                className="ml-3 flex-1 text-gray-800"
              />
            </View>

            {/* Username */}
            <View className="mb-5 flex-row items-center rounded-full bg-gray-50 px-6 py-4 border border-gray-100">
              <Ionicons name="person-outline" size={20} color="#6366f1" />
              <TextInput
                placeholder="Username or Gmail"
                value={username}
                onChangeText={setUsername}
                className="ml-3 flex-1 text-gray-800"
              />
            </View>

            {/* Password */}
            <View className="mb-2 flex-row items-center rounded-full bg-gray-50 px-6 py-4 border border-gray-100">
              <Ionicons name="lock-closed-outline" size={20} color="#6366f1" />
              <TextInput
                placeholder="Password"
                secureTextEntry={!isPasswordVisible}
                value={password}
                onChangeText={setPassword}
                className="ml-3 flex-1 text-gray-800"
              />
              <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                <Ionicons
                  name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#94a3b8"
                />
              </TouchableOpacity>
            </View>

            {/* Register */}
            <TouchableOpacity
              onPress={handleRegister}
              disabled={loading}
              className="rounded-full overflow-hidden shadow-lg mt-6"
            >
              <LinearGradient
                colors={['#00188F', '#EC008C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="py-4 items-center"
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

            {/* Login */}
            <View className="mt-8 items-center">
              <Text className="text-gray-400">Already have an account?</Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text className="text-indigo-600 font-bold text-lg mt-1">
                  Sign in
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {/* SUCCESS MODAL */}
      <Modal transparent visible={successModalVisible} animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/50">
          <View className="w-[90%] bg-white rounded-3xl p-6">
            <Text className="text-2xl font-bold text-center text-green-600">
              🎉 Registration Successful
            </Text>

            <View className="mt-6 bg-gray-100 rounded-xl p-4 flex-row justify-between items-center">
              <Text className="text-xl font-bold">
                {registerResponse?.tenant_id}
              </Text>
              <Pressable onPress={copyTenantId}>
                <Ionicons name="copy-outline" size={24} color="#6366f1" />
              </Pressable>
            </View>

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
    </View>
  );
};

export default RegistrationScreen;
