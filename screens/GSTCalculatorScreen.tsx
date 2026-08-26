import React, { useMemo, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type CalculationMode = 'exclusive' | 'inclusive';
type TaxMode = 'intra' | 'inter';

const GST_RATES = ['5', '12', '18', '28'];

const money = (value: number) => `₹${value.toFixed(2)}`;

export default function GSTCalculatorScreen() {
  const [amount, setAmount] = useState('');
  const [gstRate, setGstRate] = useState('18');
  const [customRate, setCustomRate] = useState('');
  const [mode, setMode] =
    useState<CalculationMode>('exclusive');
  const [taxMode, setTaxMode] =
    useState<TaxMode>('intra');

  const activeRate = Math.max(
    0,
    Number(customRate || gstRate) || 0
  );

  const result = useMemo(() => {
    const input = Math.max(0, Number(amount) || 0);
    const rate = activeRate;

    if (!input || !rate) {
      return {
        base: input,
        gst: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
        total: input,
      };
    }

    if (mode === 'inclusive') {
      const base = input / (1 + rate / 100);
      const gst = input - base;

      return {
        base,
        gst,
        cgst: taxMode === 'intra' ? gst / 2 : 0,
        sgst: taxMode === 'intra' ? gst / 2 : 0,
        igst: taxMode === 'inter' ? gst : 0,
        total: input,
      };
    }

    const gst = input * (rate / 100);

    return {
      base: input,
      gst,
      cgst: taxMode === 'intra' ? gst / 2 : 0,
      sgst: taxMode === 'intra' ? gst / 2 : 0,
      igst: taxMode === 'inter' ? gst : 0,
      total: input + gst,
    };
  }, [amount, activeRate, mode, taxMode]);

  const reset = () => {
    setAmount('');
    setGstRate('18');
    setCustomRate('');
    setMode('exclusive');
    setTaxMode('intra');
  };

  return (
    <ScrollView
      style={styles.safe}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons
            name="calculator-outline"
            size={28}
            color="#4f46e5"
          />
        </View>

        <View style={styles.heroText}>
          <Text style={styles.heroTitle}>
            GST Calculator
          </Text>
          <Text style={styles.heroSubtitle}>
            Calculate GST, CGST, SGST and IGST instantly
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Amount
        </Text>

        <View style={styles.amountInputWrap}>
          <Text style={styles.currency}>₹</Text>

          <TextInput
            value={amount}
            onChangeText={setAmount}
            style={styles.amountInput}
            placeholder="Enter amount"
            placeholderTextColor="#94a3b8"
            keyboardType="decimal-pad"
          />
        </View>

        <Text style={styles.sectionTitle}>
          GST Rate
        </Text>

        <View style={styles.rateGrid}>
          {GST_RATES.map(rate => {
            const selected =
              !customRate && gstRate === rate;

            return (
              <TouchableOpacity
                key={rate}
                activeOpacity={0.85}
                onPress={() => {
                  setGstRate(rate);
                  setCustomRate('');
                }}
                style={[
                  styles.rateButton,
                  selected && styles.rateButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.rateText,
                    selected && styles.rateTextActive,
                  ]}
                >
                  {rate}%
                </Text>
              </TouchableOpacity>
            );
          })}

          <View style={styles.customRateWrap}>
            <TextInput
              value={customRate}
              onChangeText={value => {
                setCustomRate(value);
                if (value) {
                  setGstRate('');
                }
              }}
              style={styles.customRateInput}
              placeholder="Custom %"
              placeholderTextColor="#94a3b8"
              keyboardType="decimal-pad"
            />
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Calculation Type
        </Text>

        <View style={styles.segment}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setMode('exclusive')}
            style={[
              styles.segmentButton,
              mode === 'exclusive' &&
                styles.segmentButtonActive,
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                mode === 'exclusive' &&
                  styles.segmentTextActive,
              ]}
            >
              Add GST
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setMode('inclusive')}
            style={[
              styles.segmentButton,
              mode === 'inclusive' &&
                styles.segmentButtonActive,
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                mode === 'inclusive' &&
                  styles.segmentTextActive,
              ]}
            >
              GST Included
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>
          Tax Type
        </Text>

        <View style={styles.segment}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setTaxMode('intra')}
            style={[
              styles.segmentButton,
              taxMode === 'intra' &&
                styles.segmentButtonActive,
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                taxMode === 'intra' &&
                  styles.segmentTextActive,
              ]}
            >
              CGST + SGST
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setTaxMode('inter')}
            style={[
              styles.segmentButton,
              taxMode === 'inter' &&
                styles.segmentButtonActive,
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                taxMode === 'inter' &&
                  styles.segmentTextActive,
              ]}
            >
              IGST
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <View>
            <Text style={styles.resultEyebrow}>
              CALCULATION RESULT
            </Text>
            <Text style={styles.resultTitle}>
              GST Summary
            </Text>
          </View>

          <View style={styles.rateBadge}>
            <Text style={styles.rateBadgeText}>
              {activeRate}% GST
            </Text>
          </View>
        </View>

        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>
            Base Amount
          </Text>
          <Text style={styles.resultValue}>
            {money(result.base)}
          </Text>
        </View>

        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>
            Total GST
          </Text>
          <Text style={styles.gstValue}>
            {money(result.gst)}
          </Text>
        </View>

        {taxMode === 'intra' ? (
          <>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>
                CGST ({(activeRate / 2).toFixed(2)}%)
              </Text>
              <Text style={styles.resultValue}>
                {money(result.cgst)}
              </Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>
                SGST ({(activeRate / 2).toFixed(2)}%)
              </Text>
              <Text style={styles.resultValue}>
                {money(result.sgst)}
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>
              IGST ({activeRate}%)
            </Text>
            <Text style={styles.resultValue}>
              {money(result.igst)}
            </Text>
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>
            Final Amount
          </Text>
          <Text style={styles.totalValue}>
            {money(result.total)}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={reset}
        style={styles.resetButton}
      >
        <Ionicons
          name="refresh-outline"
          size={18}
          color="#475569"
        />
        <Text style={styles.resetText}>
          Reset Calculator
        </Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        GST calculations are for estimation purposes.
        Verify applicable tax rules before issuing an invoice.
      </Text>
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

  hero: {
    minHeight: 88,
    padding: 15,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
  },

  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef2ff',
  },

  heroText: {
    flex: 1,
    marginLeft: 13,
  },

  heroTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#111827',
  },

  heroSubtitle: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    color: '#64748b',
  },

  card: {
    marginBottom: 14,
    padding: 17,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  sectionTitle: {
    marginBottom: 10,
    fontSize: 13,
    fontWeight: '900',
    color: '#111827',
  },

  amountInputWrap: {
    height: 56,
    marginBottom: 20,
    paddingHorizontal: 15,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  currency: {
    fontSize: 20,
    fontWeight: '900',
    color: '#4f46e5',
  },

  amountInput: {
    flex: 1,
    marginLeft: 9,
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },

  rateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },

  rateButton: {
    minWidth: 62,
    height: 42,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  rateButtonActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },

  rateText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
  },

  rateTextActive: {
    color: '#ffffff',
  },

  customRateWrap: {
    width: 92,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  customRateInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },

  segment: {
    padding: 4,
    marginBottom: 18,
    borderRadius: 14,
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
  },

  segmentButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  segmentButtonActive: {
    backgroundColor: '#ffffff',
  },

  segmentText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748b',
  },

  segmentTextActive: {
    color: '#4f46e5',
  },

  resultCard: {
    marginBottom: 14,
    padding: 18,
    borderRadius: 22,
    backgroundColor: '#111827',
  },

  resultHeader: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  resultEyebrow: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#818cf8',
  },

  resultTitle: {
    marginTop: 3,
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
  },

  rateBadge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#312e81',
  },

  rateBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#c7d2fe',
  },

  resultRow: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  resultLabel: {
    fontSize: 12,
    color: '#cbd5e1',
  },

  resultValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#f8fafc',
  },

  gstValue: {
    fontSize: 13,
    fontWeight: '900',
    color: '#86efac',
  },

  divider: {
    height: 1,
    marginVertical: 9,
    backgroundColor: '#334155',
  },

  totalRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
  },

  totalValue: {
    fontSize: 21,
    fontWeight: '900',
    color: '#a5b4fc',
  },

  resetButton: {
    minHeight: 46,
    marginBottom: 10,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  resetText: {
    marginLeft: 7,
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
  },

  footer: {
    paddingHorizontal: 14,
    textAlign: 'center',
    fontSize: 10,
    lineHeight: 16,
    color: '#94a3b8',
  },
});
