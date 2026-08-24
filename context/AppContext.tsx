// @ts-nocheck — migrated from untyped source; strict typing deferred
import { SERVICE_CATEGORIES, getSubcategories } from '@/constants/serviceCategories';
import { ADMIN_PHONE, STORAGE_KEYS } from '@/constants/storageKeys';
import { auth, db } from '@/services/firebase';
import { fetchAddressFromCoords as fetchAddressFromCoordsService, searchAddressOnMap as searchAddressOnMapService } from '@/services/geocoding';
import { fetchExternalNearbyBusinesses } from '@/services/overpass';
import { ensureCloudImageUri as ensureCloudImageUriService, uploadImageToFirebase } from '@/services/storage';
import { SCREEN_WIDTH } from '@/styles/appStyles';
import { generateAutoSlots } from '@/utils/slots';
import { formatTime } from '@/utils/time';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  setDoc,
  updateDoc, where
} from 'firebase/firestore';
import { ReactNode, createContext, useContext, useEffect, useRef, useState } from 'react';
import { Alert, Animated, Linking } from 'react-native';

export interface Service {
  id: string;
  name: string;
  price: string | number;
  shopPhone?: string;
  [key: string]: any;
}

export interface Booking {
  id: string;
  customerName?: string;
  phone?: string;
  service?: string;
  servicesList?: Array<{
    id: string;
    name: string;
    price: string | number;
    slot?: string;
  }>;
  price?: string | number;
  slot?: string;
  date?: string;
  shopPhone?: string;
  address?: string;
  status?: string;
  createdAt?: any;
  [key: string]: any;
}

export interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}


type AppContextValue = Record<string, any>;

const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [selectedSignupRole, setSelectedSignupRole] = useState('customer');

  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-SCREEN_WIDTH * 0.8)).current;

  // Customer Profile State
  const [customerProfileUri, setCustomerProfileUri] = useState(null);
  const [customerPaid, setCustomerPaid] = useState(false);
  const [shopImagesVisible, setShopImagesVisible] = useState(false);
  const [selectedShopImages, setSelectedShopImages] = useState([]);
  const [catalogPickerVisible, setCatalogPickerVisible] = useState(false);
  const [catalogPickerType, setCatalogPickerType] = useState('category');
  const [catalogPickerSearch, setCatalogPickerSearch] = useState('');
  const [customCategoryText, setCustomCategoryText] = useState('');
  const [customSubcategoryText, setCustomSubcategoryText] = useState('');
  const [adminCollection, setAdminCollection] = useState('profile');
  const [adminDocs, setAdminDocs] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminSearch, setAdminSearch] = useState('');
  const [adminEditVisible, setAdminEditVisible] = useState(false);
  const [adminEditingDoc, setAdminEditingDoc] = useState(null);
  const [adminEditText, setAdminEditText] = useState('');
  const [customerActiveTab, setCustomerActiveTab] = useState('explore'); 
  const [customerSubTab, setCustomerSubTab] = useState('active'); 

  // Provider Booking Sub-Tabs & Filter
  const [providerBookingSubTab, setProviderBookingSubTab] = useState('upcoming');
  const [historyFilter, setHistoryFilter] = useState('All');

  const [shopDetails, setShopDetails] = useState({
    bannerUri: null,
    profileUri: null,
    shopName: '',
    category: 'Salon & Spa',
    subcategory: '',
    ownerName: '',
    mobileNumber: '',
    address: '',
    frontImageUri: null,
    insideImageUri: null,
    avgRating: 1.0,
    totalReviews: 0,
    region: { latitude: 27.8819, longitude: 79.9163, latitudeDelta: 0.01, longitudeDelta: 0.01 }
  });

  const [allShops, setAllShops] = useState([]);
  const [bannerUri, setBannerUri] = useState(null);
  const [profileUri, setProfileUri] = useState(null);
  const [shopName, setShopName] = useState('');
  const [category, setCategory] = useState('Salon & Spa');
  const [subcategory, setSubcategory] = useState('');
  const [frontImageUri, setFrontImageUri] = useState(null);
  const [insideImageUri, setInsideImageUri] = useState(null);
  const [ownerName, setOwnerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const categories = ['All', ...SERVICE_CATEGORIES];

  const [loadingMap, setLoadingMap] = useState(false);
  const [region, setRegion] = useState<Region>({
    latitude: 27.8819, longitude: 79.9163, latitudeDelta: 0.01, longitudeDelta: 0.01,
  });

  // Services & Auto Slots States
  const [services, setServices] = useState<Service[]>([]);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceSpecialty, setNewServiceSpecialty] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('30'); // in minutes

  // Merged Service Timing Controls
  const [startTime, setStartTime] = useState(() => {
    const d = new Date();
    d.setHours(9, 0, 0, 0);
    return d;
  });
  const [endTime, setEndTime] = useState(() => {
    const d = new Date();
    d.setHours(17, 0, 0, 0);
    return d;
  });
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [slotCapacity, setSlotCapacity] = useState('1');

  const [incomingBookings, setIncomingBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'services' | 'bookings'

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');

  // External (OpenStreetMap) fallback results — only used when the customer's
  // search/category has zero matches among ServiceBazar's own providers.
  const [externalResults, setExternalResults] = useState([]);
  const [externalLoading, setExternalLoading] = useState(false);
  const [externalSearchedFor, setExternalSearchedFor] = useState('');
  
  // Cart & Batch Booking States
  const [cart, setCart] = useState([]); // Multiple services cart
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedSlotForBooking, setSelectedSlotForBooking] = useState({});
  const [custBookingPhone, setCustBookingPhone] = useState('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  // Rating Modal States
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [selectedBookingForRating, setSelectedBookingForRating] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');

  const [expandedShops, setExpandedShops] = useState({});

  useEffect(() => {
    let isMounted = true;
    loadUserSession();
    fetchUserCurrentLocation();

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) console.log("Authenticated User UID:", user.uid);
    });

    const unsubscribeAllShops = onSnapshot(collection(db, "profile"), (snapshot) => {
      if (!isMounted) return;
      const shopsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllShops(shopsList);
    });

    const unsubscribeServices = onSnapshot(collection(db, "services"), (snapshot) => {
      if (!isMounted) return;
      const servicesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setServices(servicesList);
      setIsDataLoaded(true);
    }, (error) => {
      if (!isMounted) return;
      Alert.alert("Firestore Error ⚠️", error.message);
      setIsDataLoaded(true);
    });

    const cleanPhone = authPhone.trim();
    const docRef = cleanPhone ? doc(db, "profile", cleanPhone) : doc(db, "profile", "shop_info");

    const unsubscribeProfile = onSnapshot(docRef, (docSnap) => {
      if (!isMounted) return;
      if (docSnap.exists()) {
        const p = docSnap.data();
        setShopDetails(p);
        setShopName(p.shopName || '');
        setCategory(p.category || 'Salon & Spa');
        setSubcategory(p.subcategory || '');
        setFrontImageUri(p.frontImageUri || null);
        setInsideImageUri(p.insideImageUri || null);
        setOwnerName(authName || p.ownerName || '');
        setMobileNumber(cleanPhone || p.mobileNumber || '');
        setAddress(p.address || '');
        setBannerUri(p.bannerUri || null);
        setProfileUri(p.profileUri || null);
        if (p.region) setRegion(p.region);

        if (p.shopName && p.shopName.trim() !== '') {
          setIsEditingProfile(false);
        } else {
          setIsEditingProfile(true);
        }
      } else {
        setIsEditingProfile(true);
      }
    });


    let unsubscribeCustomer = () => {};
    if (cleanPhone) {
      unsubscribeCustomer = onSnapshot(doc(db, "users", cleanPhone), (snap) => {
        if (!isMounted) return;
        if (snap.exists()) {
          const u = snap.data();
          setCustomerProfileUri(u.profileUri || null);
          setCustomerPaid(Boolean(u.isPaid || u.paid || u.plan === 'paid' || u.membership === 'paid'));
        }
      });
    }

    const qBookings = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
    const unsubscribeBookings = onSnapshot(qBookings, (snapshot) => {
      if (!isMounted) return;
      const bookingsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setIncomingBookings(bookingsList);
    });

    return () => {
      isMounted = false;
      unsubscribeAuth();
      unsubscribeAllShops();
      unsubscribeServices();
      unsubscribeProfile();
      unsubscribeCustomer();
      unsubscribeBookings();
    };
  }, []);

  useEffect(() => {
    if (userRole === 'admin') loadAdminCollection('profile');
  }, [userRole]);

  const fetchUserCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        setLocationLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
      setLocationLoading(false);
    } catch (e) {
      console.log("Error fetching location:", e);
      setLocationLoading(false);
    }
  };

  const toggleDrawer = (open) => {
    if (open) {
      setIsDrawerOpen(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -SCREEN_WIDTH * 0.8,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setIsDrawerOpen(false));
    }
  };

  const loadUserSession = async () => {
    try {
      const session = await AsyncStorage.getItem(STORAGE_KEYS.USER_SESSION);
      if (session) {
        const parsed = JSON.parse(session);
        setUserRole(parsed.role);
        setAuthName(parsed.name || '');
        setOwnerName(parsed.name || '');
        setAuthPhone(parsed.phone || '');
        setMobileNumber(parsed.phone || '');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSignUp = async () => {
    const cleanPhone = authPhone.trim();
    if (!authName.trim() || !cleanPhone) {
      Alert.alert("Error ⚠️", "Naam aur Phone Number daalein!");
      return;
    }

    try {
      const isSuperAdmin = cleanPhone === ADMIN_PHONE;
      const effectiveRole = isSuperAdmin ? 'admin' : selectedSignupRole;
      const phoneDocRef = doc(db, "registered_phones", cleanPhone);
      const phoneDocSnap = await getDoc(phoneDocRef);

      if (phoneDocSnap.exists() && !isSuperAdmin) {
        const existingData = phoneDocSnap.data();
        if (existingData.role !== selectedSignupRole) {
          Alert.alert(
            "Role Conflict 🛑",
            `Yeh mobile number (${cleanPhone}) pehle se as a "${existingData.role.toUpperCase()}" registered hai!`
          );
          return;
        }
      }

      const userCredential = await signInAnonymously(auth);
      const uid = userCredential.user.uid;

      await setDoc(phoneDocRef, {
        phone: cleanPhone, name: authName, role: effectiveRole, uid: uid, createdAt: new Date()
      }, { merge: true });

      await setDoc(doc(db, "users", cleanPhone), {
        name: authName, phone: cleanPhone, role: effectiveRole, uid: uid, createdAt: new Date(), isPaid: false
      }, { merge: true });

      const sessionData = { role: effectiveRole, name: authName, phone: cleanPhone, uid };
      await AsyncStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(sessionData));
      
      setUserRole(effectiveRole);
      setOwnerName(authName);
      setMobileNumber(cleanPhone);
      Alert.alert("Success 🎉", "Login successful!");
    } catch (error) {
      Alert.alert("Auth Error ❌", error.message);
    }
  };

  const handleLogout = async () => {
    toggleDrawer(false);
    await signOut(auth);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_SESSION);
    setUserRole(null);
  };

  const ensureCloudImageUri = async (uri: string | null, type: string) =>
    ensureCloudImageUriService(uri, type, authPhone);

  const saveProfileData = async () => {
    if (!shopName.trim()) {
      Alert.alert("Error ⚠️", "Service Provider / Business ka naam zaroori hai!");
      return;
    }
    try {
      const fixedMobile = authPhone || mobileNumber;

      // Migrate any legacy local image URI before writing the profile.
      const cloudBannerUri = await ensureCloudImageUri(bannerUri, 'banner');
      const cloudProfileUri = await ensureCloudImageUri(profileUri, 'profile');
      const cloudFrontImageUri = await ensureCloudImageUri(frontImageUri, 'front');
      const cloudInsideImageUri = await ensureCloudImageUri(insideImageUri, 'inside');

      setBannerUri(cloudBannerUri);
      setProfileUri(cloudProfileUri);
      setFrontImageUri(cloudFrontImageUri);
      setInsideImageUri(cloudInsideImageUri);

      const dataToSave = {
        shopName, 
        category,
        subcategory,
        ownerName: authName || ownerName, 
        mobileNumber: fixedMobile, 
        address, 
        bannerUri: cloudBannerUri,
        profileUri: cloudProfileUri,
        frontImageUri: cloudFrontImageUri,
        insideImageUri: cloudInsideImageUri, 
        region,
        avgRating: shopDetails.avgRating || 1.0,
        totalReviews: shopDetails.totalReviews || 0
      };

      const docRef = fixedMobile ? doc(db, "profile", fixedMobile) : doc(db, "profile", "shop_info");
      await setDoc(docRef, dataToSave, { merge: true });

      setShopDetails(dataToSave);
      setIsEditingProfile(false);
      Alert.alert("Success 🎉", "Profile Firestore Cloud par save ho gayi!");
    } catch (e) {
      Alert.alert("Database Error ❌", e.message);
    }
  };

  // AUTO TIME SLOT GENERATION LOGIC
  

  const handleAddServiceWithAutoSlots = async () => {
    if (!newServiceName.trim() || !newServicePrice.trim()) {
      Alert.alert("Error ⚠️", "Service Name aur Price zaroori hai!");
      return;
    }

    const durationNum = parseInt(newServiceDuration, 10) || 30;
    if (durationNum <= 0) {
      Alert.alert("Error ⚠️", "Sahi duration enter karein!");
      return;
    }

    // Auto-calculate time slots
    const calculatedSlots = generateAutoSlots(startTime, endTime, durationNum, slotCapacity);

    if (calculatedSlots.length === 0) {
      Alert.alert("Error ⚠️", "Selected Start aur End Time me Kam se kam 1 slot ban’na chahiye!");
      return;
    }

    try {
      const shopPhoneKey = authPhone || mobileNumber || 'shop_info';

      await addDoc(collection(db, "services"), {
        name: newServiceName,
        price: newServicePrice,
        specialty: newServiceSpecialty,
        duration: `${durationNum} Mins`,
        category: category,
        shopPhone: shopPhoneKey,
        autoSlots: calculatedSlots, // Auto generated slots attached directly
        createdAt: new Date()
      });

      setNewServiceName(''); 
      setNewServicePrice(''); 
      setNewServiceSpecialty(''); 
      setNewServiceDuration('30');
      
      Alert.alert("Success 🎉", `Service publish ho gayi aur Backend par ${calculatedSlots.length} Time Slots auto-generate ho gaye!`);
    } catch (e) {
      Alert.alert("Database Error ❌", e.message);
    }
  };

  const handleDeleteService = async (id) => {
    try { 
      await deleteDoc(doc(db, "services", id)); 
    } catch (e) { 
      Alert.alert("Error ❌", e.message); 
    }
  };

  // CART / MULTIPLE SERVICE TOGGLE
  const toggleCartService = (service) => {
    setCart(prevCart => {
      const exists = prevCart.some(item => item.id === service.id);
      if (exists) {
        return prevCart.filter(item => item.id !== service.id);
      } else {
        if (prevCart.length > 0 && prevCart[0].shopPhone !== service.shopPhone) {
          Alert.alert("Shop Conflict ⚠️", "Aap ek baar me ek hi shop ki multiple services book kar sakte hain!");
          return prevCart;
        }
        return [...prevCart, service];
      }
    });
  };

  // MULTIPLE SERVICE BATCH BOOKING ENGINE TRANSACTION
  const handleConfirmCustomerBooking = async () => {
    const phoneToUse = authPhone || custBookingPhone;
    const missingService = cart.find(item => !selectedSlotForBooking[item.id]);
    if (!phoneToUse.trim() || cart.length === 0 || missingService) {
      Alert.alert("Error ⚠️", missingService ? `Service "${missingService.name}" ke liye Time Slot select karein!` : "At least 1 Service aur Phone number zaroori hai!");
      return;
    }

    setIsSubmittingBooking(true);

    try {
      await runTransaction(db, async (transaction) => {
        // Step 1: Read and validate availability for all selected services
        const serviceDocsToUpdate = [];

        for (const serviceItem of cart) {
          const serviceRef = doc(db, "services", serviceItem.id);
          const serviceDoc = await transaction.get(serviceRef);

          if (!serviceDoc.exists()) {
            throw new Error(`Service "${serviceItem.name}" ab available nahi hai.`);
          }

          const serviceData = serviceDoc.data();
          const autoSlots = serviceData.autoSlots || [];
          const selectedSlot = selectedSlotForBooking[serviceItem.id];
           const targetSlotIndex = autoSlots.findIndex(s => s.slotTime === selectedSlot.slotTime);

          if (targetSlotIndex === -1) {
            throw new Error(`Slot "${selectedSlot.slotTime}" service "${serviceItem.name}" me nahi mila.`);
          }

          if (autoSlots[targetSlotIndex].availableSeats <= 0) {
            throw new Error(`Slot "${selectedSlot.slotTime}" me "${serviceItem.name}" ki saari seats full ho chuki hain!`);
          }

          // Decrement available seat count
          const updatedSlots = [...autoSlots];
          updatedSlots[targetSlotIndex] = {
            ...updatedSlots[targetSlotIndex],
            availableSeats: updatedSlots[targetSlotIndex].availableSeats - 1
          };

          serviceDocsToUpdate.push({
            ref: serviceRef,
            updatedSlots: updatedSlots,
            serviceName: serviceData.name,
            price: serviceData.price || '0',
            shopPhone: serviceData.shopPhone
          });
        }

        // Step 2: Write - Update Service Slots and Add Bookings
        const bookingDate = new Date().toDateString();
        const combinedServiceName = cart.map(item => item.name).join(' + ');
        const totalPrice = cart.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);

        for (const updateInfo of serviceDocsToUpdate) {
          transaction.update(updateInfo.ref, { autoSlots: updateInfo.updatedSlots });
        }

        // Create individual batch booking records in Firestore
        const newBookingRef = doc(collection(db, "bookings"));
        transaction.set(newBookingRef, {
          customerName: authName || 'Customer',
          phone: phoneToUse,
          service: combinedServiceName,
          servicesList: cart.map(item => ({ id: item.id, name: item.name, price: item.price, slot: selectedSlotForBooking[item.id]?.slotTime || '' })),
          price: String(totalPrice),
          slot: cart.map(item => `${item.name}: ${selectedSlotForBooking[item.id]?.slotTime || ''}`).join(' | '),
          date: bookingDate,
          shopPhone: cart[0].shopPhone || shopDetails.mobileNumber || authPhone || 'shop_info',
          address: shopDetails.address || 'Shop Location',
          status: 'Pending',
          createdAt: new Date()
        });
      });

      setCart([]);
      setBookingModalVisible(false);
      Alert.alert("Batch Booking Successful 🎉", "Aapki saari selected services ek sath book ho gayi hain!");
    } catch (e) {
      Alert.alert("Booking Failed ❌", e.message || "Transaction error occurred.");
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      await updateDoc(doc(db, "bookings", bookingId), { status: newStatus });
      Alert.alert("Status Updated 🔔", `Appointment status "${newStatus}" kar diya gaya hai.`);
    } catch (e) {
      Alert.alert("Error ❌", e.message);
    }
  };

  const handleSubmitRating = async () => {
    if (!selectedBookingForRating) return;
    try {
      const targetShopPhone = selectedBookingForRating.shopPhone || shopDetails.mobileNumber || 'shop_info';

      const reviewDocId = `${selectedBookingForRating.id}_${authPhone || custBookingPhone}`;
      await setDoc(doc(db, "reviews", reviewDocId), {
        bookingId: selectedBookingForRating.id,
        customerPhone: authPhone || custBookingPhone,
        customerName: authName || 'Customer',
        shopPhone: targetShopPhone,
        rating: Number(ratingValue),
        feedback: feedbackText,
        createdAt: new Date()
      }, { merge: true });

      await updateDoc(doc(db, "bookings", selectedBookingForRating.id), {
        status: 'Completed',
        userRating: Number(ratingValue)
      });

      const qReviews = query(collection(db, "reviews"), where("shopPhone", "==", targetShopPhone));
      const querySnap = await getDocs(qReviews);

      let totalStars = 0;
      let reviewCount = querySnap.size;

      querySnap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.rating) {
          totalStars += Number(data.rating);
        }
      });

      const newAverage = reviewCount > 0 ? (totalStars / reviewCount).toFixed(1) : "1.0";

      const profileRef = doc(db, "profile", targetShopPhone);
      await setDoc(profileRef, {
        avgRating: parseFloat(newAverage),
        totalReviews: reviewCount
      }, { merge: true });

      setRatingModalVisible(false);
      setFeedbackText('');
      Alert.alert("Thank You! ⭐", "Review submit ho gaya hai.");
    } catch (e) {
      console.error("Rating Error:", e);
      Alert.alert("Rating Error ❌", e.message);
    }
  };

  // Uploads an Expo local image URI to Firebase Storage and returns the public
  // download URL. Firestore should only receive this HTTPS URL — never the
  // device-local file:// URI — so images continue working after an APK install.
  const uploadImageToFirebaseLocal = async (localUri: string, type: string) =>
    uploadImageToFirebase(localUri, type, authPhone);

  const pickImage = async (type) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'front' || type === 'inside' ? [4, 3] : type === 'banner' ? [16, 9] : [1, 1],
        quality: 0.82,
      });

      if (result.canceled || !result.assets?.[0]?.uri) return;

        const localUri = result.assets[0].uri;

        const fileName = `upload_${Date.now()}.jpg`;
        const persistentUri = `${FileSystem.cacheDirectory}${fileName}`;

        await FileSystem.copyAsync({
          from: localUri,
          to: persistentUri,
        });

        console.log('Image copied to persistent URI:', persistentUri);

        const cloudUri = await uploadImageToFirebaseLocal(
          persistentUri,
          type
        );

      if (type === 'banner') {
        setBannerUri(cloudUri);
      } else if (type === 'customer_profile') {
        setCustomerProfileUri(cloudUri);
        if (authPhone) {
          await setDoc(doc(db, 'users', authPhone), { profileUri: cloudUri }, { merge: true });
        }
        Alert.alert('Profile Updated ✨', 'Customer profile photo Firebase Cloud par save ho gayi.');
      } else if (type === 'front') {
        setFrontImageUri(cloudUri);
      } else if (type === 'inside') {
        setInsideImageUri(cloudUri);
      } else {
        setProfileUri(cloudUri);
      }
    } catch (e) {
      console.error('Image upload error:', e);
      Alert.alert('Image Upload Error ❌', e?.message || 'Image Firebase Storage par upload nahi ho saki.');
    }
  };

  const fetchAddressFromCoords = (lat: number, lon: number) =>
    fetchAddressFromCoordsService(lat, lon, setAddress);

  const searchAddressOnMap = () =>
    searchAddressOnMapService(address, setAddress, setRegion, setLoadingMap);


  const loadAdminCollection = async (collectionName = adminCollection) => {
    if (userRole !== 'admin') return;
    setAdminLoading(true);
    try {
      const snap = await getDocs(collection(db, collectionName));
      setAdminDocs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      Alert.alert('Admin Read Error ❌', e.message);
    } finally {
      setAdminLoading(false);
    }
  };

  const openAdminEditor = (item = null) => {
    setAdminEditingDoc(item);
    const clone = item ? { ...item } : { createdAt: new Date().toISOString() };
    delete clone.id;
    setAdminEditText(JSON.stringify(clone, null, 2));
    setAdminEditVisible(true);
  };

  const saveAdminDocument = async () => {
    try {
      const parsed = JSON.parse(adminEditText);
      const clean = { ...parsed };
      delete clean.id;
      if (adminEditingDoc?.id) {
        await setDoc(doc(db, adminCollection, adminEditingDoc.id), clean, { merge: true });
      } else {
        await addDoc(collection(db, adminCollection), clean);
      }
      setAdminEditVisible(false);
      await loadAdminCollection(adminCollection);
      Alert.alert('Admin CRUD', 'Document save ho gaya.');
    } catch (e) {
      Alert.alert('Invalid Data ❌', e.message || 'Valid JSON enter karein.');
    }
  };

  const deleteAdminDocument = async (id) => {
    Alert.alert('Delete Document?', `Collection: ${adminCollection}\nID: ${id}`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await deleteDoc(doc(db, adminCollection, id));
          await loadAdminCollection(adminCollection);
        } catch (e) {
          Alert.alert('Delete Error ❌', e.message);
        }
      }}
    ]);
  };

  const selectProviderCategory = (value) => {
    setCategory(value);
    if (value !== 'Other') {
      const subs = getSubcategories(value);
      setSubcategory(subs.includes(subcategory) ? subcategory : '');
    } else {
      setSubcategory('Other');
    }
    setCatalogPickerVisible(false);
    setCatalogPickerSearch('');
  };

  const selectProviderSubcategory = (value) => {
    setSubcategory(value);
    setCatalogPickerVisible(false);
    setCatalogPickerSearch('');
  };

  

  const toggleExpandShop = (shopKey) => {
    setExpandedShops(prev => ({ ...prev, [shopKey]: !prev[shopKey] }));
  };

  const groupedShopsWithServices = services.reduce((acc, service) => {
    const shopKey = service.shopPhone || 'shop_info';
    const matchesSearch = service.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          service.specialty?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'All' || service.category === selectedCategoryFilter;

    if (matchesSearch && matchesCategory) {
      if (!acc[shopKey]) {
        const shopInfo = allShops.find(s => s.id === shopKey || s.mobileNumber === shopKey) || shopDetails;
        acc[shopKey] = { shopInfo, servicesList: [] };
      }
      acc[shopKey].servicesList.push(service);
    }
    return acc;
  }, {});

  const localMatchCount = Object.keys(groupedShopsWithServices).length;

  // When the customer has typed a search / picked a category and ServiceBazar
  // has ZERO matching providers for it, fall back to OpenStreetMap (Overpass)
  // to show the Top 10 nearest real-world businesses for that category.
  // Debounced so we don't hit the Overpass API on every keystroke.
  useEffect(() => {
    if (userRole !== 'customer') return;

    const typedQuery = searchQuery.trim();
    const hasSearchIntent = typedQuery.length > 0 || selectedCategoryFilter !== 'All';

    if (!hasSearchIntent || localMatchCount > 0 || !userLocation) {
      setExternalResults([]);
      setExternalSearchedFor('');
      return;
    }

    const categoryForSearch = selectedCategoryFilter !== 'All' ? selectedCategoryFilter : null;
    const debounceHandle = setTimeout(async () => {
      setExternalLoading(true);
      const results = await fetchExternalNearbyBusinesses(
        categoryForSearch,
        typedQuery,
        userLocation.latitude,
        userLocation.longitude
      );
      setExternalResults(results);
      setExternalSearchedFor(categoryForSearch || typedQuery);
      setExternalLoading(false);
    }, 700);

    return () => clearTimeout(debounceHandle);
  }, [searchQuery, selectedCategoryFilter, localMatchCount, userLocation, userRole]);

  const openExternalResultOnMap = (item) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lon}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Map open nahi ho saka.');
    });
  };

  const myBookings = incomingBookings.filter(b => b.phone === (authPhone || custBookingPhone));
  const activeAppointments = myBookings.filter(b => b.status === 'Pending' || b.status === 'Confirmed');
  const historyAppointments = myBookings.filter(b => b.status === 'Completed' || b.status === 'Canceled' || b.status === 'No-Show');

  const myProviderPhone = authPhone || mobileNumber || 'shop_info';
  const providerUpcoming = incomingBookings
    .filter(b => (b.shopPhone === myProviderPhone) && (b.status === 'Confirmed' || b.status === 'Pending'));

  const providerHistory = incomingBookings.filter(b => {
    if (b.shopPhone !== myProviderPhone) return false;
    const isHistoryStatus = b.status === 'Completed' || b.status === 'Canceled' || b.status === 'No-Show';
    if (!isHistoryStatus) return false;
    if (historyFilter === 'All') return true;
    return b.status === historyFilter;
  });

  const providerServices = services.filter(s => s.shopPhone === myProviderPhone);
  const value: AppContextValue = {
    isDataLoaded, userRole, setUserRole, authName, setAuthName, authPhone, setAuthPhone,
    selectedSignupRole, setSelectedSignupRole, userLocation, locationLoading,
    isDrawerOpen, slideAnim, customerProfileUri, setCustomerProfileUri, customerPaid,
    shopImagesVisible, setShopImagesVisible, selectedShopImages, setSelectedShopImages,
    catalogPickerVisible, setCatalogPickerVisible, catalogPickerType, setCatalogPickerType,
    catalogPickerSearch, setCatalogPickerSearch, customCategoryText, setCustomCategoryText,
    customSubcategoryText, setCustomSubcategoryText, adminCollection, setAdminCollection,
    adminDocs, adminLoading, adminSearch, setAdminSearch, adminEditVisible, setAdminEditVisible,
    adminEditingDoc, setAdminEditingDoc, adminEditText, setAdminEditText, customerActiveTab,
    setCustomerActiveTab, customerSubTab, setCustomerSubTab, providerBookingSubTab,
    setProviderBookingSubTab, historyFilter, setHistoryFilter, shopDetails, setShopDetails,
    allShops, bannerUri, setBannerUri, profileUri, setProfileUri, shopName, setShopName,
    category, setCategory, subcategory, setSubcategory, frontImageUri, setFrontImageUri,
    insideImageUri, setInsideImageUri, ownerName, setOwnerName, mobileNumber, setMobileNumber,
    address, setAddress, isEditingProfile, setIsEditingProfile, categories, loadingMap,
    region, setRegion, services, newServiceName, setNewServiceName, newServicePrice,
    setNewServicePrice, newServiceSpecialty, setNewServiceSpecialty, newServiceDuration,
    setNewServiceDuration, startTime, setStartTime, endTime, setEndTime, showStartTimePicker,
    setShowStartTimePicker, showEndTimePicker, setShowEndTimePicker, slotCapacity, setSlotCapacity,
    incomingBookings, activeTab, setActiveTab, searchQuery, setSearchQuery,
    selectedCategoryFilter, setSelectedCategoryFilter, externalResults, externalLoading,
    externalSearchedFor, cart, setCart, bookingModalVisible, setBookingModalVisible,
    selectedSlotForBooking, setSelectedSlotForBooking, custBookingPhone, setCustBookingPhone,
    isSubmittingBooking, ratingModalVisible, setRatingModalVisible, selectedBookingForRating,
    setSelectedBookingForRating, ratingValue, setRatingValue, feedbackText, setFeedbackText,
    expandedShops, toggleDrawer, handleSignUp, handleLogout, saveProfileData,
    handleAddServiceWithAutoSlots, handleDeleteService, toggleCartService,
    handleConfirmCustomerBooking, handleUpdateBookingStatus, handleSubmitRating, pickImage,
    loadAdminCollection, openAdminEditor, saveAdminDocument, deleteAdminDocument,
    selectProviderCategory, selectProviderSubcategory, formatTime, toggleExpandShop,
    groupedShopsWithServices, localMatchCount, openExternalResultOnMap, fetchUserCurrentLocation,
    myBookings, activeAppointments, historyAppointments, myProviderPhone, providerUpcoming,
    providerHistory, providerServices, fetchAddressFromCoords, searchAddressOnMap,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
