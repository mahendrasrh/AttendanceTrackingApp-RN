import * as Location from "expo-location";
import { Alert } from "react-native";

export async function requestLocationPermissions() {
  // Foreground permission
  const fg = await Location.requestForegroundPermissionsAsync();
  if (!fg.granted) {
    Alert.alert(
      "Permission Required",
      "Foreground location permission is required"
    );
    return false;
  }

  // Background permission
  const bg = await Location.requestBackgroundPermissionsAsync();
  if (!bg.granted) {
    Alert.alert(
      "Permission Required",
      "Background location permission is required for attendance tracking"
    );
    return false;
  }

  return true;
}
