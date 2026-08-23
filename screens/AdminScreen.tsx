import React from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApp } from '@/context/AppContext';
import { styles } from '@/styles/appStyles';

export default function AdminScreen() {
  const { adminCollection, setAdminCollection, adminDocs, adminLoading, adminSearch, setAdminSearch, loadAdminCollection, openAdminEditor, deleteAdminDocument, handleLogout } = useApp();

  return (
          <View style={{ flex: 1, backgroundColor: '#f6f7fb' }}>
            <View style={styles.adminHeader}>
              <View style={styles.adminBrandRow}>
                <View style={styles.adminBrandMark}><Ionicons name="shield-checkmark" size={19} color="#ffffff" /></View>
                <View><Text style={styles.adminTitle}>ServiceBazar Admin</Text><Text style={styles.adminSubTitle}>Full database control</Text></View>
              </View>
              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}><Ionicons name="log-out-outline" size={18} color="#dc2626" /><Text style={styles.logoutBtnText}>Logout</Text></TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.adminCollectionRow}>
              {['profile','services','bookings','users','registered_phones','reviews'].map((c) => (
                <TouchableOpacity key={c} style={[styles.adminCollectionChip, adminCollection === c && styles.adminCollectionChipActive]} onPress={() => { setAdminCollection(c); loadAdminCollection(c); }}>
                  <Text style={[styles.adminCollectionText, adminCollection === c && styles.adminCollectionTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.adminToolbar}>
              <View style={styles.adminSearchBox}><Ionicons name="search-outline" size={17} color="#94a3b8" /><TextInput style={styles.adminSearchInput} placeholder="Search documents..." value={adminSearch} onChangeText={setAdminSearch} /></View>
              <TouchableOpacity style={styles.adminAddBtn} onPress={() => openAdminEditor(null)}><Ionicons name="add" size={18} color="#ffffff" /></TouchableOpacity>
            </View>
            {adminLoading ? <ActivityIndicator size="large" color="#6366f1" style={{ marginTop: 40 }} /> : (
              <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
                {adminDocs.filter((d: Record<string, any> & { id: string }) => !adminSearch || JSON.stringify(d).toLowerCase().includes(adminSearch.toLowerCase())).map((item: Record<string, any> & { id: string }) => (
                  <View key={item.id} style={styles.adminDocCard}>
                    <View style={styles.adminDocTop}><Text style={styles.adminDocId} numberOfLines={1}>{item.id}</Text><View style={styles.adminDocActions}><TouchableOpacity onPress={() => openAdminEditor(item)} style={styles.adminIconBtn}><Ionicons name="create-outline" size={17} color="#4f46e5" /></TouchableOpacity><TouchableOpacity onPress={() => deleteAdminDocument(item.id)} style={styles.adminIconBtnDanger}><Ionicons name="trash-outline" size={17} color="#dc2626" /></TouchableOpacity></View></View>
                    <Text style={styles.adminDocPreview} numberOfLines={5}>{JSON.stringify(item, null, 2)}</Text>
                  </View>
                ))}
                {adminDocs.length === 0 && <View style={styles.emptyBox}><Ionicons name="server-outline" size={40} color="#cbd5e1" /><Text style={{ color: '#64748b', marginTop: 8 }}>Load a collection to manage its documents.</Text></View>}
              </ScrollView>
            )}
          </View>
  );
}
