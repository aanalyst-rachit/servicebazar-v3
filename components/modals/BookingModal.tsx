import React from 'react';
import { ActivityIndicator, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApp } from '@/context/AppContext';
import { styles } from '@/styles/appStyles';

type Slot = {
  slotTime: string;
  availableSeats: number;
  [key: string]: unknown;
};

type CartItem = {
  id: string;
  name: string;
  price: string | number;
  autoSlots?: Slot[];
  [key: string]: unknown;
};

export default function BookingModal() {
  const { bookingModalVisible, setBookingModalVisible, cart, authPhone, custBookingPhone, setCustBookingPhone, selectedSlotForBooking, setSelectedSlotForBooking, isSubmittingBooking, handleConfirmCustomerBooking } = useApp();

  const typedCart = cart as CartItem[];

  return (
    <>
        <Modal visible={bookingModalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Confirm Cart Booking</Text>
              
              {/* Selected Cart Items Summary */}
              <View style={styles.modalCartSummary}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#4f46e5', marginBottom: 6 }}>
                  Selected Services ({cart.length}):
                </Text>
                {typedCart.map((c: CartItem, i: number) => (
                  <View key={c.id} style={styles.modalCartRow}>
                    <Text style={{ fontSize: 12, color: '#0f172a', flex: 1 }}>{i + 1}. {c.name}</Text>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#16a34a' }}>₹{c.price}</Text>
                  </View>
                ))}
                <View style={styles.modalCartTotalRow}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#0f172a' }}>Total Amount:</Text>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: '#16a34a' }}>
                    ₹{typedCart.reduce(
                    (sum: number, item: CartItem) =>
                      sum + (parseFloat(String(item.price)) || 0),
                    0
                  )}
                  </Text>
                </View>
              </View>

              <Text style={styles.label}>Phone Number</Text>
              <TextInput style={styles.input} placeholder="9876543210" keyboardType="phone-pad" value={authPhone || custBookingPhone} onChangeText={setCustBookingPhone} />

              <Text style={styles.label}>Select Time Slot for Each Service</Text>
              <ScrollView style={{ maxHeight: 260, marginVertical: 10 }} showsVerticalScrollIndicator={false}>
                {typedCart.map((serviceItem: CartItem) => (
                  <View key={serviceItem.id} style={{ marginBottom: 12 }}>
                    <Text style={{ fontSize: 12, fontWeight: '800', color: '#0f172a', marginBottom: 6 }}>
                      {serviceItem.name}
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {(serviceItem.autoSlots || []).map((s: Slot, idx: number) => {
                        const isFull = s.availableSeats <= 0;
                        const isSelected = selectedSlotForBooking[serviceItem.id]?.slotTime === s.slotTime;
                        return (
                          <TouchableOpacity
                            key={`${serviceItem.id}-${idx}`}
                            disabled={isFull}
                            style={[
                              styles.slotChip,
                              isSelected && styles.activeSlotChip,
                              isFull && { backgroundColor: '#fee2e2', opacity: 0.6 }
                            ]}
                            onPress={() => setSelectedSlotForBooking((prev: Record<string, Slot>) => ({ ...prev, [serviceItem.id]: s }))}
                          >
                            <Ionicons
                              name="time-outline"
                              size={14}
                              color={isSelected ? '#ffffff' : isFull ? '#ef4444' : '#334155'}
                              style={{ marginRight: 4 }}
                            />
                            <Text style={[
                              styles.slotChipText,
                              isSelected && styles.activeSlotChipText,
                              isFull && { color: '#dc2626' }
                            ]}>
                              {s.slotTime} ({isFull ? 'Housefull' : `${s.availableSeats} left`})
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                ))}
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setBookingModalVisible(false)} disabled={isSubmittingBooking}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmCustomerBooking} disabled={isSubmittingBooking}>
                  {isSubmittingBooking ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.confirmBtnText}>Book Cart 🚀</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
    </>
  );
}
