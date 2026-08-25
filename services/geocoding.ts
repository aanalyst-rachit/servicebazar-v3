import { Alert } from 'react-native';
import * as Location from 'expo-location';

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export const fetchAddressFromCoords = async (
  lat: number,
  lon: number,
  setAddress: (address: string) => void
): Promise<void> => {
  try {
    const results = await Location.reverseGeocodeAsync({
      latitude: lat,
      longitude: lon,
    });

    if (!results || results.length === 0) {
      console.log('Reverse Geocoding: No address found');
      return;
    }

    const place = results[0];

    const parts = [
      place.name,
      place.street,
      place.district,
      place.subregion,
      place.city,
      place.region,
      place.postalCode,
    ].filter(
      (value, index, array) =>
        value && array.indexOf(value) === index
    );

    const formattedAddress = parts.join(', ');

    if (formattedAddress) {
      setAddress(formattedAddress);
    }
  } catch (e) {
    console.log(
      'Native Reverse Geocoding Error:',
      e
    );
  }
};

export const searchAddressOnMap = async (
  address: string,
  setAddress: (address: string) => void,
  setRegion: (region: Region) => void,
  setLoadingMap: (loading: boolean) => void
): Promise<void> => {
  if (!address.trim()) {
    Alert.alert(
      'Alert ⚠️',
      'Address input me type karein!'
    );
    return;
  }

  setLoadingMap(true);

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`,
      {
        headers: {
          'User-Agent': 'ServiceBazarApp/1.0',
          'Accept-Language': 'en',
        },
      }
    );

    const data = await response.json();

    if (data && data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);

      setRegion({
        latitude: lat,
        longitude: lon,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });

      if (data[0].display_name) {
        setAddress(data[0].display_name);
      }

      Alert.alert(
        'Success 📍',
        'Map location update ho gayi!'
      );
    } else {
      Alert.alert(
        'Location Not Found ❌',
        'Sahi location name enter karein.'
      );
    }
  } catch {
    Alert.alert(
      'Error ❌',
      'Location fetch nahi ho saki.'
    );
  } finally {
    setLoadingMap(false);
  }
};
