import React from 'react';
import { ActivityIndicator, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApp } from '@/context/AppContext';
import { styles } from '@/styles/appStyles';

export default function RatingModal() {
  const { ratingModalVisible, setRatingModalVisible, ratingValue, setRatingValue, feedbackText, setFeedbackText, handleSubmitRating } = useApp();

  return (
    <>
        <Modal visible={ratingModalVisible} animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Rate Your Experience ⭐</Text>
              <Text style={{ fontSize: 12, color: '#64748b', marginBottom: 15 }}>
                Service complete karne ke liye rating dein:
              </Text>

              <View style={styles.starSelectionRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRatingValue(star)}>
                    <Ionicons 
                      name={star <= ratingValue ? "star" : "star-outline"} 
                      size={32} 
                      color={star <= ratingValue ? "#eab308" : "#cbd5e1"} 
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { marginTop: 10 }]}>Feedback / Review (Optional)</Text>
              <TextInput 
                style={[styles.input, { height: 60 }]} 
                placeholder="Aapko service kaisi lagi?" 
                multiline 
                value={feedbackText} 
                onChangeText={setFeedbackText} 
              />

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setRatingModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmBtn} onPress={handleSubmitRating}>
                  <Text style={styles.confirmBtnText}>Submit Rating</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
    </>
  );
}
