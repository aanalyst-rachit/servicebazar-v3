import AutoProviderBanner from '@/components/AutoProviderBanner';
import SocialFeed from '@/components/SocialFeed';
import { useApp } from '@/context/AppContext';
import QuoteStudioScreen from '@/screens/QuoteStudioScreen';
import { styles } from '@/styles/appStyles';
import { calculateDistance } from '@/utils/distance';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { ActivityIndicator, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
export default function CustomerScreen() {
  const {
    customerActiveTab,
    setCustomerActiveTab,

    customerSubTab,
    setCustomerSubTab,

    fetchUserCurrentLocation,

    searchQuery,
    setSearchQuery,

    categories,
    selectedCategoryFilter,
    setSelectedCategoryFilter,

    groupedShopsWithServices,

    userLocation,

    externalLoading,
    externalResults,
    externalSearchedFor,
    openExternalResultOnMap,

    expandedShops,
    toggleExpandShop,

    cart,
    toggleCartService,

    setSelectedShopImages,
    setShopImagesVisible,

    activeAppointments,
    historyAppointments,
    myBookings,

    setSelectedBookingForRating,
    setRatingModalVisible,

    setSelectedSlotForBooking,
    setBookingModalVisible,

    customerProfileUri,
    customerPaid,

    authName,
    authPhone,

    pickImage,
    handleLogout,
  } = useApp();

  // ============================================================
  // LOCAL DRAWER
  // ============================================================

  const [drawerOpen, setDrawerOpen] = useState(false);

  // ============================================================
  // TYPES
  // ============================================================

  type Slot = {
    slotTime: string;
    availableSeats: number;
    [key: string]: unknown;
  };

  type CartItem = {
    id: string;
    name: string;
    price: string | number;
    autoSlots?: Slot[];
    [key: string]: unknown;
  };

  type Booking = {
    id: string;
    service: string;
    status: string;
    slot: string;
    price?: string | number;
    phone?: string;
    userRating?: number;
    [key: string]: unknown;
  };

  type ExternalResult = {
    id: string;
    name: string;
    category?: string;
    address?: string;
    distanceKm?: number;
    [key: string]: unknown;
  };

  const typedCategories = categories as string[];

  const typedExternalResults =
    externalResults as ExternalResult[];

  const typedCart = cart as CartItem[];

  const typedActiveAppointments =
    activeAppointments as Booking[];

  const typedHistoryAppointments =
    historyAppointments as Booking[];

  // ============================================================
  // CURRENT TAB
  // ============================================================

  const currentTab =
    customerActiveTab || 'explore';

  // ============================================================
  // DRAWER NAVIGATION
  // ============================================================

  const navigateFromDrawer = (
    tab: string
  ) => {
    setCustomerActiveTab(tab as any);

    setDrawerOpen(false);
  };

  // ============================================================
  // CUSTOMER DRAWER ITEMS
  // ============================================================

  const drawerItems = [
    {
      key: 'explore',
      title: 'Explore',
      subtitle: 'Find Nearby Services',
      icon: 'storefront-outline' as const,
    },

    {
      key: 'feed',
      title: 'Feed',
      subtitle: 'Latest Updates',
      icon: 'newspaper-outline' as const,
    },

    {
      key: 'appointments',
      title: 'Appointments',
      subtitle: 'My Bookings',
      icon: 'calendar-outline' as const,
    },
    {
      key: 'quote',
      title: 'Quote Studio',
      subtitle: 'Create AI Quotes',
      icon: 'sparkles-outline' as const,
    },
  ];

  // ============================================================
  // CURRENT TITLE
  // ============================================================

  const currentTitle =
  currentTab === 'explore'
    ? 'Explore'
    : currentTab === 'feed'
      ? 'Feed'
      : currentTab === 'quote'
        ? 'Quote Studio'
        : 'Appointments';

  const currentIcon =
  currentTab === 'explore'
    ? 'storefront-outline'
    : currentTab === 'feed'
      ? 'newspaper-outline'
      : currentTab === 'quote'
        ? 'sparkles-outline'
        : 'calendar-outline';

  return (
    <View
      style={{
        flex: 1,
        position: 'relative',
      }}
    >
      {/* ======================================================
          TOP BAR
          ====================================================== */}

      <View style={styles.custTopBar}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
          }}
        >
          {/* MENU */}

          <TouchableOpacity
            onPress={() =>
              setDrawerOpen(true)
            }
            activeOpacity={0.7}
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              backgroundColor: '#eef2ff',
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

          {/* BRAND */}

          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
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
              style={styles.welcomeText}
              numberOfLines={1}
            >
              Service{' '}
              <Text
                style={styles.dashboardAccent}
              >
                Customer
              </Text>
            </Text>
          </View>
        </View>

        {/* GPS */}

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={
            fetchUserCurrentLocation
          }
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            backgroundColor: '#eef2ff',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons
            name="locate-outline"
            size={21}
            color="#4f46e5"
          />
        </TouchableOpacity>
      </View>

      {/* ======================================================
          FEED
          ====================================================== */}

      {currentTab === 'feed' ? (
        <SocialFeed
          userRole="customer"
          authName={authName}
          authPhone={authPhone}
          canCreatePost={false}
          canComment={true}
        />
        ) : currentTab === 'quote' ? (
          <QuoteStudioScreen
            ownerName={authName}
            phone={authPhone}
          />
      ) : currentTab === 'explore' ? (
        /* ====================================================
           EXPLORE
           ==================================================== */

        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            styles.scrollContainer
          }
        >
          {/* SEARCH */}

          <View
            style={
              styles.searchBoxContainer
            }
          >
            <Ionicons
              name="search-outline"
              size={20}
              color="#94a3b8"
              style={{
                marginRight: 8,
              }}
            />

            <TextInput
              style={styles.searchInput}
              placeholder="Search services..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={
                setSearchQuery
              }
            />
          </View>

          {/* CATEGORY SLIDER */}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.categorySliderContent
            }
          >
            {typedCategories.map(
              (cat: string) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() =>
                    setSelectedCategoryFilter(
                      cat
                    )
                  }
                  style={[
                    styles.modernFilterChip,
                    selectedCategoryFilter ===
                      cat &&
                      styles.modernFilterChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.modernFilterChipText,
                      selectedCategoryFilter ===
                        cat &&
                        styles.modernFilterChipTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </ScrollView>

          {/* NEARBY SHOPS */}

          <View
            style={{
              marginHorizontal: 16,
            }}
          >
            <View
              style={
                styles.flexHeaderRow
              }
            >
              <Text
                style={
                  styles.sectionHeader
                }
              >
                Nearby Shops
              </Text>

              {selectedCategoryFilter !==
                'All' && (
                <Text
                  style={
                    styles.activeFilterBadge
                  }
                >
                  Filter:{' '}
                  {
                    selectedCategoryFilter
                  }
                </Text>
              )}
            </View>

            {/* NO LOCAL PROVIDERS */}

            {Object.keys(
              groupedShopsWithServices
            ).length === 0 ? (
              <View>
                <View
                  style={
                    styles.emptyBox
                  }
                >
                  <Text
                    style={{
                      color: '#64748b',
                      fontSize: 13,
                    }}
                  >
                    No ServiceBazar
                    provider matches
                    your search 😞
                  </Text>

                  {!userLocation && (
                    <Text
                      style={{
                        color: '#94a3b8',
                        fontSize: 11,
                        marginTop: 6,
                        textAlign:
                          'center',
                      }}
                    >
                      Nearby options
                      dekhne ke liye
                      location on
                      karein (📍 icon
                      top par)
                    </Text>
                  )}
                </View>

                {/* EXTERNAL LOADING */}

                {externalLoading && (
                  <View
                    style={{
                      paddingVertical: 20,
                      alignItems:
                        'center',
                    }}
                  >
                    <ActivityIndicator
                      color="#4f46e5"
                    />

                    <Text
                      style={{
                        color:
                          '#94a3b8',
                        fontSize: 11,
                        marginTop: 8,
                      }}
                    >
                      Nearby options
                      dhoondh rahe
                      hain...
                    </Text>
                  </View>
                )}

                {/* EXTERNAL RESULTS */}

                {!externalLoading &&
                  externalResults.length >
                    0 && (
                    <View
                      style={{
                        marginTop: 6,
                      }}
                    >
                      <View
                        style={
                          styles.externalSectionHeaderRow
                        }
                      >
                        <Ionicons
                          name="map-outline"
                          size={15}
                          color="#64748b"
                        />

                        <Text
                          style={
                            styles.externalSectionHeaderText
                          }
                        >
                          Found nearby
                          (map data) —
                          not
                          ServiceBazar
                          providers
                        </Text>
                      </View>

                      {typedExternalResults.map(
                        (
                          item: ExternalResult
                        ) => (
                          <View
                            key={item.id}
                            style={
                              styles.externalResultCard
                            }
                          >
                            <View
                              style={{
                                flex: 1,
                                paddingRight: 8,
                              }}
                            >
                              <Text
                                style={
                                  styles.externalResultName
                                }
                                numberOfLines={
                                  1
                                }
                              >
                                {item.name}
                              </Text>

                              <Text
                                style={
                                  styles.externalResultCategory
                                }
                                numberOfLines={
                                  1
                                }
                              >
                                {item.category}
                              </Text>

                              {!!item.address && (
                                <Text
                                  style={
                                    styles.externalResultAddress
                                  }
                                  numberOfLines={
                                    1
                                  }
                                >
                                  📍{' '}
                                  {
                                    item.address
                                  }
                                </Text>
                              )}

                              <Text
                                style={
                                  styles.externalResultDistance
                                }
                              >
                                ⚡{' '}
                                {
                                  item.distanceKm
                                }{' '}
                                km away
                                from you
                              </Text>
                            </View>

                            <TouchableOpacity
                              style={
                                styles.externalViewMapBtn
                              }
                              onPress={() =>
                                openExternalResultOnMap(
                                  item
                                )
                              }
                            >
                              <Ionicons
                                name="navigate-outline"
                                size={14}
                                color="#4f46e5"
                              />

                              <Text
                                style={
                                  styles.externalViewMapBtnText
                                }
                              >
                                View on Map
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )
                      )}

                      <Text
                        style={
                          styles.externalDisclaimerText
                        }
                      >
                        Ye results
                        OpenStreetMap
                        se aa rahe
                        hain —
                        booking, coins
                        ya reviews
                        yahan available
                        nahi hain.
                      </Text>
                    </View>
                  )}

                {/* NO EXTERNAL RESULTS */}

                {!externalLoading &&
                  externalSearchedFor !==
                    '' &&
                  externalResults.length ===
                    0 &&
                  userLocation && (
                    <View
                      style={{
                        paddingVertical: 10,
                        alignItems:
                          'center',
                      }}
                    >
                      <Text
                        style={{
                          color:
                            '#94a3b8',
                          fontSize: 11,
                          textAlign:
                            'center',
                        }}
                      >
                        "
                        {
                          externalSearchedFor
                        }
                        " ke liye map
                        par bhi kuch
                        nahi mila 6 km
                        ke andar.
                      </Text>
                    </View>
                  )}
              </View>
            ) : (
              /* ==================================================
                 LOCAL PROVIDERS
                 ================================================== */

              Object.keys(
                groupedShopsWithServices
              ).map((shopKey) => {
                const itemGroup =
                  groupedShopsWithServices[
                    shopKey
                  ];

                const currentShop =
                  itemGroup.shopInfo;

                const currentServices =
                  itemGroup.servicesList;

                const calculatedDist =
                  userLocation &&
                  currentShop.region
                    ? calculateDistance(
                        userLocation.latitude,
                        userLocation.longitude,
                        currentShop.region
                          .latitude,
                        currentShop.region
                          .longitude
                      )
                    : null;

                return (
                  <View
                    key={shopKey}
                    style={
                      styles.custShopCard
                    }
                  >
                    {/* PROVIDER BANNER */}

                    <AutoProviderBanner
                      shop={currentShop}
                      serviceCount={
                        currentServices.length
                      }
                      profileUri={
                        currentShop.profileUri ||
                        null
                      }
                    />

                    <View
                      style={
                        styles.custCardBody
                      }
                    >
                      {/* SHOP HEADER */}

                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() =>
                          toggleExpandShop(
                            shopKey
                          )
                        }
                        style={{
                          flexDirection:
                            'row',
                          justifyContent:
                            'space-between',
                          alignItems:
                            'flex-start',
                        }}
                      >
                        <View
                          style={{
                            flex: 1,
                            paddingRight: 8,
                          }}
                        >
                          <Text
                            style={
                              styles.custCardShopTitle
                            }
                          >
                            {currentShop.shopName ||
                              'Shop Name'}
                          </Text>

                          <Text
                            style={
                              styles.custCardAddress
                            }
                          >
                            📍{' '}
                            {currentShop.address ||
                              'Location N/A'}
                          </Text>

                          {calculatedDist && (
                            <View
                              style={
                                styles.distanceBadge
                              }
                            >
                              <Text
                                style={
                                  styles.distanceBadgeText
                                }
                              >
                                ⚡{' '}
                                {
                                  calculatedDist
                                }{' '}
                                km away
                                from you
                              </Text>
                            </View>
                          )}

                          <View
                            style={{
                              flexDirection:
                                'row',
                              alignItems:
                                'center',
                              marginTop: 8,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 12,
                                color:
                                  '#4f46e5',
                                fontWeight:
                                  '700',
                                marginRight: 4,
                              }}
                            >
                              {expandedShops[
                                shopKey
                              ]
                                ? 'Hide Services'
                                : `View ${currentServices.length} Services`}
                            </Text>

                            <Ionicons
                              name={
                                expandedShops[
                                  shopKey
                                ]
                                  ? 'chevron-up'
                                  : 'chevron-down'
                              }
                              size={14}
                              color="#4f46e5"
                            />
                          </View>
                        </View>

                        {/* RIGHT ACTIONS */}

                        <View
                          style={
                            styles.cardActionColumn
                          }
                        >
                          <Text
                            style={
                              styles.custCardBadge
                            }
                          >
                            {currentShop.category ||
                              'Service'}
                          </Text>

                          {(currentShop.frontImageUri ||
                            currentShop.insideImageUri) && (
                            <TouchableOpacity
                              style={
                                styles.seeImagesBtn
                              }
                              onPress={() => {
                                setSelectedShopImages(
                                  [
                                    currentShop.frontImageUri,
                                    currentShop.insideImageUri,
                                  ].filter(
                                    Boolean
                                  )
                                );

                                setShopImagesVisible(
                                  true
                                );
                              }}
                            >
                              <Ionicons
                                name="images-outline"
                                size={13}
                                color="#4f46e5"
                              />

                              <Text
                                style={
                                  styles.seeImagesText
                                }
                              >
                                See Images
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </TouchableOpacity>

                      <View
                        style={
                          styles.custCardDivider
                        }
                      />

                      {/* SERVICES */}

                      {expandedShops[
                        shopKey
                      ] && (
                        <View>
                          {(
                            currentServices as CartItem[]
                          ).map(
                            (
                              item: CartItem,
                              idx: number
                            ) => {
                              const isSelectedInCart =
                                typedCart.some(
                                  (
                                    c: CartItem
                                  ) =>
                                    c.id ===
                                    item.id
                                );

                              return (
                                <View
                                  key={
                                    item.id
                                  }
                                  style={[
                                    styles.innerServiceRow,
                                    idx > 0 &&
                                      styles.innerServiceBorder,
                                  ]}
                                >
                                  <View
                                    style={{
                                      flex: 1,
                                      paddingRight: 10,
                                    }}
                                  >
                                    <Text
                                      style={
                                        styles.custCardServiceTitle
                                      }
                                    >
                                      <Ionicons
                                        name="construct-outline"
                                        size={14}
                                        color="#4f46e5"
                                      />{' '}
                                      {
                                        item.name
                                      }
                                    </Text>

                                    <Text
                                      style={
                                        styles.custCardSpecialty
                                      }
                                    >
                                      ✨{' '}
                                      {String(
                                        item.specialty ??
                                          ''
                                      )}
                                    </Text>

                                    <Text
                                      style={
                                        styles.custCardMeta
                                      }
                                    >
                                      ⏱️{' '}
                                      {String(
                                        item.duration ??
                                          ''
                                      )}{' '}
                                      •{' '}
                                      <Text
                                        style={{
                                          color:
                                            '#16a34a',
                                          fontWeight:
                                            '700',
                                        }}
                                      >
                                        ₹
                                        {
                                          item.price
                                        }
                                      </Text>
                                    </Text>
                                  </View>

                                  <TouchableOpacity
                                    style={[
                                      styles.custBookBtn,
                                      isSelectedInCart && {
                                        backgroundColor:
                                          '#16a34a',
                                      },
                                    ]}
                                    onPress={() =>
                                      toggleCartService(
                                        item
                                      )
                                    }
                                  >
                                    <Text
                                      style={
                                        styles.custBookBtnText
                                      }
                                    >
                                      {isSelectedInCart
                                        ? 'Added ✓'
                                        : '+ Add Service'}
                                    </Text>
                                  </TouchableOpacity>
                                </View>
                              );
                            }
                          )}
                        </View>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      ) : (
        /* ======================================================
           APPOINTMENTS
           ====================================================== */

        <View
          style={{
            flex: 1,
            backgroundColor: '#f8fafc',
          }}
        >
          {/* SUB TABS */}

          <View
            style={
              styles.subTabsContainer
            }
          >
            <TouchableOpacity
              style={[
                styles.subTabBtn,
                customerSubTab ===
                  'active' &&
                  styles.activeSubTabBtn,
              ]}
              onPress={() =>
                setCustomerSubTab(
                  'active'
                )
              }
            >
              <Text
                style={[
                  styles.subTabText,
                  customerSubTab ===
                    'active' &&
                    styles.activeSubTabText,
                ]}
              >
                Active Appointments (
                {
                  activeAppointments.length
                }
                )
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.subTabBtn,
                customerSubTab ===
                  'history' &&
                  styles.activeSubTabBtn,
              ]}
              onPress={() =>
                setCustomerSubTab(
                  'history'
                )
              }
            >
              <Text
                style={[
                  styles.subTabText,
                  customerSubTab ===
                    'history' &&
                    styles.activeSubTabText,
                ]}
              >
                History (
                {
                  historyAppointments.length
                }
                )
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              padding: 16,
              paddingBottom: 40,
            }}
          >
            {/* ACTIVE APPOINTMENTS */}

            {customerSubTab ===
            'active' ? (
              activeAppointments.length ===
              0 ? (
                <View
                  style={
                    styles.emptyBox
                  }
                >
                  <Ionicons
                    name="calendar-outline"
                    size={40}
                    color="#cbd5e1"
                  />

                  <Text
                    style={{
                      color:
                        '#64748b',
                      fontSize: 13,
                      marginTop: 8,
                    }}
                  >
                    No active
                    appointments
                    found.
                  </Text>
                </View>
              ) : (
                typedActiveAppointments.map(
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
                        <Text
                          style={
                            styles.customerName
                          }
                        >
                          {b.service}
                        </Text>

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
                          name="time-outline"
                          size={15}
                          color="#64748b"
                        />

                        <Text
                          style={
                            styles.bookingDetail
                          }
                        >
                          Slot: {b.slot}
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
                          Total: ₹
                          {b.price}
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

                      <TouchableOpacity
                        style={
                          styles.doneAndRateBtn
                        }
                        onPress={() => {
                          setSelectedBookingForRating(
                            b
                          );

                          setRatingModalVisible(
                            true
                          );
                        }}
                      >
                        <Ionicons
                          name="checkmark-done-circle-outline"
                          size={18}
                          color="#ffffff"
                          style={{
                            marginRight: 6,
                          }}
                        />

                        <Text
                          style={
                            styles.doneAndRateBtnText
                          }
                        >
                          Mark Complete &
                          Rate ⭐
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )
                )
              )
            ) : (
              /* ==================================================
                 HISTORY
                 ================================================== */

              historyAppointments.length ===
              0 ? (
                <View
                  style={
                    styles.emptyBox
                  }
                >
                  <Ionicons
                    name="time-outline"
                    size={40}
                    color="#cbd5e1"
                  />

                  <Text
                    style={{
                      color:
                        '#64748b',
                      fontSize: 13,
                      marginTop: 8,
                    }}
                  >
                    No appointment
                    history
                    available.
                  </Text>
                </View>
              ) : (
                typedHistoryAppointments.map(
                  (b: Booking) => (
                    <View
                      key={b.id}
                      style={[
                        styles.bookingCard,
                        {
                          opacity: 0.8,
                        },
                      ]}
                    >
                      <View
                        style={
                          styles.bookingHeader
                        }
                      >
                        <Text
                          style={
                            styles.customerName
                          }
                        >
                          {b.service}
                        </Text>

                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor:
                                '#f1f5f9',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusBadgeText,
                              {
                                color:
                                  '#64748b',
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
                          name="time-outline"
                          size={15}
                          color="#64748b"
                        />

                        <Text
                          style={
                            styles.bookingDetail
                          }
                        >
                          Slot: {b.slot}
                        </Text>
                      </View>

                      {b.userRating && (
                        <View
                          style={
                            styles.bookingDetailRow
                          }
                        >
                          <Ionicons
                            name="star"
                            size={14}
                            color="#eab308"
                          />

                          <Text
                            style={
                              styles.bookingDetail
                            }
                          >
                            Your Rating:{' '}
                            {
                              b.userRating
                            }{' '}
                            ⭐
                          </Text>
                        </View>
                      )}
                    </View>
                  )
                )
              )
            )}
          </ScrollView>
        </View>
      )}

      {/* ======================================================
          CART FLOATING BAR
          ====================================================== */}

      {cart.length > 0 &&
        currentTab === 'explore' && (
          <View
            style={
              styles.cartBarFloating
            }
          >
            <View>
              <Text
                style={{
                  color: '#ffffff',
                  fontWeight: '800',
                  fontSize: 14,
                }}
              >
                {cart.length}{' '}
                {cart.length === 1
                  ? 'Service'
                  : 'Services'}{' '}
                Selected
              </Text>

              <Text
                style={{
                  color: '#cbd5e1',
                  fontSize: 11,
                }}
              >
                Total: ₹
                {typedCart.reduce(
                  (
                    sum: number,
                    item: CartItem
                  ) =>
                    sum +
                    (parseFloat(
                      String(
                        item.price
                      )
                    ) || 0),
                  0
                )}
              </Text>
            </View>

            <TouchableOpacity
              style={
                styles.cartCheckoutBtn
              }
              onPress={() => {
                const initialSlots: Record<
                  string,
                  Slot
                > = {};

                typedCart.forEach(
                  (
                    serviceItem: CartItem
                  ) => {
                    const firstAvailableSlot =
                      (
                        serviceItem.autoSlots ||
                        []
                      ).find(
                        (
                          slot: Slot
                        ) =>
                          slot.availableSeats >
                          0
                      );

                    if (
                      firstAvailableSlot
                    ) {
                      initialSlots[
                        serviceItem.id
                      ] =
                        firstAvailableSlot;
                    }
                  }
                );

                setSelectedSlotForBooking(
                  initialSlots
                );

                setBookingModalVisible(
                  true
                );
              }}
            >
              <Text
                style={
                  styles.cartCheckoutBtnText
                }
              >
                Checkout Cart 🚀
              </Text>
            </TouchableOpacity>
          </View>
        )}

      {/* ======================================================
          PROVIDER-STYLE CUSTOMER DRAWER
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
          {/* ==================================================
              DRAWER
              ================================================== */}

          <View
            style={{
              width: '82%',
              maxWidth: 340,
              backgroundColor: '#ffffff',
              flex: 1,
              shadowColor: '#000000',
              shadowOffset: {
                width: 4,
                height: 0,
              },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 12,
            }}
          >
            {/* ==================================================
                DRAWER HEADER
                ================================================== */}

            <View
              style={{
                backgroundColor: '#4f46e5',
                paddingTop: 20,
                paddingHorizontal: 20,
                paddingBottom: 20,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent:
                    'space-between',
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flex: 1,
                  }}
                >
                  {/* APP ICON */}

                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor:
                        'rgba(255,255,255,0.18)',
                      alignItems: 'center',
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

                  {/* CUSTOMER INFO */}

                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <Text
                      style={{
                        color: '#fff',
                        fontSize: 17,
                        fontWeight: '800',
                      }}
                      numberOfLines={1}
                    >
                      {authName ||
                        'Customer'}
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
                      {authPhone ||
                        'Customer Account'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* ==================================================
                DRAWER MENU
                ================================================== */}

            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
              contentContainerStyle={{
                paddingVertical: 14,
                paddingHorizontal: 12,
              }}
            >
              {/* MAIN MENU */}

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
                      {/* ICON */}

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

                      {/* TITLE */}

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

                      {/* APPOINTMENT BADGE */}

                      {item.key ===
                        'appointments' &&
                        myBookings.length >
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
                                myBookings.length
                              }
                            </Text>
                          </View>
                        )}

                      {/* SELECTED ARROW */}

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

              {/* ==================================================
                  DIVIDER
                  ================================================== */}


              {/* ==================================================
                  CATEGORIES
                  ================================================== */}


              {/* ==================================================
                  DIVIDER
                  ================================================== */}

              <View
                style={{
                  height: 1,
                  backgroundColor:
                    '#e2e8f0',
                  marginVertical: 14,
                }}
              />

              {/* ==================================================
                  PROFILE
                  ================================================== */}

              <View
                style={{
                  paddingHorizontal: 13,
                  paddingVertical: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '800',
                    color: '#94a3b8',
                    textTransform:
                      'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  Account
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => {
                  pickImage(
                    'customer_profile'
                  );
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
                {/* PROFILE IMAGE */}

                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    backgroundColor:
                      '#eef2ff',
                    alignItems:
                      'center',
                    justifyContent:
                      'center',
                    overflow: 'hidden',
                  }}
                >
                  {customerProfileUri ? (
                    <Image
                      source={{
                        uri: customerProfileUri,
                      }}
                      style={{
                        width: 42,
                        height: 42,
                      }}
                    />
                  ) : (
                    <Text
                      style={{
                        color:
                          '#4f46e5',
                        fontSize: 17,
                        fontWeight:
                          '800',
                      }}
                    >
                      {authName
                        ? authName
                            .charAt(
                              0
                            )
                            .toUpperCase()
                        : 'C'}
                    </Text>
                  )}
                </View>

                <View
                  style={{
                    flex: 1,
                    marginLeft: 12,
                  }}
                >
                  <Text
                    style={{
                      color:
                        '#0f172a',
                      fontSize: 14,
                      fontWeight:
                        '800',
                    }}
                    numberOfLines={1}
                  >
                    My Profile
                  </Text>

                  <Text
                    style={{
                      color:
                        '#94a3b8',
                      fontSize: 10,
                      marginTop: 3,
                    }}
                  >
                    Change Profile
                    Photo
                  </Text>
                </View>

                <Ionicons
                  name="camera-outline"
                  size={18}
                  color="#64748b"
                />
              </TouchableOpacity>

              {/* ==================================================
                  LOGOUT
                  ================================================== */}

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

            {/* ==================================================
                DRAWER FOOTER
                ================================================== */}

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
                ServiceBazar Customer
              </Text>
            </View>
          </View>

          {/* ==================================================
              OUTSIDE DRAWER TAP
              ================================================== */}

          <TouchableOpacity
            activeOpacity={1}
            onPress={() =>
              setDrawerOpen(false)
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