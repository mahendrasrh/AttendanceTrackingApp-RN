import { API_BASE_URL } from '../constants/api';
import api from './axiosInstance';
export const loginService = async (payload: {
  tenant_id: string;
  username: string;
  password: string;
}) => {
  const url = `${API_BASE_URL}/api/login`;

  console.log("LOGIN API URL 👉", url);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }

  return data;
};
export const registerTenantService = async (payload: {
  institution_name: string;
  admin_username: string;
  admin_password: string;
}) => {
  const url = `${API_BASE_URL}/api/register_tenant`;

  console.log("REGISTER API URL 👉", url);
  console.log("REGISTER PAYLOAD 👉", payload);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Registration failed');
  }

  return data;
};
export const onboardEmployeeService = async (payload: any) => {
  const response = await api.post(
    '/api/onboard_employee',
    payload
  );

  return response.data;
};
export const getEmployeesService = async () => {
  const response = await api.get('/api/employees');
  return response.data;
};
export const updateEmployeeService = async (
  employeeId: string,
  payload: any
) => {
  const response = await api.put(
    `/api/employee/${employeeId}`,
    payload
  );

  return response.data;
};
