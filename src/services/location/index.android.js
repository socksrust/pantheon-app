import { PermissionsAndroid } from 'react-native';

const checkPermissionAlreadyGranted = async () => {
  const isPermissionAlreadyGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
  
  return isPermissionAlreadyGranted;
}

const requestLocationPermission = async () => {
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      'title': 'Location Permission',
      'message': 'We need to know your location to ' +
                 'provide events near you.',
    },
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

const getLocationCoordinates = async (navigator) => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve(coords),
      error => reject(error),
      { enableHighAccuracy: true, timeout: 20000 },
    );
  });
}

const getUserLocation = async (navigator) => {
 const isPermissionAlreadyGranted = await checkPermissionAlreadyGranted();

  if (!isPermissionAlreadyGranted) {
    const grantedLocationPermission = await requestLocationPermission();

    if (grantedLocationPermission === PermissionsAndroid.RESULTS.DENIED) {
      return null;
    }
  }
  
  const userCoordinates = await getLocationCoordinates(navigator);

  return userCoordinates;
}

export default getUserLocation;
