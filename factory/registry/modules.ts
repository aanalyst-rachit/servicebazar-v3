import type { FactoryModule } from '@/factory/types/moduleTypes';
import QuoteStudioScreen from '@/screens/QuoteStudioScreen';
import QRMakerScreen from '@/screens/QRMakerScreen';
import GSTCalculatorScreen from '@/screens/GSTCalculatorScreen';
import InvoiceMakerScreen from '@/screens/InvoiceMakerScreen';
import CoachingStudioScreen from '@/factory/coaching-studio/screens/CoachingStudioScreen';

export const FACTORY_MODULES: FactoryModule[] = [
  {
    id: 'coaching-studio',
    title: 'Coaching Studio',
    subtitle: 'Build and manage your coaching profile',
    icon: 'school-outline',
    category: 'Education',
    price: 'Free',
    component: CoachingStudioScreen,
  },

  {
    id: 'quote-maker',
    title: 'Quote Maker',
    subtitle: 'Create professional quotes and estimates',
    icon: 'document-text-outline',
    category: 'Business',
    price: 'Free',
    component: QuoteStudioScreen,
  },
  {
    id: 'qr-maker',
    title: 'QR Maker',
    subtitle: 'Create QR codes for your business and services',
    icon: 'qr-code-outline',
    category: 'Business',
    price: 'Free',
    component: QRMakerScreen,
  },
  {
    id: 'invoice-maker',
    title: 'Invoice Maker',
    subtitle: 'Create simple professional invoices',
    icon: 'receipt-outline',
    category: 'Business',
    price: 'Free',
    component: InvoiceMakerScreen,
  },
  {
    id: 'gst-calculator',
    title: 'GST Calculator',
    subtitle: 'Quick GST and price calculations',
    icon: 'calculator-outline',
    category: 'Finance',
    price: 'Free',
    component: GSTCalculatorScreen,
  },
];
