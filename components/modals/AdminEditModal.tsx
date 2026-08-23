import React from 'react';
import { ActivityIndicator, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApp } from '@/context/AppContext';
import { styles } from '@/styles/appStyles';

export default function AdminEditModal() {
  const { adminEditVisible, setAdminEditVisible, adminEditingDoc, adminCollection, adminEditText, setAdminEditText, saveAdminDocument } = useApp();

  return (
    <>
        <Modal visible={adminEditVisible} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxHeight: '88%' }]}>
              <View style={styles.modalHeaderRow}><Text style={styles.modalTitle}>{adminEditingDoc ? 'Edit Document' : 'Create Document'}</Text><TouchableOpacity onPress={() => setAdminEditVisible(false)}><Ionicons name="close-circle-outline" size={25} color="#64748b" /></TouchableOpacity></View>
              <Text style={styles.modalSubTitle}>{adminCollection} • JSON editor</Text>
              <TextInput style={styles.adminJsonInput} multiline value={adminEditText} onChangeText={setAdminEditText} autoCapitalize="none" autoCorrect={false} />
              <View style={styles.modalActions}><TouchableOpacity style={styles.cancelBtn} onPress={() => setAdminEditVisible(false)}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity><TouchableOpacity style={styles.confirmBtn} onPress={saveAdminDocument}><Text style={styles.confirmBtnText}>Save</Text></TouchableOpacity></View>
            </View>
          </View>
        </Modal>
    </>
  );
}
