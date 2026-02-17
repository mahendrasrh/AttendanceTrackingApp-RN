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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Dropdown } from 'react-native-element-dropdown';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { onboardEmployeeService } from '../services/auth.services';
import { useRouter } from 'expo-router';

/* ---------------- DROPDOWN DATA ---------------- */

const positionOptions = [
  { label: 'Software Engineer', value: 'software_engineer' },
  { label: 'HR Executive', value: 'hr_executive' },
  { label: 'Project Manager', value: 'project_manager' },
  { label: 'Team Lead', value: 'team_lead' },
];

const businessUnitOptions = [
  { label: 'IT', value: 'IT' },
  { label: 'HR', value: 'HR' },
  { label: 'Operations', value: 'Operations' },
  { label: 'Finance', value: 'Finance' },
];

const roleOptions = [
  { label: 'User', value: 'user' },
  { label: 'Admin', value: 'admin' },
];

/* ---------------- COMPONENT ---------------- */

const AddEmployee = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets(); // ⭐ FIX FOR NAV BAR

  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const [formData, setFormData] = useState({
    employee_id: '',
    name: '',
    position: '',
    business_unit: '',
    username: '',
    password: '',
    role: '',
    contact_email: '',
  });

  const [errors, setErrors] = useState<any>({});

  /* ---------------- VALIDATION ---------------- */

  const validateForm = () => {
    let newErrors: any = {};
    const emailRegex = /\S+@\S+\.\S+/;

    if (!formData.employee_id.trim())
      newErrors.employee_id = 'Employee ID is required';
    if (!formData.name.trim())
      newErrors.name = 'Full Name is required';
    if (!formData.position)
      newErrors.position = 'Position is required';
    if (!formData.business_unit)
      newErrors.business_unit = 'Business Unit is required';
    if (!formData.username.trim())
      newErrors.username = 'Username is required';
    if (!formData.password)
      newErrors.password = 'Password is required';
    else if (formData.password.length < 6)
      newErrors.password = 'Minimum 6 characters required';
    if (!formData.role)
      newErrors.role = 'Role is required';
    if (!formData.contact_email.trim())
      newErrors.email = 'Email is required';
    else if (!emailRegex.test(formData.contact_email))
      newErrors.email = 'Invalid email format';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- HANDLERS ---------------- */

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: null });
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Please fill all mandatory fields correctly');
      return;
    }

    try {
      setLoading(true);
      const res = await onboardEmployeeService(formData);
      Alert.alert('Success', res.message, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Failed',
        error.response?.data?.message || 'Unauthorized'
      );
    } finally {
      setLoading(false);
    }
  };

  const ErrorMsg = ({ msg }: { msg: string }) =>
    msg ? (
      <Text className="text-red-500 text-xs mb-2 ml-1">{msg}</Text>
    ) : null;

  /* ---------------- UI ---------------- */

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      {/* HEADER */}
      <LinearGradient
        colors={['#00188F', '#3b82f6']}
        style={{ paddingTop: 48, paddingBottom: 80, paddingHorizontal: 20 }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ position: 'absolute', top: 28, left: 16 }}
        >
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>

        <View style={{ marginTop: 16 }}>
          <Text className="text-white text-3xl font-bold">
            Add Employee
          </Text>
          <Text className="text-slate-200 text-sm font-bold">
            Fill Employee Details Below*
          </Text>
        </View>
      </LinearGradient>

      {/* FORM */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <View
          style={{
            flex: 1,
            marginTop: -40,
            backgroundColor: '#fff',
            borderTopLeftRadius: 40,
            borderTopRightRadius: 40,
          }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              padding: 24,
              paddingBottom: insets.bottom + 140, // ⭐ FINAL FIX
            }}
          >
            {/* Employee ID */}
            <Text className="text-gray-500 font-semibold mb-2 ml-1">
              Employee ID *
            </Text>
            <TextInput
              className={`bg-gray-50 border ${
                errors.employee_id ? 'border-red-500' : 'border-gray-200'
              } rounded-2xl p-4 mb-1`}
              placeholder="Enter ID"
              placeholderTextColor="#9ca3af" // optional: lighter gray for placeholder
  style={{ color: '#111827' }} //
              onChangeText={(t) =>
                handleInputChange('employee_id', t)
              }
            />
            <ErrorMsg msg={errors.employee_id} />

            {/* Full Name */}
            <Text className="text-gray-500 font-semibold mb-2 ml-1">
              Full Name *
            </Text>
            <TextInput
              className={`bg-gray-50 border ${
                errors.name ? 'border-red-500' : 'border-gray-200'
              } rounded-2xl p-4 mb-1`}
              placeholderTextColor="#9ca3af" // optional: lighter gray for placeholder
  style={{ color: '#111827' }} //
              placeholder="Enter Full Name"
              onChangeText={(t) => handleInputChange('name', t)}
            />
            <ErrorMsg msg={errors.name} />

            {/* Position */}
            <Text className="text-gray-500 font-semibold mb-2 ml-1">
              Position *
            </Text>
            <Dropdown
              style={{
                backgroundColor: '#f9fafb',
                borderColor: errors.position ? '#ef4444' : '#e5e7eb',
                borderWidth: 1,
                borderRadius: 16,
                padding: 12,
              }}
              data={positionOptions}
              labelField="label"
              valueField="value"
              placeholder="Select Position"
              value={formData.position}
              onChange={(item) =>
                handleInputChange('position', item.value)
              }
            />
            <ErrorMsg msg={errors.position} />

            {/* Business Unit */}
            <Text className="text-gray-500 font-semibold mb-2 ml-1">
              Business Unit *
            </Text>
            <Dropdown
              style={{
                backgroundColor: '#f9fafb',
                borderColor: errors.business_unit ? '#ef4444' : '#e5e7eb',
                borderWidth: 1,
                borderRadius: 16,
                padding: 12,
              }}
              data={businessUnitOptions}
              labelField="label"
              valueField="value"
              placeholder="Select Business Unit"
              value={formData.business_unit}
              onChange={(item) =>
                handleInputChange('business_unit', item.value)
              }
            />
            <ErrorMsg msg={errors.business_unit} />

            {/* Username */}
            <Text className="text-gray-500 font-semibold mb-2 ml-1">
              Username *
            </Text>
            <TextInput
              className={`bg-gray-50 border ${
                errors.username ? 'border-red-500' : 'border-gray-200'
              } rounded-2xl p-4 mb-1`}
              placeholderTextColor="#9ca3af" // optional: lighter gray for placeholder
  style={{ color: '#111827' }} //
              placeholder="Username"
              autoCapitalize="none"
              onChangeText={(t) =>
                handleInputChange('username', t)
              }
            />
            <ErrorMsg msg={errors.username} />

            {/* Password */}
            <Text className="text-gray-500 font-semibold mb-2 ml-1">
              Password *
            </Text>
            <View
              className={`bg-gray-50 border ${
                errors.password ? 'border-red-500' : 'border-gray-200'
              } rounded-2xl flex-row items-center px-4 mb-1`}
            >
              <TextInput
                secureTextEntry={!isPasswordVisible}
                className="flex-1 py-4"
                placeholder="Password"
                placeholderTextColor="#9ca3af" // optional: lighter gray for placeholder
  style={{ color: '#111827' }} //
                onChangeText={(t) =>
                  handleInputChange('password', t)
                }
              />
              <TouchableOpacity
                onPress={() =>
                  setIsPasswordVisible(!isPasswordVisible)
                }
              >
                <Ionicons
                  name={isPasswordVisible ? 'eye-off' : 'eye'}
                  size={20}
                  color="#9ca3af"
                />
              </TouchableOpacity>
            </View>
            <ErrorMsg msg={errors.password} />

            {/* Role */}
            <Text className="text-gray-500 font-semibold mb-2 ml-1">
              Role *
            </Text>
            <Dropdown
              style={{
                backgroundColor: '#f9fafb',
                borderColor: errors.role ? '#ef4444' : '#e5e7eb',
                borderWidth: 1,
                borderRadius: 16,
                padding: 12,
              }}
              data={roleOptions}
              labelField="label"
              valueField="value"
              placeholder="Select Role"
              value={formData.role}
              onChange={(item) =>
                handleInputChange('role', item.value)
              }
            />
            <ErrorMsg msg={errors.role} />

            {/* Email */}
            <Text className="text-gray-500 font-semibold mb-2 ml-1">
              Contact Email *
            </Text>
            <TextInput
              className={`bg-gray-50 border ${
                errors.email ? 'border-red-500' : 'border-gray-200'
              } rounded-2xl p-4 mb-1`}
              placeholder="email@company.com"
              placeholderTextColor="#9ca3af" // optional: lighter gray for placeholder
  style={{ color: '#111827' }} //
              keyboardType="email-address"
              onChangeText={(t) =>
                handleInputChange('contact_email', t)
              }
            />
            <ErrorMsg msg={errors.email} />

            {/* SUBMIT */}
            <TouchableOpacity
              onPress={handleRegister}
              disabled={loading}
              className="mt-6 rounded-2xl overflow-hidden"
            >
              <LinearGradient
                colors={['#00188F', '#00182a']}
                className="py-4 items-center"
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-bold text-lg">
                    Register Employee
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddEmployee; 