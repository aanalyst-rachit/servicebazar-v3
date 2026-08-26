import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

import { useApp } from '@/context/AppContext';
import { db } from '@/services/firebase';

function extractYouTubeVideoId(url: string): string | null {
  const value = url.trim();

  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&\s]+)/i,
    /(?:youtu\.be\/)([^?\s]+)/i,
    /(?:youtube\.com\/live\/)([^?\s]+)/i,
    /(?:youtube\.com\/embed\/)([^?\s]+)/i,
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}

export default function CoachingLiveClassScreen() {
  const { firebaseUid } = useApp();

  const [className, setClassName] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [classType, setClassType] = useState<'live' | 'recorded'>('live');
  const [accessType, setAccessType] = useState<'free' | 'paid'>('free');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const playerKey = useMemo(
    () => videoId || 'empty',
    [videoId]
  );

  const connectClass = async () => {
    Keyboard.dismiss();
    setError('');

    const cleanClassName = className.trim();
    const cleanUrl = youtubeUrl.trim();
    const id = extractYouTubeVideoId(cleanUrl);

    if (!cleanClassName) {
      setError('Please enter your class name.');
      return;
    }

    if (!id) {
      setVideoId(null);
      setError('Please enter a valid YouTube link.');
      return;
    }

    if (!firebaseUid) {
      setError('User authentication not found. Please login again.');
      return;
    }

    try {
      setSaving(true);

      await addDoc(collection(db, 'coachingLiveClasses'), {
        uid: firebaseUid,
        className: cleanClassName,
        link: cleanUrl,
        type: classType,
        access: accessType,
        createdAt: serverTimestamp(),
      });

      setVideoId(id);
    } catch (err) {
      console.error('Coaching class save error:', err);
      setError('Unable to save your class. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.playerContainer}>
        {videoId ? (
          <YoutubePlayer
            key={playerKey}
            height={220}
            play
            videoId={videoId}
          />
        ) : (
          <View style={styles.emptyPlayer}>
            <Text style={styles.emptyTitle}>
              Your class will appear here
            </Text>
            <Text style={styles.emptyText}>
              Connect your YouTube class below.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Class Name</Text>

        <TextInput
          value={className}
          onChangeText={setClassName}
          placeholder="Enter your class name"
          placeholderTextColor="#94a3b8"
          style={styles.input}
        />

        <Text style={styles.label}>YouTube Link</Text>

        <TextInput
          value={youtubeUrl}
          onChangeText={setYoutubeUrl}
          placeholder="Paste your YouTube Live/Video link"
          placeholderTextColor="#94a3b8"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          style={styles.input}
        />

        <Text style={styles.label}>Class Type</Text>

        <View style={styles.optionRow}>
          <TouchableOpacity
            onPress={() => setClassType('live')}
            style={[
              styles.option,
              classType === 'live' && styles.optionActive,
            ]}
          >
            <Text
              style={[
                styles.optionText,
                classType === 'live' && styles.optionTextActive,
              ]}
            >
              Live
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setClassType('recorded')}
            style={[
              styles.option,
              classType === 'recorded' && styles.optionActive,
            ]}
          >
            <Text
              style={[
                styles.optionText,
                classType === 'recorded' && styles.optionTextActive,
              ]}
            >
              Recorded
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Access</Text>

        <View style={styles.optionRow}>
          <TouchableOpacity
            onPress={() => setAccessType('free')}
            style={[
              styles.option,
              accessType === 'free' && styles.optionActive,
            ]}
          >
            <Text
              style={[
                styles.optionText,
                accessType === 'free' && styles.optionTextActive,
              ]}
            >
              Free
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setAccessType('paid')}
            style={[
              styles.option,
              accessType === 'paid' && styles.optionActive,
            ]}
          >
            <Text
              style={[
                styles.optionText,
                accessType === 'paid' && styles.optionTextActive,
              ]}
            >
              Paid
            </Text>
          </TouchableOpacity>
        </View>

        {error ? (
          <Text style={styles.error}>
            {error}
          </Text>
        ) : null}

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={connectClass}
          disabled={saving}
          style={[styles.button, saving && styles.buttonDisabled]}
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>
              Connect your class
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  playerContainer: {
    width: '100%',
    backgroundColor: '#000000',
  },

  emptyPlayer: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  emptyTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },

  emptyText: {
    marginTop: 8,
    color: '#cbd5e1',
    fontSize: 14,
    textAlign: 'center',
  },

  form: {
    padding: 18,
  },

  label: {
    marginBottom: 8,
    marginTop: 4,
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '700',
  },

  input: {
    height: 52,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    color: '#0f172a',
    fontSize: 15,
  },

  optionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },

  option: {
    flex: 1,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },

  optionActive: {
    borderColor: '#2563eb',
    backgroundColor: '#2563eb',
  },

  optionText: {
    color: '#334155',
    fontSize: 15,
    fontWeight: '700',
  },

  optionTextActive: {
    color: '#ffffff',
  },

  error: {
    marginTop: 4,
    marginBottom: 4,
    color: '#dc2626',
    fontSize: 13,
  },

  button: {
    height: 52,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#2563eb',
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
});
