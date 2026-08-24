import { useApp } from '@/context/AppContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function NewUserProfileScreen() {
  const {
    pendingGoogleUser,
    completeGoogleProfile,
    cancelGoogleOnboarding,
  } = useApp();

  const [name, setName] =
    useState(pendingGoogleUser?.name || '');

  const [phone, setPhone] =
    useState(pendingGoogleUser?.phone || '');

  const [address, setAddress] =
    useState('');

  const [location, setLocation] =
    useState<{
      latitude: number;
      longitude: number;
    } | null>(null);

  const [type, setType] =
    useState('customer');

  const [photo, setPhoto] =
    useState(
      pendingGoogleUser?.profileUri || null
    );

  const [businessName, setBusinessName] =
    useState('');

  const [tagline, setTagline] =
    useState('');

  const [banner, setBanner] =
    useState<string | null>(null);

  const [saving, setSaving] =
    useState(false);

  const [locationLoading, setLocationLoading] =
    useState(false);

  const pickImage = async (isBanner = false) => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permission Required',
        'Photo select karne ke liye gallery permission allow karein.'
      );
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
      });

    if (
      !result.canceled &&
      result.assets?.[0]?.uri
    ) {
      if (isBanner) {
        setBanner(result.assets[0].uri);
      } else {
        setPhoto(result.assets[0].uri);
      }
    }
  };

  const useCurrentLocation = async () => {
    try {
      setLocationLoading(true);

      const permission =
        await Location.requestForegroundPermissionsAsync();

      if (permission.status !== 'granted') {
        Alert.alert(
          'Location Permission',
          'Current location use karne ke liye location permission allow karein.'
        );
        return;
      }

      const current =
        await Location.getCurrentPositionAsync({
          accuracy:
            Location.Accuracy.Balanced,
        });

      const coords = {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      };

      setLocation(coords);

      try {
        const addresses =
          await Location.reverseGeocodeAsync(coords);

        if (addresses?.[0]) {
          const a = addresses[0];

          const parts = [
            a.name,
            a.street,
            a.district,
            a.city,
            a.region,
            a.postalCode,
          ].filter(Boolean);

          if (parts.length) {
            setAddress(
              parts.join(', ')
            );
          }
        }
      } catch (geoError) {
        console.log(
          'Reverse geocoding skipped:',
          geoError
        );
      }

      Alert.alert(
        'Location Added 📍',
        'Current location successfully add ho gayi.'
      );

    } catch (error: any) {
      console.error(
        'Current Location Error:',
        error
      );

      Alert.alert(
        'Location Error',
        error?.message ||
          'Current location nahi mil payi.'
      );

    } finally {
      setLocationLoading(false);
    }
  };

  const submit = async () => {
    if (!name.trim()) {
      Alert.alert(
        'Required',
        'Please apna naam enter karein.'
      );
      return;
    }

    if (!phone.trim()) {
      Alert.alert(
        'Required',
        'Please phone number enter karein.'
      );
      return;
    }

    if (type === 'provider' &&
        !businessName.trim()) {
      Alert.alert(
        'Required',
        'Service Provider ke liye Business/Shop Name required hai.'
      );
      return;
    }

    try {
      setSaving(true);

      await completeGoogleProfile({
        name,
        phone,
        address,
        location,
        type,
        photo,
        businessName,
        tagline,
        banner,
      });

    } catch (error) {
      // completeGoogleProfile already shows the error.
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 20,
        paddingBottom: 40,
        backgroundColor: '#f8fafc',
        flexGrow: 1,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <View
        style={{
          marginBottom: 20,
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: '#4f46e5',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          {photo ? (
            <Image
              source={{ uri: photo }}
              style={{
                width: 72,
                height: 72,
              }}
            />
          ) : (
            <Ionicons
              name="person"
              size={34}
              color="#ffffff"
            />
          )}
        </View>

        <TouchableOpacity
          onPress={() => pickImage(false)}
          style={{
            marginTop: 10,
            paddingHorizontal: 16,
            paddingVertical: 9,
            borderRadius: 8,
            backgroundColor: '#e0e7ff',
          }}
        >
          <Text
            style={{
              color: '#3730a3',
              fontWeight: '700',
            }}
          >
            Add Profile Photo
          </Text>
        </TouchableOpacity>

        <Text
          style={{
            marginTop: 18,
            fontSize: 24,
            fontWeight: '800',
            color: '#111827',
          }}
        >
          Complete Your Profile
        </Text>

        <Text
          style={{
            marginTop: 5,
            textAlign: 'center',
            color: '#64748b',
          }}
        >
          Google sign-in ho gaya. Ab apni basic details complete karein.
        </Text>
      </View>

      <Text style={labelStyle}>Full Name *</Text>
      <TextInput
        style={inputStyle}
        placeholder="Your full name"
        value={name}
        onChangeText={setName}
      />

      <Text style={labelStyle}>Phone Number *</Text>
      <TextInput
        style={inputStyle}
        placeholder="9876543210"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <Text style={labelStyle}>Account Type *</Text>

      <View
        style={{
          flexDirection: 'row',
          gap: 10,
          marginBottom: 16,
        }}
      >
        <TouchableOpacity
          onPress={() => setType('customer')}
          style={[
            roleButtonStyle,
            type === 'customer' &&
              activeRoleStyle,
          ]}
        >
          <Ionicons
            name="person-outline"
            size={20}
            color={
              type === 'customer'
                ? '#ffffff'
                : '#475569'
            }
          />
          <Text
            style={{
              color:
                type === 'customer'
                  ? '#ffffff'
                  : '#475569',
              fontWeight: '700',
            }}
          >
            Customer
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setType('provider')}
          style={[
            roleButtonStyle,
            type === 'provider' &&
              activeRoleStyle,
          ]}
        >
          <Ionicons
            name="storefront-outline"
            size={20}
            color={
              type === 'provider'
                ? '#ffffff'
                : '#475569'
            }
          />
          <Text
            style={{
              color:
                type === 'provider'
                  ? '#ffffff'
                  : '#475569',
              fontWeight: '700',
            }}
          >
            Provider
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={labelStyle}>Address</Text>
      <TextInput
        style={[
          inputStyle,
          {
            minHeight: 80,
            textAlignVertical: 'top',
          },
        ]}
        placeholder="House / Street / Area"
        multiline
        value={address}
        onChangeText={setAddress}
      />

      <TouchableOpacity
        onPress={useCurrentLocation}
        disabled={locationLoading}
        style={{
          backgroundColor: '#ffffff',
          borderWidth: 1,
          borderColor: '#cbd5e1',
          borderRadius: 10,
          padding: 14,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 18,
        }}
      >
        {locationLoading ? (
          <ActivityIndicator />
        ) : (
          <Ionicons
            name="location-outline"
            size={21}
            color="#4f46e5"
          />
        )}

        <Text
          style={{
            marginLeft: 8,
            color: '#3730a3',
            fontWeight: '700',
          }}
        >
          {locationLoading
            ? 'Getting Location...'
            : location
              ? 'Location Added ✓'
              : 'Use Current Location'}
        </Text>
      </TouchableOpacity>

      {location && (
        <Text
          style={{
            marginTop: -10,
            marginBottom: 16,
            color: '#64748b',
            fontSize: 12,
          }}
        >
          {location.latitude.toFixed(6)},
          {' '}
          {location.longitude.toFixed(6)}
        </Text>
      )}

      {type === 'provider' && (
        <>
          <Text style={labelStyle}>
            Business / Shop Name *
          </Text>

          <TextInput
            style={inputStyle}
            placeholder="Your business name"
            value={businessName}
            onChangeText={setBusinessName}
          />

          <Text style={labelStyle}>
            Tagline
          </Text>

          <TextInput
            style={inputStyle}
            placeholder="Your business tagline"
            value={tagline}
            onChangeText={setTagline}
          />

          <Text style={labelStyle}>
            Banner (Optional)
          </Text>

          <TouchableOpacity
            onPress={() => pickImage(true)}
            style={{
              height: 120,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#cbd5e1',
              borderStyle: 'dashed',
              backgroundColor: '#ffffff',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden',
              marginBottom: 18,
            }}
          >
            {banner ? (
              <Image
                source={{ uri: banner }}
                style={{
                  width: '100%',
                  height: '100%',
                }}
                resizeMode="cover"
              />
            ) : (
              <>
                <Ionicons
                  name="image-outline"
                  size={30}
                  color="#64748b"
                />
                <Text
                  style={{
                    marginTop: 6,
                    color: '#64748b',
                  }}
                >
                  Add Business Banner
                </Text>
              </>
            )}
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity
        onPress={submit}
        disabled={saving}
        style={{
          backgroundColor: '#4f46e5',
          borderRadius: 12,
          paddingVertical: 16,
          alignItems: 'center',
          marginTop: 5,
        }}
      >
        {saving ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text
            style={{
              color: '#ffffff',
              fontSize: 16,
              fontWeight: '800',
            }}
          >
            Create Profile & Continue 🚀
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={cancelGoogleOnboarding}
        disabled={saving}
        style={{
          alignItems: 'center',
          paddingVertical: 15,
        }}
      >
        <Text
          style={{
            color: '#64748b',
            fontWeight: '600',
          }}
        >
          Cancel
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const labelStyle = {
  color: '#334155',
  fontSize: 14,
  fontWeight: '700' as const,
  marginBottom: 7,
};

const inputStyle = {
  backgroundColor: '#ffffff',
  borderWidth: 1,
  borderColor: '#cbd5e1',
  borderRadius: 10,
  paddingHorizontal: 14,
  paddingVertical: 12,
  fontSize: 15,
  color: '#111827',
  marginBottom: 15,
};

const roleButtonStyle = {
  flex: 1,
  minHeight: 52,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: '#cbd5e1',
  backgroundColor: '#ffffff',
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  gap: 7,
};

const activeRoleStyle = {
  backgroundColor: '#4f46e5',
  borderColor: '#4f46e5',
};
