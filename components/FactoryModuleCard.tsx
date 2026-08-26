import React, { useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { FactoryModule } from '@/factory/types/moduleTypes';

type Props = {
  module: FactoryModule;
  onPress: () => void;
};

export default function FactoryModuleCard({
  module,
  onPress,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 28,
      bounciness: 3,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 22,
      bounciness: 5,
    }).start();
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={pressIn}
      onPressOut={pressOut}
      onPress={onPress}
    >
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ scale }],
          },
        ]}
      >
        <View style={styles.topRow}>
          <View style={styles.iconOuter}>
            <View style={styles.iconInner}>
              <Ionicons
                name={module.icon}
                size={28}
                color="#4f46e5"
              />
            </View>
          </View>

          <View style={styles.arrow}>
            <Ionicons
              name="arrow-forward"
              size={15}
              color="#6366f1"
            />
          </View>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {module.title}
        </Text>

        <View style={styles.categoryRow}>
          <View style={styles.categoryDot} />
          <Text style={styles.category}>
            {module.category}
          </Text>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    minHeight: 154,
    marginBottom: 14,
    padding: 15,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  iconOuter: {
    width: 58,
    height: 58,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef2ff',
  },

  iconInner: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },

  arrow: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f3ff',
  },

  title: {
    marginTop: 15,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '800',
    color: '#111827',
  },

  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  categoryDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#6366f1',
    marginRight: 6,
  },

  category: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
  },
});
