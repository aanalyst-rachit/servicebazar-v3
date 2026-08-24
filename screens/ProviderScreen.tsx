import AutoProviderBanner from '@/components/AutoProviderBanner';
import OSMMap from '@/components/OSMMap';
import SocialFeed from '@/components/SocialFeed';
import { useApp } from '@/context/AppContext';
import QuoteStudioScreen from '@/screens/QuoteStudioScreen';
import { styles } from '@/styles/appStyles';
import { formatTime } from '@/utils/time';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import {
  ActivityIndicator, Image, Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface Service {
  id: string;
  name: string;
  price: string | number;
  [key: string]: any;
}

interface Booking {
  id: string;
  [key: string]: any;
}

export default function ProviderScreen() {
  const {
    handleLogout,

    shopDetails,
    shopName,
    category,
    subcategory,

    profileUri,

    isEditingProfile,
    setIsEditingProfile,

    providerServices,

    activeTab,
    setActiveTab,

    providerUpcoming,

    authName,
    ownerName,

    pickImage,

    frontImageUri,
    insideImageUri,

    setSelectedShopImages,
    setShopImagesVisible,

    setCatalogPickerType,
    setCatalogPickerVisible,

    customCategoryText,
    setCustomCategoryText,

    customSubcategoryText,
    setCustomSubcategoryText,

    setShopName,
    setCategory,
    setSubcategory,

    authPhone,
    mobileNumber,

    address,
    setAddress,

    searchAddressOnMap,
    loadingMap,

    region,
    setRegion,

    fetchAddressFromCoords,

    saveProfileData,

    newServiceName,
    setNewServiceName,

    newServicePrice,
    setNewServicePrice,

    newServiceDuration,
    setNewServiceDuration,

    startTime,
    setStartTime,

    endTime,
    setEndTime,

    showStartTimePicker,
    setShowStartTimePicker,

    showEndTimePicker,
    setShowEndTimePicker,

    slotCapacity,
    setSlotCapacity,

    newServiceSpecialty,
    setNewServiceSpecialty,

    handleAddServiceWithAutoSlots,
    handleDeleteService,

    providerBookingSubTab,
    setProviderBookingSubTab,

    providerHistory,

    historyFilter,
    setHistoryFilter,

    handleUpdateBookingStatus,
  } = useApp();

  const [drawerOpen, setDrawerOpen] =
    useState(false);

  const currentTab =
    activeTab || 'profile';

  // ============================================================
  // DRAWER NAVIGATION
  // ============================================================

  const navigateFromDrawer = (
    tab: string
  ) => {
    setActiveTab(tab as any);

    setDrawerOpen(false);
  };

  const drawerItems = [
    {
      key: 'profile',
      title: 'Dukan',
      subtitle: 'Business Profile',
      icon: 'storefront-outline' as const,
    },

    {
      key: 'feed',
      title: 'Feed',
      subtitle: 'Advertisement',
      icon: 'newspaper-outline' as const,
    },

    {
      key: 'services',
      title: 'Services',
      subtitle: 'Manage Services',
      icon: 'construct-outline' as const,
    },

    {
      key: 'bookings',
      title: 'Bookings',
      subtitle: 'Appointments',
      icon: 'calendar-outline' as const,
    },

    {
      key: 'quoteStudio',
      title: 'Quote Studio',
      subtitle: 'Create & Share Quotes',
      icon: 'document-text-outline' as const,
    },
  ];

  const currentTitle =
    currentTab === 'profile'
      ? 'Dukan'
      : currentTab === 'feed'
        ? 'Feed'
        : currentTab === 'services'
          ? 'Services'
          : currentTab === 'bookings'
            ? 'Bookings'
            : 'Quote Studio';

  const currentIcon =
    currentTab === 'profile'
      ? 'storefront-outline'
      : currentTab === 'feed'
        ? 'newspaper-outline'
        : currentTab === 'services'
          ? 'construct-outline'
          : currentTab === 'bookings'
            ? 'calendar-outline'
            : 'document-text-outline';

  return (
    <View style={{ flex: 1 }}>
      {/* ======================================================
          MAIN SCREEN
          ====================================================== */}

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          styles.scrollContainer
        }
      >
        {/* ====================================================
            TOP BAR
            ==================================================== */}

        <View style={styles.custTopBar}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              flex: 1,
            }}
          >
            <TouchableOpacity
              onPress={() =>
                setDrawerOpen(true)
              }
              activeOpacity={0.7}
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                backgroundColor:
                  '#eef2ff',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 10,
              }}
            >
              <Ionicons
                name="menu"
                size={25}
                color="#4f46e5"
              />
            </TouchableOpacity>

            <View
              style={{
                flex: 1,
                flexDirection:
                  'row',
                alignItems:
                  'center',
                gap: 8,
              }}
            >
              <Image
                source={require('@/assets/images/icon.png')}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                }}
                resizeMode="contain"
              />

              <Text
                style={
                  styles.welcomeText
                }
                numberOfLines={1}
              >
                Service{' '}
                <Text
                  style={
                    styles.dashboardAccent
                  }
                >
                  Provider
                </Text>
              </Text>
            </View>
          </View>

  

        </View>

        {/* ====================================================
            PROVIDER BANNER
            ==================================================== */}

        <AutoProviderBanner
          shop={{
            ...shopDetails,
            shopName,
            category,
            avgRating:
              shopDetails.avgRating,
            totalReviews:
              shopDetails.totalReviews,
          }}
          serviceCount={
            providerServices.length
          }
          profileUri={profileUri}
          editable={isEditingProfile}
          onProfilePress={() =>
            pickImage('profile')
          }
        />

        {/* ====================================================
            SHOP HEADER
            ==================================================== */}

        <View
          style={styles.shopHeaderInfo}
        >
          <View
            style={{
              flexDirection:
                'row',
              alignItems:
                'center',
              gap: 8,
            }}
          >
            <Text
              style={
                styles.shopTitleText
              }
            >
              {shopName ||
                'Dukan Ka Naam Set Karein'}
            </Text>

            <View
              style={
                styles.ownerStarBadgeInline
              }
            >
              <Ionicons
                name="star"
                size={12}
                color="#eab308"
              />

              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '800',
                  color: '#1e293b',
                }}
              >
                {shopDetails.avgRating
                  ? shopDetails.avgRating.toFixed(
                      1
                    )
                  : '1.0'}{' '}
                (
                {shopDetails.totalReviews ||
                  0}
                )
              </Text>
            </View>
          </View>

          <Text
            style={
              styles.shopCategoryText
            }
          >
            {category} • Owner:{' '}
            {authName ||
              ownerName ||
              'N/A'}
          </Text>
        </View>
        {/* ====================================================
            QUOTE STUDIO
            ==================================================== */}

        {currentTab === 'quoteStudio' && (
          <View
            style={{
              flex: 1,
              minHeight: 600,
            }}
          >
            <QuoteStudioScreen />
          </View>
        )}

        {/* ====================================================
            FEED
            ==================================================== */}
        {/* ====================================================
            FEED
            ==================================================== */}

        {currentTab === 'feed' && (
          <View
            style={{
              flex: 1,
              minHeight: 600,
            }}
          >
            <SocialFeed
              userRole="provider"
              authName={authName}
              authPhone={authPhone}
              canCreatePost={true}
              canComment={true}
            />
          </View>
        )}

        {/* ====================================================
            PROFILE / DUKAN
            ==================================================== */}

        {currentTab === 'profile' && (
          <View style={styles.card}>
            <View
              style={{
                flexDirection:
                  'row',
                justifyContent:
                  'space-between',
                alignItems:
                  'center',
                marginBottom: 12,
              }}
            >
              <Text
                style={
                  styles.cardTitle
                }
              >
                Service Provider
                Profile & Location
              </Text>

              {!isEditingProfile && (
                <TouchableOpacity
                  style={
                    styles.editModeBtn
                  }
                  onPress={() =>
                    setIsEditingProfile(
                      true
                    )
                  }
                >
                  <Ionicons
                    name="create-outline"
                    size={14}
                    color="#4f46e5"
                    style={{
                      marginRight: 4,
                    }}
                  />

                  <Text
                    style={
                      styles.editModeBtnText
                    }
                  >
                    Edit Profile
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {!isEditingProfile ? (
              <View
                style={
                  styles.viewProfileContainer
                }
              >
                <View
                  style={styles.viewRow}
                >
                  <Ionicons
                    name="storefront-outline"
                    size={16}
                    color="#4f46e5"
                    style={{
                      marginRight: 8,
                    }}
                  />

                  <Text
                    style={
                      styles.viewLabel
                    }
                  >
                    Business:
                  </Text>

                  <Text
                    style={
                      styles.viewValue
                    }
                  >
                    {shopName ||
                      'Not Set'}
                  </Text>
                </View>

                <View
                  style={styles.viewRow}
                >
                  <Ionicons
                    name="pricetags-outline"
                    size={16}
                    color="#4f46e5"
                    style={{
                      marginRight: 8,
                    }}
                  />

                  <Text
                    style={
                      styles.viewLabel
                    }
                  >
                    Category:
                  </Text>

                  <Text
                    style={
                      styles.viewValue
                    }
                  >
                    {category}
                    {subcategory
                      ? ` • ${subcategory}`
                      : ''}
                  </Text>
                </View>

                <View
                  style={styles.viewRow}
                >
                  <Ionicons
                    name="star-outline"
                    size={16}
                    color="#4f46e5"
                    style={{
                      marginRight: 8,
                    }}
                  />

                  <Text
                    style={
                      styles.viewLabel
                    }
                  >
                    Overall Rating:
                  </Text>

                  <Text
                    style={
                      styles.viewValue
                    }
                  >
                    ⭐{' '}
                    {shopDetails.avgRating
                      ? shopDetails.avgRating.toFixed(
                          1
                        )
                      : '1.0'}{' '}
                    (
                    {shopDetails.totalReviews ||
                      0}{' '}
                    reviews)
                  </Text>
                </View>

                <View
                  style={styles.viewRow}
                >
                  <Ionicons
                    name="person-outline"
                    size={16}
                    color="#4f46e5"
                    style={{
                      marginRight: 8,
                    }}
                  />

                  <Text
                    style={
                      styles.viewLabel
                    }
                  >
                    Owner Name:
                  </Text>

                  <Text
                    style={
                      styles.viewValue
                    }
                  >
                    {authName ||
                      ownerName ||
                      'Not Set'}
                  </Text>
                </View>

                <View
                  style={styles.viewRow}
                >
                  <Ionicons
                    name="call-outline"
                    size={16}
                    color="#4f46e5"
                    style={{
                      marginRight: 8,
                    }}
                  />

                  <Text
                    style={
                      styles.viewLabel
                    }
                  >
                    Contact ID:
                  </Text>

                  <Text
                    style={
                      styles.viewValue
                    }
                  >
                    {authPhone ||
                      mobileNumber ||
                      'Not Set'}
                  </Text>
                </View>

                <View
                  style={styles.viewRow}
                >
                  <Ionicons
                    name="location-outline"
                    size={16}
                    color="#4f46e5"
                    style={{
                      marginRight: 8,
                    }}
                  />

                  <Text
                    style={
                      styles.viewLabel
                    }
                  >
                    Address:
                  </Text>

                  <Text
                    style={
                      styles.viewValue
                    }
                  >
                    {address ||
                      'Not Set'}
                  </Text>
                </View>

                {(frontImageUri ||
                  insideImageUri) && (
                  <View
                    style={{
                      marginTop: 12,
                    }}
                  >
                    <Text
                      style={
                        styles.label
                      }
                    >
                      Business Images
                    </Text>

                    <View
                      style={
                        styles.businessImageRow
                      }
                    >
                      {frontImageUri && (
                        <TouchableOpacity
                          style={
                            styles.businessImagePicker
                          }
                          onPress={() => {
                            setSelectedShopImages(
                              [
                                frontImageUri,
                                insideImageUri,
                              ].filter(
                                Boolean
                              )
                            );

                            setShopImagesVisible(
                              true
                            );
                          }}
                        >
                          <Image
                            source={{
                              uri: frontImageUri,
                            }}
                            style={
                              styles.businessImageThumb
                            }
                          />

                          <Text
                            style={
                              styles.businessImageLabel
                            }
                          >
                            Front
                          </Text>
                        </TouchableOpacity>
                      )}

                      {insideImageUri && (
                        <TouchableOpacity
                          style={
                            styles.businessImagePicker
                          }
                          onPress={() => {
                            setSelectedShopImages(
                              [
                                frontImageUri,
                                insideImageUri,
                              ].filter(
                                Boolean
                              )
                            );

                            setShopImagesVisible(
                              true
                            );
                          }}
                        >
                          <Image
                            source={{
                              uri: insideImageUri,
                            }}
                            style={
                              styles.businessImageThumb
                            }
                          />

                          <Text
                            style={
                              styles.businessImageLabel
                            }
                          >
                            Inside
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}

                <Text
                  style={[
                    styles.label,
                    {
                      marginTop: 15,
                    },
                  ]}
                >
                  📍 Shop Location Map
                </Text>

                <View
                  style={
                    styles.mapBox
                  }
                >
                  <OSMMap
                    latitude={region.latitude}
                    longitude={region.longitude}
                  />
                  </View>
              </View>
            ) : (
              <View>
                <Text
                  style={styles.label}
                >
                  <Ionicons
                    name="storefront-outline"
                    size={14}
                    color="#4f46e5"
                  />{' '}
                  Dukan Ka Naam
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="e.g. Royal Beauty Salon"
                  value={shopName}
                  onChangeText={
                    setShopName
                  }
                />

                <Text
                  style={styles.label}
                >
                  <Ionicons
                    name="pricetags-outline"
                    size={14}
                    color="#4f46e5"
                  />{' '}
                  Service Category
                </Text>

                <TouchableOpacity
                  style={
                    styles.modernSelectBtn
                  }
                  onPress={() => {
                    setCatalogPickerType(
                      'category'
                    );

                    setCatalogPickerVisible(
                      true
                    );
                  }}
                >
                  <Text
                    style={
                      styles.modernSelectText
                    }
                  >
                    {category ||
                      'Select category'}
                  </Text>

                  <Ionicons
                    name="chevron-down"
                    size={17}
                    color="#6366f1"
                  />
                </TouchableOpacity>

                {category ===
                  'Other' && (
                  <TextInput
                    style={styles.input}
                    placeholder="Apni custom category likhein"
                    value={
                      customCategoryText
                    }
                    onChangeText={v => {
                      setCustomCategoryText(
                        v
                      );

                      setCategory(
                        v || 'Other'
                      );
                    }}
                  />
                )}

                <Text
                  style={styles.label}
                >
                  Sub Category
                </Text>

                <TouchableOpacity
                  style={
                    styles.modernSelectBtn
                  }
                  onPress={() => {
                    setCatalogPickerType(
                      'subcategory'
                    );

                    setCatalogPickerVisible(
                      true
                    );
                  }}
                >
                  <Text
                    style={
                      styles.modernSelectText
                    }
                  >
                    {subcategory ||
                      'Select sub category'}
                  </Text>

                  <Ionicons
                    name="chevron-down"
                    size={17}
                    color="#6366f1"
                  />
                </TouchableOpacity>

                {(subcategory ===
                  'Other' ||
                  customSubcategoryText) && (
                  <TextInput
                    style={styles.input}
                    placeholder="Apni custom sub category likhein"
                    value={
                      customSubcategoryText
                    }
                    onChangeText={v => {
                      setCustomSubcategoryText(
                        v
                      );

                      setSubcategory(
                        v || 'Other'
                      );
                    }}
                  />
                )}

                <Text
                  style={styles.label}
                >
                  Business Images —
                  2 photos
                </Text>

                <View
                  style={
                    styles.businessImageRow
                  }
                >
                  <TouchableOpacity
                    style={
                      styles.businessImagePicker
                    }
                    onPress={() =>
                      pickImage(
                        'front'
                      )
                    }
                  >
                    {frontImageUri ? (
                      <Image
                        source={{
                          uri: frontImageUri,
                        }}
                        style={
                          styles.businessImageThumb
                        }
                      />
                    ) : (
                      <Ionicons
                        name="image-outline"
                        size={26}
                        color="#94a3b8"
                      />
                    )}

                    <Text
                      style={
                        styles.businessImageLabel
                      }
                    >
                      Front
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={
                      styles.businessImagePicker
                    }
                    onPress={() =>
                      pickImage(
                        'inside'
                      )
                    }
                  >
                    {insideImageUri ? (
                      <Image
                        source={{
                          uri: insideImageUri,
                        }}
                        style={
                          styles.businessImageThumb
                        }
                      />
                    ) : (
                      <Ionicons
                        name="images-outline"
                        size={26}
                        color="#94a3b8"
                      />
                    )}

                    <Text
                      style={
                        styles.businessImageLabel
                      }
                    >
                      Inside
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text
                  style={styles.label}
                >
                  <Ionicons
                    name="person-outline"
                    size={14}
                    color="#4f46e5"
                  />{' '}
                  Owner Name
                  (Fetched Auto)
                </Text>

                <TextInput
                  style={[
                    styles.input,
                    styles.disabledInput,
                  ]}
                  value={
                    authName ||
                    ownerName
                  }
                  editable={false}
                />

                <Text
                  style={styles.label}
                >
                  <Ionicons
                    name="call-outline"
                    size={14}
                    color="#4f46e5"
                  />{' '}
                  Contact Number
                  (Primary Key ID)
                </Text>

                <TextInput
                  style={[
                    styles.input,
                    styles.disabledInput,
                  ]}
                  value={
                    authPhone ||
                    mobileNumber
                  }
                  editable={false}
                />

                <Text
                  style={styles.label}
                >
                  <Ionicons
                    name="location-outline"
                    size={14}
                    color="#4f46e5"
                  />{' '}
                  Address
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Main Market, City"
                  value={address}
                  onChangeText={
                    setAddress
                  }
                />

                <TouchableOpacity
                  style={styles.searchBtn}
                  onPress={
                    searchAddressOnMap
                  }
                >
                  {loadingMap ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text
                      style={
                        styles.searchBtnText
                      }
                    >
                      🔍 Search Address
                      On Map
                    </Text>
                  )}
                </TouchableOpacity>

                <View
                  style={
                    styles.mapBox
                  }
                >
                  <OSMMap
                    latitude={region.latitude}
                    longitude={region.longitude}
                    draggable
                    onLocationChange={(
                      latitude,
                      longitude
                    ) => {
                      const newCoords = {
                        latitude,
                        longitude,
                      };

                      setRegion((prev: Region) => ({
                        ...prev,
                        ...newCoords,
                      }));

                      fetchAddressFromCoords(
                        latitude,
                        longitude
                      );
                    }}
                  />
                </View>

                <View
                  style={{
                    flexDirection:
                      'row',
                    gap: 10,
                  }}
                >
                  <TouchableOpacity
                    style={
                      styles.cancelEditBtn
                    }
                    onPress={() =>
                      setIsEditingProfile(
                        false
                      )
                    }
                  >
                    <Text
                      style={
                        styles.cancelEditBtnText
                      }
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.btn,
                      {
                        flex: 1,
                        marginTop: 0,
                      },
                    ]}
                    onPress={
                      saveProfileData
                    }
                  >
                    <Text
                      style={
                        styles.btnText
                      }
                    >
                      💾 Save Profile
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {/* ====================================================
            SERVICES
            ==================================================== */}

        {currentTab === 'services' && (
          <View>
            <View style={styles.card}>
              <Text
                style={
                  styles.cardTitle
                }
              >
                ➕ Nayi Service &
                Auto-Slot Engine
              </Text>

              <Text
                style={styles.label}
              >
                Service Name *
              </Text>

              <TextInput
                style={styles.input}
                placeholder="e.g. Hair Cut & Spa"
                value={newServiceName}
                onChangeText={
                  setNewServiceName
                }
              />

              <View
                style={{
                  flexDirection:
                    'row',
                  gap: 10,
                }}
              >
                <View
                  style={{ flex: 1 }}
                >
                  <Text
                    style={styles.label}
                  >
                    Price (₹) *
                  </Text>

                  <TextInput
                    style={
                      styles.input
                    }
                    placeholder="350"
                    keyboardType="numeric"
                    value={
                      newServicePrice
                    }
                    onChangeText={
                      setNewServicePrice
                    }
                  />
                </View>

                <View
                  style={{ flex: 1 }}
                >
                  <Text
                    style={styles.label}
                  >
                    Slot Duration
                    (Mins) *
                  </Text>

                  <TextInput
                    style={
                      styles.input
                    }
                    placeholder="30"
                    keyboardType="numeric"
                    value={
                      newServiceDuration
                    }
                    onChangeText={
                      setNewServiceDuration
                    }
                  />
                </View>
              </View>

              <Text
                style={[
                  styles.label,
                  {
                    marginTop: 12,
                  },
                ]}
              >
                ⏰ Service Timing
                (Auto-Slot Bounds)
              </Text>

              <View
                style={styles.timeRow}
              >
                <View
                  style={{ flex: 1 }}
                >
                  <TouchableOpacity
                    style={
                      styles.clockBtn
                    }
                    onPress={() =>
                      setShowStartTimePicker(
                        true
                      )
                    }
                  >
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color="#4f46e5"
                    />

                    <Text
                      style={
                        styles.clockBtnText
                      }
                    >
                      {formatTime(
                        startTime
                      )}
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text
                  style={{
                    fontWeight:
                      'bold',
                    color:
                      '#64748b',
                  }}
                >
                  TO
                </Text>

                <View
                  style={{ flex: 1 }}
                >
                  <TouchableOpacity
                    style={
                      styles.clockBtn
                    }
                    onPress={() =>
                      setShowEndTimePicker(
                        true
                      )
                    }
                  >
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color="#4f46e5"
                    />

                    <Text
                      style={
                        styles.clockBtnText
                      }
                    >
                      {formatTime(
                        endTime
                      )}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text
                style={[
                  styles.label,
                  {
                    marginTop: 12,
                  },
                ]}
              >
                🪑 Total Seats /
                Capacity Per Slot
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Maximum seats per slot (e.g. 2)"
                keyboardType="numeric"
                value={slotCapacity}
                onChangeText={
                  setSlotCapacity
                }
              />

              {showStartTimePicker && (
                <DateTimePicker
                  value={startTime}
                  mode="time"
                  display="clock"
                  onChange={(
                    event,
                    d
                  ) => {
                    setShowStartTimePicker(
                      false
                    );

                    if (
                      event.type !==
                        'dismissed' &&
                      d
                    ) {
                      setStartTime(
                        d
                      );
                    }
                  }}
                />
              )}

              {showEndTimePicker && (
                <DateTimePicker
                  value={endTime}
                  mode="time"
                  display="clock"
                  onChange={(
                    event,
                    d
                  ) => {
                    setShowEndTimePicker(
                      false
                    );

                    if (
                      event.type !==
                        'dismissed' &&
                      d
                    ) {
                      setEndTime(d);
                    }
                  }}
                />
              )}

              <Text
                style={styles.label}
              >
                Specialty /
                Description
              </Text>

              <TextInput
                style={[
                  styles.input,
                  { height: 50 },
                ]}
                placeholder="e.g. Premium hair wash included"
                multiline
                value={
                  newServiceSpecialty
                }
                onChangeText={
                  setNewServiceSpecialty
                }
              />

              <TouchableOpacity
                style={styles.btn}
                onPress={
                  handleAddServiceWithAutoSlots
                }
              >
                <Text
                  style={
                    styles.btnText
                  }
                >
                  ⚡ Save & Auto-Generate
                  Slots
                </Text>
              </TouchableOpacity>
            </View>

            <Text
              style={
                styles.sectionHeader
              }
            >
              Offered Services (
              {providerServices.length}
              )
            </Text>

            {providerServices.map(
             (item: Service) => (
                <View
                  key={item.id}
                  style={
                    styles.serviceCard
                  }
                >
                  <View
                    style={
                      styles.serviceHeaderRow
                    }
                  >
                    <Text
                      style={
                        styles.serviceTitle
                      }
                    >
                      <Ionicons
                        name="construct-outline"
                        size={14}
                        color="#4f46e5"
                      />{' '}
                      {item.name}
                    </Text>

                    <Text
                      style={
                        styles.servicePrice
                      }
                    >
                      ₹{item.price}
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.specialtyText
                    }
                  >
                    ✨ {item.specialty}
                  </Text>

                  <View
                    style={
                      styles.serviceFooterRow
                    }
                  >
                    <Text
                      style={
                        styles.durationBadge
                      }
                    >
                      ⏱️ Duration:{' '}
                      {item.duration}{' '}
                      • ⚡ Slots:{' '}
                      {item.autoSlots
                        ? item.autoSlots
                            .length
                        : 0}
                    </Text>

                    <TouchableOpacity
                      onPress={() =>
                        handleDeleteService(
                          item.id
                        )
                      }
                    >
                      <Text
                        style={
                          styles.deleteText
                        }
                      >
                        Delete ❌
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )
            )}
          </View>
        )}

        {/* ====================================================
            BOOKINGS
            ==================================================== */}

        {currentTab === 'bookings' && (
          <View
            style={{
              marginHorizontal: 16,
            }}
          >
            <View
              style={
                styles.providerSubTabRow
              }
            >
              <TouchableOpacity
                style={[
                  styles.providerSubTabBtn,
                  providerBookingSubTab ===
                    'upcoming' &&
                    styles.activeProviderSubTabBtn,
                ]}
                onPress={() =>
                  setProviderBookingSubTab(
                    'upcoming'
                  )
                }
              >
                <Text
                  style={[
                    styles.providerSubTabText,
                    providerBookingSubTab ===
                      'upcoming' &&
                      styles.activeProviderSubTabText,
                  ]}
                >
                  Upcoming (
                  {
                    providerUpcoming.length
                  }
                  )
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.providerSubTabBtn,
                  providerBookingSubTab ===
                    'history' &&
                    styles.activeProviderSubTabBtn,
                ]}
                onPress={() =>
                  setProviderBookingSubTab(
                    'history'
                  )
                }
              >
                <Text
                  style={[
                    styles.providerSubTabText,
                    providerBookingSubTab ===
                      'history' &&
                      styles.activeProviderSubTabText,
                  ]}
                >
                  History
                </Text>
              </TouchableOpacity>
            </View>

            {providerBookingSubTab ===
            'upcoming' ? (
              providerUpcoming.length ===
              0 ? (
                <View
                  style={
                    styles.emptyBox
                  }
                >
                  <Ionicons
                    name="calendar-outline"
                    size={36}
                    color="#94a3b8"
                  />

                  <Text
                    style={{
                      color:
                        '#64748b',
                      fontSize: 13,
                      marginTop: 8,
                    }}
                  >
                    Koi upcoming
                    appointment
                    nahi hai.
                  </Text>
                </View>
              ) : (
                providerUpcoming.map(
                 (b: Booking) => (
                    <View
                      key={b.id}
                      style={
                        styles.bookingCard
                      }
                    >
                      <View
                        style={
                          styles.bookingHeader
                        }
                      >
                        <View
                          style={{
                            flexDirection:
                              'row',
                            alignItems:
                              'center',
                            gap: 6,
                          }}
                        >
                          <Ionicons
                            name="person-circle-outline"
                            size={22}
                            color="#4f46e5"
                          />

                          <Text
                            style={
                              styles.customerName
                            }
                          >
                            {b.customerName ||
                              'Customer'}
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.statusBadge,
                            b.status ===
                              'Pending'
                              ? styles.pendingBadge
                              : styles.confirmedBadge,
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusBadgeText,
                              {
                                color:
                                  b.status ===
                                  'Pending'
                                    ? '#d97706'
                                    : '#16a34a',
                              },
                            ]}
                          >
                            {b.status}
                          </Text>
                        </View>
                      </View>

                      <View
                        style={
                          styles.bookingDetailRow
                        }
                      >
                        <Ionicons
                          name="construct-outline"
                          size={15}
                          color="#64748b"
                        />

                        <Text
                          style={
                            styles.bookingDetail
                          }
                        >
                          Service:{' '}
                          <Text
                            style={{
                              fontWeight:
                                '700',
                              color:
                                '#0f172a',
                            }}
                          >
                            {b.service}
                          </Text>
                        </Text>
                      </View>

                      <View
                        style={
                          styles.bookingDetailRow
                        }
                      >
                        <Ionicons
                          name="time-outline"
                          size={15}
                          color="#64748b"
                        />

                        <Text
                          style={
                            styles.bookingDetail
                          }
                        >
                          Date & Time:{' '}
                          {b.date ||
                            'Today'}{' '}
                          ({b.slot})
                        </Text>
                      </View>

                      <View
                        style={
                          styles.bookingDetailRow
                        }
                      >
                        <Ionicons
                          name="location-outline"
                          size={15}
                          color="#64748b"
                        />

                        <Text
                          style={
                            styles.bookingDetail
                          }
                        >
                          Location:{' '}
                          {b.address ||
                            shopDetails.address ||
                            'Shop'}
                        </Text>
                      </View>

                      <View
                        style={
                          styles.bookingDetailRow
                        }
                      >
                        <Ionicons
                          name="call-outline"
                          size={15}
                          color="#64748b"
                        />

                        <Text
                          style={
                            styles.bookingDetail
                          }
                        >
                          Phone: {b.phone}
                        </Text>
                      </View>

                      <View
                        style={
                          styles.quickActionRow
                        }
                      >
                        {b.status ===
                        'Pending' ? (
                          <TouchableOpacity
                            style={
                              styles.actionBtnConfirm
                            }
                            onPress={() =>
                              handleUpdateBookingStatus(
                                b.id,
                                'Confirmed'
                              )
                            }
                          >
                            <Text
                              style={
                                styles.actionBtnText
                              }
                            >
                              Confirm Request
                            </Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            style={
                              styles.actionBtnComplete
                            }
                            onPress={() =>
                              handleUpdateBookingStatus(
                                b.id,
                                'Completed'
                              )
                            }
                          >
                            <Ionicons
                              name="checkmark-done-outline"
                              size={14}
                              color="#ffffff"
                            />

                            <Text
                              style={
                                styles.actionBtnText
                              }
                            >
                              Mark Complete
                            </Text>
                          </TouchableOpacity>
                        )}

                        <TouchableOpacity
                          style={
                            styles.actionBtnCancel
                          }
                          onPress={() =>
                            handleUpdateBookingStatus(
                              b.id,
                              'Canceled'
                            )
                          }
                        >
                          <Text
                            style={
                              styles.actionCancelText
                            }
                          >
                            Cancel
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )
                )
              )
            ) : (
              <View>
                <View
                  style={
                    styles.historyFilterRow
                  }
                >
                  {[
                    'All',
                    'Completed',
                    'Canceled',
                    'No-Show',
                  ].map(filter => (
                    <TouchableOpacity
                      key={filter}
                      style={[
                        styles.historyFilterChip,
                        historyFilter ===
                          filter &&
                          styles.activeHistoryFilterChip,
                      ]}
                      onPress={() =>
                        setHistoryFilter(
                          filter
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.historyFilterText,
                          historyFilter ===
                            filter &&
                            styles.activeHistoryFilterText,
                        ]}
                      >
                        {filter}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {providerHistory.length ===
                0 ? (
                  <View
                    style={
                      styles.emptyBox
                    }
                  >
                    <Ionicons
                      name="time-outline"
                      size={36}
                      color="#94a3b8"
                    />

                    <Text
                      style={{
                        color:
                          '#64748b',
                        fontSize: 13,
                        marginTop: 8,
                      }}
                    >
                      Iss category
                      me koi history
                      record nahi
                      hai.
                    </Text>
                  </View>
                ) : (
                  providerHistory.map(
                    (b: Booking) => (
                      <View
                        key={b.id}
                        style={[
                          styles.bookingCard,
                          {
                            opacity: 0.9,
                          },
                        ]}
                      >
                        <View
                          style={
                            styles.bookingHeader
                          }
                        >
                          <View
                            style={{
                              flexDirection:
                                'row',
                              alignItems:
                                'center',
                              gap: 6,
                            }}
                          >
                            <Ionicons
                              name="person-circle-outline"
                              size={20}
                              color="#64748b"
                            />

                            <Text
                              style={
                                styles.customerName
                              }
                            >
                              {b.customerName ||
                                'Customer'}
                            </Text>
                          </View>

                          <View
                            style={[
                              styles.statusBadge,
                              b.status ===
                                'Completed'
                                ? {
                                    backgroundColor:
                                      '#dcfce7',
                                  }
                                : {
                                    backgroundColor:
                                      '#fee2e2',
                                  },
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusBadgeText,
                                {
                                  color:
                                    b.status ===
                                    'Completed'
                                      ? '#16a34a'
                                      : '#dc2626',
                                },
                              ]}
                            >
                              {b.status}
                            </Text>
                          </View>
                        </View>

                        <View
                          style={
                            styles.bookingDetailRow
                          }
                        >
                          <Ionicons
                            name="construct-outline"
                            size={15}
                            color="#64748b"
                          />

                          <Text
                            style={
                              styles.bookingDetail
                            }
                          >
                            Service:{' '}
                            {b.service}
                          </Text>
                        </View>

                        <View
                          style={
                            styles.bookingDetailRow
                          }
                        >
                          <Ionicons
                            name="time-outline"
                            size={15}
                            color="#64748b"
                          />

                          <Text
                            style={
                              styles.bookingDetail
                            }
                          >
                            Date & Time:{' '}
                            {b.date ||
                              'Past'}{' '}
                            ({b.slot})
                          </Text>
                        </View>

                        <View
                          style={
                            styles.bookingDetailRow
                          }
                        >
                          <Ionicons
                            name="cash-outline"
                            size={15}
                            color="#16a34a"
                          />

                          <Text
                            style={
                              styles.bookingDetail
                            }
                          >
                            Total Amount
                            Paid:{' '}
                            <Text
                              style={{
                                fontWeight:
                                  '800',
                                color:
                                  '#16a34a',
                              }}
                            >
                              ₹
                              {b.price ||
                                '0'}
                            </Text>
                          </Text>
                        </View>
                      </View>
                    )
                  )
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* ======================================================
          DRAWER
          ====================================================== */}

      <Modal
        visible={drawerOpen}
        transparent
        animationType="none"
        onRequestClose={() =>
          setDrawerOpen(false)
        }
      >
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            backgroundColor:
              'rgba(15,23,42,0.45)',
          }}
        >
          {/* DRAWER */}

          <View
            style={{
              width: '82%',
              maxWidth: 340,
              backgroundColor:
                '#ffffff',
              flex: 1,
              shadowColor:
                '#000000',
              shadowOffset: {
                width: 4,
                height: 0,
              },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 12,
            }}
          >
            {/* DRAWER HEADER */}

            <View
              style={{
                backgroundColor:
                  '#4f46e5',
                paddingTop: 20,
                paddingHorizontal: 20,
                paddingBottom: 20,
              }}
            >
              <View
                style={{
                  flexDirection:
                    'row',
                  alignItems:
                    'center',
                  justifyContent:
                    'space-between',
                }}
              >
                <View
                  style={{
                    flexDirection:
                      'row',
                    alignItems:
                      'center',
                    flex: 1,
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor:
                        'rgba(255,255,255,0.18)',
                      alignItems:
                        'center',
                      justifyContent:
                        'center',
                      marginRight: 12,
                    }}
                  >
                    <Image
                      source={require('@/assets/images/icon.png')}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 17,
                      }}
                      resizeMode="contain"
                    />
                  </View>

                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <Text
                      style={{
                        color:
                          '#fff',
                        fontSize: 17,
                        fontWeight:
                          '800',
                      }}
                      numberOfLines={1}
                    >
                      {shopName ||
                        'My Dukan'}
                    </Text>

                    <Text
                      style={{
                        color:
                          'rgba(255,255,255,0.78)',
                        fontSize: 11,
                        marginTop: 3,
                      }}
                      numberOfLines={1}
                    >
                      {authName ||
                        ownerName ||
                        'Provider'}
                    </Text>
                  </View>
                </View>

              </View>
            </View>

            {/* MENU */}

            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
              contentContainerStyle={{
                paddingVertical: 14,
                paddingHorizontal: 12,
              }}
            >
              {drawerItems.map(
                item => {
                  const selected =
                    currentTab ===
                    item.key;

                  return (
                    <TouchableOpacity
                      key={
                        item.key
                      }
                      activeOpacity={0.75}
                      onPress={() =>
                        navigateFromDrawer(
                          item.key
                        )
                      }
                      style={{
                        minHeight: 66,
                        borderRadius: 14,
                        paddingHorizontal: 13,
                        flexDirection:
                          'row',
                        alignItems:
                          'center',
                        marginBottom: 6,
                        backgroundColor:
                          selected
                            ? '#eef2ff'
                            : '#ffffff',
                      }}
                    >
                      <View
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 12,
                          alignItems:
                            'center',
                          justifyContent:
                            'center',
                          backgroundColor:
                            selected
                              ? '#e0e7ff'
                              : '#f8fafc',
                        }}
                      >
                        <Ionicons
                          name={
                            item.icon
                          }
                          size={21}
                          color={
                            selected
                              ? '#4f46e5'
                              : '#64748b'
                          }
                        />
                      </View>

                      <View
                        style={{
                          flex: 1,
                          marginLeft: 12,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight:
                              '800',
                            color:
                              selected
                                ? '#4338ca'
                                : '#0f172a',
                          }}
                        >
                          {
                            item.title
                          }
                        </Text>

                        <Text
                          style={{
                            fontSize: 10,
                            color:
                              '#94a3b8',
                            marginTop: 3,
                          }}
                        >
                          {
                            item.subtitle
                          }
                        </Text>
                      </View>

                      {item.key ===
                        'bookings' &&
                        providerUpcoming.length >
                          0 && (
                          <View
                            style={{
                              minWidth: 23,
                              height: 23,
                              paddingHorizontal: 6,
                              borderRadius: 12,
                              backgroundColor:
                                '#ef4444',
                              alignItems:
                                'center',
                              justifyContent:
                                'center',
                            }}
                          >
                            <Text
                              style={{
                                color:
                                  '#fff',
                                fontSize: 10,
                                fontWeight:
                                  '800',
                              }}
                            >
                              {
                                providerUpcoming.length
                              }
                            </Text>
                          </View>
                        )}

                      {selected && (
                        <Ionicons
                          name="chevron-forward"
                          size={18}
                          color="#4f46e5"
                        />
                      )}
                    </TouchableOpacity>
                  );
                }
              )}

              {/* DIVIDER */}

              <View
                style={{
                  height: 1,
                  backgroundColor:
                    '#e2e8f0',
                  marginVertical: 14,
                }}
              />

              {/* LOGOUT */}

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => {
                  setDrawerOpen(
                    false
                  );

                  handleLogout();
                }}
                style={{
                  minHeight: 55,
                  borderRadius: 14,
                  paddingHorizontal: 13,
                  flexDirection:
                    'row',
                  alignItems:
                    'center',
                }}
              >
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    backgroundColor:
                      '#fef2f2',
                    alignItems:
                      'center',
                    justifyContent:
                      'center',
                  }}
                >
                  <Ionicons
                    name="log-out-outline"
                    size={21}
                    color="#dc2626"
                  />
                </View>

                <Text
                  style={{
                    marginLeft: 12,
                    color:
                      '#dc2626',
                    fontSize: 14,
                    fontWeight:
                      '800',
                  }}
                >
                  Logout
                </Text>
              </TouchableOpacity>
            </ScrollView>

            {/* DRAWER FOOTER */}

            <View
              style={{
                paddingHorizontal: 20,
                paddingVertical: 18,
                borderTopWidth: 1,
                borderTopColor:
                  '#e2e8f0',
              }}
            >
              <Text
                style={{
                  color:
                    '#94a3b8',
                  fontSize: 10,
                  textAlign:
                    'center',
                }}
              >
                ServiceBazar Provider
              </Text>
            </View>
          </View>

          {/* OUTSIDE DRAWER TAP */}

          <TouchableOpacity
            activeOpacity={1}
            onPress={() =>
              setDrawerOpen(
                false
              )
            }
            style={{
              flex: 1,
            }}
          />
        </View>
      </Modal>
    </View>
  );
}