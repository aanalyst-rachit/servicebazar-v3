import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import geetaData from '../data/quotes/geeta.json';
import quranData from '../data/quotes/quran.json';

type ScriptureType = 'Bhagavad Gita' | 'Quran';

type ScriptureItem = {
  source: string;
  reference: string;
  text: string;
};

type ScriptureDatabase = {
  type: string;
  items: ScriptureItem[];
};

const SCRIPTURES: Record<ScriptureType, ScriptureDatabase> = {
  'Bhagavad Gita': geetaData as ScriptureDatabase,
  Quran: quranData as ScriptureDatabase,
};

export default function PremiumScriptureStudio() {
  const [scripture, setScripture] =
    useState<ScriptureType>('Bhagavad Gita');

  const [selectedItem, setSelectedItem] =
    useState<ScriptureItem | null>(null);

  const [loading, setLoading] = useState(false);

  const database = useMemo(
    () => SCRIPTURES[scripture],
    [scripture],
  );

  const generateScripture = () => {
    if (!database.items.length) return;

    setLoading(true);

    const randomIndex = Math.floor(
      Math.random() * database.items.length,
    );

    setSelectedItem(database.items[randomIndex]);

    setLoading(false);
  };

  const changeScripture = (next: ScriptureType) => {
    setScripture(next);
    setSelectedItem(null);
  };

  return (
    <View style={styles.container}>
      {/* Premium Header */}
      <View style={styles.header}>
        <View style={styles.premiumIcon}>
          <Ionicons name="sparkles" size={20} color="#fbbf24" />
        </View>

        <View style={styles.headerText}>
          <Text style={styles.premiumLabel}>PREMIUM</Text>
          <Text style={styles.title}>Scripture Studio</Text>
          <Text style={styles.subtitle}>
            Sacred wisdom, beautifully presented
          </Text>
        </View>
      </View>

      {/* Scripture Selector */}
      <Text style={styles.sectionTitle}>Choose Scripture</Text>

      <View style={styles.selectorRow}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => changeScripture('Bhagavad Gita')}
          style={[
            styles.selector,
            scripture === 'Bhagavad Gita' && styles.selectorActive,
          ]}
        >
          <Text
            style={[
              styles.selectorIcon,
              scripture === 'Bhagavad Gita' && styles.activeText,
            ]}
          >
            🕉
          </Text>

          <Text
            style={[
              styles.selectorText,
              scripture === 'Bhagavad Gita' && styles.activeText,
            ]}
          >
            Bhagavad Gita
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => changeScripture('Quran')}
          style={[
            styles.selector,
            scripture === 'Quran' && styles.selectorActive,
          ]}
        >
          <Text
            style={[
              styles.selectorIcon,
              scripture === 'Quran' && styles.activeText,
            ]}
          >
            ☪
          </Text>

          <Text
            style={[
              styles.selectorText,
              scripture === 'Quran' && styles.activeText,
            ]}
          >
            Quran
          </Text>
        </TouchableOpacity>
      </View>

      {/* Premium Scripture Card */}
      <View style={styles.cardWrapper}>
        <LinearGradient
          colors={
            scripture === 'Bhagavad Gita'
              ? ['#451a03', '#78350f', '#92400e']
              : ['#052e16', '#064e3b', '#065f46']
          }
          style={styles.card}
        >
          <View style={styles.cardTop}>
            <View>
              <Text style={styles.cardPremium}>✦ PREMIUM</Text>

              <Text style={styles.scriptureName}>
                {scripture}
              </Text>
            </View>

            <View style={styles.cardSymbol}>
              <Text style={styles.symbolText}>
                {scripture === 'Bhagavad Gita' ? '🕉' : '☪'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {loading ? (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color="#fbbf24" />
              <Text style={styles.loadingText}>
                Preparing wisdom...
              </Text>
            </View>
          ) : selectedItem ? (
            <View style={styles.content}>
              <Text style={styles.reference}>
                {selectedItem.reference}
              </Text>

              <Text style={styles.quote}>
                {selectedItem.text}
              </Text>

              <Text style={styles.source}>
                {selectedItem.source}
              </Text>
            </View>
          ) : (
            <View style={styles.empty}>
              <Ionicons
                name="book-outline"
                size={38}
                color="#fbbf24"
              />

              <Text style={styles.emptyTitle}>
                Discover Sacred Wisdom
              </Text>

              <Text style={styles.emptyText}>
                Tap below to reveal a random passage.
              </Text>
            </View>
          )}

          <View style={styles.footer}>
            <Text style={styles.brand}>
              SERVICEBAZAR • SCRIPTURE
            </Text>
          </View>
        </LinearGradient>
      </View>

      {/* Generate */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={generateScripture}
        style={styles.generateButton}
      >
        <Ionicons name="sparkles" size={19} color="#ffffff" />

        <Text style={styles.generateText}>
          {selectedItem ? 'Reveal Another' : 'Reveal Sacred Wisdom'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 18,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  premiumIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  headerText: {
    flex: 1,
  },

  premiumLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#d97706',
    letterSpacing: 1.5,
  },

  title: {
    fontSize: 23,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 1,
  },

  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 10,
  },

  selectorRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },

  selector: {
    flex: 1,
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },

  selectorActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },

  selectorIcon: {
    fontSize: 18,
    marginRight: 7,
  },

  selectorText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },

  activeText: {
    color: '#ffffff',
  },

  cardWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
  },

  card: {
    minHeight: 390,
    borderRadius: 24,
    padding: 22,
    justifyContent: 'space-between',
  },

  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  cardPremium: {
    color: '#fbbf24',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  scriptureName: {
    color: '#ffffff',
    fontSize: 21,
    fontWeight: '800',
    marginTop: 5,
  },

  cardSymbol: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  symbolText: {
    fontSize: 24,
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginVertical: 18,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
  },

  reference: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 18,
  },

  quote: {
    color: '#ffffff',
    fontSize: 19,
    lineHeight: 31,
    fontWeight: '500',
    textAlign: 'center',
  },

  source: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 18,
  },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
  },

  emptyTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 12,
  },

  emptyText: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
  },

  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 10,
    fontSize: 12,
  },

  footer: {
    alignItems: 'center',
    marginTop: 18,
  },

  brand: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
  },

  generateButton: {
    height: 52,
    borderRadius: 15,
    backgroundColor: '#111827',
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },

  generateText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});
