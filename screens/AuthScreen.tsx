import { useApp } from '@/context/AppContext';
import { styles } from '@/styles/appStyles';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AuthScreen() {
  const {
    selectedSignupRole,
    setSelectedSignupRole,
    authName,
    setAuthName,
    authPhone,
    setAuthPhone,
    handleSignUp,
    handleGoogleSignIn,
  } = useApp();

  const [showOtherOptions, setShowOtherOptions] = useState(false);

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.82)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 7,
        tension: 45,
        useNativeDriver: true,
      }),
    ]).start();
  }, [logoOpacity, logoScale]);

  return (
    <ScrollView
      keyboardShouldPersistTaps="always"
      keyboardDismissMode="none"
      contentContainerStyle={styles.authContainer}
    >
      {/* =====================================================
          SERVICEBAZAR BRAND
          ===================================================== */}
      <Animated.View
        style={{
          alignItems: 'center',
          marginBottom: 12,
          opacity: logoOpacity,
          transform: [{ scale: logoScale }],
        }}
      >
        <Image
          source={require('@/assets/images/icon.png')}
          style={{
            width: 86,
            height: 86,
            borderRadius: 20,
            marginBottom: 10,
          }}
          resizeMode="contain"
        />

        <Text style={styles.appLogoText}>ServiceBazar</Text>

        <Text style={styles.authSubTitle}>
          Local services. One place.
        </Text>
      </Animated.View>

      {/* =====================================================
          PRIMARY GOOGLE LOGIN
          ===================================================== */}
      <View
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 18,
          padding: 18,
          borderWidth: 1,
          borderColor: '#e2e8f0',
          marginTop: 8,
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: '800',
            color: '#0f172a',
            textAlign: 'center',
            marginBottom: 14,
          }}
        >
          Welcome to ServiceBazar
        </Text>

        <TouchableOpacity
          style={[
            styles.btn,
            {
              backgroundColor: '#ffffff',
              borderWidth: 1,
              borderColor: '#d1d5db',
              elevation: 2,
            },
          ]}
          onPress={handleGoogleSignIn}
          activeOpacity={0.8}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons
              name="logo-google"
              size={20}
              color="#4285F4"
            />
            <Text
              style={[
                styles.btnText,
                {
                  color: '#1f2937',
                  marginLeft: 8,
                },
              ]}
            >
              Continue with Google
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* =====================================================
          OTHER LOGIN OPTIONS
          ===================================================== */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setShowOtherOptions((value) => !value)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 10,
          marginBottom: showOtherOptions ? 12 : 0,
        }}
      >
        <View
          style={{
            width: 18,
            height: 18,
            borderRadius: 9,
            borderWidth: 1.8,
            borderColor: showOtherOptions ? '#4f46e5' : '#94a3b8',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 8,
          }}
        >
          {showOtherOptions && (
            <View
              style={{
                width: 9,
                height: 9,
                borderRadius: 5,
                backgroundColor: '#4f46e5',
              }}
            />
          )}
        </View>

        <Text
          style={{
            fontSize: 13,
            fontWeight: '700',
            color: '#475569',
          }}
        >
          Other login options
        </Text>
      </TouchableOpacity>

      {/* =====================================================
          OLD PHONE + NAME LOGIN
          HIDDEN BY DEFAULT
          ===================================================== */}
      {showOtherOptions && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {selectedSignupRole === 'customer'
              ? 'Customer Sign Up'
              : 'Register Service Provider'}
          </Text>

          {/* ROLE SELECTION */}
          <View style={styles.roleSelectionRow}>
            <TouchableOpacity
              style={[
                styles.roleBox,
                selectedSignupRole === 'customer' &&
                  styles.selectedRoleBox,
              ]}
              onPress={() =>
                setSelectedSignupRole('customer')
              }
            >
              <View
                style={[
                  styles.roleIconCircle,
                  selectedSignupRole === 'customer' &&
                    styles.roleIconCircleActive,
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={24}
                  color={
                    selectedSignupRole === 'customer'
                      ? '#ffffff'
                      : '#64748b'
                  }
                />
              </View>

              <Text
                style={[
                  styles.roleText,
                  selectedSignupRole === 'customer' &&
                    styles.selectedRoleText,
                ]}
              >
                Customer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleBox,
                selectedSignupRole === 'provider' &&
                  styles.selectedRoleBox,
              ]}
              onPress={() =>
                setSelectedSignupRole('provider')
              }
            >
              <View
                style={[
                  styles.roleIconCircle,
                  selectedSignupRole === 'provider' &&
                    styles.roleIconCircleActive,
                ]}
              >
                <Ionicons
                  name="storefront-outline"
                  size={24}
                  color={
                    selectedSignupRole === 'provider'
                      ? '#ffffff'
                      : '#64748b'
                  }
                />
              </View>

              <Text
                style={[
                  styles.roleText,
                  selectedSignupRole === 'provider' &&
                    styles.selectedRoleText,
                ]}
              >
                Service Provider
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Full Name</Text>

          <TextInput
            style={styles.input}
            placeholder="e.g. Amit Sharma"
            value={authName}
            onChangeText={setAuthName}
          />

          <Text style={styles.label}>
            Mobile Number (Primary Key ID)
          </Text>

          <TextInput
            style={styles.input}
            placeholder="9876543210"
            keyboardType="phone-pad"
            value={authPhone}
            onChangeText={setAuthPhone}
          />

          <TouchableOpacity
            style={styles.btn}
            onPress={handleSignUp}
          >
            <Text style={styles.btnText}>
              Continue 🚀
            </Text>
          </TouchableOpacity>

        </View>
      )}
    </ScrollView>
  );
}
