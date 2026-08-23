import { useApp } from '@/context/AppContext';
import { styles } from '@/styles/appStyles';
import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AuthScreen() {
  const { selectedSignupRole, setSelectedSignupRole, authName, setAuthName, authPhone, setAuthPhone, handleSignUp } = useApp();

  return (
          <ScrollView   keyboardShouldPersistTaps="always" keyboardDismissMode="none" contentContainerStyle={styles.authContainer}>
            <View style={styles.authBrandRow}><View style={styles.brandMark}><Ionicons name="storefront-outline" size={22} color="#ffffff" /></View><Text style={styles.appLogoText}>ServiceBazar</Text></View>
            <Text style={styles.authSubTitle}>Welcome! Select your account type to proceed</Text>

            <View style={styles.roleSelectionRow}>
              <TouchableOpacity 
                style={[styles.roleBox, selectedSignupRole === 'customer' && styles.selectedRoleBox]}
                onPress={() => setSelectedSignupRole('customer')}
              >
                <View style={[styles.roleIconCircle, selectedSignupRole === 'customer' && styles.roleIconCircleActive]}><Ionicons name="person-outline" size={24} color={selectedSignupRole === 'customer' ? "#ffffff" : "#64748b"} /></View>
                <Text style={[styles.roleText, selectedSignupRole === 'customer' && styles.selectedRoleText]}>Customer</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.roleBox, selectedSignupRole === 'provider' && styles.selectedRoleBox]}
                onPress={() => setSelectedSignupRole('provider')}
              >
                <View style={[styles.roleIconCircle, selectedSignupRole === 'provider' && styles.roleIconCircleActive]}><Ionicons name="storefront-outline" size={24} color={selectedSignupRole === 'provider' ? "#ffffff" : "#64748b"} /></View>
                <Text style={[styles.roleText, selectedSignupRole === 'provider' && styles.selectedRoleText]}>Service Provider</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                {selectedSignupRole === 'customer' ? 'Customer Sign Up' : 'Register Service Provider'}
              </Text>

              <Text style={styles.label}>Full Name</Text>
              <TextInput style={styles.input} placeholder="e.g. Amit Sharma" value={authName} onChangeText={setAuthName} />

              <Text style={styles.label}>Mobile Number (Primary Key ID)</Text>
              <TextInput style={styles.input} placeholder="9876543210" keyboardType="phone-pad" value={authPhone} onChangeText={setAuthPhone} />

              <TouchableOpacity style={styles.btn} onPress={handleSignUp}>
                <Text style={styles.btnText}>Continue 🚀</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
  );
}
