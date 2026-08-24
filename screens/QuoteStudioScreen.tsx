import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';

// Paste your Google Gemini API Key here
const GEMINI_API_KEY = 'AQ.Ab8RN6Ic6DIghbbP4LB-AkS7XLdXuCJnilEuTMWG41luNBe3rQ';

type QuoteCategory =
  | 'Motivational'
  | 'Business'
  | 'Success'
  | 'Life'
  | 'Religious';

type LanguageOption = 'Hindi' | 'English' | 'Hinglish' | 'Marathi' | 'Gujarati';

interface ThemeOption {
  id: string;
  name: string;
  colors: [string, string];
  textColor: string;
  subTextColor: string;
  accentColor: string;
}

const CATEGORIES: QuoteCategory[] = [
  'Motivational',
  'Business',
  'Success',
  'Life',
  'Religious',
];

const LANGUAGES: LanguageOption[] = [
  'Hindi',
  'English',
  'Hinglish',
  'Marathi',
  'Gujarati',
];

const CARD_THEMES: ThemeOption[] = [
  {
    id: 'light-slate',
    name: 'Classic Light',
    colors: ['#ffffff', '#f1f5f9'],
    textColor: '#0f172a',
    subTextColor: '#64748b',
    accentColor: '#4f46e5',
  },
  {
    id: 'indigo-glow',
    name: 'Indigo Glow',
    colors: ['#4f46e5', '#3730a3'],
    textColor: '#ffffff',
    subTextColor: '#c7d2fe',
    accentColor: '#fbbf24',
  },
  {
    id: 'midnight',
    name: 'Midnight Dark',
    colors: ['#0f172a', '#1e293b'],
    textColor: '#ffffff',
    subTextColor: '#94a3b8',
    accentColor: '#38bdf8',
  },
  {
    id: 'sunset',
    name: 'Warm Sunset',
    colors: ['#ff7e5f', '#feb47b'],
    textColor: '#ffffff',
    subTextColor: '#fef3c7',
    accentColor: '#ffffff',
  },
  {
    id: 'emerald',
    name: 'Mint Emerald',
    colors: ['#064e3b', '#047857'],
    textColor: '#ffffff',
    subTextColor: '#a7f3d0',
    accentColor: '#34d399',
  },
  {
    id: 'rose-gold',
    name: 'Rose Pearl',
    colors: ['#fff1f2', '#fecdd3'],
    textColor: '#881337',
    subTextColor: '#9f1239',
    accentColor: '#e11d48',
  },
];

interface QuoteStudioProps {
  profileUri?: string | null;
  ownerName?: string;
  shopName?: string;
  category?: string;
  subcategory?: string;
  phone?: string;
}

export default function QuoteStudioScreen({
  profileUri,
  ownerName = '',
  shopName = '',
  category: providerCategory = '',
  subcategory = '',
  phone = '',
}: QuoteStudioProps) {
  const quoteCardRef = useRef<View>(null);
  
  const [category, setCategory] = useState<QuoteCategory>('Motivational');
  const [language, setLanguage] = useState<LanguageOption>('Hindi');
  const [quote, setQuote] = useState('अपनी यात्रा पर विश्वास रखें और आगे बढ़ते रहें।');
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeOption>(CARD_THEMES[0]);

  // Dynamic Gemini API Fetch Call
  const fetchAIQuote = async (selectedCat: QuoteCategory, selectedLang: LanguageOption) => {
    setLoading(true);
    try {
      const prompt = `Generate a short, inspiring, 1-line ${selectedCat} quote in ${selectedLang} language. Return ONLY the quote text without any quotation marks or extra explanation.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      
      if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const generatedText = data.candidates[0].content.parts[0].text.trim().replace(/^["']|["']$/g, '');
        setQuote(generatedText);
      } else {
        setQuote('सफलता का रहस्य निरंतरता में है।');
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
      setQuote('सफलता का अभ्यास हर दिन किया जाता है।');
    } finally {
      setLoading(false);
    }
  };

  const changeCategory = (nextCategory: QuoteCategory) => {
    setCategory(nextCategory);
    fetchAIQuote(nextCategory, language);
  };

  const changeLanguage = (nextLang: LanguageOption) => {
    setLanguage(nextLang);
    fetchAIQuote(category, nextLang);
  };

  const shareQuote = async () => {
    try {
      if (!quoteCardRef.current) return;

      const uri = await captureRef(quoteCardRef, {
        format: 'png',
        quality: 1,
      });

      const canShare = await Sharing.isAvailableAsync();

      if (!canShare) return;

      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share Quote',
        UTI: 'public.png',
      });
    } catch (error) {
      console.error('Quote sharing failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="sparkles" size={22} color="#ffffff" />
        </View>

        <View style={styles.headerText}>
          <Text style={styles.title}>Quote Studio AI</Text>
          <Text style={styles.subtitle}>
            AI-powered multilingual quote generator
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Language Selector */}
        <Text style={styles.sectionTitle}>Select Language</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rowPadding}
        >
          {LANGUAGES.map((lang) => {
            const selected = language === lang;
            return (
              <TouchableOpacity
                key={lang}
                activeOpacity={0.8}
                onPress={() => changeLanguage(lang)}
                style={[
                  styles.chip,
                  selected && styles.chipActive,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    selected && styles.chipTextActive,
                  ]}
                >
                  {lang}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Category Selector */}
        <Text style={styles.sectionTitle}>Choose Quote Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rowPadding}
        >
          {CATEGORIES.map((item) => {
            const selected = category === item;
            return (
              <TouchableOpacity
                key={item}
                activeOpacity={0.8}
                onPress={() => changeCategory(item)}
                style={[
                  styles.chip,
                  selected && styles.chipActive,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    selected && styles.chipTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Color Theme Selector */}
        <Text style={styles.sectionTitle}>Choose Theme</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.colorPickerRow}
        >
          {CARD_THEMES.map((theme) => {
            const isSelected = selectedTheme.id === theme.id;
            return (
              <TouchableOpacity
                key={theme.id}
                activeOpacity={0.8}
                onPress={() => setSelectedTheme(theme)}
                style={[
                  styles.colorOption,
                  isSelected && styles.colorOptionActive,
                ]}
              >
                <LinearGradient
                  colors={theme.colors}
                  style={styles.colorCircle}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {isSelected && (
                    <Ionicons
                      name="checkmark-sharp"
                      size={14}
                      color={theme.textColor}
                    />
                  )}
                </LinearGradient>
                <Text style={styles.colorName}>{theme.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Dynamic Quote Card */}
        <Text style={styles.sectionTitle}>Your Quote</Text>
        <View ref={quoteCardRef} collapsable={false} style={styles.quoteCardWrapper}>
          <LinearGradient
            colors={selectedTheme.colors}
            style={styles.quoteCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.profileRow}>
              {profileUri ? (
                <Image source={{ uri: profileUri }} style={styles.profileImage} />
              ) : (
                <View style={[styles.profilePlaceholder, { backgroundColor: selectedTheme.accentColor }]}>
                  <Ionicons name="person" size={28} color="#ffffff" />
                </View>
              )}

              <View style={styles.profileInfo}>
                <Text
                  style={[styles.ownerName, { color: selectedTheme.textColor }]}
                  numberOfLines={1}
                >
                  {ownerName || 'Service Provider'}
                </Text>

                <Text
                  style={[styles.shopName, { color: selectedTheme.accentColor }]}
                  numberOfLines={1}
                >
                  {shopName || 'ServiceBazar Provider'}
                </Text>

                {!!providerCategory && (
                  <Text
                    style={[styles.providerCategory, { color: selectedTheme.subTextColor }]}
                    numberOfLines={1}
                  >
                    {providerCategory}
                    {subcategory ? ` • ${subcategory}` : ''}
                  </Text>
                )}
              </View>
            </View>

            <View style={[styles.quoteDivider, { backgroundColor: selectedTheme.subTextColor + '30' }]} />

            <View style={styles.quoteIconContainer}>
              <Ionicons name="chatbubble-ellipses" size={32} color={selectedTheme.accentColor + '80'} />
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={selectedTheme.accentColor} />
                <Text style={[styles.loadingText, { color: selectedTheme.subTextColor }]}>
                  AI is creating quote...
                </Text>
              </View>
            ) : (
              <TextInput
                value={quote}
                onChangeText={setQuote}
                multiline
                textAlign="center"
                style={[styles.quoteInput, { color: selectedTheme.textColor }]}
                placeholder="Write your quote..."
                placeholderTextColor={selectedTheme.subTextColor}
              />
            )}

            <View style={styles.brandContainer}>
              <Text style={[styles.brandText, { color: selectedTheme.accentColor }]}>
                SERVICEBAZAR
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Buttons */}
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={loading}
          onPress={() => fetchAIQuote(category, language)}
          style={[styles.generateButton, loading && styles.buttonDisabled]}
        >
          <Ionicons name="sparkles" size={19} color="#ffffff" />
          <Text style={styles.generateButtonText}>
            {loading ? 'Generating...' : 'Generate New AI Quote'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={shareQuote}
          style={styles.shareButton}
        >
          <Ionicons name="share-social-outline" size={19} color="#4f46e5" />
          <Text style={styles.shareButtonText}>Share Quote</Text>
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
    fontSize: 14,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
    marginTop: 10,
  },
  rowPadding: {
    paddingBottom: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  colorPickerRow: {
    paddingBottom: 14,
    gap: 12,
  },
  colorOption: {
    alignItems: 'center',
    padding: 6,
    borderRadius: 14,
  },
  colorOptionActive: {
    backgroundColor: '#eef2ff',
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    elevation: 2,
  },
  colorName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    marginTop: 4,
  },
  quoteCardWrapper: {
    borderRadius: 24,
    elevation: 8,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    overflow: 'hidden',
    marginTop: 4,
  },
  quoteCardGradient: {
    padding: 24,
    minHeight: 280,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileImage: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  profilePlaceholder: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  shopName: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: '700',
  },
  providerCategory: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '600',
  },
  quoteDivider: {
    width: '100%',
    height: 1,
    marginBottom: 16,
  },
  quoteIconContainer: {
    width: '100%',
    alignItems: 'flex-start',
    paddingLeft: 8,
    marginBottom: -8,
  },
  quoteInput: {
    width: '100%',
    minHeight: 110,
    fontSize: 20,
    lineHeight: 30,
    fontWeight: '700',
    padding: 8,
  },
  loadingContainer: {
    minHeight: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  brandContainer: {
    width: '100%',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  brandText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  generateButton: {
    height: 52,
    borderRadius: 14,
    marginTop: 20,
    backgroundColor: '#4f46e5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
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