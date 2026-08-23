import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { styles } from '@/styles/appStyles';

export type BannerTier = {
  key: string;
  label: string;
  subLabel: string;
  bg: string;
  bg2: string;
  accent: string;
  text: string;
  icon: string;
};

export const getProviderBannerTier = (rating = 1, reviews = 0): BannerTier => {
  const r = Number(rating) || 1;
  const reviewCount = Number(reviews) || 0;

  if (r >= 4.5 && reviewCount >= 5) {
    return {
      key: 'gold',
      label: 'TOP PROVIDER',
      subLabel: 'Highly Rated',
      bg: '#7a4b00',
      bg2: '#d9a441',
      accent: '#fff3b0',
      text: '#ffffff',
      icon: 'trophy-outline',
    };
  }

  if (r >= 3.5 && reviewCount >= 2) {
    return {
      key: 'purple',
      label: 'TRUSTED PROVIDER',
      subLabel: 'Good Standing',
      bg: '#3b1b75',
      bg2: '#7c3aed',
      accent: '#e9d5ff',
      text: '#ffffff',
      icon: 'ribbon-outline',
    };
  }

  return {
    key: 'gray',
    label: 'SERVICE PROVIDER',
    subLabel: 'New / Standard',
    bg: '#334155',
    bg2: '#64748b',
    accent: '#e2e8f0',
    text: '#ffffff',
    icon: 'briefcase-outline',
  };
};

type ShopLike = {
  shopName?: string;
  category?: string;
  avgRating?: number;
  totalReviews?: number;
};

type Props = {
  shop?: ShopLike;
  serviceCount?: number;
  compact?: boolean;
  showProfile?: boolean;
  onProfilePress?: () => void;
  editable?: boolean;
  onProfilePick?: () => void;
  profileUri?: string | null;
};

export default function AutoProviderBanner({
  shop,
  serviceCount = 0,
  compact = false,
  showProfile = true,
  onProfilePress,
  editable = false,
  profileUri = null,
}: Props) {
  const tier = getProviderBannerTier(shop?.avgRating, shop?.totalReviews);
  const rating = Number(shop?.avgRating) || 1;
  const reviews = Number(shop?.totalReviews) || 0;

  return (
    <View style={[styles.autoBannerShell, compact && styles.autoBannerShellCompact]}>
      <View style={[styles.autoBanner, { backgroundColor: tier.bg }]}>
        <View style={[styles.autoBannerGlowOne, { backgroundColor: tier.bg2 }]} />
        <View style={[styles.autoBannerGlowTwo, { backgroundColor: tier.bg2 }]} />
        <View style={styles.autoBannerGridLineOne} />
        <View style={styles.autoBannerGridLineTwo} />

        <View style={styles.autoBannerTopRow}>
          <View style={styles.autoBrandPill}>
            <Ionicons name="sparkles-outline" size={11} color={tier.accent} />
            <Text style={[styles.autoBrandText, { color: tier.accent }]}>SERVICEBAZAR</Text>
          </View>

          <View style={[styles.autoTierPill, { backgroundColor: tier.bg2, borderColor: tier.accent }]}>
            <Ionicons name={tier.icon as 'trophy-outline'} size={12} color={tier.accent} />
            <Text style={[styles.autoTierText, { color: tier.accent }]}>{tier.label}</Text>
          </View>
        </View>

        <View style={styles.autoBannerMainRow}>
          <View style={styles.autoBannerTextBlock}>
            <Text numberOfLines={1} style={[styles.autoBannerShopName, { color: tier.text }]}>
              {shop?.shopName || 'Local Service Provider'}
            </Text>
            <Text numberOfLines={1} style={[styles.autoBannerCategory, { color: tier.accent }]}>
              {shop?.category || 'Local Services'}
            </Text>

            <View style={styles.autoBannerStatsRow}>
              <View style={styles.autoStatItem}>
                <Ionicons name="star" size={12} color="#facc15" />
                <Text style={styles.autoStatText}>{rating.toFixed(1)}</Text>
              </View>
              <View style={styles.autoStatDivider} />
              <Text style={styles.autoStatText}>{reviews} reviews</Text>
              <View style={styles.autoStatDivider} />
              <Text style={styles.autoStatText}>{serviceCount} services</Text>
            </View>

            <Text numberOfLines={1} style={styles.autoBannerSubLabel}>{tier.subLabel}</Text>
          </View>

          {showProfile && (
            <TouchableOpacity
              activeOpacity={editable ? 0.75 : 1}
              onPress={editable ? onProfilePress : undefined}
              style={styles.autoBannerProfileWrap}
            >
              {profileUri ? (
                <Image source={{ uri: profileUri }} style={styles.autoBannerProfileImage} />
              ) : (
                <View style={styles.autoBannerProfilePlaceholder}>
                  <Ionicons name="person" size={28} color="#94a3b8" />
                </View>
              )}
              {editable && (
                <View style={styles.autoBannerCameraBadge}>
                  <Ionicons name="camera" size={11} color="#ffffff" />
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
