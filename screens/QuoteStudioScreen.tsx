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
import {
  getRandomQuote,
  type QuoteCategory as DatabaseQuoteCategory,
  type QuoteLanguage,
} from '../services/quoteDatabase';
import {
  getRandomPremiumQuote,
  type PremiumQuoteItem,
  type PremiumQuoteType,
} from '../services/premiumQuoteDatabase';
import {
  PRO_THEMES,
  DEFAULT_PRO_THEME,
  type ProTheme,
} from '../pro_themes/themes';

type QuoteCategory =
  | 'Motivational'
  | 'Business'
  | 'Success'
  | 'Life'
  | 'Religious';

type LanguageOption = 'Hindi' | 'English' | 'Hinglish' | 'Urdu';

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
  'Urdu',
];

const CARD_THEMES: ThemeOption[] = [
  {
    id: 'rose-gold',
    name: 'Rose Pearl',
    colors: ['#fff1f2', '#fecdd3'],
    textColor: '#881337',
    subTextColor: '#9f1239',
    accentColor: '#e11d48',
  },
  {
    id: 'indigo-glow',
    name: 'Indigo Glow',
    colors: ['#3b82f6', '#1d4ed8'],
    textColor: '#ffffff',
    subTextColor: '#93c5fd',
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
    id: 'light-slate',
    name: 'Classic Light',
    colors: ['#ffffff', '#f1f5f9'],
    textColor: '#0f172a',
    subTextColor: '#64748b',
    accentColor: '#2563eb',
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
  const premiumQuoteCardRef = useRef<View>(null);

  const [category, setCategory] = useState<QuoteCategory>('Religious');
  const [language, setLanguage] = useState<LanguageOption>('Hindi');
  const [quote, setQuote] = useState('ईश्वर पर अटूट विश्वास ही आपकी सबसे बड़ी शक्ति है।');
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeOption>(CARD_THEMES[1]);

  // Premium spiritual quote state
  const [premiumSource, setPremiumSource] =
    useState<PremiumQuoteType>('Bhagavad Gita');
  const [premiumQuote, setPremiumQuote] =
    useState<PremiumQuoteItem | null>(null);
  const [premiumLoading, setPremiumLoading] = useState<boolean>(false);
  const [selectedProTheme, setSelectedProTheme] =
    useState<ProTheme>(DEFAULT_PRO_THEME);

  // Local quote database
  const generateLocalQuote = (
    selectedCat: QuoteCategory,
    selectedLang: LanguageOption,
  ) => {
    try {
      setLoading(true);

      const newQuote = getRandomQuote(
        selectedLang as QuoteLanguage,
        selectedCat as DatabaseQuoteCategory,
      );

      setQuote(newQuote);
    } catch (error) {
      console.error('Local quote generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePremiumQuote = (source: PremiumQuoteType) => {
    try {
      setPremiumLoading(true);
      setPremiumSource(source);

      const newPremiumQuote = getRandomPremiumQuote(source);
      setPremiumQuote(newPremiumQuote);
    } catch (error) {
      console.error('Premium quote generation failed:', error);
    } finally {
      setPremiumLoading(false);
    }
  };

  const sharePremiumQuote = async () => {
    try {
      if (!premiumQuoteCardRef.current) return;

      const uri = await captureRef(premiumQuoteCardRef, {
        format: 'png',
        quality: 1,
      });

      const canShare = await Sharing.isAvailableAsync();

      if (!canShare) return;

      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share Premium Quote',
        UTI: 'public.png',
      });
    } catch (error) {
      console.error('Premium quote sharing failed:', error);
    }
  };

  const changeCategory = (nextCategory: QuoteCategory) => {
    setCategory(nextCategory);
  };

  const changeLanguage = (nextLang: LanguageOption) => {
    setLanguage(nextLang);
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
            Create modern & stylized quotes
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
                      name="checkmark"
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

        {/* Stylized Dynamic Quote Card */}
        <Text style={styles.sectionTitle}>Your Quote Card</Text>
        <View ref={quoteCardRef} collapsable={false} style={styles.quoteCardWrapper}>
          <LinearGradient
            colors={selectedTheme.colors}
            style={styles.quoteCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Background Vector Art Elements */}
            <View style={[styles.vectorCircleTop, { borderColor: selectedTheme.subTextColor + '25' }]} />
            <View style={[styles.vectorCircleBottom, { backgroundColor: selectedTheme.accentColor + '20' }]} />
            <View style={[styles.vectorLineAccent, { backgroundColor: selectedTheme.accentColor }]} />

            {/* Profile Section */}
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
                  {ownerName || 'Pro2'}
                </Text>

                <Text
                  style={[styles.shopName, { color: selectedTheme.accentColor }]}
                  numberOfLines={1}
                >
                  {shopName || 'Pro2 ki dukan'}
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

            <View style={[styles.quoteDivider, { backgroundColor: selectedTheme.subTextColor + '35' }]} />

            {/* Quote Body Area */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={selectedTheme.accentColor} />
                <Text style={[styles.loadingText, { color: selectedTheme.subTextColor }]}>
                  AI is creating dynamic quote...
                </Text>
              </View>
            ) : (
              <View style={styles.quoteContentContainer}>
                <TextInput
                  value={quote}
                  onChangeText={setQuote}
                  multiline
                  textAlign="center"
                  style={[styles.quoteInput, { color: selectedTheme.textColor }]}
                  placeholder="Write your quote..."
                  placeholderTextColor={selectedTheme.subTextColor}
                />
              </View>
            )}

            {/* Card Footer Watermark */}
            <View style={styles.brandContainer}>
              <View style={[styles.brandBadge, { backgroundColor: selectedTheme.subTextColor + '20' }]}>
                <Text style={[styles.brandText, { color: selectedTheme.accentColor }]}>
                  SERVICEBAZAR
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Normal Quote Actions */}
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={loading}
          onPress={() => generateLocalQuote(category, language)}
          style={[styles.generateButton, loading && styles.buttonDisabled]}
        >
          <Ionicons name="sparkles" size={19} color="#ffffff" />
          <Text style={styles.generateButtonText}>
            {loading ? 'Generating...' : 'Generate New Quote'}
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

        {/* Premium Quote Studio */}
        <View
          style={{
            marginTop: 28,
            marginBottom: 4,
          }}
        >
          {/* Premium Section Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 14,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#fff8df',
                borderWidth: 1,
                borderColor: selectedProTheme.colors.primary,
              }}
            >
              <Ionicons name="diamond" size={21} color="#b8860b" />
            </View>

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text
                style={{
                  color: '#111827',
                  fontSize: 19,
                  fontWeight: '900',
                }}
              >
                Premium Quote Studio
              </Text>

              <Text
                style={{
                  color: '#9a7b16',
                  fontSize: 11,
                  fontWeight: '800',
                  marginTop: 3,
                  letterSpacing: 0.5,
                }}
              >
                SACRED • EXCLUSIVE • PREMIUM
              </Text>
            </View>

            <View
              style={{
                paddingHorizontal: 9,
                paddingVertical: 6,
                borderRadius: 10,
                backgroundColor: '#fff8df',
                borderWidth: 1,
                borderColor: selectedProTheme.colors.primary,
              }}
            >
              <Text
                style={{
                  color: '#9a7b16',
                  fontSize: 9,
                  fontWeight: '900',
                }}
              >
                PREMIUM
              </Text>
            </View>
          </View>

          {/* Premium Theme Selector - App UI Only */}
          <Text
            style={{
              paddingHorizontal: 18,
              paddingTop: 18,
              marginBottom: 10,
              color: '#475569',
              fontSize: 13,
              fontWeight: '900',
            }}
          >
            Choose Premium Theme
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 18,
              paddingBottom: 14,
              gap: 10,
            }}
          >
            {PRO_THEMES.map((theme) => {
              const selected = selectedProTheme.id === theme.id;

              return (
                <TouchableOpacity
                  key={theme.id}
                  activeOpacity={0.85}
                  onPress={() => setSelectedProTheme(theme)}
                  style={{
                    minWidth: 112,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: 15,
                    alignItems: 'center',
                    backgroundColor: selected
                      ? theme.colors.accentSoft
                      : '#ffffff',
                    borderWidth: 1,
                    borderColor: selected
                      ? theme.colors.primary
                      : '#e2e8f0',
                  }}
                >
                  <Text style={{ fontSize: 18 }}>
                    {theme.icon}
                  </Text>

                  <Text
                    numberOfLines={1}
                    style={{
                      marginTop: 5,
                      color: selected
                        ? theme.colors.primary
                        : '#475569',
                      fontSize: 10,
                      fontWeight: '900',
                    }}
                  >
                    {theme.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Premium Source Selector - App UI Only */}
          <View
            style={{
              flexDirection: 'row',
              gap: 10,
              marginBottom: 14,
            }}
          >
            {(['Bhagavad Gita', 'Quran'] as PremiumQuoteType[]).map(
              (source) => {
                const selected = premiumSource === source;

                return (
                  <TouchableOpacity
                    key={source}
                    activeOpacity={0.85}
                    onPress={() => setPremiumSource(source)}
                    style={{
                      flex: 1,
                      minHeight: 48,
                      borderRadius: 14,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: selected ? '#d4af37' : '#ffffff',
                      borderWidth: 1,
                      borderColor: selected ? '#d4af37' : '#e2e8f0',
                      elevation: selected ? 3 : 1,
                    }}
                  >
                    <Text
                      style={{
                        color: selected ? '#111827' : '#475569',
                        fontSize: 12,
                        fontWeight: '900',
                        textAlign: 'center',
                      }}
                    >
                      {source === 'Bhagavad Gita'
                        ? '🕉️ Bhagavad Gita'
                        : '☪️ Quran'}
                    </Text>
                  </TouchableOpacity>
                );
              },
            )}
          </View>

          {/* PREMIUM CARD ONLY - THIS IS SHARED */}
          <View
            ref={premiumQuoteCardRef}
            collapsable={false}
            style={{
              borderRadius: 26,
              overflow: 'hidden',
              elevation: 12,
              shadowColor: '#8a6d1d',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.25,
              shadowRadius: 18,
            }}
          >
            <LinearGradient
              colors={selectedProTheme.colors.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                minHeight: 330,
                padding: 24,
                justifyContent: 'space-between',
              }}
            >
              {/* Premium Decorative Vector Artwork */}

              {/* Large outer ring */}
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  width: 210,
                  height: 210,
                  borderRadius: 105,
                  right: -105,
                  top: -105,
                  borderWidth: 2,
                  borderColor: selectedProTheme.vector.topShape,
                  opacity: 0.28,
                }}
              />

              {/* Inner luxury ring */}
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  width: 150,
                  height: 150,
                  borderRadius: 75,
                  right: -75,
                  top: -75,
                  borderWidth: 14,
                  borderColor: selectedProTheme.vector.topShape,
                  opacity: 0.12,
                }}
              />

              {/* Glow core */}
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  width: 90,
                  height: 90,
                  borderRadius: 45,
                  right: -45,
                  top: -45,
                  backgroundColor: selectedProTheme.vector.glow,
                  opacity: 0.08,
                }}
              />

              {/* Bottom ornamental ring */}
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  width: 170,
                  height: 170,
                  borderRadius: 85,
                  left: -90,
                  bottom: -90,
                  borderWidth: 18,
                  borderColor: selectedProTheme.vector.bottomShape,
                  opacity: 0.16,
                }}
              />

              {/* Bottom inner ring */}
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  width: 105,
                  height: 105,
                  borderRadius: 53,
                  left: -52,
                  bottom: -52,
                  borderWidth: 2,
                  borderColor: selectedProTheme.vector.glow,
                  opacity: 0.24,
                }}
              />

              {/* Premium diagonal accent */}
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  width: 110,
                  height: 2,
                  right: -18,
                  top: 72,
                  backgroundColor: selectedProTheme.vector.line,
                  opacity: 0.35,
                  transform: [{ rotate: '-35deg' }],
                }}
              />

              {/* Secondary diagonal accent */}
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  width: 70,
                  height: 1,
                  right: 8,
                  top: 92,
                  backgroundColor: selectedProTheme.vector.glow,
                  opacity: 0.28,
                  transform: [{ rotate: '-35deg' }],
                }}
              />

              {/* Premium top accent */}
              <View
                pointerEvents="none"
                style={{
                  width: 58,
                  height: 4,
                  borderRadius: 4,
                  backgroundColor: selectedProTheme.vector.line,
                  marginBottom: 18,
                  opacity: 0.95,
                }}
              />

              {/* User Profile */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                {profileUri ? (
                  <Image
                    source={{ uri: profileUri }}
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 32,
                      borderWidth: 2.5,
                      borderColor: selectedProTheme.vector.glow,
                    }}
                  />
                ) : (
                  <View
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 32,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: selectedProTheme.colors.accentSoft,
                      borderWidth: 2.5,
                      borderColor: selectedProTheme.vector.glow,
                    }}
                  >
                    <Ionicons name="person" size={29} color={selectedProTheme.vector.glow} />
                  </View>
                )}

                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      color: selectedProTheme.colors.text,
                      fontSize: 17,
                      fontWeight: '900',
                    }}
                  >
                    {ownerName || 'Pro2'}
                  </Text>

                  <Text
                    numberOfLines={1}
                    style={{
                      color: selectedProTheme.colors.secondary,
                      fontSize: 13,
                      fontWeight: '800',
                      marginTop: 3,
                    }}
                  >
                    {shopName || 'Pro2 ki dukan'}
                  </Text>

                  {!!providerCategory && (
                    <Text
                      numberOfLines={1}
                      style={{
                        color: selectedProTheme.colors.subText,
                        fontSize: 11,
                        fontWeight: '600',
                        marginTop: 3,
                      }}
                    >
                      {providerCategory}
                      {subcategory ? ` • ${subcategory}` : ''}
                    </Text>
                  )}
                </View>
              </View>

              {/* Divider */}
              <View
                style={{
                  height: 1,
                  backgroundColor: 'rgba(245,215,110,0.25)',
                  marginVertical: 18,
                }}
              />

              {/* Quote */}
              <View
                style={{
                  flex: 1,
                  minHeight: 145,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 4,
                }}
              >
                {premiumLoading ? (
                  <>
                    <ActivityIndicator size="large" color={selectedProTheme.vector.glow} />
                    <Text
                      style={{
                        color: selectedProTheme.colors.subText,
                        marginTop: 12,
                        fontSize: 12,
                        fontWeight: '600',
                      }}
                    >
                      Preparing sacred quote...
                    </Text>
                  </>
                ) : premiumQuote ? (
                  <>
                    <Text
                      style={{
                        color: selectedProTheme.colors.primary,
                        fontSize: 11,
                        fontWeight: '900',
                        textAlign: 'center',
                        marginBottom: 6,
                        letterSpacing: 0.7,
                      }}
                    >
                      {premiumQuote.reference}
                    </Text>

                    <Text
                      style={{
                        color: '#fffdf2',
                        fontSize: 19,
                        lineHeight: 31,
                        fontWeight: '700',
                        textAlign: 'center',
                      }}
                    >
                      {premiumQuote.text}
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons
                      name="sparkles-outline"
                      size={38}
                      color="#d4af37"
                    />

                    <Text
                      style={{
                        color: selectedProTheme.colors.secondary,
                        fontSize: 17,
                        fontWeight: '900',
                        textAlign: 'center',
                        marginTop: 10,
                      }}
                    >
                      {premiumSource === 'Bhagavad Gita'
                        ? 'Sacred Wisdom'
                        : 'Sacred Guidance'}
                    </Text>

                    <Text
                      style={{
                        color: selectedProTheme.colors.subText,
                        fontSize: 12,
                        textAlign: 'center',
                        lineHeight: 19,
                        marginTop: 6,
                      }}
                    >
                      Generate your premium spiritual quote.
                    </Text>
                  </>
                )}
              </View>

              {/* Premium Branding */}
              <View
                style={{
                  alignItems: 'center',
                  marginTop: 18,
                }}
              >
                <Text
                  style={{
                    color: selectedProTheme.colors.primary,
                    fontSize: 10,
                    fontWeight: '900',
                    letterSpacing: 2,
                  }}
                >
                  SERVICEBAZAR PREMIUM
                </Text>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Premium Actions */}

        <TouchableOpacity
          activeOpacity={0.85}
          disabled={premiumLoading}
          onPress={() => generatePremiumQuote(premiumSource)}
          style={{
            minHeight: 50,
            marginTop: 2,
            borderRadius: 15,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            backgroundColor: selectedProTheme.vector.line,
            opacity: premiumLoading ? 0.65 : 1,
          }}
        >
          <Ionicons name="sparkles" size={18} color="#111827" />

          <Text
            style={{
              color: '#111827',
              fontSize: 14,
              fontWeight: '900',
              marginLeft: 8,
            }}
          >
            {premiumLoading
              ? 'Generating...'
              : 'Generate Premium Quote'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={sharePremiumQuote}
          style={{
            minHeight: 48,
            marginTop: 10,
            marginBottom: 12,
            borderRadius: 15,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            backgroundColor: '#ffffff',
            borderWidth: 1,
            borderColor: '#d4af37',
          }}
        >
          <Ionicons
            name="share-social-outline"
            size={18}
            color="#9a7b16"
          />

          <Text
            style={{
              color: '#7c6213',
              fontSize: 14,
              fontWeight: '900',
              marginLeft: 8,
            }}
          >
            Share Premium Quote
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
    elevation: 10,
    shadowColor: '#1e1b4b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    overflow: 'hidden',
    marginTop: 4,
  },
  quoteCardGradient: {
    padding: 24,
    minHeight: 300,
    justifyContent: 'space-between',
    position: 'relative',
  },
  vectorCircleTop: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 25,
    zIndex: 1,
  },
  vectorCircleBottom: {
    position: 'absolute',
    bottom: -40,
    left: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    zIndex: 1,
  },
  vectorLineAccent: {
    position: 'absolute',
    top: 0,
    left: 24,
    width: 45,
    height: 4,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    zIndex: 2,
  },
  profileRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2.5,
    borderColor: '#ffffff',
  },
  profilePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#ffffff',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },
  ownerName: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
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
    marginVertical: 14,
    zIndex: 2,
  },
  quoteContentContainer: {
    zIndex: 2,
    width: '100%',
    marginVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
    zIndex: 2,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  brandContainer: {
    width: '100%',
    alignItems: 'flex-end',
    zIndex: 2,
  },
  brandBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  brandText: {
    fontSize: 10,
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
