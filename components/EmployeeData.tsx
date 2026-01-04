import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { FlatList } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import {
  getEmployeesService,
  updateEmployeeService,
} from '../services/auth.services';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Employee {
  id: string;
  name: string;
  role: string;
  dept: string;
  email: string;
  username: string;
  image: string;
  isActive: boolean;
}

const EmployeeData = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const data = await getEmployeesService();
      const mapped = data.map((emp: any) => ({
        id: emp.employee_id,
        name: emp.name,
        role: emp.position,
        dept: emp.business_unit,
        email: emp.contact_email,
        username: emp.employee_id,
        image: 'https://i.pravatar.cc/150',
        isActive: emp.is_active,
      }));
      setEmployees(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* =======================
      EMPLOYEE DETAIL VIEW
     ======================= */
  const EmployeeDetailView = ({ emp }: { emp: Employee }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isActive, setIsActive] = useState(emp.isActive);

    const [formData, setFormData] = useState({
      name: emp.name,
      role: emp.role,
      dept: emp.dept,
      email: emp.email,
    });

    const handleChange = (key: string, value: string) => {
      setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
      try {
        setSaving(true);

        const payload = {
          employee_id: emp.id,
          name: formData.name,
          position: formData.role,
          business_unit: formData.dept,
          contact_email: formData.email,
          is_active: isActive,
          reports_to_employee_ids: [],
          tenant_id: 'CA2970',
          date_added: new Date().toISOString(),
        };

        await updateEmployeeService(emp.id, payload);

        setSelectedEmp(prev =>
          prev
            ? {
                ...prev,
                ...formData,
                isActive,
              }
            : prev
        );

        Alert.alert('Success', 'Employee updated successfully');
        setIsEditing(false);
      } catch (err) {
        Alert.alert('Error', 'Update failed');
      } finally {
        setSaving(false);
      }
    };

    return (
      <View className="flex-1 bg-gray-200">
        {/* HEADER */}
        <View className="bg-[#0061C1] pt-14 pb-20 px-6 flex-row items-center">
          <TouchableOpacity onPress={() => setSelectedEmp(null)}>
            <Ionicons name="chevron-back" size={26} color="white" />
          </TouchableOpacity>
          <Text className="absolute left-0 right-0 top-14 text-center text-white text-lg font-semibold">
            Employee Details
          </Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingTop: 50 }}>
          <View className="px-6">
            {/* PROFILE CARD */}
            <View className="bg-white rounded-3xl pt-16 pb-10 shadow-sm">
              <View className="absolute -top-12 self-center border-4 border-white rounded-full">
                <Image
                  source={{ uri: emp.image }}
                  className="w-24 h-24 rounded-full"
                />
              </View>

              <Text className="text-center text-gray-400 text-xs">
                ID: {emp.id}
              </Text>

              {isEditing ? (
                <TextInput
                  value={formData.name}
                  onChangeText={t => handleChange('name', t)}
                  className="text-center text-2xl font-bold border-b mt-1"
                />
              ) : (
                <Text className="text-center text-2xl font-bold mt-1">
                  {emp.name}
                </Text>
              )}

              {isEditing ? (
                <TextInput
                  value={formData.role}
                  onChangeText={t => handleChange('role', t)}
                  className="text-center text-gray-600 border-b mt-2"
                />
              ) : (
                <Text className="text-center text-gray-600 mt-2">
                  {emp.role}
                </Text>
              )}

              {isEditing ? (
                <TextInput
                  value={formData.dept}
                  onChangeText={t => handleChange('dept', t)}
                  className="text-center text-gray-400 border-b mt-2"
                />
              ) : (
                <Text className="text-center text-gray-400 mt-2">
                  {emp.dept}
                </Text>
              )}
            </View>

            {/* CONTACT */}
            <Text className="text-gray-500 text-xs font-bold mt-8 mb-3">
              CONTACT INFO
            </Text>

            <View className="bg-white rounded-2xl px-4 py-4 shadow-sm">
              <Text className="text-gray-400 text-xs">Email</Text>
              {isEditing ? (
                <TextInput
                  value={formData.email}
                  onChangeText={t => handleChange('email', t)}
                  className="border-b text-[#0061C1]"
                />
              ) : (
                <Text className="text-[#0061C1] font-medium">
                  {emp.email}
                </Text>
              )}
            </View>

            {/* STATUS TOGGLE – EDIT MODE ONLY */}
            {isEditing && (
              <View className="bg-white rounded-2xl px-4 py-4 mt-6 shadow-sm">
                <Text className="text-gray-500 text-xs font-bold mb-2">
                  EMPLOYEE STATUS
                </Text>

                <TouchableOpacity
                  onPress={() => setIsActive(!isActive)}
                  className={`flex-row items-center justify-center py-3 rounded-xl ${
                    isActive ? 'bg-green-100' : 'bg-red-100'
                  }`}
                >
                  <Ionicons
                    name={isActive ? 'checkmark-circle' : 'close-circle'}
                    size={20}
                    color={isActive ? '#16a34a' : '#dc2626'}
                  />
                  <Text
                    className={`ml-2 font-bold ${
                      isActive ? 'text-green-700' : 'text-red-700'
                    }`}
                  >
                    {isActive ? 'ACTIVE' : 'INACTIVE'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ACTION BUTTONS */}
            <View className="flex-row mt-10 mb-12">
              {isEditing ? (
                <>
                  <TouchableOpacity
                    onPress={() => setIsEditing(false)}
                    className="flex-1 bg-gray-400 py-4 rounded-xl mr-3 items-center"
                  >
                    <Text className="text-white font-bold">Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSave}
                    disabled={saving}
                    className="flex-1 bg-green-600 py-4 rounded-xl items-center"
                  >
                    {saving ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text className="text-white font-bold">Save</Text>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    onPress={() => setIsEditing(true)}
                    className="flex-1 bg-[#0061C1] py-4 rounded-xl mr-3 items-center"
                  >
                    <Text className="text-white font-bold">Edit</Text>
                  </TouchableOpacity>

                  <View
                    className={`flex-1 py-4 rounded-xl items-center ${
                      isActive ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  >
                    <Text className="text-white font-bold">
                      {isActive ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  };

  if (selectedEmp) {
    return <EmployeeDetailView emp={selectedEmp} />;
  }

  /* =======================
      EMPLOYEE LIST VIEW
     ======================= */
  return (
<SafeAreaView
  edges={['bottom']}
  style={{ flex: 1, backgroundColor: 'white' }}
>

      {/* Header */}
     <View className="bg-[#0061C1] pt-14 pb-1 px-6 flex-row items-center justify-between">
  <TouchableOpacity onPress={() => setSelectedEmp(null)}>
    <Ionicons name="chevron-back" size={26} color="white" />
  </TouchableOpacity>

  <Text className="text-white text-lg font-semibold">
    Employee Details
  </Text>

  <Ionicons name="notifications-outline" size={22} color="white" />
</View>


      <View className="flex-1 -mt-12 bg-gray-300 rounded-t-[40px] px-5 pt-8">
        {/* Search Label */}
        <Text className="text-gray-500 text-xs uppercase mb-2">
          Search Employees
        </Text>

        <View className="bg-[#F1F5F9] rounded-xl px-4 py-3 mb-6 flex-row items-center">
          <Ionicons name="search-outline" size={20} color="#94a3b8" />
          <TextInput
            placeholder="Enter employee name"
            className="ml-2 flex-1"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <FlatList
  data={employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase())
  )}
  keyExtractor={(item) => item.id}
  showsVerticalScrollIndicator={true}
  contentContainerStyle={{ paddingBottom:100 }}
  renderItem={({ item: emp }) => (
    <View className="bg-white rounded-xl mb-2 shadow-sm px-4 pb-2 py-3" >
      <View className="flex-row items-center">
        {/* Avatar */}
        <Image
          source={{ uri: emp.image }}
          className="w-12 h-12 rounded-full"
        />

        {/* Employee Info */}
        <View className="ml-4 flex-1">
          <Text className="font-semibold text-gray-900">
            {emp.name}
          </Text>
          <Text className="text-gray-500 text-xs">
            {emp.role}
          </Text>
          <Text className="text-gray-400 text-[11px]">
            {emp.dept}
          </Text>
        </View>

        {/* View Button */}
        <TouchableOpacity
          onPress={() => setSelectedEmp(emp)}
          className="flex-row items-center"
        >
          <Text className="text-[#0061C1] font-semibold mr-1">
            View
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color="#0061C1"
          />
        </TouchableOpacity>
      </View>
    </View>
  )}
/>

        )}
      </View>
    </SafeAreaView>
  );
};

export default EmployeeData;
