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
  deleteRecordedCourse,
  getRecordedCourses,
  saveRecordedCourse,
  updateRecordedCourse,
  type RecordedCourse as FirebaseRecordedCourse,
  type RecordedCourseMaterial,
} from '../coachingTeacherService';

type RecordedClassScreenProps = {
  onBack?: () => void;
};

type CourseType = 'free' | 'paid';

type CourseMaterialForm = {
  id: string;
  subjectName: string;
  notesUrl: string;
  videoUrl: string;
  notesUploading: boolean;
  videoUploading: boolean;
};

type RecordedCourse = FirebaseRecordedCourse;

const createMaterial = (): CourseMaterialForm => ({
  id: `${Date.now()}-${Math.random()}`,
  subjectName: '',
  notesUrl: '',
  videoUrl: '',
  notesUploading: false,
  videoUploading: false,
});

export default function RecordedClassScreen({
  onBack,
}: RecordedClassScreenProps) {
  const { firebaseUid } = useApp();

  const [activeTab, setActiveTab] = useState<
    'add' | 'courses'
  >('add');

  const [courseName, setCourseName] = useState('');
  const [courseDetails, setCourseDetails] = useState('');
  const [courseType, setCourseType] =
    useState<CourseType>('free');

  const [materials, setMaterials] = useState<
    CourseMaterialForm[]
  >([createMaterial()]);

  const [courses, setCourses] = useState<
    RecordedCourse[]
  >([]);

  const [saving, setSaving] = useState(false);
  const [loadingCourses, setLoadingCourses] =
    useState(false);

  const [editingCourseId, setEditingCourseId] =
    useState<string | null>(null);

  useEffect(() => {
    if (!firebaseUid) {
      return;
    }

    loadCourses();
  }, [firebaseUid]);

  const loadCourses = async () => {
    if (!firebaseUid) {
      return;
    }

    try {
      setLoadingCourses(true);

      const loadedCourses =
        await getRecordedCourses(firebaseUid);

      setCourses(loadedCourses);
    } catch (error) {
      console.error(
        'RECORDED COURSES LOAD ERROR:',
        error
      );

      Alert.alert(
        'Error',
        'Unable to load recorded courses.'
      );
    } finally {
      setLoadingCourses(false);
    }
  };

  const addMaterial = () => {
    setMaterials((current) => [
      ...current,
      createMaterial(),
    ]);
  };

  const removeMaterial = (id: string) => {
    if (materials.length === 1) {
      return;
    }

    setMaterials((current) =>
      current.filter((item) => item.id !== id)
    );
  };

  const updateMaterial = (
    id: string,
    field: keyof CourseMaterialForm,
    value: string | boolean
  ) => {
    setMaterials((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };



  const pickNotes = async (
    materialId: string
  ) => {
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

      updateMaterial(
        materialId,
        'notesUploading',
        true
      );

      const cloudinaryUrl =
        await uploadMediaToCloudinary(
          file.uri,
          'raw'
        );

      updateMaterial(
        materialId,
        'notesUrl',
        cloudinaryUrl
      );

        updateMaterial(
          materialId,
          'notesUrl',
          cloudinaryUrl
        );

      Alert.alert(
        'PDF uploaded',
        'PDF has been uploaded successfully.'
      );
    } catch (error: any) {
      console.error(
        'RECORDED PDF UPLOAD ERROR:',
        error
      );

      Alert.alert(
        'PDF upload failed',
        error?.message ||
          'Unable to upload PDF.'
      );
    } finally {
      updateMaterial(
        materialId,
        'notesUploading',
        false
      );
    }
  };

  const pickVideo = async (
    materialId: string
  ) => {
    try {
      const result =
        await DocumentPicker.getDocumentAsync({
          type: 'video/*',
          copyToCacheDirectory: true,
          multiple: false,
        });

      if (result.canceled) {
        return;
      }

      const file = result.assets?.[0];

      if (!file?.uri) {
        throw new Error(
          'Video file URI was not returned.'
        );
      }

      updateMaterial(
        materialId,
        'videoUploading',
        true
      );

      const cloudinaryUrl =
        await uploadMediaToCloudinary(
          file.uri,
          'video'
        );

      updateMaterial(
        materialId,
        'videoUrl',
        cloudinaryUrl
      );

      Alert.alert(
        'Video uploaded',
        'Video has been uploaded successfully.'
      );
    } catch (error: any) {
      console.error(
        'RECORDED VIDEO UPLOAD ERROR:',
        error
      );

      Alert.alert(
        'Video upload failed',
        error?.message ||
          'Unable to upload video.'
      );
    } finally {
      updateMaterial(
        materialId,
        'videoUploading',
        false
      );
    }
  };

  const startEditCourse = (
    course: RecordedCourse
  ) => {
    setEditingCourseId(course.id);
    setCourseName(course.courseName);
    setCourseDetails(course.courseDetails);
    setCourseType(course.courseType);

    const loadedMaterials: CourseMaterialForm[] =
      course.materials.map((material) => ({
        id: material.id,
        subjectName: material.subjectName || '',
        notesUrl: material.notesUrl || '',
        videoUrl: material.videoUrl || '',
        notesUploading: false,
        videoUploading: false,
      }));

    setMaterials(
      loadedMaterials.length > 0
        ? loadedMaterials
        : [createMaterial()]
    );

    setActiveTab('add');
  };

  const cancelEdit = () => {
    setEditingCourseId(null);
    resetForm();
  };

  const deleteCourse = (course: RecordedCourse) => {
    if (!firebaseUid) {
      Alert.alert(
        'Login required',
        'Teacher authentication not found.'
      );
      return;
    }

    Alert.alert(
      'Delete course?',
      `Are you sure you want to delete "${course.courseName}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoadingCourses(true);

              await deleteRecordedCourse(
                firebaseUid,
                course.id
              );

              setCourses((current) =>
                current.filter(
                  (item) => item.id !== course.id
                )
              );

              Alert.alert(
                'Course deleted',
                'Recorded course has been deleted successfully.'
              );
            } catch (error: any) {
              console.error(
                'RECORDED COURSE DELETE ERROR:',
                error
              );

              Alert.alert(
                'Delete failed',
                error?.message ||
                  'Unable to delete recorded course.'
              );
            } finally {
              setLoadingCourses(false);
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setCourseName('');
    setCourseDetails('');
    setCourseType('free');
    setMaterials([createMaterial()]);
  };

  const saveCourse = async () => {
    if (!firebaseUid) {
      Alert.alert(
        'Login required',
        'Teacher authentication not found.'
      );
      return;
    }

    if (!courseName.trim()) {
      Alert.alert(
        'Course name required',
        'Please enter the course name.'
      );
      return;
    }

    if (!courseDetails.trim()) {
      Alert.alert(
        'Course details required',
        'Please enter course details.'
      );
      return;
    }

    const incompleteUpload = materials.some(
      (item) =>
        item.notesUploading ||
        item.videoUploading
    );

    if (incompleteUpload) {
      Alert.alert(
        'Upload in progress',
        'Please wait until all uploads finish.'
      );
      return;
    }

    const validMaterials =
      materials.filter(
        (item) =>
          item.subjectName.trim() ||
          item.notesUrl.trim() ||
          item.videoUrl.trim() ||
          item.videoUrl.trim()
      );

    if (validMaterials.length === 0) {
      Alert.alert(
        'Course content required',
        'Please add at least one lecture or material.'
      );
      return;
    }

      for (const item of validMaterials) {
        if (!item.subjectName.trim()) {
          Alert.alert(
            'Subject required',
            'Please enter the subject name.'
          );
          return;
        }

        if (!item.notesUrl.trim()) {
          Alert.alert(
            'Notes required',
            'Please select and upload the PDF notes.'
          );
          return;
        }

        if (!item.videoUrl.trim()) {
          Alert.alert(
            'Video required',
            'Please select and upload the video.'
          );
          return;
        }
      }

    try {
      setSaving(true);

        const firebaseMaterials:
          RecordedCourseMaterial[] =
          validMaterials.map((item) => ({
            id: item.id,
            subjectName:
              item.subjectName.trim(),
            notesUrl:
              item.notesUrl.trim(),
            videoUrl:
              item.videoUrl.trim(),
          }));

        if (editingCourseId) {
          await updateRecordedCourse(
            firebaseUid,
            editingCourseId,
            {
              courseName:
                courseName.trim(),
              courseDetails:
                courseDetails.trim(),
              courseType,
              materials:
                firebaseMaterials,
            }
          );
        } else {
          await saveRecordedCourse(
            firebaseUid,
            {
              courseName:
                courseName.trim(),
              courseDetails:
                courseDetails.trim(),
              courseType,
              materials:
                firebaseMaterials,
            }
          );
        }

      resetForm();
      await loadCourses();
      setActiveTab('courses');

      Alert.alert(
        'Course added',
        'Recorded course has been saved successfully.'
      );
    } catch (error: any) {
      console.error(
        'RECORDED COURSE SAVE ERROR:',
        error
      );

      Alert.alert(
        'Save failed',
        error?.message ||
          'Unable to save recorded course.'
      );
    } finally {
      setSaving(false);
    }
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
            Recorded Class
          </Text>

          <Text style={styles.subtitle}>
            Manage your recorded courses
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
            Add Course
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() =>
            setActiveTab('courses')
          }
          style={[
            styles.tab,
            activeTab === 'courses' &&
              styles.activeTab,
          ]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'courses' &&
                styles.activeTabText,
            ]}
          >
            My Courses
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
                Course Information
              </Text>

              <Text style={styles.label}>
                Course Name
              </Text>

              <TextInput
                value={courseName}
                onChangeText={setCourseName}
                placeholder="Enter course name"
                placeholderTextColor="#94a3b8"
                style={styles.input}
              />

              <Text style={styles.label}>
                Course Details
              </Text>

              <TextInput
                value={courseDetails}
                onChangeText={setCourseDetails}
                placeholder="Describe this course"
                placeholderTextColor="#94a3b8"
                style={[
                  styles.input,
                  styles.multilineInput,
                ]}
                multiline
                textAlignVertical="top"
              />

              <Text style={styles.label}>
                Course Type
              </Text>

              <View style={styles.typeRow}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() =>
                    setCourseType('free')
                  }
                  style={[
                    styles.typeButton,
                    courseType === 'free' &&
                      styles.selectedTypeButton,
                  ]}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      courseType === 'free' &&
                        styles.selectedTypeText,
                    ]}
                  >
                    FREE
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() =>
                    setCourseType('paid')
                  }
                  style={[
                    styles.typeButton,
                    courseType === 'paid' &&
                      styles.selectedTypeButton,
                  ]}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      courseType === 'paid' &&
                        styles.selectedTypeText,
                    ]}
                  >
                    PAID
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  Course Content
                </Text>

                <Text style={styles.itemCount}>
                  {materials.length} item
                  {materials.length === 1
                    ? ''
                    : 's'}
                </Text>
              </View>

              {materials.map(
                (material, index) => (
                  <View
                    key={material.id}
                    style={styles.materialCard}
                  >
                    <View
                      style={styles.materialHeader}
                    >
                      <Text
                        style={
                          styles.materialTitle
                        }
                      >
                        Lecture / Material{' '}
                        {index + 1}
                      </Text>

                      {materials.length > 1 ? (
                        <TouchableOpacity
                          onPress={() =>
                            removeMaterial(
                              material.id
                            )
                          }
                        >
                          <Ionicons
                            name="trash-outline"
                            size={20}
                            color="#dc2626"
                          />
                        </TouchableOpacity>
                      ) : null}
                    </View>

                    <Text style={styles.label}>
                      Subject Name
                    </Text>

                    <TextInput
                      value={material.subjectName}
                      onChangeText={(value) =>
                        updateMaterial(
                          material.id,
                          'subjectName',
                          value
                        )
                      }
                      placeholder="e.g. Mathematics"
                      placeholderTextColor="#94a3b8"
                      style={styles.input}
                    />

                    <Text style={styles.label}>
                      Notes
                    </Text>

                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() =>
                        pickNotes(material.id)
                      }
                      disabled={material.notesUploading}
                      style={[
                        styles.browseButton,
                        material.notesUploading &&
                          styles.buttonDisabled,
                      ]}
                    >
                      {material.notesUploading ? (
                        <ActivityIndicator />
                      ) : (
                        <Ionicons
                          name={
                            material.notesUrl
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
                        {material.notesUploading
                          ? 'Uploading Notes...'
                          : material.notesUrl
                            ? 'Notes uploaded'
                            : 'Pick PDF Notes'}
                      </Text>
                    </TouchableOpacity>

                    <Text style={styles.label}>
                      Video
                    </Text>

                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() =>
                        pickVideo(material.id)
                      }
                      disabled={material.videoUploading}
                      style={[
                        styles.browseButton,
                        material.videoUploading &&
                          styles.buttonDisabled,
                      ]}
                    >
                      {material.videoUploading ? (
                        <ActivityIndicator />
                      ) : (
                        <Ionicons
                          name={
                            material.videoUrl
                              ? 'checkmark-circle-outline'
                              : 'videocam-outline'
                          }
                          size={21}
                          color="#2563eb"
                        />
                      )}

                      <Text
                        style={styles.browseButtonText}
                      >
                        {material.videoUploading
                          ? 'Uploading Video...'
                          : material.videoUrl
                            ? 'Video uploaded'
                            : 'Pick Video'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )
              )}

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={addMaterial}
                style={styles.addMoreButton}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={21}
                  color="#2563eb"
                />

                <Text
                  style={styles.addMoreText}
                >
                  Add More
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={saveCourse}
              disabled={saving}
              style={[
                styles.primaryButton,
                saving &&
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
                        editingCourseId
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
                      {editingCourseId
                        ? 'Update Course'
                        : 'Add Course'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            {loadingCourses ? (
              <View style={styles.loadingCard}>
                <ActivityIndicator />

                <Text
                  style={styles.loadingText}
                >
                  Loading courses...
                </Text>
              </View>
            ) : courses.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons
                  name="library-outline"
                  size={48}
                  color="#94a3b8"
                />

                <Text
                  style={styles.emptyTitle}
                >
                  Please add a course
                </Text>

                <Text
                  style={styles.emptyText}
                >
                  Your recorded courses will
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
                    Add Course
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              courses.map((course) => (
                <View
                  key={course.id}
                  style={styles.courseCard}
                >
                  <View
                    style={styles.courseHeader}
                  >
                    <View
                      style={
                        styles.courseTitleWrap
                      }
                    >
                      <Text
                        style={
                          styles.courseTitle
                        }
                      >
                        {course.courseName}
                      </Text>

                      <Text
                        style={
                          styles.courseType
                        }
                      >
                        {course.courseType.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={styles.courseDetails}
                  >
                    {course.courseDetails}
                  </Text>

                  <Text
                    style={styles.courseCount}
                  >
                    {course.materials.length}{' '}
                    lecture/material
                    {course.materials.length === 1
                      ? ''
                      : 's'}
                  </Text>

                  <View style={styles.courseActions}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() =>
                        startEditCourse(course)
                      }
                      style={styles.editCourseButton}
                    >
                      <Ionicons
                        name="create-outline"
                        size={19}
                        color="#2563eb"
                      />
                      <Text
                        style={styles.editCourseButtonText}
                      >
                        Edit
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() =>
                        deleteCourse(course)
                      }
                      style={styles.deleteCourseButton}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={19}
                        color="#dc2626"
                      />
                      <Text
                        style={styles.deleteCourseButtonText}
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
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    marginRight: 12,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },

  subtitle: {
    marginTop: 3,
    fontSize: 13,
    color: '#64748b',
  },

  tabs: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
    paddingBottom: 10,
  },

  tab: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
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
    padding: 18,
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
    marginBottom: 4,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
  },

  itemCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },

  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginTop: 10,
    marginBottom: 6,
  },

  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    color: '#0f172a',
    backgroundColor: '#ffffff',
    fontSize: 14,
  },

  multilineInput: {
    minHeight: 100,
    paddingTop: 12,
  },

  typeRow: {
    flexDirection: 'row',
    gap: 10,
  },

  typeButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedTypeButton: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },

  typeButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748b',
  },

  selectedTypeText: {
    color: '#2563eb',
  },

  materialCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    backgroundColor: '#f8fafc',
  },

  materialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  materialTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },

  browseButton: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#93c5fd',
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },

  browseButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563eb',
  },

  addMoreButton: {
    minHeight: 46,
    marginTop: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    backgroundColor: '#eff6ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  addMoreText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2563eb',
  },

  primaryButton: {
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },

  primaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 28,
    alignItems: 'center',
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },

  emptyText: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    color: '#64748b',
  },

  emptyButton: {
    marginTop: 18,
    minHeight: 42,
    paddingHorizontal: 22,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563eb',
  },

  loadingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 30,
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#64748b',
  },

  courseCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 12,
  },

  courseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  courseTitleWrap: {
    flex: 1,
  },

  courseTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },

  courseType: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '800',
    color: '#2563eb',
  },

  courseDetails: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 20,
    color: '#475569',
  },

  courseActions: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 10,
  },

  editCourseButton: {
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

  editCourseButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563eb',
  },

  deleteCourseButton: {
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

  deleteCourseButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#dc2626',
  },

  courseCount: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
});
