import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

type QuoteCategory =
  | 'Motivational'
  | 'Business'
  | 'Success'
  | 'Life'
  | 'Religious';

const QUOTES: Record<QuoteCategory, string[]> = {
  Motivational: [
    'Small steps every day create big results.',
    'Believe in your journey and keep moving forward.',
    'Your effort today builds your success tomorrow.',
  ],
  Business: [
    'Great businesses are built one happy customer at a time.',
    'Serve better, grow faster, build stronger relationships.',
    'Every customer is an opportunity to create lasting value.',
  ],
  Success: [
    'Success starts with consistency, not perfection.',
    'Keep learning, keep improving, keep going.',
    'Dream big, work smart, stay consistent.',
  ],
  Life: [
    'Enjoy the journey while building the future.',
    'Good things take time. Keep faith and keep moving.',
    'Make today meaningful and tomorrow brighter.',
  ],
  Religious: [
    'Have faith, stay humble, and keep doing good.',
    'Patience and faith can make difficult journeys easier.',
    'Let gratitude guide your heart every day.',
  ],
};

const CATEGORIES: QuoteCategory[] = [
  'Motivational',
  'Business',
  'Success',
  'Life',
  'Religious',
];

export default function QuoteStudioScreen() {
  const [category, setCategory] =
    useState<QuoteCategory>('Motivational');

  const [quote, setQuote] = useState(
    QUOTES.Motivational[0]
  );

  const categoryQuotes = useMemo(
    () => QUOTES[category],
    [category]
  );

  const generateQuote = () => {
    const randomIndex = Math.floor(
      Math.random() * categoryQuotes.length
    );

    setQuote(categoryQuotes[randomIndex]);
  };

  const changeCategory = (nextCategory: QuoteCategory) => {
    setCategory(nextCategory);
    setQuote(QUOTES[nextCategory][0]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons
            name="sparkles"
            size={22}
            color="#ffffff"
          />
        </View>

        <View style={styles.headerText}>
          <Text style={styles.title}>
            Quote Studio
          </Text>

          <Text style={styles.subtitle}>
            Create and share beautiful quotes
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.sectionTitle}>
          Choose Quote Category
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {CATEGORIES.map(item => {
            const selected = category === item;

            return (
              <TouchableOpacity
                key={item}
                activeOpacity={0.8}
                onPress={() =>
                  changeCategory(item)
                }
                style={[
                  styles.categoryChip,
                  selected &&
                    styles.categoryChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selected &&
                      styles.categoryTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={styles.sectionTitle}>
          Your Quote
        </Text>

        <View style={styles.quoteCard}>
          <View style={styles.quoteMark}>
            <Ionicons
              name="chatbubble-ellipses"
              size={20}
              color="#4f46e5"
            />
          </View>

          <TextInput
            value={quote}
            onChangeText={setQuote}
            multiline
            textAlign="center"
            style={styles.quoteInput}
            placeholder="Write your quote..."
            placeholderTextColor="#94a3b8"
          />

          <Text style={styles.brandText}>
            ServiceBazar
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={generateQuote}
          style={styles.generateButton}
        >
          <Ionicons
            name="sparkles-outline"
            size={19}
            color="#ffffff"
          />

          <Text style={styles.generateButtonText}>
            Another Quote
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {}}
          style={styles.shareButton}
        >
          <Ionicons
            name="share-social-outline"
            size={19}
            color="#4f46e5"
          />

          <Text style={styles.shareButtonText}>
            Share Quote
          </Text>
        </TouchableOpacity>
      </ScrollView>
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

  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4f46e5',
  },

  headerText: {
    flex: 1,
    marginLeft: 12,
  },

  title: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0f172a',
  },

  subtitle: {
    marginTop: 3,
    fontSize: 11,
    color: '#64748b',
  },

  content: {
    padding: 18,
    paddingBottom: 40,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 10,
  },

  categoryRow: {
    paddingBottom: 22,
  },

  categoryChip: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 8,
  },

  categoryChipActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },

  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },

  categoryTextActive: {
    color: '#ffffff',
  },

  quoteCard: {
    minHeight: 260,
    borderRadius: 22,
    padding: 24,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },

  quoteMark: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  quoteInput: {
    width: '100%',
    minHeight: 110,
    fontSize: 22,
    lineHeight: 32,
    fontWeight: '700',
    color: '#0f172a',
    padding: 8,
  },

  brandText: {
    marginTop: 18,
    fontSize: 11,
    fontWeight: '800',
    color: '#4f46e5',
  },

  generateButton: {
    height: 52,
    borderRadius: 14,
    marginTop: 18,
    backgroundColor: '#4f46e5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  generateButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },

  shareButton: {
    height: 52,
    borderRadius: 14,
    marginTop: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#c7d2fe',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  shareButtonText: {
    color: '#4f46e5',
    fontSize: 14,
    fontWeight: '800',
  },
});
