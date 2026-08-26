import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants/storageKeys';

export async function getInstalledFactoryModules(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(
      STORAGE_KEYS.FACTORY_INSTALLED_MODULES
    );

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      item => typeof item === 'string'
    );
  } catch (error) {
    console.error(
      'Factory modules load error:',
      error
    );

    return [];
  }
}

export async function installFactoryModule(
  moduleId: string
): Promise<string[]> {
  const current =
    await getInstalledFactoryModules();

  if (current.includes(moduleId)) {
    return current;
  }

  const updated = [
    ...current,
    moduleId,
  ];

  await AsyncStorage.setItem(
    STORAGE_KEYS.FACTORY_INSTALLED_MODULES,
    JSON.stringify(updated)
  );

  return updated;
}

export async function uninstallFactoryModule(
  moduleId: string
): Promise<string[]> {
  const current =
    await getInstalledFactoryModules();

  const updated =
    current.filter(
      id => id !== moduleId
    );

  await AsyncStorage.setItem(
    STORAGE_KEYS.FACTORY_INSTALLED_MODULES,
    JSON.stringify(updated)
  );

  return updated;
}
