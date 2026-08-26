import Ionicons from '@expo/vector-icons/Ionicons';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
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

type QRType =
  | 'text'
  | 'upi'
  | 'whatsapp'
  | 'phone'
  | 'website';

const QR_TYPES: {
  id: QRType;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    id: 'text',
    title: 'Text',
    icon: 'text-outline',
  },
  {
    id: 'upi',
    title: 'UPI',
    icon: 'card-outline',
  },
  {
    id: 'whatsapp',
    title: 'WhatsApp',
    icon: 'logo-whatsapp',
  },
  {
    id: 'phone',
    title: 'Phone',
    icon: 'call-outline',
  },
  {
    id: 'website',
    title: 'Website',
    icon: 'globe-outline',
  },
];

export default function QRMakerScreen() {
  const [qrType, setQrType] = useState<QRType>('text');
  const [value, setValue] = useState('');
  const [upiName, setUpiName] = useState('');
  const [upiAmount, setUpiAmount] = useState('');
  const [qrDataUri, setQrDataUri] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const buildQRValue = () => {
    if (qrType === 'upi') {
      const upiId = value.trim();

      if (!upiId) {
        return '';
      }

      const params = new URLSearchParams();
      params.set('pa', upiId);

      if (upiName.trim()) {
        params.set('pn', upiName.trim());
      }

      if (upiAmount.trim()) {
        params.set('am', upiAmount.trim());
        params.set('cu', 'INR');
      }

      return `upi://pay?${params.toString()}`;
    }

    if (qrType === 'whatsapp') {
      const phone = value.replace(/\D/g, '');

      if (!phone) {
        return '';
      }

      return `https://wa.me/${phone}`;
    }

    if (qrType === 'phone') {
      const phone = value.trim();

      if (!phone) {
        return '';
      }

      return `tel:${phone}`;
    }

    if (qrType === 'website') {
      const website = value.trim();

      if (!website) {
        return '';
      }

      return website.startsWith('http://') ||
        website.startsWith('https://')
        ? website
        : `https://${website}`;
    }

    return value.trim();
  };

  const generateQR = async () => {
    const data = buildQRValue();

    if (!data) {
      setQrDataUri(null);
      return;
    }

    try {
      setGenerating(true);

      const uri = await QRCode.toDataURL(data, {
        width: 900,
        margin: 2,
        errorCorrectionLevel: 'M',
      });

      setQrDataUri(uri);
    } catch (error) {
      console.error('QR generation failed:', error);
      setQrDataUri(null);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    setQrDataUri(null);
  }, [qrType]);

  return (
    <ScrollView
      style={styles.safe}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.intro}>
        <View style={styles.titleIcon}>
          <Ionicons
            name="qr-code-outline"
            size={26}
            color="#4f46e5"
          />
        </View>

        <View style={styles.introText}>
          <Text style={styles.title}>QR Maker</Text>
          <Text style={styles.subtitle}>
            Create a QR code for your business, payment or contact.
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Choose QR Type</Text>

      <View style={styles.typeGrid}>
        {QR_TYPES.map(type => {
          const active = qrType === type.id;

          return (
            <TouchableOpacity
              key={type.id}
              activeOpacity={0.82}
              onPress={() => setQrType(type.id)}
              style={[
                styles.typeCard,
                active && styles.typeCardActive,
              ]}
            >
              <Ionicons
                name={type.icon}
                size={21}
                color={active ? '#4f46e5' : '#64748b'}
              />

              <Text
                style={[
                  styles.typeText,
                  active && styles.typeTextActive,
                ]}
              >
                {type.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.inputCard}>
        <Text style={styles.inputLabel}>
          {qrType === 'upi'
            ? 'UPI ID'
            : qrType === 'whatsapp'
              ? 'WhatsApp Number'
              : qrType === 'phone'
                ? 'Phone Number'
                : qrType === 'website'
                  ? 'Website URL'
                  : 'Text'}
        </Text>

        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder={
            qrType === 'upi'
              ? 'example@upi'
              : qrType === 'whatsapp'
                ? '919876543210'
                : qrType === 'phone'
                  ? '9876543210'
                  : qrType === 'website'
                    ? 'www.example.com'
                    : 'Enter text to create QR'
          }
          placeholderTextColor="#94a3b8"
          keyboardType={
            qrType === 'phone' || qrType === 'whatsapp'
              ? 'phone-pad'
              : 'default'
          }
          autoCapitalize="none"
          style={styles.input}
        />

        {qrType === 'upi' && (
          <>
            <Text style={styles.inputLabel}>Payee Name</Text>

            <TextInput
              value={upiName}
              onChangeText={setUpiName}
              placeholder="Business / Owner name"
              placeholderTextColor="#94a3b8"
              style={styles.input}
            />

            <Text style={styles.inputLabel}>Amount (optional)</Text>

            <TextInput
              value={upiAmount}
              onChangeText={setUpiAmount}
              placeholder="e.g. 500"
              placeholderTextColor="#94a3b8"
              keyboardType="decimal-pad"
              style={styles.input}
            />
          </>
        )}

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={generateQR}
          style={styles.generateButton}
        >
          {generating ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Ionicons
                name="qr-code-outline"
                size={19}
                color="#ffffff"
              />
              <Text style={styles.generateText}>
                Generate QR
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {qrDataUri && (
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>Your QR Code</Text>

          <View style={styles.qrBox}>
            <Image
              source={{ uri: qrDataUri }}
              style={styles.qrImage}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.previewHint}>
            Scan this QR code using any compatible QR scanner.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  intro: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  titleIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef2ff',
  },

  introText: {
    flex: 1,
    marginLeft: 13,
  },

  title: {
    fontSize: 23,
    fontWeight: '800',
    color: '#111827',
  },

  subtitle: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 18,
    color: '#64748b',
  },

  sectionTitle: {
    marginBottom: 11,
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },

  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginBottom: 16,
  },

  typeCard: {
    width: '31.5%',
    minHeight: 76,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  typeCardActive: {
    backgroundColor: '#eef2ff',
    borderColor: '#c7d2fe',
  },

  typeText: {
    marginTop: 7,
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },

  typeTextActive: {
    color: '#4f46e5',
  },

  inputCard: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  inputLabel: {
    marginBottom: 7,
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
  },

  input: {
    minHeight: 46,
    marginBottom: 14,
    paddingHorizontal: 13,
    borderRadius: 13,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    color: '#111827',
    fontSize: 14,
  },

  generateButton: {
    minHeight: 47,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#4f46e5',
  },

  generateText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },

  previewCard: {
    marginTop: 16,
    padding: 18,
    borderRadius: 22,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  previewTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },

  qrBox: {
    marginTop: 15,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  qrImage: {
    width: 250,
    height: 250,
  },

  previewHint: {
    maxWidth: 280,
    marginTop: 12,
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 17,
    color: '#64748b',
  },
});
