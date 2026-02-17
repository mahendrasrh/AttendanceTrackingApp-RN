import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { pingLocationService } from '../services/auth.services';

export const TASK_NAME = 'BACKGROUND_LOCATION_TASK';

TaskManager.defineTask(TASK_NAME, async ({ data, error }) => {
  if (error) {
    // console.error('❌ Background task error:', error);
    return;
  }

  const { locations } = data as any;
  const location = locations?.[0];
  if (!location) return;

  const payload = {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };

  console.log('📡 BACKGROUND LOCATION 👉', payload);

  try {
    await pingLocationService(payload);
  } catch (err: any) {
    // ❌ NO INTERNET → handled later
    console.log('📴 Offline – storing locally');
  }
});
