import React from 'react';
import { ActivityIndicator, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApp } from '@/context/AppContext';
import { styles } from '@/styles/appStyles';

export default function ShopImagesModal() {
  const { shopImagesVisible, setShopImagesVisible, selectedShopImages } = useApp();

  return (
    <>
        <Modal visible={shopImagesVisible} animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}><View style={[styles.modalContent, { padding: 12 }]}><View style={styles.modalHeaderRow}><Text style={styles.modalTitle}>Business Images</Text><TouchableOpacity onPress={() => setShopImagesVisible(false)}><Ionicons name="close-circle-outline" size={25} color="#64748b" /></TouchableOpacity></View><ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>{selectedShopImages.map((uri: string, i: number) => <View key={uri + i} style={styles.fullShopImageWrap}><Image source={{ uri }} style={styles.fullShopImage} /><Text style={styles.imageCaption}>{i === 0 ? 'Front View' : 'Inside View'}</Text></View>)}</ScrollView></View></View>
        </Modal>
    </>
  );
}
