import AdminEditModal from '@/components/modals/AdminEditModal';
import BookingModal from '@/components/modals/BookingModal';
import CatalogPickerModal from '@/components/modals/CatalogPickerModal';
import RatingModal from '@/components/modals/RatingModal';
import ShopImagesModal from '@/components/modals/ShopImagesModal';
import { useApp } from '@/context/AppContext';
import AdminScreen from '@/screens/AdminScreen';
import AuthScreen from '@/screens/AuthScreen';
import CustomerScreen from '@/screens/CustomerScreen';
import ProviderScreen from '@/screens/ProviderScreen';
import { styles } from '@/styles/appStyles';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function ServiceBazarRoot() {
  const { isDataLoaded, userRole } = useApp();

  if (!isDataLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={{ marginTop: 12, color: '#64748b', fontSize: 13, fontWeight: '500' }}>Connecting to Cloud...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          {!userRole ? (
            <AuthScreen />
          ) : userRole === 'admin' ? (
            <AdminScreen />
          ) : userRole === 'customer' ? (
            <CustomerScreen />
          ) : (
            <ProviderScreen />
          )}

          <AdminEditModal />
          <CatalogPickerModal />
          <ShopImagesModal />
          <BookingModal />
          <RatingModal />
        </SafeAreaView>
    </SafeAreaProvider>
  );
}
