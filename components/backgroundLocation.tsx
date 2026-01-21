// backgroundLocation.ts
import * as TaskManager from 'expo-task-manager';
import { pingLocationService } from '../services/auth.services';

export const TASK_NAME = 'BACKGROUND_LOCATION_TASK';

type BackgroundLocationData = {
  locations: Array<{
    coords: {
      latitude: number;
      longitude: number;
      accuracy?: number;
      altitude?: number | null;
      heading?: number | null;
      speed?: number | null;
    };
    timestamp: number;
  }>;
};

TaskManager.defineTask(TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('❌ Background task error:', error);
    return;
  }

  if (!data) return;

  const { locations } = data as BackgroundLocationData;
  const location = locations?.[0];

  if (!location) return;

  const payload = {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };

  console.log('📡 BACKGROUND PING PAYLOAD 👉', payload);

  try {
    const res = await pingLocationService(payload);
    console.log('✅ BACKGROUND PING RESPONSE 👉', res);
  } catch (err: any) {
    console.error(
      '❌ Failed to ping location',
      err?.response?.data || err.message
    );
  }
});
