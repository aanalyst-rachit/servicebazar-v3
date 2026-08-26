import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import { useApp } from '@/context/AppContext';
import { FACTORY_MODULES } from '@/factory/registry/modules';
import { FACTORY_MANAGERS } from '@/factory/registry/managers';
import {
  getManagerComponent,
  resolveManager,
} from '@/factory/runtime/ManagerResolver';
import { resolveManagerModules } from '@/factory/runtime/ModuleResolver';
import {
  getInstalledFactoryModules,
  installFactoryModule,
  uninstallFactoryModule,
} from '@/factory/storage/factoryStorage';
import {
  getInstalledFactoryManagers,
  installFactoryManager,
  uninstallFactoryManager,
} from '@/factory/storage/managerStorage';



export default function FactoryScreen() {
  const {
    setFactoryOpen,
    profileUri,
    customerProfileUri,
    authName,
    authPhone,
    firebaseUid,
    userRole,
    ownerName,
    shopName,
    category,
    subcategory,
    mobileNumber,
  } = useApp();
  const [activeSection, setActiveSection] = useState<'my' | 'store'>('my');
  const [installedModules, setInstalledModules] = useState<string[]>([]);
  const [installedManagers, setInstalledManagers] = useState<string[]>([]);
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);
  const [openManagerId, setOpenManagerId] = useState<string | null>(null);

  // ============================================================
  // FACTORY BACKGROUND ART ANIMATION
  // Universal decorative animation for the complete Factory
  // ============================================================
  const geometricOpacity = useRef(
    new Animated.Value(0.24)
  ).current;

  const artTranslateY = useRef(
    new Animated.Value(5)
  ).current;

  useEffect(() => {
    const opacityLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(geometricOpacity, {
          toValue: 0.32,
          duration: 3200,
          useNativeDriver: true,
        }),
        Animated.timing(geometricOpacity, {
          toValue: 0.24,
          duration: 3200,
          useNativeDriver: true,
        }),
      ])
    );

    const movementLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(artTranslateY, {
          toValue: -4,
          duration: 4200,
          useNativeDriver: true,
        }),
        Animated.timing(artTranslateY, {
          toValue: 5,
          duration: 4200,
          useNativeDriver: true,
        }),
      ])
    );

    opacityLoop.start();
    movementLoop.start();

    return () => {
      opacityLoop.stop();
      movementLoop.stop();
    };
  }, [geometricOpacity, artTranslateY]);

  useEffect(() => {
    let mounted = true;

    const loadFactory = async () => {
      const savedModules =
        await getInstalledFactoryModules();
      const savedManagers =
        await getInstalledFactoryManagers();

      if (mounted) {
        setInstalledModules(savedModules);
        setInstalledManagers(savedManagers);
      }
    };

    loadFactory();

    return () => {
      mounted = false;
    };
  }, []);

  const addModule = async (moduleId: string) => {
    const updated =
      await installFactoryModule(moduleId);

    setInstalledModules(updated);
  };

  const removeModule = async (moduleId: string) => {
    // Required modules of an installed manager cannot be removed
    // while that manager is installed.
    const requiredByInstalledManager =
      installedManagerList.some(manager =>
        manager.requiredModules.includes(moduleId)
      );

    if (requiredByInstalledManager) {
      return;
    }

    const updated =
      await uninstallFactoryModule(moduleId);

    setInstalledModules(updated);
  };

  const addManager = async (managerId: string) => {
    const updated =
      await installFactoryManager(managerId);

    setInstalledManagers(updated);

    // Manager installation may also install its required modules.
    // Refresh module state so Factory UI reflects the change immediately.
    const updatedModules =
      await getInstalledFactoryModules();

    setInstalledModules(updatedModules);
  };

  const removeManager = async (managerId: string) => {
    const updated =
      await uninstallFactoryManager(managerId);

    setInstalledManagers(updated);

    if (openManagerId === managerId) {
      setOpenManagerId(null);
    }
  };

  const openModule = (moduleId: string) => {
    setOpenModuleId(moduleId);
  };

  const openManager = (managerId: string) => {
    setOpenManagerId(managerId);
  };

  const installed = FACTORY_MODULES.filter(module =>
    installedModules.includes(module.id)
  );

  const installedManagerList = FACTORY_MANAGERS.filter(manager =>
    installedManagers.includes(manager.id)
  );

  const activeModule = FACTORY_MODULES.find(
    module => module.id === openModuleId
  );

  const activeManager = openManagerId
    ? resolveManager(openManagerId)
    : undefined;

  const ActiveManagerComponent = openManagerId
    ? getManagerComponent(openManagerId)
    : null;

  if (activeModule?.component) {
    const ModuleComponent = activeModule.component;

    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          onPress={() => setOpenModuleId(null)}
          activeOpacity={0.85}
          style={{
            height: 48,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            borderBottomWidth: 1,
            borderBottomColor: '#e2e8f0',
          }}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color="#111827"
          />
          <Text
            style={{
              marginLeft: 10,
              fontSize: 17,
              fontWeight: '800',
              color: '#111827',
            }}
          >
            {activeModule.title}
          </Text>
        </TouchableOpacity>

        <ModuleComponent
          profileUri={profileUri || customerProfileUri || null}
          ownerName={authName || ownerName || ''}
          shopName={shopName || ''}
          category={category || ''}
          subcategory={subcategory || ''}
          phone={authPhone || mobileNumber || ''}
        />
      </View>
    );
  }

  if (activeManager && ActiveManagerComponent) {
    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          onPress={() => setOpenManagerId(null)}
          activeOpacity={0.85}
          style={{
            height: 48,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            borderBottomWidth: 1,
            borderBottomColor: '#e2e8f0',
          }}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color="#111827"
          />
          <Text
            style={{
              marginLeft: 10,
              fontSize: 17,
              fontWeight: '800',
              color: '#111827',
            }}
          >
            {activeManager.title}
          </Text>
        </TouchableOpacity>

        <ActiveManagerComponent
          context={{
            managerId: activeManager.id,
            organizationId: firebaseUid || 'local',
            userId: firebaseUid || 'local',
            role:
              userRole === 'admin'
                ? 'admin'
                : 'owner',
            enabledModules: resolveManagerModules(
              activeManager,
              installedModules,
            ),
          }}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>

      {/* =====================================================
          UNIVERSAL FACTORY PREMIUM BACKGROUND
          Same visual language as AuthScreen
          Automatically applies behind every Factory card.
          ===================================================== */}
      <View
        pointerEvents="none"
        style={styles.backgroundArt}
      >
        <Animated.View
          style={[
            styles.backgroundArtAnimated,
            {
              opacity: geometricOpacity,
              transform: [
                {
                  translateY: artTranslateY,
                },
              ],
            },
          ]}
        >
          <Svg
            width="100%"
            height="100%"
            viewBox="0 0 400 800"
            preserveAspectRatio="xMidYMid slice"
          >
            {/* Top soft circles */}
            <Circle
              cx="35"
              cy="90"
              r="105"
              fill="#6366f1"
              opacity="0.055"
            />

            <Circle
              cx="365"
              cy="100"
              r="95"
              fill="#8b5cf6"
              opacity="0.045"
            />

            <Circle
              cx="35"
              cy="90"
              r="72"
              fill="none"
              stroke="#6366f1"
              strokeWidth="1"
              opacity="0.10"
            />

            <Circle
              cx="365"
              cy="100"
              r="66"
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="1"
              opacity="0.08"
            />

            {/* Middle flowing network */}
            <Path
              d="M-10 390
                 C55 330 105 405 158 365
                 C220 318 275 405 340 350
                 C365 330 385 326 410 338"
              fill="none"
              stroke="#6366f1"
              strokeWidth="1.2"
              opacity="0.20"
            />

            <Path
              d="M-15 425
                 C55 375 105 445 165 405
                 C225 365 285 442 410 380"
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="0.9"
              opacity="0.14"
            />

            {/* Geometric network */}
            <Path
              d="M38 500
                 L105 440
                 L170 500
                 L235 430
                 L300 495
                 L365 440"
              fill="none"
              stroke="#4f46e5"
              strokeWidth="1"
              opacity="0.16"
            />

            <Path
              d="M105 440
                 L128 515
                 M235 430
                 L255 515
                 M365 440
                 L350 510"
              fill="none"
              stroke="#6366f1"
              strokeWidth="0.8"
              opacity="0.12"
            />

            {/* Large elegant circles */}
            <Circle
              cx="105"
              cy="440"
              r="31"
              fill="none"
              stroke="#6366f1"
              strokeWidth="1"
              opacity="0.13"
            />

            <Circle
              cx="235"
              cy="430"
              r="37"
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="1"
              opacity="0.12"
            />

            <Circle
              cx="365"
              cy="440"
              r="27"
              fill="none"
              stroke="#4f46e5"
              strokeWidth="1"
              opacity="0.11"
            />

            {/* Network nodes */}
            <Circle
              cx="38"
              cy="500"
              r="3.2"
              fill="#6366f1"
              opacity="0.28"
            />

            <Circle
              cx="105"
              cy="440"
              r="4"
              fill="#4f46e5"
              opacity="0.26"
            />

            <Circle
              cx="170"
              cy="500"
              r="3.2"
              fill="#8b5cf6"
              opacity="0.25"
            />

            <Circle
              cx="235"
              cy="430"
              r="4"
              fill="#6366f1"
              opacity="0.28"
            />

            <Circle
              cx="300"
              cy="495"
              r="3.2"
              fill="#8b5cf6"
              opacity="0.23"
            />

            <Circle
              cx="365"
              cy="440"
              r="3.8"
              fill="#4f46e5"
              opacity="0.25"
            />

            {/* Lower premium waves */}
            <Path
              d="M0 650
                 C55 600 102 666 158 635
                 C220 600 278 665 340 628
                 C365 613 384 609 400 602
                 L400 800
                 L0 800 Z"
              fill="#6366f1"
              opacity="0.055"
            />

            <Path
              d="M0 690
                 C70 648 114 707 180 676
                 C244 646 306 702 400 660
                 L400 800
                 L0 800 Z"
              fill="#8b5cf6"
              opacity="0.04"
            />

            <Path
              d="M-10 690
                 C48 634 91 641 134 678
                 C176 715 214 715 254 671
                 C294 628 342 629 410 678"
              fill="none"
              stroke="#6366f1"
              strokeWidth="1.3"
              opacity="0.20"
            />

            <Path
              d="M-15 730
                 C48 682 94 688 138 718
                 C180 747 219 748 260 708
                 C302 668 348 670 415 712"
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="0.9"
              opacity="0.15"
            />

            {/* Decorative dots */}
            <Circle cx="45" cy="735" r="2" fill="#6366f1" opacity="0.15" />
            <Circle cx="82" cy="715" r="1.7" fill="#8b5cf6" opacity="0.13" />
            <Circle cx="175" cy="748" r="2" fill="#4f46e5" opacity="0.12" />
            <Circle cx="285" cy="730" r="2" fill="#6366f1" opacity="0.13" />
            <Circle cx="350" cy="715" r="1.7" fill="#8b5cf6" opacity="0.12" />
          </Svg>
        </Animated.View>
      </View>

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setFactoryOpen(false)}
          style={styles.backButton}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>

        <View style={styles.headerText}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Factory</Text>
            <Text style={styles.factoryEmoji}>🏭</Text>
          </View>
          <Text style={styles.subtitle}>
            Build your own ServiceBazar workspace
          </Text>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setActiveSection('my')}
          style={[
            styles.tab,
            activeSection === 'my' && styles.activeTab,
          ]}
        >
          <Ionicons
            name="grid-outline"
            size={18}
            color={activeSection === 'my' ? '#4f46e5' : '#64748b'}
          />
          <Text
            style={[
              styles.tabText,
              activeSection === 'my' && styles.activeTabText,
            ]}
          >
            My Factory
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setActiveSection('store')}
          style={[
            styles.tab,
            activeSection === 'store' && styles.activeTab,
          ]}
        >
          <Ionicons
            name="storefront-outline"
            size={18}
            color={activeSection === 'store' ? '#4f46e5' : '#64748b'}
          />
          <Text
            style={[
              styles.tabText,
              activeSection === 'store' && styles.activeTabText,
            ]}
          >
            Factory Store
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {activeSection === 'my' ? (
          <>
            {installed.length === 0 ? (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIcon}>
                  <Text style={styles.emptyEmoji}>🏭</Text>
                </View>

                <Text style={styles.emptyTitle}>
                  Your Factory is Empty
                </Text>

                <Text style={styles.emptyText}>
                  Add tools from Factory Store and build
                  your own workspace.
                </Text>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setActiveSection('store')}
                  style={styles.primaryButton}
                >
                  <Ionicons
                    name="storefront-outline"
                    size={18}
                    color="#ffffff"
                  />
                  <Text style={styles.primaryButtonText}>
                    Explore Store
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.sectionTitle}>
                  Installed Tools
                </Text>

                <View style={styles.myFactoryGrid}>
                  {installed.map(module => (
                    <TouchableOpacity
                      key={module.id}
                      activeOpacity={0.85}
                      onPress={() => openModule(module.id)}
                      style={styles.myFactoryTouchable}
                    >
                      <LinearGradient
                        colors={['#ffffff', '#f8f7ff', '#f1f5ff']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.myFactoryCard}
                      >
                        <View style={styles.myFactoryIcon}>
                          <Ionicons
                            name={module.icon}
                            size={30}
                            color="#4f46e5"
                          />
                        </View>

                        <Text style={styles.myFactoryTitle}>
                          {module.title}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {installedManagerList.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>
                  Installed Managers
                </Text>

                <View style={styles.myFactoryGrid}>
                  {installedManagerList.map(manager => (
                    <TouchableOpacity
                      key={manager.id}
                      activeOpacity={0.85}
                      onPress={() => openManager(manager.id)}
                      style={styles.myFactoryTouchable}
                    >
                      <LinearGradient
                        colors={['#ffffff', '#f8f7ff', '#f1f5ff']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.myFactoryCard}
                      >
                        <View style={styles.myFactoryIcon}>
                          <Ionicons
                            name={manager.icon as keyof typeof Ionicons.glyphMap}
                            size={30}
                            color="#4f46e5"
                          />
                        </View>

                        <Text style={styles.myFactoryTitle}>
                          {manager.title}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </>
        ) : (
          <>
            <View style={styles.storeIntro}>
              <Text style={styles.storeTitle}>
                Factory Store
              </Text>
              <Text style={styles.storeSubtitle}>
                Choose only the tools you need. Nothing is
                pre-installed.
              </Text>
            </View>

            <View style={styles.searchPlaceholder}>
              <Ionicons
                name="search-outline"
                size={19}
                color="#94a3b8"
              />
              <Text style={styles.searchText}>
                Search factory tools...
              </Text>
            </View>

            <View style={styles.categoryRow}>
              {['Business', 'Finance', 'PDF', 'Design'].map(
                category => (
                  <View key={category} style={styles.categoryChip}>
                    <Text style={styles.categoryText}>
                      {category}
                    </Text>
                  </View>
                )
              )}
            </View>

            <Text style={styles.sectionTitle}>
              Available Tools
            </Text>

            {FACTORY_MODULES.map(module => {
              const isInstalled = installedModules.includes(
                module.id
              );

              const isRequiredByInstalledManager =
                installedManagerList.some(manager =>
                  manager.requiredModules.includes(module.id)
                );

              return (
                <View key={module.id} style={styles.moduleCard}>
                  <View style={styles.moduleIcon}>
                    <Ionicons
                      name={module.icon}
                      size={24}
                      color="#4f46e5"
                    />
                  </View>

                  <View style={styles.moduleInfo}>
                    <Text style={styles.moduleTitle}>
                      {module.title}
                    </Text>
                    <Text style={styles.moduleSubtitle}>
                      {module.subtitle}
                    </Text>

                    <Text style={styles.moduleCategory}>
                      {module.category} · {module.price}
                    </Text>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      if (isRequiredByInstalledManager) {
                        return;
                      }

                      isInstalled
                        ? removeModule(module.id)
                        : addModule(module.id);
                    }}
                    style={[
                      styles.addButton,
                      isInstalled && styles.removeStoreButton,
                    ]}
                  >
                    <Text
                      style={[
                        styles.addButtonText,
                        isInstalled && styles.removeStoreButtonText,
                      ]}
                    >
                      {isRequiredByInstalledManager
                        ? 'Required'
                        : isInstalled
                          ? 'Remove'
                          : 'Add'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}

            <Text style={styles.sectionTitle}>
              Management
            </Text>

            {FACTORY_MANAGERS.map(manager => {
              const isInstalled = installedManagers.includes(
                manager.id
              );

              return (
                <View key={manager.id} style={styles.moduleCard}>
                  <View style={styles.moduleIcon}>
                    <Ionicons
                      name={manager.icon as keyof typeof Ionicons.glyphMap}
                      size={24}
                      color="#4f46e5"
                    />
                  </View>

                  <View style={styles.moduleInfo}>
                    <Text style={styles.moduleTitle}>
                      {manager.title}
                    </Text>
                    <Text style={styles.moduleSubtitle}>
                      {manager.subtitle}
                    </Text>

                    <Text style={styles.moduleCategory}>
                      {manager.category} · {manager.price}
                    </Text>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() =>
                      isInstalled
                        ? removeManager(manager.id)
                        : addManager(manager.id)
                    }
                    style={[
                      styles.addButton,
                      isInstalled && styles.removeStoreButton,
                    ]}
                  >
                    <Text
                      style={[
                        styles.addButtonText,
                        isInstalled && styles.removeStoreButtonText,
                      ]}
                    >
                      {isInstalled ? 'Remove' : 'Add'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  backgroundArt: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  backgroundArtAnimated: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  header: {
    minHeight: 78,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    marginRight: 12,
  },

  headerText: {
    flex: 1,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },

  factoryEmoji: {
    fontSize: 22,
    marginLeft: 8,
  },

  subtitle: {
    marginTop: 2,
    fontSize: 12,
    color: '#64748b',
  },

  tabs: {
    flexDirection: 'row',
    marginHorizontal: 14,
    marginTop: 14,
    padding: 4,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
  },

  tab: {
    flex: 1,
    minHeight: 44,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  activeTab: {
    backgroundColor: '#ffffff',
  },

  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },

  activeTabText: {
    color: '#4f46e5',
  },

  content: {
    padding: 16,
    paddingBottom: 36,
  },

  emptyCard: {
    marginTop: 28,
    padding: 26,
    borderRadius: 24,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  emptyIcon: {
    width: 78,
    height: 78,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef2ff',
  },

  emptyEmoji: {
    fontSize: 38,
  },

  emptyTitle: {
    marginTop: 18,
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },

  emptyText: {
    marginTop: 8,
    maxWidth: 280,
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 13,
    color: '#64748b',
  },

  primaryButton: {
    marginTop: 20,
    minHeight: 46,
    paddingHorizontal: 20,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4f46e5',
  },

  primaryButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },

  storeIntro: {
    marginBottom: 14,
  },

  storeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },

  storeSubtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color: '#64748b',
  },

  searchPlaceholder: {
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  searchText: {
    marginLeft: 9,
    fontSize: 13,
    color: '#94a3b8',
  },

  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    marginBottom: 20,
  },

  categoryChip: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
  },

  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4f46e5',
  },

  sectionTitle: {
    marginBottom: 12,
    marginTop: 4,
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },

  moduleCard: {
    minHeight: 92,
    marginBottom: 10,
    padding: 14,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  moduleIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef2ff',
  },

  moduleInfo: {
    flex: 1,
    marginHorizontal: 12,
  },

  moduleTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },

  moduleSubtitle: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: '#64748b',
  },

  moduleCategory: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: '700',
    color: '#4f46e5',
  },

  addButton: {
    minWidth: 58,
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4f46e5',
  },

  removeStoreButton: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },

  removeStoreButtonText: {
    color: '#dc2626',
  },

  addedButton: {
    backgroundColor: '#dcfce7',
  },

  addButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },

  addedButtonText: {
    color: '#15803d',
  },

  myFactoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  myFactoryTouchable: {
    width: '48%',
    marginBottom: 14,
  },

  myFactoryCard: {
    width: '100%',
    minHeight: 145,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },

  myFactoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef2ff',
    marginBottom: 12,
  },

  myFactoryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },

  installedBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 9,
    backgroundColor: '#dcfce7',
  },

  installedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803d',
  },
});
