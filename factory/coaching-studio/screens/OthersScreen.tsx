import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

type OthersScreenProps = {
  onBack?: () => void;
};

export default function OthersScreen({
  onBack,
}: OthersScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onBack}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color="#0f172a"
          />
        </TouchableOpacity>

        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>
            Others
          </Text>

          <Text style={styles.headerSubtitle}>
            More coaching management options
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons
              name="ellipsis-horizontal-circle-outline"
              size={52}
              color="#2563eb"
            />
          </View>

          <Text style={styles.title}>
            More Services Coming Soon
          </Text>

          <Text style={styles.description}>
            New coaching management services and
            features will be available here soon.
          </Text>
        </View>
      </View>
    </View>
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
    paddingHorizontal: 18,
    paddingVertical: 16,
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

  headerTextWrap: {
    flex: 1,
    marginLeft: 12,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#0f172a',
  },

  headerSubtitle: {
    marginTop: 3,
    fontSize: 13,
    color: '#64748b',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingHorizontal: 24,
    paddingVertical: 36,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  iconCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
  },

  title: {
    marginTop: 22,
    textAlign: 'center',
    fontSize: 21,
    fontWeight: '700',
    color: '#0f172a',
  },

  description: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 21,
    color: '#64748b',
  },
});
