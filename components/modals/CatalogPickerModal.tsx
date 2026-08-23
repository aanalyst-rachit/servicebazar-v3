import React from 'react';
import { ActivityIndicator, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApp } from '@/context/AppContext';
import { styles } from '@/styles/appStyles';
import { SERVICE_CATEGORIES, getSubcategories } from '@/constants/serviceCategories';

export default function CatalogPickerModal() {
  const { catalogPickerVisible, setCatalogPickerVisible, catalogPickerType, catalogPickerSearch, setCatalogPickerSearch, category, selectProviderCategory, selectProviderSubcategory } = useApp();

  return (
    <>
        <Modal visible={catalogPickerVisible} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxHeight: '84%' }]}>
              <View style={styles.modalHeaderRow}><Text style={styles.modalTitle}>{catalogPickerType === 'category' ? 'Select Service Category' : 'Select Sub Category'}</Text><TouchableOpacity onPress={() => setCatalogPickerVisible(false)}><Ionicons name="close-circle-outline" size={25} color="#64748b" /></TouchableOpacity></View>
              <View style={styles.adminSearchBox}><Ionicons name="search-outline" size={17} color="#94a3b8" /><TextInput style={styles.adminSearchInput} placeholder="Search..." value={catalogPickerSearch} onChangeText={setCatalogPickerSearch} /></View>
              <ScrollView contentContainerStyle={{ paddingTop: 8 }}>
                {(catalogPickerType === 'category' ? SERVICE_CATEGORIES : getSubcategories(category)).filter(v => v.toLowerCase().includes(catalogPickerSearch.toLowerCase())).map((value) => (
                  <TouchableOpacity key={value} style={styles.catalogOption} onPress={() => catalogPickerType === 'category' ? selectProviderCategory(value) : selectProviderSubcategory(value)}>
                    <Text style={styles.catalogOptionText}>{value}</Text><Ionicons name="chevron-forward" size={16} color="#94a3b8" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
    </>
  );
}
