import * as Location from 'expo-location';
import { Alert, Linking } from 'react-native';

export const requestLocationPermissions = async (): Promise<boolean> => {
  const { status, canAskAgain } =
    await Location.requestForegroundPermissionsAsync();

  if (status === 'granted') {
    return true;
  }

  if (!canAskAgain) {
    Alert.alert(
      'Location Permission Required',
      'Please enable location permission from Settings to continue.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]
    );
  } else {
    Alert.alert(
      'Location Permission Required',
      'Location permission is required for attendance tracking.'
    );
  }

  return false;
};
