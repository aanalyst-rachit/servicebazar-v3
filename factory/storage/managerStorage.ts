import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { FACTORY_MANAGERS } from '@/factory/registry/managers';
import {
  getInstalledFactoryModules,
  installFactoryModule,
} from '@/factory/storage/factoryStorage';

export async function getInstalledFactoryManagers(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(
      STORAGE_KEYS.FACTORY_INSTALLED_MANAGERS
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
      'Factory managers load error:',
      error
    );

    return [];
  }
}

export async function installFactoryManager(
  managerId: string
): Promise<string[]> {
  const current =
    await getInstalledFactoryManagers();

  if (current.includes(managerId)) {
    return current;
  }

  const updated = [
    ...current,
    managerId,
  ];

  await AsyncStorage.setItem(
    STORAGE_KEYS.FACTORY_INSTALLED_MANAGERS,
    JSON.stringify(updated)
  );

  // A manager owns a set of required modules.
  // Installing the manager automatically installs those modules.
  const manager = FACTORY_MANAGERS.find(
    item => item.id === managerId
  );

  if (manager) {
    let installedModules =
      await getInstalledFactoryModules();

    for (const moduleId of manager.requiredModules) {
      if (!installedModules.includes(moduleId)) {
        installedModules =
          await installFactoryModule(moduleId);
      }
    }
  }

  return updated;
}

export async function uninstallFactoryManager(
  managerId: string
): Promise<string[]> {
  const current =
    await getInstalledFactoryManagers();

  const updated =
    current.filter(
      id => id !== managerId
    );

  await AsyncStorage.setItem(
    STORAGE_KEYS.FACTORY_INSTALLED_MANAGERS,
    JSON.stringify(updated)
  );

  return updated;
}
