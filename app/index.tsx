import { AppProvider } from '@/context/AppContext';
import ServiceBazarRoot from '@/screens/ServiceBazarRoot';

export default function Index() {
  return (
    <AppProvider>
      <ServiceBazarRoot />
    </AppProvider>
  );
}
