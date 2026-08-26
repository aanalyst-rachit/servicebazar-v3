import React, { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useApp } from '@/context/AppContext';
import {
  COACHING_BOARDS,
  COACHING_CLASS_OPTIONS,
  COACHING_SUBJECT_OPTIONS,
  COACHING_TEACHING_MODES,
} from '@/factory/coaching-studio';

export default function CoachingTeacherRegistrationScreen() {
  const {
    authName,
    authPhone,
    ownerName,
    shopName,
    category,
    subcategory,
    mobileNumber,
    address,
    profileUri,
    firebaseUid,
  } = useApp();

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [board, setBoard] = useState('');
  const [teachingMode, setTeachingMode] =
    useState<'online' | 'offline' | 'both'>('offline');
  const [experience, setExperience] = useState('');
  const [qualification, setQualification] = useState('');
  const [bio, setBio] = useState('');

  const teacherName = useMemo(
    () => ownerName || authName || '',
    [ownerName, authName]
  );

  const businessName = useMemo(
    () => shopName || '',
    [shopName]
  );

  const phone = useMemo(
    () => mobileNumber || authPhone || '',
    [mobileNumber, authPhone]
  );

  const toggleItem = (
    value: string,
    current: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter(
      current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value]
    );
  };

  const handleContinue = () => {
    if (!teacherName.trim()) {
      Alert.alert('Required', 'Teacher name is missing.');
      return;
    }

    if (!businessName.trim()) {
      Alert.alert('Required', 'Business / Coaching name is missing.');
      return;
    }

    if (selectedSubjects.length === 0) {
      Alert.alert('Required', 'Please select at least one subject.');
      return;
    }

    if (selectedClasses.length === 0) {
      Alert.alert('Required', 'Please select at least one class.');
      return;
    }

    console.log('COACHING TEACHER REGISTRATION', {
      serviceBazarUid: firebaseUid || '',
      profileUri: profileUri || null,
      name: teacherName,
      businessName,
      phone,
      address,
      category,
      subcategory,
      subjects: selectedSubjects,
      classes: selectedClasses,
      board,
      teachingMode,
      experienceYears: experience
        ? Number(experience)
        : undefined,
      qualification,
      bio,
      registrationCompleted: false,
    });

    Alert.alert(
      'Form Ready',
      'Teacher registration data is ready. Database saving will be added in the next step.'
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons
              name="school-outline"
              size={28}
              color="#ffffff"
            />
          </View>

          <View style={styles.headerText}>
            <Text style={styles.title}>
              Teacher Registration
            </Text>
            <Text style={styles.subtitle}>
              Complete your Coaching Studio profile
            </Text>
          </View>
        </View>

        <SectionTitle title="ServiceBazar Profile" />

        <ReadOnlyField
          label="Teacher Name"
          value={teacherName}
        />

        <ReadOnlyField
          label="Coaching Name"
          value={businessName}
        />

        <ReadOnlyField
          label="Phone Number"
          value={phone}
        />

        <ReadOnlyField
          label="Address"
          value={address || ''}
        />

        <ReadOnlyField
          label="Category"
          value={category || ''}
        />

        <ReadOnlyField
          label="Subcategory"
          value={subcategory || ''}
        />

        <SectionTitle title="Coaching Details" />

        <Text style={styles.label}>Subjects</Text>
        <View style={styles.chipContainer}>
          {COACHING_SUBJECT_OPTIONS.map(subject => {
            const selected =
              selectedSubjects.includes(subject);

            return (
              <Chip
                key={subject}
                label={subject}
                selected={selected}
                onPress={() =>
                  toggleItem(
                    subject,
                    selectedSubjects,
                    setSelectedSubjects
                  )
                }
              />
            );
          })}
        </View>

        <Text style={styles.label}>Classes</Text>
        <View style={styles.chipContainer}>
          {COACHING_CLASS_OPTIONS.map(className => {
            const selected =
              selectedClasses.includes(className);

            return (
              <Chip
                key={className}
                label={className}
                selected={selected}
                onPress={() =>
                  toggleItem(
                    className,
                    selectedClasses,
                    setSelectedClasses
                  )
                }
              />
            );
          })}
        </View>

        <Text style={styles.label}>Board</Text>
        <View style={styles.chipContainer}>
          {COACHING_BOARDS.map(item => {
            const selected = board === item;

            return (
              <Chip
                key={item}
                label={item}
                selected={selected}
                onPress={() => setBoard(item)}
              />
            );
          })}
        </View>

        <Text style={styles.label}>Teaching Mode</Text>
        <View style={styles.chipContainer}>
          {COACHING_TEACHING_MODES.map(mode => {
            const selected =
              teachingMode === mode.id;

            return (
              <Chip
                key={mode.id}
                label={mode.label}
                selected={selected}
                onPress={() =>
                  setTeachingMode(mode.id)
                }
              />
            );
          })}
        </View>

        <Text style={styles.label}>
          Teaching Experience (Years)
        </Text>

        <TextInput
          value={experience}
          onChangeText={setExperience}
          placeholder="e.g. 5"
          placeholderTextColor="#94a3b8"
          keyboardType="numeric"
          style={styles.input}
        />

        <Text style={styles.label}>
          Qualification
        </Text>

        <TextInput
          value={qualification}
          onChangeText={setQualification}
          placeholder="e.g. M.Sc Mathematics, B.Ed"
          placeholderTextColor="#94a3b8"
          style={styles.input}
        />

        <Text style={styles.label}>
          About / Bio
        </Text>

        <TextInput
          value={bio}
          onChangeText={setBio}
          placeholder="Tell students about your teaching experience..."
          placeholderTextColor="#94a3b8"
          multiline
          textAlignVertical="top"
          style={[
            styles.input,
            styles.bioInput,
          ]}
        />

        <TouchableOpacity
          style={styles.continueButton}
          activeOpacity={0.85}
          onPress={handleContinue}
        >
          <Text style={styles.continueText}>
            Continue Registration
          </Text>

          <Ionicons
            name="arrow-forward"
            size={20}
            color="#ffffff"
          />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function SectionTitle({
  title,
}: {
  title: string;
}) {
  return (
    <Text style={styles.sectionTitle}>
      {title}
    </Text>
  );
}

function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.readOnlyField}>
        <Text
          style={
            value
              ? styles.readOnlyText
              : styles.placeholderText
          }
        >
          {value || 'Not available'}
        </Text>

        <Ionicons
          name="lock-closed-outline"
          size={16}
          color="#94a3b8"
        />
      </View>
    </View>
  );
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.chip,
        selected && styles.selectedChip,
      ]}
    >
      <Text
        style={[
          styles.chipText,
          selected && styles.selectedChipText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  content: {
    padding: 18,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },

  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerText: {
    flex: 1,
    marginLeft: 14,
  },

  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },

  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#64748b',
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 8,
    marginBottom: 14,
  },

  fieldContainer: {
    marginBottom: 14,
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 7,
  },

  readOnlyField: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  readOnlyText: {
    flex: 1,
    fontSize: 15,
    color: '#334155',
  },

  placeholderText: {
    flex: 1,
    fontSize: 15,
    color: '#94a3b8',
  },

  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },

  chip: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
  },

  selectedChip: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },

  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },

  selectedChipText: {
    color: '#ffffff',
  },

  input: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#0f172a',
    marginBottom: 16,
  },

  bioInput: {
    minHeight: 120,
    paddingTop: 14,
  },

  continueButton: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
  },

  continueText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});
