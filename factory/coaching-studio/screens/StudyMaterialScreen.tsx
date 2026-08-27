import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as DocumentPicker from 'expo-document-picker';

import { useApp } from '@/context/AppContext';
import { uploadMediaToCloudinary } from '@/services/cloudinary';
import {
  deleteStudyMaterial,
  getStudyMaterials,
  saveStudyMaterial,
  updateStudyMaterial,
  type StudyMaterial,
} from '../coachingTeacherService';

type StudyMaterialScreenProps = {
  onBack?: () => void;
};

export default function StudyMaterialScreen({
  onBack,
}: StudyMaterialScreenProps) {
  const { firebaseUid } = useApp();

  const [activeTab, setActiveTab] = useState<
    'add' | 'materials'
  >('add');

  const [materialName, setMaterialName] =
    useState('');
  const [materialDetails, setMaterialDetails] =
    useState('');
  const [pdfName, setPdfName] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');

  const [materials, setMaterials] = useState<
    StudyMaterial[]
  >([]);

  const [saving, setSaving] = useState(false);
  const [loadingMaterials, setLoadingMaterials] =
    useState(false);
  const [pdfUploading, setPdfUploading] =
    useState(false);

  const [editingMaterialId, setEditingMaterialId] =
    useState<string | null>(null);

  useEffect(() => {
    if (!firebaseUid) {
      return;
    }

    loadMaterials();
  }, [firebaseUid]);

  const loadMaterials = async () => {
    if (!firebaseUid) {
      return;
    }

    try {
      setLoadingMaterials(true);

      const loadedMaterials =
        await getStudyMaterials(firebaseUid);

      setMaterials(loadedMaterials);
    } catch (error) {
      console.error(
        'STUDY MATERIALS LOAD ERROR:',
        error
      );

      Alert.alert(
        'Error',
        'Unable to load study materials.'
      );
    } finally {
      setLoadingMaterials(false);
    }
  };

  const resetForm = () => {
    setMaterialName('');
    setMaterialDetails('');
    setPdfName('');
    setPdfUrl('');
    setEditingMaterialId(null);
  };

  const pickPdf = async () => {
    try {
      const result =
        await DocumentPicker.getDocumentAsync({
          type: 'application/pdf',
          copyToCacheDirectory: true,
          multiple: false,
        });

      if (result.canceled) {
        return;
      }

      const file = result.assets?.[0];

      if (!file?.uri) {
        throw new Error(
          'PDF file URI was not returned.'
        );
      }

      setPdfUploading(true);

      const cloudinaryUrl =
        await uploadMediaToCloudinary(
          file.uri,
          'raw'
        );

      setPdfUrl(cloudinaryUrl);
      setPdfName(file.name || 'PDF Document');

      Alert.alert(
        'PDF uploaded',
        'PDF has been uploaded successfully.'
      );
    } catch (error: any) {
      console.error(
        'STUDY MATERIAL PDF UPLOAD ERROR:',
        error
      );

      Alert.alert(
        'PDF upload failed',
        error?.message ||
          'Unable to upload PDF.'
      );
    } finally {
      setPdfUploading(false);
    }
  };

  const saveMaterial = async () => {
    if (!firebaseUid) {
      Alert.alert(
        'Login required',
        'Teacher authentication not found.'
      );
      return;
    }

    if (!materialName.trim()) {
      Alert.alert(
        'Material name required',
        'Please enter the material name.'
      );
      return;
    }

    if (!materialDetails.trim()) {
      Alert.alert(
        'Material details required',
        'Please enter material details.'
      );
      return;
    }

    if (pdfUploading) {
      Alert.alert(
        'Upload in progress',
        'Please wait until the PDF upload finishes.'
      );
      return;
    }

    if (!pdfUrl.trim()) {
      Alert.alert(
        'PDF required',
        'Please select and upload the PDF.'
      );
      return;
    }

    try {
      setSaving(true);

      const materialData = {
        materialName: materialName.trim(),
        materialDetails: materialDetails.trim(),
        pdfName: pdfName.trim(),
        pdfUrl: pdfUrl.trim(),
      };

      if (editingMaterialId) {
        await updateStudyMaterial(
          firebaseUid,
          editingMaterialId,
          materialData
        );
      } else {
        await saveStudyMaterial(
          firebaseUid,
          materialData
        );
      }

      resetForm();
      await loadMaterials();
      setActiveTab('materials');

      Alert.alert(
        editingMaterialId
          ? 'Material updated'
          : 'Material added',
        editingMaterialId
          ? 'Study material has been updated successfully.'
          : 'Study material has been saved successfully.'
      );
    } catch (error: any) {
      console.error(
        'STUDY MATERIAL SAVE ERROR:',
        error
      );

      Alert.alert(
        'Save failed',
        error?.message ||
          'Unable to save study material.'
      );
    } finally {
      setSaving(false);
    }
  };

  const startEditMaterial = (
    material: StudyMaterial
  ) => {
    setEditingMaterialId(material.id);
    setMaterialName(material.materialName || '');
    setMaterialDetails(
      material.materialDetails || ''
    );
    setPdfName(material.pdfName || '');
    setPdfUrl(material.pdfUrl || '');
    setActiveTab('add');
  };

  const deleteMaterial = (
    material: StudyMaterial
  ) => {
    Alert.alert(
      'Delete study material?',
      `Are you sure you want to delete "${material.materialName}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!firebaseUid) {
              return;
            }

            try {
              await deleteStudyMaterial(
                firebaseUid,
                material.id
              );

              await loadMaterials();

              Alert.alert(
                'Deleted',
                'Study material has been deleted.'
              );
            } catch (error: any) {
              console.error(
                'STUDY MATERIAL DELETE ERROR:',
                error
              );

              Alert.alert(
                'Delete failed',
                error?.message ||
                  'Unable to delete study material.'
              );
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          activeOpacity={0.8}
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color="#0f172a"
          />
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={styles.title}>
            Study Material
          </Text>

          <Text style={styles.subtitle}>
            Manage your PDF study materials
          </Text>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setActiveTab('add')}
          style={[
            styles.tab,
            activeTab === 'add' &&
              styles.activeTab,
          ]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'add' &&
                styles.activeTabText,
            ]}
          >
            {editingMaterialId
              ? 'Edit Material'
              : 'Add Material'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() =>
            setActiveTab('materials')
          }
          style={[
            styles.tab,
            activeTab === 'materials' &&
              styles.activeTab,
          ]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'materials' &&
                styles.activeTabText,
            ]}
          >
            My Materials
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {activeTab === 'add' ? (
          <>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>
                Material Information
              </Text>

              <Text style={styles.label}>
                Material Name
              </Text>

              <TextInput
                value={materialName}
                onChangeText={setMaterialName}
                placeholder="e.g. Mathematics Notes"
                placeholderTextColor="#94a3b8"
                style={styles.input}
              />

              <Text style={styles.label}>
                Material Details
              </Text>

              <TextInput
                value={materialDetails}
                onChangeText={setMaterialDetails}
                placeholder="Describe this study material"
                placeholderTextColor="#94a3b8"
                style={[
                  styles.input,
                  styles.multilineInput,
                ]}
                multiline
                textAlignVertical="top"
              />
            </View>

            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  PDF Document
                </Text>
              </View>

              <Text style={styles.label}>
                Attach PDF
              </Text>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={pickPdf}
                disabled={pdfUploading}
                style={[
                  styles.browseButton,
                  pdfUploading &&
                    styles.buttonDisabled,
                ]}
              >
                {pdfUploading ? (
                  <ActivityIndicator />
                ) : (
                  <Ionicons
                    name={
                      pdfUrl
                        ? 'checkmark-circle-outline'
                        : 'document-attach-outline'
                    }
                    size={21}
                    color="#2563eb"
                  />
                )}

                <Text
                  style={styles.browseButtonText}
                >
                  {pdfUploading
                    ? 'Uploading PDF...'
                    : pdfUrl
                      ? pdfName ||
                        'PDF uploaded'
                      : 'Pick PDF'}
                </Text>
              </TouchableOpacity>

              {pdfName ? (
                <View style={styles.pdfInfo}>
                  <Ionicons
                    name="document-text-outline"
                    size={19}
                    color="#2563eb"
                  />

                  <Text
                    style={styles.pdfName}
                    numberOfLines={2}
                  >
                    {pdfName}
                  </Text>
                </View>
              ) : null}
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={saveMaterial}
              disabled={
                saving || pdfUploading
              }
              style={[
                styles.primaryButton,
                (saving || pdfUploading) &&
                  styles.buttonDisabled,
              ]}
            >
              {saving ? (
                <ActivityIndicator
                  color="#ffffff"
                />
              ) : (
                <>
                  <Ionicons
                    name={
                      editingMaterialId
                        ? 'save-outline'
                        : 'add-circle-outline'
                    }
                    size={21}
                    color="#ffffff"
                  />

                  <Text
                    style={
                      styles.primaryButtonText
                    }
                  >
                    {editingMaterialId
                      ? 'Update Material'
                      : 'Add Material'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {editingMaterialId ? (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={resetForm}
                style={styles.cancelEditButton}
              >
                <Text
                  style={styles.cancelEditText}
                >
                  Cancel Edit
                </Text>
              </TouchableOpacity>
            ) : null}
          </>
        ) : (
          <>
            {loadingMaterials ? (
              <View style={styles.loadingCard}>
                <ActivityIndicator />

                <Text
                  style={styles.loadingText}
                >
                  Loading study materials...
                </Text>
              </View>
            ) : materials.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons
                  name="book-outline"
                  size={48}
                  color="#94a3b8"
                />

                <Text
                  style={styles.emptyTitle}
                >
                  Please add study material
                </Text>

                <Text
                  style={styles.emptyText}
                >
                  Your PDF study materials will
                  appear here.
                </Text>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() =>
                    setActiveTab('add')
                  }
                  style={styles.emptyButton}
                >
                  <Text
                    style={
                      styles.emptyButtonText
                    }
                  >
                    Add Material
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              materials.map((material) => (
                <View
                  key={material.id}
                  style={styles.materialCard}
                >
                  <View
                    style={styles.materialHeader}
                  >
                    <View
                      style={
                        styles.materialTitleWrap
                      }
                    >
                      <Text
                        style={
                          styles.materialTitle
                        }
                      >
                        {material.materialName}
                      </Text>

                      <Text
                        style={styles.pdfBadge}
                      >
                        PDF
                      </Text>
                    </View>

                    <Ionicons
                      name="document-text-outline"
                      size={25}
                      color="#2563eb"
                    />
                  </View>

                  <Text
                    style={styles.materialDetails}
                  >
                    {material.materialDetails}
                  </Text>

                  <View
                    style={styles.pdfRow}
                  >
                    <Ionicons
                      name="document-attach-outline"
                      size={18}
                      color="#64748b"
                    />

                    <Text
                      style={styles.pdfFileName}
                      numberOfLines={2}
                    >
                      {material.pdfName ||
                        'PDF Document'}
                    </Text>
                  </View>

                  <View
                    style={styles.materialActions}
                  >
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() =>
                        startEditMaterial(
                          material
                        )
                      }
                      style={
                        styles.editMaterialButton
                      }
                    >
                      <Ionicons
                        name="create-outline"
                        size={19}
                        color="#2563eb"
                      />

                      <Text
                        style={
                          styles.editMaterialButtonText
                        }
                      >
                        Edit
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() =>
                        deleteMaterial(material)
                      }
                      style={
                        styles.deleteMaterialButton
                      }
                    >
                      <Ionicons
                        name="trash-outline"
                        size={19}
                        color="#dc2626"
                      />

                      <Text
                        style={
                          styles.deleteMaterialButtonText
                        }
                      >
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
  },

  headerText: {
    flex: 1,
    marginLeft: 12,
  },

  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },

  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },

  tabs: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },

  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },

  activeTab: {
    borderBottomColor: '#2563eb',
  },

  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
  },

  activeTabText: {
    color: '#2563eb',
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 7,
    marginTop: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#ffffff',
  },

  multilineInput: {
    minHeight: 100,
  },

  browseButton: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 11,
    backgroundColor: '#eff6ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    gap: 8,
  },

  browseButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563eb',
  },

  buttonDisabled: {
    opacity: 0.55,
  },

  pdfInfo: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 11,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    gap: 8,
  },

  pdfName: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },

  primaryButton: {
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 2,
  },

  primaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },

  cancelEditButton: {
    alignItems: 'center',
    paddingVertical: 13,
  },

  cancelEditText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '700',
  },

  loadingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  loadingText: {
    marginTop: 10,
    color: '#64748b',
    fontSize: 13,
  },

  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 17,
    fontWeight: '800',
    color: '#334155',
  },

  emptyText: {
    marginTop: 5,
    textAlign: 'center',
    color: '#64748b',
    fontSize: 13,
  },

  emptyButton: {
    marginTop: 18,
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 10,
  },

  emptyButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },

  materialCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  materialHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  materialTitleWrap: {
    flex: 1,
    paddingRight: 10,
  },

  materialTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },

  pdfBadge: {
    alignSelf: 'flex-start',
    marginTop: 7,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#dbeafe',
    color: '#2563eb',
    fontSize: 10,
    fontWeight: '800',
  },

  materialDetails: {
    fontSize: 13,
    lineHeight: 19,
    color: '#64748b',
    marginTop: 12,
  },

  pdfRow: {
    marginTop: 13,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  pdfFileName: {
    flex: 1,
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },

  materialActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },

  editMaterialButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    backgroundColor: '#eff6ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  editMaterialButtonText: {
    color: '#2563eb',
    fontSize: 13,
    fontWeight: '800',
  },

  deleteMaterialButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  deleteMaterialButtonText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '800',
  },
});
