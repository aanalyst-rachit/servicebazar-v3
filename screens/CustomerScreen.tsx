import AutoProviderBanner from '@/components/AutoProviderBanner';
import SocialFeed from '@/components/SocialFeed';
import { useApp } from '@/context/AppContext';
import { styles } from '@/styles/appStyles';
import { calculateDistance } from '@/utils/distance';
import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { ActivityIndicator, Animated, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CustomerScreen() {
  const { isDrawerOpen, slideAnim, customerActiveTab, setCustomerActiveTab, customerSubTab, setCustomerSubTab, toggleDrawer, fetchUserCurrentLocation, searchQuery, setSearchQuery, categories, selectedCategoryFilter, setSelectedCategoryFilter, groupedShopsWithServices, userLocation, externalLoading, externalResults, externalSearchedFor, openExternalResultOnMap, expandedShops, toggleExpandShop, cart, toggleCartService, setSelectedShopImages, setShopImagesVisible, activeAppointments, historyAppointments, myBookings, setSelectedBookingForRating, setRatingModalVisible, setSelectedSlotForBooking, setBookingModalVisible, customerProfileUri, customerPaid, authName, authPhone, userRole, pickImage, handleLogout } = useApp();

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
  const typedExternalResults = externalResults as ExternalResult[];
  const typedCart = cart as CartItem[];
  const typedActiveAppointments = activeAppointments as Booking[];
  const typedHistoryAppointments = historyAppointments as Booking[];

  return (
          <View style={{ flex: 1, position: 'relative' }}>
            
            <View style={styles.custHeaderRow}>
              <TouchableOpacity onPress={() => toggleDrawer(true)} style={styles.menuIconBtn}>
                <Ionicons name="menu-outline" size={26} color="#0f172a" />
              </TouchableOpacity>
              
              <View style={styles.customerBrandWrap}>
                <View style={styles.customerBrandMark}><Ionicons name="sparkles-outline" size={17} color="#ffffff" /></View>
                <Text style={styles.appHeaderTitle}>ServiceBazar</Text>
              </View>

              <TouchableOpacity style={styles.gpsReloadBtn} onPress={fetchUserCurrentLocation}>
                <Ionicons name="locate-outline" size={20} color="#4f46e5" />
              </TouchableOpacity>
            </View>

            {customerActiveTab === 'feed' ? (
              <SocialFeed
                userRole="customer"
                authName={authName}
                authPhone={authPhone}
                canCreatePost={false}
                canComment={true}
              />
            ) : customerActiveTab === 'explore' ? (
              <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContainer}>
                <View style={styles.searchBoxContainer}>
                  <Ionicons name="search-outline" size={20} color="#94a3b8" style={{ marginRight: 8 }} />
                  <TextInput 
                    style={styles.searchInput} 
                    placeholder="Search services..." 
                    placeholderTextColor="#94a3b8"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categorySliderContent}>
                  {typedCategories.map((cat: string) => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setSelectedCategoryFilter(cat)}
                      style={[styles.modernFilterChip, selectedCategoryFilter === cat && styles.modernFilterChipActive]}
                    >
                      <Text style={[styles.modernFilterChipText, selectedCategoryFilter === cat && styles.modernFilterChipTextActive]} numberOfLines={1}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <View style={{ marginHorizontal: 16 }}>
                  <View style={styles.flexHeaderRow}>
                    <Text style={styles.sectionHeader}>Nearby Shops</Text>
                    {selectedCategoryFilter !== 'All' && (
                      <Text style={styles.activeFilterBadge}>Filter: {selectedCategoryFilter}</Text>
                    )}
                  </View>

                  {Object.keys(groupedShopsWithServices).length === 0 ? (
                    <View>
                      <View style={styles.emptyBox}>
                        <Text style={{ color: '#64748b', fontSize: 13 }}>No ServiceBazar provider matches your search 😞</Text>
                        {!userLocation && (
                          <Text style={{ color: '#94a3b8', fontSize: 11, marginTop: 6, textAlign: 'center' }}>
                            Nearby options dekhne ke liye location on karein (📍 icon top par)
                          </Text>
                        )}
                      </View>

                      {externalLoading && (
                        <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                          <ActivityIndicator color="#4f46e5" />
                          <Text style={{ color: '#94a3b8', fontSize: 11, marginTop: 8 }}>Nearby options dhoondh rahe hain...</Text>
                        </View>
                      )}

                      {!externalLoading && externalResults.length > 0 && (
                        <View style={{ marginTop: 6 }}>
                          <View style={styles.externalSectionHeaderRow}>
                            <Ionicons name="map-outline" size={15} color="#64748b" />
                            <Text style={styles.externalSectionHeaderText}>
                              Found nearby (map data) — not ServiceBazar providers
                            </Text>
                          </View>

                          {typedExternalResults.map((item: ExternalResult) => (
                            <View key={item.id} style={styles.externalResultCard}>
                              <View style={{ flex: 1, paddingRight: 8 }}>
                                <Text style={styles.externalResultName} numberOfLines={1}>{item.name}</Text>
                                <Text style={styles.externalResultCategory} numberOfLines={1}>{item.category}</Text>
                                {!!item.address && (
                                  <Text style={styles.externalResultAddress} numberOfLines={1}>📍 {item.address}</Text>
                                )}
                                <Text style={styles.externalResultDistance}>⚡ {item.distanceKm} km away from you</Text>
                              </View>
                              <TouchableOpacity style={styles.externalViewMapBtn} onPress={() => openExternalResultOnMap(item)}>
                                <Ionicons name="navigate-outline" size={14} color="#4f46e5" />
                                <Text style={styles.externalViewMapBtnText}>View on Map</Text>
                              </TouchableOpacity>
                            </View>
                          ))}

                          <Text style={styles.externalDisclaimerText}>
                            Ye results OpenStreetMap se aa rahe hain — booking, coins ya reviews yahan available nahi hain.
                          </Text>
                        </View>
                      )}

                      {!externalLoading && externalSearchedFor !== '' && externalResults.length === 0 && userLocation && (
                        <View style={{ paddingVertical: 10, alignItems: 'center' }}>
                          <Text style={{ color: '#94a3b8', fontSize: 11, textAlign: 'center' }}>
                            "{externalSearchedFor}" ke liye map par bhi kuch nahi mila 6 km ke andar.
                          </Text>
                        </View>
                      )}
                    </View>
                  ) : (
                    Object.keys(groupedShopsWithServices).map((shopKey) => {
                      const itemGroup = groupedShopsWithServices[shopKey];
                      const currentShop = itemGroup.shopInfo;
                      const currentServices = itemGroup.servicesList;

                      const calculatedDist = userLocation && currentShop.region ? 
                        calculateDistance(userLocation.latitude, userLocation.longitude, currentShop.region.latitude, currentShop.region.longitude) : null;

                      return (
                        <View key={shopKey} style={styles.custShopCard}>
                          <AutoProviderBanner
                            shop={currentShop}
                            serviceCount={currentServices.length}
                            profileUri={currentShop.profileUri || null}
                          />

                          <View style={styles.custCardBody}>
                            <TouchableOpacity 
                              activeOpacity={0.8}
                              onPress={() => toggleExpandShop(shopKey)} 
                              style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}
                            >
                              <View style={{ flex: 1, paddingRight: 8 }}>
                                <Text style={styles.custCardShopTitle}>{currentShop.shopName || 'Shop Name'}</Text>
                                <Text style={styles.custCardAddress}>📍 {currentShop.address || 'Location N/A'}</Text>
                                
                                {calculatedDist && (
                                  <View style={styles.distanceBadge}>
                                    <Text style={styles.distanceBadgeText}>⚡ {calculatedDist} km away from you</Text>
                                  </View>
                                )}

                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                                  <Text style={{ fontSize: 12, color: '#4f46e5', fontWeight: '700', marginRight: 4 }}>
                                    {expandedShops[shopKey] ? 'Hide Services' : `View ${currentServices.length} Services`}
                                  </Text>
                                  <Ionicons name={expandedShops[shopKey] ? "chevron-up" : "chevron-down"} size={14} color="#4f46e5" />
                                </View>
                              </View>
                              
                              <View style={styles.cardActionColumn}>
                                <Text style={styles.custCardBadge}>{currentShop.category || 'Service'}</Text>
                                {(currentShop.frontImageUri || currentShop.insideImageUri) && (
                                  <TouchableOpacity
                                    style={styles.seeImagesBtn}
                                    onPress={() => {
                                      setSelectedShopImages([currentShop.frontImageUri, currentShop.insideImageUri].filter(Boolean));
                                      setShopImagesVisible(true);
                                    }}
                                  >
                                    <Ionicons name="images-outline" size={13} color="#4f46e5" />
                                    <Text style={styles.seeImagesText}>See Images</Text>
                                  </TouchableOpacity>
                                )}
                              </View>
                            </TouchableOpacity>

                            <View style={styles.custCardDivider} />

                            {expandedShops[shopKey] && (
                              <View>
                                {(currentServices as CartItem[]).map((item: CartItem, idx: number) => {
                                  const isSelectedInCart = typedCart.some((c: CartItem) => c.id === item.id);
                                  return (
                                    <View key={item.id} style={[styles.innerServiceRow, idx > 0 && styles.innerServiceBorder]}>
                                      <View style={{ flex: 1, paddingRight: 10 }}>
                                        <Text style={styles.custCardServiceTitle}>
                                          <Ionicons name="construct-outline" size={14} color="#4f46e5" /> {item.name}
                                        </Text>
                                        <Text style={styles.custCardSpecialty}>✨ {String(item.specialty ?? '')}</Text>
                                        <Text style={styles.custCardMeta}>⏱️ {String(item.duration ?? '')} • <Text style={{ color: '#16a34a', fontWeight: '700' }}>₹{item.price}</Text></Text>
                                      </View>

                                      <TouchableOpacity 
                                        style={[styles.custBookBtn, isSelectedInCart && { backgroundColor: '#16a34a' }]} 
                                        onPress={() => toggleCartService(item)}
                                      >
                                        <Text style={styles.custBookBtnText}>{isSelectedInCart ? 'Added ✓' : '+ Add Service'}</Text>
                                      </TouchableOpacity>
                                    </View>
                                  );
                                })}
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
              <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
                <View style={styles.subTabsContainer}>
                  <TouchableOpacity 
                    style={[styles.subTabBtn, customerSubTab === 'active' && styles.activeSubTabBtn]}
                    onPress={() => setCustomerSubTab('active')}
                  >
                    <Text style={[styles.subTabText, customerSubTab === 'active' && styles.activeSubTabText]}>
                      Active Appointments ({activeAppointments.length})
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.subTabBtn, customerSubTab === 'history' && styles.activeSubTabBtn]}
                    onPress={() => setCustomerSubTab('history')}
                  >
                    <Text style={[styles.subTabText, customerSubTab === 'history' && styles.activeSubTabText]}>
                      History ({historyAppointments.length})
                    </Text>
                  </TouchableOpacity>
                </View>

                <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
                  {customerSubTab === 'active' ? (
                    activeAppointments.length === 0 ? (
                      <View style={styles.emptyBox}>
                        <Ionicons name="calendar-outline" size={40} color="#cbd5e1" />
                        <Text style={{ color: '#64748b', fontSize: 13, marginTop: 8 }}>No active appointments found.</Text>
                      </View>
                    ) : (
                      typedActiveAppointments.map((b: Booking) => (
                        <View key={b.id} style={styles.bookingCard}>
                          <View style={styles.bookingHeader}>
                            <Text style={styles.customerName}>{b.service}</Text>
                            <View style={[styles.statusBadge, b.status === 'Pending' ? styles.pendingBadge : styles.confirmedBadge]}>
                              <Text style={[styles.statusBadgeText, { color: b.status === 'Pending' ? "#d97706" : "#16a34a" }]}>
                                {b.status}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.bookingDetailRow}>
                            <Ionicons name="time-outline" size={15} color="#64748b" />
                            <Text style={styles.bookingDetail}>Slot: {b.slot}</Text>
                          </View>
                          <View style={styles.bookingDetailRow}>
                            <Ionicons name="cash-outline" size={15} color="#16a34a" />
                            <Text style={styles.bookingDetail}>Total: ₹{b.price}</Text>
                          </View>
                          <View style={styles.bookingDetailRow}>
                            <Ionicons name="call-outline" size={15} color="#64748b" />
                            <Text style={styles.bookingDetail}>Phone: {b.phone}</Text>
                          </View>

                          <TouchableOpacity 
                            style={styles.doneAndRateBtn}
                            onPress={() => {
                              setSelectedBookingForRating(b);
                              setRatingModalVisible(true);
                            }}
                          >
                            <Ionicons name="checkmark-done-circle-outline" size={18} color="#ffffff" style={{ marginRight: 6 }} />
                            <Text style={styles.doneAndRateBtnText}>Mark Complete & Rate ⭐</Text>
                          </TouchableOpacity>
                        </View>
                      ))
                    )
                  ) : (
                    historyAppointments.length === 0 ? (
                      <View style={styles.emptyBox}>
                        <Ionicons name="time-outline" size={40} color="#cbd5e1" />
                        <Text style={{ color: '#64748b', fontSize: 13, marginTop: 8 }}>No appointment history available.</Text>
                      </View>
                    ) : (
                      typedHistoryAppointments.map((b: Booking) => (
                        <View key={b.id} style={[styles.bookingCard, { opacity: 0.8 }]}>
                          <View style={styles.bookingHeader}>
                            <Text style={styles.customerName}>{b.service}</Text>
                            <View style={[styles.statusBadge, { backgroundColor: '#f1f5f9' }]}>
                              <Text style={[styles.statusBadgeText, { color: '#64748b' }]}>{b.status}</Text>
                            </View>
                          </View>
                          <View style={styles.bookingDetailRow}>
                            <Ionicons name="time-outline" size={15} color="#64748b" />
                            <Text style={styles.bookingDetail}>Slot: {b.slot}</Text>
                          </View>
                          {b.userRating && (
                            <View style={styles.bookingDetailRow}>
                              <Ionicons name="star" size={14} color="#eab308" />
                              <Text style={styles.bookingDetail}>Your Rating: {b.userRating} ⭐</Text>
                            </View>
                          )}
                        </View>
                      ))
                    )
                  )}
                </ScrollView>
              </View>
            )}

            {/* CART FLOATING BAR */}
            {cart.length > 0 && customerActiveTab === 'explore' && (
              <View style={styles.cartBarFloating}>
                <View>
                  <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 14 }}>
                    {cart.length} {cart.length === 1 ? 'Service' : 'Services'} Selected
                  </Text>
                  <Text style={{ color: '#cbd5e1', fontSize: 11 }}>
                    Total: ₹{typedCart.reduce(
                      (sum: number, item: CartItem) =>
                        sum + (parseFloat(String(item.price)) || 0),
                      0
                    )}
                  </Text>
                </View>

                <TouchableOpacity 
                  style={styles.cartCheckoutBtn} 
                  onPress={() => {
                    const initialSlots: Record<string, Slot> = {};
                    typedCart.forEach((serviceItem: CartItem) => {
                      const firstAvailableSlot = (serviceItem.autoSlots || []).find((slot: Slot) => slot.availableSeats > 0);
                      if (firstAvailableSlot) initialSlots[serviceItem.id] = firstAvailableSlot;
                    });
                    setSelectedSlotForBooking(initialSlots);
                    setBookingModalVisible(true);
                  }}
                >
                  <Text style={styles.cartCheckoutBtnText}>Checkout Cart 🚀</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* SIDE DRAWER */}
            {isDrawerOpen && (
              <TouchableOpacity 
                style={styles.drawerBackdrop} 
                activeOpacity={1} 
                onPress={() => toggleDrawer(false)} 
              />
            )}

            <Animated.View style={[styles.drawerContainer, { transform: [{ translateX: slideAnim }] }]}>
              <SafeAreaView style={{ flex: 1 }}>
                <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 20 }}>
                  
                  <View style={[styles.customerProfileCard, customerPaid ? styles.customerProfileCardPaid : styles.customerProfileCardFree]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <TouchableOpacity onPress={() => pickImage('customer_profile')} activeOpacity={0.7} style={styles.customerAvatarEditWrap}>
                        {customerProfileUri ? (
                          <Image source={{ uri: customerProfileUri }} style={styles.customerAvatarImg} />
                        ) : (
                          <View style={styles.customerAvatarPlaceholder}>
                            <Text style={styles.customerAvatarText}>
                              {authName ? authName.charAt(0).toUpperCase() : 'C'}
                            </Text>
                          </View>
                        )}
                        <View style={styles.customerCameraBadge}><Ionicons name="camera-outline" size={11} color="#ffffff" /></View>
                      </TouchableOpacity>

                      <View style={{ flex: 1 }}>
                        <Text style={[styles.customerProfileName, customerPaid ? styles.customerProfileNamePaid : styles.customerProfileNameFree]}>{authName || 'Customer Name'}</Text>
                        <Text style={[styles.customerProfilePhone, customerPaid ? styles.customerProfilePhonePaid : styles.customerProfilePhoneFree]}>📞 {authPhone || 'No Phone'}</Text>
                        <Text style={[styles.customerMembershipPill, customerPaid ? styles.customerMembershipPaid : styles.customerMembershipFree]}>{customerPaid ? 'GOLD MEMBER' : 'FREE MEMBER'}</Text>
                      </View>
                    </View>

                    <View style={styles.customerMainTabsRow}>
                      <TouchableOpacity 
                        style={[styles.customerTabItem, customerActiveTab === 'explore' && styles.activeCustomerTabItem]}
                        onPress={() => {
                          setCustomerActiveTab('explore');
                          toggleDrawer(false);
                        }}
                      >
                        <Ionicons name="storefront-outline" size={16} color={customerActiveTab === 'explore' ? "#4f46e5" : "#64748b"} />
                        <Text style={[styles.customerTabText, customerActiveTab === 'explore' && styles.activeCustomerTabText]}>Explore</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={[styles.customerTabItem, customerActiveTab === 'feed' && styles.activeCustomerTabItem]}
                        onPress={() => {
                          setCustomerActiveTab('feed');
                          toggleDrawer(false);
                        }}
                      >
                        <Ionicons name="newspaper-outline" size={16} color={customerActiveTab === 'feed' ? "#4f46e5" : "#64748b"} />
                        <Text style={[styles.customerTabText, customerActiveTab === 'feed' && styles.activeCustomerTabText]}>Feed</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={[styles.customerTabItem, customerActiveTab === 'appointments' && styles.activeCustomerTabItem]}
                        onPress={() => {
                          setCustomerActiveTab('appointments');
                          toggleDrawer(false);
                        }}
                      >
                        <Ionicons name="calendar-outline" size={16} color={customerActiveTab === 'appointments' ? "#4f46e5" : "#64748b"} />
                        <Text style={[styles.customerTabText, customerActiveTab === 'appointments' && styles.activeCustomerTabText]}>
                          Appointments ({myBookings.length})
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.drawerDivider} />

                  <Text style={styles.drawerSectionTitle}>Categories & Filters</Text>
                  {typedCategories.map((cat: string, i: number) => (
                    <TouchableOpacity 
                      key={i} 
                      style={[styles.drawerFilterItem, selectedCategoryFilter === cat && styles.activeDrawerFilterItem]}
                      onPress={() => {
                        setSelectedCategoryFilter(cat);
                        toggleDrawer(false);
                      }}
                    >
                      <Ionicons 
                        name={selectedCategoryFilter === cat ? "checkmark-circle" : "ellipse-outline"} 
                        size={18} 
                        color={selectedCategoryFilter === cat ? "#4f46e5" : "#94a3b8"} 
                      />
                      <Text style={[styles.drawerFilterText, selectedCategoryFilter === cat && styles.activeDrawerFilterText]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <TouchableOpacity style={styles.drawerLogoutBtn} onPress={handleLogout}>
                  <Ionicons name="log-out-outline" size={18} color="#dc2626" />
                  <Text style={styles.drawerLogoutText}>Logout</Text>
                </TouchableOpacity>

              </SafeAreaView>
            </Animated.View>

          </View>
  );
}
