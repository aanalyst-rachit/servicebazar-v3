import React, { useMemo, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type InvoiceItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

const INVOICE_STORAGE_KEY = 'servicebazar:invoice-history:v1';

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const createItem = (): InvoiceItem => ({
  id: `${Date.now()}-${Math.random()}`,
  name: '',
  quantity: 1,
  price: 0,
});

export default function InvoiceMakerScreen() {
  const [invoiceNumber, setInvoiceNumber] = useState(
    `INV-${new Date().getTime().toString().slice(-6)}`
  );

  const [businessName, setBusinessName] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const [items, setItems] = useState<InvoiceItem[]>([
    createItem(),
  ]);

  const [gstRate, setGstRate] = useState('0');
  const [discount, setDiscount] = useState('0');

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total + Math.max(0, item.quantity) * Math.max(0, item.price),
        0
      ),
    [items]
  );

  const discountAmount = useMemo(() => {
    const value = Number(discount) || 0;
    return Math.min(subtotal, Math.max(0, value));
  }, [discount, subtotal]);

  const taxableAmount = Math.max(0, subtotal - discountAmount);

  const gstAmount = useMemo(() => {
    const rate = Math.max(0, Number(gstRate) || 0);
    return (taxableAmount * rate) / 100;
  }, [gstRate, taxableAmount]);

  const grandTotal = taxableAmount + gstAmount;

  const updateItem = (
    id: string,
    field: keyof InvoiceItem,
    value: string
  ) => {
    setItems(current =>
      current.map(item => {
        if (item.id !== id) return item;

        if (field === 'name') {
          return { ...item, name: value };
        }

        if (field === 'quantity') {
          return {
            ...item,
            quantity: Math.max(0, Number(value) || 0),
          };
        }

        return {
          ...item,
          price: Math.max(0, Number(value) || 0),
        };
      })
    );
  };

  const addItem = () => {
    setItems(current => [...current, createItem()]);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) {
      setItems([createItem()]);
      return;
    }

    setItems(current => current.filter(item => item.id !== id));
  };

  const resetInvoice = () => {
    setInvoiceNumber(
      `INV-${new Date().getTime().toString().slice(-6)}`
    );
    setBusinessName('');
    setBusinessPhone('');
    setCustomerName('');
    setCustomerPhone('');
    setGstRate('0');
    setDiscount('0');
    setItems([createItem()]);
  };

  const saveInvoiceAndCreatePdf = async () => {
    try {
      const validItems = items.filter(
        item => item.name.trim() && item.quantity > 0
      );

      if (!businessName.trim()) {
        Alert.alert(
          'Business Name Required',
          'Please enter your business name before creating the invoice.'
        );
        return;
      }

      if (!customerName.trim()) {
        Alert.alert(
          'Customer Name Required',
          'Please enter the customer name before creating the invoice.'
        );
        return;
      }

      if (validItems.length === 0) {
        Alert.alert(
          'No Items',
          'Please add at least one invoice item.'
        );
        return;
      }

      const invoiceData = {
        id: `${Date.now()}`,
        invoiceNumber,
        businessName,
        businessPhone,
        customerName,
        customerPhone,
        items: validItems,
        gstRate: Number(gstRate) || 0,
        discount: discountAmount,
        subtotal,
        gstAmount,
        grandTotal,
        createdAt: new Date().toISOString(),
      };

      const existingRaw = await AsyncStorage.getItem(
        INVOICE_STORAGE_KEY
      );

      const existingInvoices = existingRaw
        ? JSON.parse(existingRaw)
        : [];

      const updatedInvoices = [
        invoiceData,
        ...existingInvoices,
      ].slice(0, 100);

      await AsyncStorage.setItem(
        INVOICE_STORAGE_KEY,
        JSON.stringify(updatedInvoices)
      );

      const itemRows = validItems
        .map(
          item => `
            <tr>
              <td>${escapeHtml(item.name)}</td>
              <td>${item.quantity}</td>
              <td>₹${item.price.toFixed(2)}</td>
              <td>₹${(item.quantity * item.price).toFixed(2)}</td>
            </tr>
          `
        )
        .join('');

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 32px;
                color: #111827;
              }

              .header {
                display: flex;
                justify-content: space-between;
                border-bottom: 2px solid #4f46e5;
                padding-bottom: 18px;
                margin-bottom: 24px;
              }

              .business {
                font-size: 24px;
                font-weight: bold;
              }

              .invoice {
                text-align: right;
              }

              .invoice-title {
                font-size: 22px;
                font-weight: bold;
                color: #4f46e5;
              }

              .meta {
                color: #64748b;
                font-size: 12px;
                margin-top: 5px;
              }

              .section {
                margin-bottom: 22px;
              }

              .section-title {
                font-size: 12px;
                color: #64748b;
                text-transform: uppercase;
                margin-bottom: 5px;
              }

              .customer {
                font-size: 16px;
                font-weight: bold;
              }

              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 24px;
              }

              th {
                background: #eef2ff;
                color: #3730a3;
                text-align: left;
                padding: 11px;
                font-size: 12px;
              }

              td {
                padding: 11px;
                border-bottom: 1px solid #e5e7eb;
                font-size: 12px;
              }

              .summary {
                width: 320px;
                margin-left: auto;
                margin-top: 24px;
              }

              .row {
                display: flex;
                justify-content: space-between;
                padding: 7px 0;
                font-size: 13px;
              }

              .total {
                border-top: 2px solid #111827;
                margin-top: 8px;
                padding-top: 12px;
                font-size: 18px;
                font-weight: bold;
              }

              .footer {
                margin-top: 45px;
                text-align: center;
                color: #94a3b8;
                font-size: 10px;
              }
            </style>
          </head>

          <body>
            <div class="header">
              <div>
                <div class="business">
                  ${escapeHtml(businessName)}
                </div>
                ${
                  businessPhone
                    ? `<div class="meta">${escapeHtml(
                        businessPhone
                      )}</div>`
                    : ''
                }
              </div>

              <div class="invoice">
                <div class="invoice-title">INVOICE</div>
                <div class="meta">
                  ${escapeHtml(invoiceNumber)}
                </div>
                <div class="meta">
                  ${new Date().toLocaleDateString('en-IN')}
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Bill To</div>
              <div class="customer">
                ${escapeHtml(customerName)}
              </div>
              ${
                customerPhone
                  ? `<div class="meta">${escapeHtml(
                      customerPhone
                    )}</div>`
                  : ''
              }
            </div>

            <table>
              <thead>
                <tr>
                  <th>Item / Service</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Amount</th>
                </tr>
              </thead>

              <tbody>
                ${itemRows}
              </tbody>
            </table>

            <div class="summary">
              <div class="row">
                <span>Subtotal</span>
                <span>₹${subtotal.toFixed(2)}</span>
              </div>

              <div class="row">
                <span>Discount</span>
                <span>- ₹${discountAmount.toFixed(2)}</span>
              </div>

              <div class="row">
                <span>GST (${Number(gstRate) || 0}%)</span>
                <span>₹${gstAmount.toFixed(2)}</span>
              </div>

              <div class="row total">
                <span>Grand Total</span>
                <span>₹${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div class="footer">
              Generated with ServiceBazar Invoice Maker
            </div>
          </body>
        </html>
      `;

      const result = await Print.printToFileAsync({
        html,
      });

      if (!result?.uri) {
        throw new Error('PDF file was not created.');
      }

      const canShare = await Sharing.isAvailableAsync();

      if (canShare) {
        await Sharing.shareAsync(result.uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Save or Share Invoice PDF',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert(
          'PDF Created',
          'Invoice saved locally, but PDF sharing is not available on this device.'
        );
      }
    } catch (error) {
      console.error('Invoice PDF creation failed:', error);

      Alert.alert(
        'Invoice Error',
        'Invoice save or PDF creation failed. Please try again.'
      );
    }
  };

  const money = (value: number) => `₹${value.toFixed(2)}`;

  return (
    <KeyboardAvoidingView
      style={styles.safe}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* HERO */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons
              name="receipt-outline"
              size={28}
              color="#ffffff"
            />
          </View>

          <View style={styles.heroInfo}>
            <Text style={styles.heroTitle}>Invoice Maker</Text>
            <Text style={styles.heroSubtitle}>
              Create clean professional invoices
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={resetInvoice}
            style={styles.resetButton}
          >
            <Ionicons
              name="refresh-outline"
              size={18}
              color="#4f46e5"
            />
          </TouchableOpacity>
        </View>

        {/* INVOICE DETAILS */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <Ionicons
                name="document-text-outline"
                size={18}
                color="#4f46e5"
              />
            </View>

            <View>
              <Text style={styles.cardTitle}>Invoice Details</Text>
              <Text style={styles.cardSubtitle}>
                Basic invoice information
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>Invoice Number</Text>
              <TextInput
                value={invoiceNumber}
                onChangeText={setInvoiceNumber}
                style={styles.input}
                placeholder="INV-000001"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.half}>
              <Text style={styles.label}>Date</Text>
              <View style={styles.dateBox}>
                <Ionicons
                  name="calendar-outline"
                  size={17}
                  color="#64748b"
                />
                <Text style={styles.dateText}>
                  {new Date().toLocaleDateString('en-IN')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* BUSINESS */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <Ionicons
                name="business-outline"
                size={18}
                color="#4f46e5"
              />
            </View>

            <View>
              <Text style={styles.cardTitle}>Business Details</Text>
              <Text style={styles.cardSubtitle}>
                Your business information
              </Text>
            </View>
          </View>

          <Text style={styles.label}>Business Name</Text>
          <TextInput
            value={businessName}
            onChangeText={setBusinessName}
            style={styles.input}
            placeholder="Your business name"
            placeholderTextColor="#94a3b8"
          />

          <Text style={styles.label}>Phone</Text>
          <TextInput
            value={businessPhone}
            onChangeText={setBusinessPhone}
            style={styles.input}
            placeholder="Business phone number"
            placeholderTextColor="#94a3b8"
            keyboardType="phone-pad"
          />
        </View>

        {/* CUSTOMER */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <Ionicons
                name="person-outline"
                size={18}
                color="#4f46e5"
              />
            </View>

            <View>
              <Text style={styles.cardTitle}>Customer Details</Text>
              <Text style={styles.cardSubtitle}>
                Bill this invoice to
              </Text>
            </View>
          </View>

          <Text style={styles.label}>Customer Name</Text>
          <TextInput
            value={customerName}
            onChangeText={setCustomerName}
            style={styles.input}
            placeholder="Customer name"
            placeholderTextColor="#94a3b8"
          />

          <Text style={styles.label}>Phone</Text>
          <TextInput
            value={customerPhone}
            onChangeText={setCustomerPhone}
            style={styles.input}
            placeholder="Customer phone number"
            placeholderTextColor="#94a3b8"
            keyboardType="phone-pad"
          />
        </View>

        {/* ITEMS */}
        <View style={styles.card}>
          <View style={styles.itemsHeader}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderIcon}>
                <Ionicons
                  name="list-outline"
                  size={18}
                  color="#4f46e5"
                />
              </View>

              <View>
                <Text style={styles.cardTitle}>Items & Services</Text>
                <Text style={styles.cardSubtitle}>
                  Add products or services
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={addItem}
              style={styles.addItemButton}
            >
              <Ionicons
                name="add"
                size={18}
                color="#ffffff"
              />
              <Text style={styles.addItemText}>Add</Text>
            </TouchableOpacity>
          </View>

          {items.map((item, index) => {
            const amount = item.quantity * item.price;

            return (
              <View key={item.id} style={styles.itemBox}>
                <View style={styles.itemTop}>
                  <Text style={styles.itemNumber}>
                    ITEM {index + 1}
                  </Text>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => removeItem(item.id)}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={18}
                      color="#ef4444"
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>Description</Text>
                <TextInput
                  value={item.name}
                  onChangeText={value =>
                    updateItem(item.id, 'name', value)
                  }
                  style={styles.input}
                  placeholder="Service or product"
                  placeholderTextColor="#94a3b8"
                />

                <View style={styles.row}>
                  <View style={styles.smallField}>
                    <Text style={styles.label}>Qty</Text>
                    <TextInput
                      value={String(item.quantity)}
                      onChangeText={value =>
                        updateItem(item.id, 'quantity', value)
                      }
                      style={styles.input}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.smallField}>
                    <Text style={styles.label}>Price</Text>
                    <TextInput
                      value={
                        item.price === 0
                          ? ''
                          : String(item.price)
                      }
                      onChangeText={value =>
                        updateItem(item.id, 'price', value)
                      }
                      style={styles.input}
                      placeholder="0"
                      placeholderTextColor="#94a3b8"
                      keyboardType="decimal-pad"
                    />
                  </View>

                  <View style={styles.amountField}>
                    <Text style={styles.label}>Amount</Text>
                    <View style={styles.amountBox}>
                      <Text style={styles.amountText}>
                        {money(amount)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* TAX & DISCOUNT */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <Ionicons
                name="calculator-outline"
                size={18}
                color="#4f46e5"
              />
            </View>

            <View>
              <Text style={styles.cardTitle}>
                Tax & Discount
              </Text>
              <Text style={styles.cardSubtitle}>
                Adjust the final invoice amount
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>GST %</Text>
              <TextInput
                value={gstRate}
                onChangeText={setGstRate}
                style={styles.input}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.half}>
              <Text style={styles.label}>Discount ₹</Text>
              <TextInput
                value={discount}
                onChangeText={setDiscount}
                style={styles.input}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>
        </View>

        {/* SUMMARY */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>
              {money(subtotal)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Discount</Text>
            <Text style={styles.discountValue}>
              - {money(discountAmount)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              GST ({Number(gstRate) || 0}%)
            </Text>
            <Text style={styles.summaryValue}>
              {money(gstAmount)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>
              {money(grandTotal)}
            </Text>
          </View>
        </View>

        {/* ACTION */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={saveInvoiceAndCreatePdf}
          style={styles.previewButton}
        >
          <Ionicons
            name="download-outline"
            size={20}
            color="#ffffff"
          />
          <Text style={styles.previewText}>
            Save & Download PDF
          </Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Invoice data is saved locally on this device and
          a professional PDF is generated for saving or sharing.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
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
    backgroundColor: '#4f46e5',
  },

  heroInfo: {
    flex: 1,
    marginLeft: 13,
  },

  heroTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#111827',
  },

  heroSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: '#64748b',
  },

  resetButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef2ff',
  },

  card: {
    marginBottom: 13,
    padding: 15,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  cardHeaderIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef2ff',
    marginRight: 10,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
  },

  cardSubtitle: {
    marginTop: 2,
    fontSize: 11,
    color: '#64748b',
  },

  label: {
    marginTop: 13,
    marginBottom: 6,
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
  },

  input: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 13,
    color: '#111827',
  },

  row: {
    flexDirection: 'row',
    gap: 10,
  },

  half: {
    flex: 1,
  },

  smallField: {
    flex: 0.8,
  },

  amountField: {
    flex: 1.2,
  },

  dateBox: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  dateText: {
    marginLeft: 7,
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },

  itemsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },

  addItemButton: {
    minHeight: 36,
    paddingHorizontal: 11,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4f46e5',
  },

  addItemText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },

  itemBox: {
    marginTop: 13,
    padding: 12,
    borderRadius: 15,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  itemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  itemNumber: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
    color: '#6366f1',
  },

  amountBox: {
    minHeight: 44,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef2ff',
  },

  amountText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#4338ca',
  },

  summaryCard: {
    marginBottom: 14,
    padding: 17,
    borderRadius: 20,
    backgroundColor: '#111827',
  },

  summaryRow: {
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  summaryLabel: {
    fontSize: 12,
    color: '#cbd5e1',
  },

  summaryValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#f8fafc',
  },

  discountValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#86efac',
  },

  divider: {
    height: 1,
    marginVertical: 8,
    backgroundColor: '#334155',
  },

  totalRow: {
    minHeight: 38,
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
    fontSize: 20,
    fontWeight: '900',
    color: '#a5b4fc',
  },

  previewButton: {
    minHeight: 50,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4f46e5',
  },

  previewText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
  },

  footerText: {
    marginTop: 12,
    paddingHorizontal: 12,
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 17,
    color: '#94a3b8',
  },
});
