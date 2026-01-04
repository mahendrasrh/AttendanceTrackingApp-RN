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
import { Dropdown, MultiSelect } from 'react-native-element-dropdown';
import { SafeAreaView } from 'react-native-safe-area-context';
import { onboardEmployeeService } from '../services/auth.services'
import { useRouter } from 'expo-router';

const AddEmployee = () => {
 const [isPasswordVisible, setIsPasswordVisible] = useState(false);
 const [loading, setLoading] = useState(false);

  const router = useRouter();
  // Form State
  const [formData, setFormData] = useState({
    employee_id: '',
    name: '',
    position: '',
    business_unit: '',
    username: '',
    password: '',
    role: '',
    // reports_to_employee_ids: [],
    contact_email: '',
  });


  const [errors, setErrors] = useState<any>({});

  const emptyOptions = [
    { label: 'empty1', value: 'empty1' },
    { label: 'empty2', value: 'empty2' },
    { label: 'empty3', value: 'empty3' },
    { label: 'empty4', value: 'empty4' },
  ];
   const roleOptions = [
    { label: 'user', value: 'user' },
       { label: 'admin', value: 'admin' },
   
  ];

  const validateForm = () => {
    let newErrors: any = {};
    const emailRegex = /\S+@\S+\.\S+/;

    if (!formData.employee_id.trim()) newErrors.employee_id = 'Employee ID is required';
    if (!formData.name.trim()) newErrors.name = 'Full Name is required';
    if (!formData.position) newErrors.position = 'Position is required';
    if (!formData.business_unit) newErrors.business_unit = 'Business Unit is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be 6+ chars';
    if (!formData.role) newErrors.role = 'Role is required';
    // if (formData.reports_to_employee_ids.length === 0) newErrors.reports_to = 'Select at least one supervisor';
    
    if (!formData.contact_email.trim()) newErrors.email = 'Email is required';
    else if (!emailRegex.test(formData.contact_email)) newErrors.email = 'Invalid email format';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleRegister = async () => {
  if (!validateForm()) {
    Alert.alert("Error", "Please fill all mandatory fields correctly.");
    return;
  }

  setLoading(true);

  try {
    const data = await onboardEmployeeService(formData);

    Alert.alert("Success", data.message, [
      { text: 'OK', onPress: () => router.back() },
    ]);

  } catch (error: any) {
    Alert.alert(
      "Failed",
      error.response?.data?.message || "Unauthorized"
    );
  } finally {
    setLoading(false);
  }
};




  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };
  const ErrorMsg = ({ msg }: { msg: string }) => (
    msg ? <Text className="text-red-500 text-xs mb-2 ml-1">{msg}</Text> : null
  );

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top','bottom']}>
      {/* 🔵 FIXED HEADER */}
      
<LinearGradient
  colors={['#00188F', '#3b82f6']}
  style={{
    paddingTop: 48,
    paddingBottom: 80,
    paddingHorizontal: 20,
  }}
>
  {/* 🔙 BACK BUTTON */}
  <TouchableOpacity
    onPress={() => router.back()}
    style={{
      position: 'absolute',
      top: 28,
      left: 16,
      zIndex: 10,
    }}
  >
    <Ionicons name="arrow-back" size={26} color="#fff" />
  </TouchableOpacity>

  {/* HEADER TEXT */}
  <View style={{ marginTop: 16 }}>
    <Text className="text-white text-3xl font-bold">Add Employee</Text>
    <Text className="text-slate-200 text-sm font-bold">
      Fill Employee Details Below*
    </Text>
  </View>
</LinearGradient>

      {/* ⚪ FORM CONTAINER */}
      <View
        style={{
          flex: 1,
          marginTop: -40,
          backgroundColor: '#fff',
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              padding: 24,
              paddingBottom: 120, // 👈 prevents bottom cut
            }}
          >
            {/* ---- FORM FIELDS START ---- */}
 <Text className="text-gray-500 font-semibold mb-2 ml-1">Employee ID *</Text>
            <TextInput
              className={`bg-gray-50 border ${errors.employee_id ? 'border-red-500' : 'border-gray-200'} rounded-2xl p-4 mb-1 text-gray-800`}
              placeholder="Enter ID"
              onChangeText={(t) => handleInputChange('employee_id', t)}
            />
            <ErrorMsg msg={errors.employee_id} />

            {/* Name */}
            <Text className="text-gray-500 font-semibold mb-2 ml-1">Full Name *</Text>
            <TextInput
              className={`bg-gray-50 border ${errors.name ? 'border-red-500' : 'border-gray-200'} rounded-2xl p-4 mb-1 text-gray-800`}
              placeholder="Enter Full Name"
              onChangeText={(t) => handleInputChange('name', t)}
            />
            <ErrorMsg msg={errors.name} />
            <Text className="text-gray-500 font-semibold mb-2 ml-1">Position *</Text>
            <Dropdown
              style={{ backgroundColor: '#f9fafb', borderColor: errors.position ? '#ef4444' : '#e5e7eb', borderWidth: 1, borderRadius: 16, padding: 12, marginBottom: 4 }}
              data={emptyOptions} labelField="label" valueField="value" placeholder="Select Position"
              onChange={item => handleInputChange('position', item.value)}
            />
            <ErrorMsg msg={errors.position} />

            {/* Business  */}
            <Text className="text-gray-500 font-semibold mb-2 ml-1">Business Unit *</Text>
            <Dropdown
              style={{ backgroundColor: '#f9fafb', borderColor: errors.business_unit ? '#ef4444' : '#e5e7eb', borderWidth: 1, borderRadius: 16, padding: 12, marginBottom: 4 }}
              data={emptyOptions} labelField="label" valueField="value" placeholder="Select Business Unit"
              onChange={item => handleInputChange('business_unit', item.value)}
            />
            <ErrorMsg msg={errors.business_unit} />

            {/* Username */}
            <Text className="text-gray-500 font-semibold mb-2 ml-1">Username *</Text>
            <TextInput
              className={`bg-gray-50 border ${errors.username ? 'border-red-500' : 'border-gray-200'} rounded-2xl p-4 mb-1 text-gray-800`}
              placeholder="Username" autoCapitalize="none"
              onChangeText={(t) => handleInputChange('username', t)}
            />
            <ErrorMsg msg={errors.username} />

            {/* Password */}
            <Text className="text-gray-500 font-semibold mb-2 ml-1">Password *</Text>
            <View className={`bg-gray-50 border ${errors.password ? 'border-red-500' : 'border-gray-200'} rounded-2xl flex-row items-center px-4 mb-1`}>
              <TextInput
                secureTextEntry={!isPasswordVisible} className="flex-1 py-4 text-gray-800" placeholder="Password"
                onChangeText={(t) => handleInputChange('password', t)}
              />
              <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                <Ionicons name={isPasswordVisible ? "eye-off" : "eye"} size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>
            <ErrorMsg msg={errors.password} />

            {/* Role Dropdown */}
            <Text className="text-gray-500 font-semibold mb-2 ml-1">Role *</Text>
            <Dropdown
              style={{ backgroundColor: '#f9fafb', borderColor: errors.role ? '#ef4444' : '#e5e7eb', borderWidth: 1, borderRadius: 16, padding: 12, marginBottom: 4 }}
              data={roleOptions} labelField="label" valueField="value" placeholder="Select Role"
              onChange={item => handleInputChange('role', item.value)}
            />
            <ErrorMsg msg={errors.role} />

            {/* Reports To */}
            {/* <Text className="text-gray-500 font-semibold mb-2 ml-1">Reports To (IDs) *</Text>
            <MultiSelect
              style={{ backgroundColor: '#f9fafb', borderColor: errors.reports_to ? '#ef4444' : '#e5e7eb', borderWidth: 1, borderRadius: 16, padding: 12, marginBottom: 4 }}
              data={emptyOptions} labelField="label" valueField="value" placeholder="Select Supervisor(s)"
              value={formData.reports_to_employee_ids}
              onChange={item => handleInputChange('reports_to_employee_ids', item)}
            />
            <ErrorMsg msg={errors.reports_to} /> */}

            {/* Contact Email */}
            <Text className="text-gray-500 font-semibold mb-2 ml-1">Contact Email *</Text>
            <TextInput
              className={`bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-2xl p-4 mb-1 text-gray-800`}
              placeholder="email@company.com" keyboardType="email-address"
              onChangeText={(t) => handleInputChange('contact_email', t)}
            />
            <ErrorMsg msg={errors.email} />

            {/* Continue all fields here */}

          <TouchableOpacity
  onPress={handleRegister}
  disabled={loading}
  activeOpacity={0.8}
  className={`mt-6 rounded-2xl overflow-hidden ${
    loading ? 'opacity-70' : ''
  }`}
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


            {/* ---- FORM FIELDS END ---- */}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

export default AddEmployee;
