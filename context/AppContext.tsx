// @ts-nocheck — migrated from untyped source; strict typing deferred

import { SERVICE_CATEGORIES, getSubcategories } from '@/constants/serviceCategories';
import { ADMIN_PHONE, STORAGE_KEYS } from '@/constants/storageKeys';
import { auth, db } from '@/services/firebase';
import {
  fetchAddressFromCoords as fetchAddressFromCoordsService,
  searchAddressOnMap as searchAddressOnMapService,
} from '@/services/geocoding';
import { fetchExternalNearbyBusinesses } from '@/services/overpass';
import {
  ensureCloudImageUri as ensureCloudImageUriService,
  uploadImageToFirebase,
} from '@/services/storage';
import { SCREEN_WIDTH } from '@/styles/appStyles';
import { generateAutoSlots } from '@/utils/slots';
import { formatTime } from '@/utils/time';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInAnonymously,
  signInWithCredential,
  signOut,
} from 'firebase/auth';

import { GoogleSignin } from '@react-native-google-signin/google-signin';

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
  updateDoc,
  where,
} from 'firebase/firestore';

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { Alert, Animated, Linking } from 'react-native';


// ============================================================
// GOOGLE SIGN-IN CONFIGURATION
// ============================================================

GoogleSignin.configure({
  webClientId:
    '139153043703-9dcv7a2l35hl6la7nlu7du7j8vri7gu3.apps.googleusercontent.com',
});


// ============================================================
// TYPES
// ============================================================

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


// ============================================================
// CONTEXT
// ============================================================

type AppContextValue = Record<string, any>;

const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);

  if (!ctx) {
    throw new Error('useApp must be used within AppProvider');
  }

  return ctx;
}


// ============================================================
// APP PROVIDER
// ============================================================

export function AppProvider({
  children,
}: {
  children: ReactNode;
}) {
  // ==========================================================
  // AUTH / SESSION STATES
  // ==========================================================

  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [selectedSignupRole, setSelectedSignupRole] =
    useState('customer');

  // ==========================================================
  // GOOGLE NEW USER ONBOARDING
  // ==========================================================

  const [showGoogleOnboarding, setShowGoogleOnboarding] =
    useState(false);

  const [pendingGoogleUser, setPendingGoogleUser] =
    useState(null);

  // ==========================================================
  // LOCATION
  // ==========================================================

  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // ==========================================================
  // DRAWER
  // ==========================================================

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const slideAnim = useRef(
    new Animated.Value(-SCREEN_WIDTH * 0.8)
  ).current;

  // ==========================================================
  // CUSTOMER PROFILE
  // ==========================================================

  const [customerProfileUri, setCustomerProfileUri] =
    useState(null);

  const [customerPaid, setCustomerPaid] = useState(false);

  const [shopImagesVisible, setShopImagesVisible] =
    useState(false);

  const [selectedShopImages, setSelectedShopImages] =
    useState([]);

  const [catalogPickerVisible, setCatalogPickerVisible] =
    useState(false);

  const [catalogPickerType, setCatalogPickerType] =
    useState('category');

  const [catalogPickerSearch, setCatalogPickerSearch] =
    useState('');

  const [customCategoryText, setCustomCategoryText] =
    useState('');

  const [customSubcategoryText, setCustomSubcategoryText] =
    useState('');

  // ==========================================================
  // ADMIN
  // ==========================================================

  const [adminCollection, setAdminCollection] =
    useState('profile');

  const [adminDocs, setAdminDocs] = useState([]);

  const [adminLoading, setAdminLoading] = useState(false);

  const [adminSearch, setAdminSearch] = useState('');

  const [adminEditVisible, setAdminEditVisible] =
    useState(false);

  const [adminEditingDoc, setAdminEditingDoc] =
    useState(null);

  const [adminEditText, setAdminEditText] =
    useState('');

  // ==========================================================
  // CUSTOMER TABS
  // ==========================================================

  const [customerActiveTab, setCustomerActiveTab] =
    useState('explore');

  const [customerSubTab, setCustomerSubTab] =
    useState('active');

  // ==========================================================
  // PROVIDER BOOKING TABS
  // ==========================================================

  const [providerBookingSubTab, setProviderBookingSubTab] =
    useState('upcoming');

  const [historyFilter, setHistoryFilter] =
    useState('All');

  // ==========================================================
  // SHOP DETAILS
  // ==========================================================

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

    region: {
      latitude: 27.8819,
      longitude: 79.9163,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    },
  });

  const [allShops, setAllShops] = useState([]);

  const [bannerUri, setBannerUri] = useState(null);
  const [profileUri, setProfileUri] = useState(null);

  const [shopName, setShopName] = useState('');

  const [category, setCategory] =
    useState('Salon & Spa');

  const [subcategory, setSubcategory] =
    useState('');

  const [frontImageUri, setFrontImageUri] =
    useState(null);

  const [insideImageUri, setInsideImageUri] =
    useState(null);

  const [ownerName, setOwnerName] =
    useState('');

  const [mobileNumber, setMobileNumber] =
    useState('');

  const [address, setAddress] =
    useState('');

  const [isEditingProfile, setIsEditingProfile] =
    useState(false);

  const categories = [
    'All',
    ...SERVICE_CATEGORIES,
  ];

  // ==========================================================
  // MAP
  // ==========================================================

  const [loadingMap, setLoadingMap] =
    useState(false);

  const [region, setRegion] =
    useState<Region>({
      latitude: 27.8819,
      longitude: 79.9163,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });

  // ==========================================================
  // SERVICES / AUTO SLOTS
  // ==========================================================

  const [services, setServices] =
    useState<Service[]>([]);

  const [newServiceName, setNewServiceName] =
    useState('');

  const [newServicePrice, setNewServicePrice] =
    useState('');

  const [newServiceSpecialty, setNewServiceSpecialty] =
    useState('');

  const [newServiceDuration, setNewServiceDuration] =
    useState('30');

  // ==========================================================
  // TIME CONTROLS
  // ==========================================================

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

  const [showStartTimePicker, setShowStartTimePicker] =
    useState(false);

  const [showEndTimePicker, setShowEndTimePicker] =
    useState(false);

  const [slotCapacity, setSlotCapacity] =
    useState('1');

  const [incomingBookings, setIncomingBookings] =
    useState<Booking[]>([]);

  const [activeTab, setActiveTab] =
    useState('profile');

  const [searchQuery, setSearchQuery] =
    useState('');

  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    useState('All');

  // ==========================================================
  // EXTERNAL OPENSTREETMAP RESULTS
  // ==========================================================

  const [externalResults, setExternalResults] =
    useState([]);

  const [externalLoading, setExternalLoading] =
    useState(false);

  const [externalSearchedFor, setExternalSearchedFor] =
    useState('');

  // ==========================================================
  // CART / BOOKING
  // ==========================================================

  const [cart, setCart] = useState([]);

  const [bookingModalVisible, setBookingModalVisible] =
    useState(false);

  const [selectedSlotForBooking, setSelectedSlotForBooking] =
    useState({});

  const [custBookingPhone, setCustBookingPhone] =
    useState('');

  const [isSubmittingBooking, setIsSubmittingBooking] =
    useState(false);

  // ==========================================================
  // RATING
  // ==========================================================

  const [ratingModalVisible, setRatingModalVisible] =
    useState(false);

  const [selectedBookingForRating, setSelectedBookingForRating] =
    useState(null);

  const [ratingValue, setRatingValue] =
    useState(5);

  const [feedbackText, setFeedbackText] =
    useState('');

  // ==========================================================
  // SHOP EXPANSION
  // ==========================================================

  const [expandedShops, setExpandedShops] =
    useState({});


  // ==========================================================
  // INITIAL DATA / FIREBASE LISTENERS
  // ==========================================================

  useEffect(() => {
    let isMounted = true;

    loadUserSession();
    fetchUserCurrentLocation();

    // --------------------------------------------------------
    // Firebase Auth Listener
    // --------------------------------------------------------

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      (user) => {
        if (user) {
          console.log(
            'Authenticated User UID:',
            user.uid
          );
        }
      }
    );

    // --------------------------------------------------------
    // All Shops Listener
    // --------------------------------------------------------

    const unsubscribeAllShops = onSnapshot(
      collection(db, 'profile'),
      (snapshot) => {
        if (!isMounted) return;

        const shopsList = snapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        );

        setAllShops(shopsList);
      }
    );

    // --------------------------------------------------------
    // Services Listener
    // --------------------------------------------------------

    const unsubscribeServices = onSnapshot(
      collection(db, 'services'),
      (snapshot) => {
        if (!isMounted) return;

        const servicesList = snapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        );

        setServices(servicesList);

        setIsDataLoaded(true);
      },
      (error) => {
        if (!isMounted) return;

        Alert.alert(
          'Firestore Error ⚠️',
          error.message
        );

        setIsDataLoaded(true);
      }
    );

    // --------------------------------------------------------
    // Profile Listener
    // --------------------------------------------------------

    const cleanPhone = authPhone.trim();

    const docRef = cleanPhone
      ? doc(db, 'profile', cleanPhone)
      : doc(db, 'profile', 'shop_info');

    const unsubscribeProfile = onSnapshot(
      docRef,
      (docSnap) => {
        if (!isMounted) return;

        if (docSnap.exists()) {
          const p = docSnap.data();

          setShopDetails(p);

          setShopName(
            p.shopName || ''
          );

          setCategory(
            p.category || 'Salon & Spa'
          );

          setSubcategory(
            p.subcategory || ''
          );

          setFrontImageUri(
            p.frontImageUri || null
          );

          setInsideImageUri(
            p.insideImageUri || null
          );

          setOwnerName(
            authName || p.ownerName || ''
          );

          setMobileNumber(
            cleanPhone || p.mobileNumber || ''
          );

          setAddress(
            p.address || ''
          );

          setBannerUri(
            p.bannerUri || null
          );

          setProfileUri(
            p.profileUri || null
          );

          if (p.region) {
            setRegion(p.region);
          }

          if (
            p.shopName &&
            p.shopName.trim() !== ''
          ) {
            setIsEditingProfile(false);
          } else {
            setIsEditingProfile(true);
          }
        } else {
          setIsEditingProfile(true);
        }
      }
    );

    // --------------------------------------------------------
    // Customer Listener
    // --------------------------------------------------------

    let unsubscribeCustomer = () => {};

    if (cleanPhone) {
      unsubscribeCustomer = onSnapshot(
        doc(db, 'users', cleanPhone),
        (snap) => {
          if (!isMounted) return;

          if (snap.exists()) {
            const u = snap.data();

            setCustomerProfileUri(
              u.profileUri || null
            );

            setCustomerPaid(
              Boolean(
                u.isPaid ||
                u.paid ||
                u.plan === 'paid' ||
                u.membership === 'paid'
              )
            );
          }
        }
      );
    }

    // --------------------------------------------------------
    // Bookings Listener
    // --------------------------------------------------------

    const qBookings = query(
      collection(db, 'bookings'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeBookings = onSnapshot(
      qBookings,
      (snapshot) => {
        if (!isMounted) return;

        const bookingsList =
          snapshot.docs.map(
            (doc) => ({
              id: doc.id,
              ...doc.data(),
            })
          );

        setIncomingBookings(bookingsList);
      }
    );

    // --------------------------------------------------------
    // Cleanup
    // --------------------------------------------------------

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


  // ==========================================================
  // ADMIN DATA
  // ==========================================================

  useEffect(() => {
    if (userRole === 'admin') {
      loadAdminCollection('profile');
    }
  }, [userRole]);


  // ==========================================================
  // LOCATION
  // ==========================================================

  const fetchUserCurrentLocation =
    async () => {
      try {
        setLocationLoading(true);

        const { status } =
          await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          Alert.alert(
            'Permission Denied',
            'Location permission is required.'
          );

          setLocationLoading(false);

          return;
        }

        const location =
          await Location.getCurrentPositionAsync({});

        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        setLocationLoading(false);
      } catch (e) {
        console.log(
          'Error fetching location:',
          e
        );

        setLocationLoading(false);
      }
    };


  // ==========================================================
  // DRAWER
  // ==========================================================

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
      }).start(() =>
        setIsDrawerOpen(false)
      );
    }
  };


  // ==========================================================
  // LOAD LOCAL SESSION
  // ==========================================================

  const loadUserSession =
    async () => {
      try {
        const session =
          await AsyncStorage.getItem(
            STORAGE_KEYS.USER_SESSION
          );

        if (session) {
          const parsed =
            JSON.parse(session);

          setUserRole(parsed.role);

          setAuthName(
            parsed.name || ''
          );

          setOwnerName(
            parsed.name || ''
          );

          setAuthPhone(
            parsed.phone || ''
          );

          setMobileNumber(
            parsed.phone || ''
          );

          if (parsed.profileUri) {
            setCustomerProfileUri(
              parsed.profileUri
            );
          }
        }
      } catch (e) {
        console.error(e);
      }
    };


  // ==========================================================
  // NORMAL PHONE SIGN UP
  // ==========================================================

  const handleSignUp =
    async () => {
      const cleanPhone =
        authPhone.trim();

      if (
        !authName.trim() ||
        !cleanPhone
      ) {
        Alert.alert(
          'Error ⚠️',
          'Naam aur Phone Number daalein!'
        );

        return;
      }

      try {
        const isSuperAdmin =
          cleanPhone === ADMIN_PHONE;

        const effectiveRole =
          isSuperAdmin
            ? 'admin'
            : selectedSignupRole;

        const phoneDocRef =
          doc(
            db,
            'registered_phones',
            cleanPhone
          );

        const phoneDocSnap =
          await getDoc(phoneDocRef);

        if (
          phoneDocSnap.exists() &&
          !isSuperAdmin
        ) {
          const existingData =
            phoneDocSnap.data();

          if (
            existingData.role !==
            selectedSignupRole
          ) {
            Alert.alert(
              'Role Conflict 🛑',
              `Yeh mobile number (${cleanPhone}) pehle se as a "${existingData.role.toUpperCase()}" registered hai!`
            );

            return;
          }
        }

        // Firebase Anonymous Auth
        const userCredential =
          await signInAnonymously(auth);

        const uid =
          userCredential.user.uid;

        // registered_phones
        await setDoc(
          phoneDocRef,
          {
            phone: cleanPhone,
            name: authName,
            role: effectiveRole,
            uid: uid,
            createdAt: new Date(),
          },
          { merge: true }
        );

        // users
        await setDoc(
          doc(
            db,
            'users',
            cleanPhone
          ),
          {
            name: authName,
            phone: cleanPhone,
            role: effectiveRole,
            uid: uid,
            createdAt: new Date(),
            isPaid: false,
          },
          { merge: true }
        );

        const sessionData = {
          role: effectiveRole,
          name: authName,
          phone: cleanPhone,
          uid,
        };

        await AsyncStorage.setItem(
          STORAGE_KEYS.USER_SESSION,
          JSON.stringify(sessionData)
        );

        setUserRole(effectiveRole);
        setOwnerName(authName);
        setMobileNumber(cleanPhone);

        Alert.alert(
          'Success 🎉',
          'Login successful!'
        );
      } catch (error) {
        console.error(
          'Phone Auth Error:',
          error
        );

        Alert.alert(
          'Auth Error ❌',
          error?.message ||
            'Login failed.'
        );
      }
    };


  // ==========================================================
  // GOOGLE SIGN-IN
  // ==========================================================

  const handleGoogleSignIn =
    async () => {
      try {
        console.log('Starting Google Sign-In...');

        await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog: true,
        });

        const response =
          await GoogleSignin.signIn();

        console.log(
          'Google Sign-In response received.'
        );

        const idToken =
          response?.data?.idToken;

        if (!idToken) {
          throw new Error(
            'Google ID Token nahi mila.'
          );
        }

        const credential =
          GoogleAuthProvider.credential(
            idToken
          );

        const userCredential =
          await signInWithCredential(
            auth,
            credential
          );

        const firebaseUser =
          userCredential.user;

        const uid =
          firebaseUser.uid;

        const googleName =
          firebaseUser.displayName?.trim() ||
          firebaseUser.email?.split('@')[0] ||
          '';

        const googleEmail =
          firebaseUser.email || '';

        const googlePhoto =
          firebaseUser.photoURL || null;

        const googlePhone =
          firebaseUser.phoneNumber?.trim() || '';

        // ----------------------------------------------------
        // NEW MASTER PROFILE: users/{uid}
        // ----------------------------------------------------

        const uidRef =
          doc(db, 'users', uid);

        const uidSnap =
          await getDoc(uidRef);

        if (uidSnap.exists()) {
          const existing =
            uidSnap.data();

          const role =
            existing.role || 'customer';

          const sessionData = {
            ...existing,
            uid,
            email: existing.email || googleEmail,
            role,
            authProvider:
              existing.authProvider || 'google',
          };

          await AsyncStorage.setItem(
            STORAGE_KEYS.USER_SESSION,
            JSON.stringify(sessionData)
          );

          setUserRole(role);
          setAuthName(
            existing.name || googleName
          );
          setAuthPhone(
            existing.phone || googlePhone
          );
          setOwnerName(
            existing.name || googleName
          );
          setMobileNumber(
            existing.phone || googlePhone
          );

          if (existing.profileUri) {
            setCustomerProfileUri(
              existing.profileUri
            );
          }

          return;
        }

        // ----------------------------------------------------
        // BACKWARD COMPATIBILITY
        // Existing Google users were previously stored as
        // users/{email}. Reuse that data and migrate it to
        // users/{uid}.
        // ----------------------------------------------------

        if (googleEmail) {
          const legacyRef =
            doc(db, 'users', googleEmail);

          const legacySnap =
            await getDoc(legacyRef);

          if (legacySnap.exists()) {
            const legacy =
              legacySnap.data();

            const migrated = {
              ...legacy,
              uid,
              email:
                legacy.email || googleEmail,
              name:
                legacy.name || googleName,
              phone:
                legacy.phone || googlePhone,
              profileUri:
                legacy.profileUri || googlePhoto,
              role:
                legacy.role || 'customer',
              authProvider: 'google',
              updatedAt: new Date(),
            };

            await setDoc(
              uidRef,
              migrated,
              { merge: true }
            );

            const sessionData = {
              ...migrated,
              uid,
            };

            await AsyncStorage.setItem(
              STORAGE_KEYS.USER_SESSION,
              JSON.stringify(sessionData)
            );

            setUserRole(
              migrated.role
            );

            setAuthName(
              migrated.name || ''
            );

            setAuthPhone(
              migrated.phone || ''
            );

            setOwnerName(
              migrated.name || ''
            );

            setMobileNumber(
              migrated.phone || ''
            );

            if (migrated.profileUri) {
              setCustomerProfileUri(
                migrated.profileUri
              );
            }

            return;
          }
        }

        // ----------------------------------------------------
        // BRAND NEW GOOGLE USER
        // Do NOT automatically make them a customer.
        // Show onboarding form instead.
        // ----------------------------------------------------

        setPendingGoogleUser({
          uid,
          email: googleEmail,
          name: googleName,
          phone: googlePhone,
          profileUri: googlePhoto,
        });

        setAuthName(googleName);
        setAuthPhone(googlePhone);

        setShowGoogleOnboarding(true);

      } catch (error) {
        console.error(
          'Google Sign-In Error:',
          error
        );

        if (
          error?.code === '12501' ||
          error?.code === 'SIGN_IN_CANCELLED'
        ) {
          console.log(
            'Google Sign-In cancelled by user.'
          );

          return;
        }

        Alert.alert(
          'Google Sign-In Error ❌',
          error?.message ||
            'Google login failed.'
        );
      }
    };


  // ==========================================================
  // COMPLETE GOOGLE NEW USER PROFILE
  // ==========================================================

  const completeGoogleProfile =
    async (profileData) => {
      try {
        if (!pendingGoogleUser?.uid) {
          throw new Error(
            'Google user session missing.'
          );
        }

        const uid =
          pendingGoogleUser.uid;

        const role =
          profileData.type === 'provider'
            ? 'provider'
            : 'customer';

        const profile = {
          uid,
          email:
            pendingGoogleUser.email || '',
          name:
            profileData.name?.trim() ||
            pendingGoogleUser.name ||
            '',
          phone:
            profileData.phone?.trim() || '',
          address:
            profileData.address?.trim() || '',
          location:
            profileData.location || null,
          role,
          profileUri:
            profileData.photo || 
            pendingGoogleUser.profileUri ||
            null,
          businessName:
            role === 'provider'
              ? profileData.businessName?.trim() || ''
              : '',
          tagline:
            role === 'provider'
              ? profileData.tagline?.trim() || ''
              : '',
          banner:
            role === 'provider'
              ? profileData.banner || null
              : null,
          authProvider: 'google',
          isPaid: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await setDoc(
          doc(db, 'users', uid),
          profile,
          { merge: true }
        );

        // Keep legacy email-based Google record for
        // backward compatibility with existing app data.
        if (pendingGoogleUser.email) {
          await setDoc(
            doc(
              db,
              'users',
              pendingGoogleUser.email
            ),
            profile,
            { merge: true }
          );
        }

        if (profile.phone) {
          await setDoc(
            doc(
              db,
              'registered_phones',
              profile.phone
            ),
            {
              phone: profile.phone,
              name: profile.name,
              role,
              uid,
              email: profile.email,
              authProvider: 'google',
              updatedAt: new Date(),
            },
            { merge: true }
          );
        }

        const sessionData = {
          ...profile,
        };

        await AsyncStorage.setItem(
          STORAGE_KEYS.USER_SESSION,
          JSON.stringify(sessionData)
        );

        setUserRole(role);
        setAuthName(profile.name);
        setAuthPhone(profile.phone);
        setOwnerName(profile.name);
        setMobileNumber(profile.phone);

        setCustomerProfileUri(
          profile.profileUri || null
        );

        setPendingGoogleUser(null);
        setShowGoogleOnboarding(false);

        Alert.alert(
          'Profile Created 🎉',
          `Welcome ${profile.name}!`
        );

      } catch (error) {
        console.error(
          'Google Profile Save Error:',
          error
        );

        Alert.alert(
          'Profile Error ❌',
          error?.message ||
            'Profile save nahi ho paya.'
        );

        throw error;
      }
    };


  // ==========================================================
  // CANCEL GOOGLE ONBOARDING
  // ==========================================================

  const cancelGoogleOnboarding =
    async () => {
      setShowGoogleOnboarding(false);
      setPendingGoogleUser(null);

      try {
        await GoogleSignin.signOut();
      } catch (e) {
        console.log(
          'Google signOut skipped:',
          e
        );
      }

      try {
        await signOut(auth);
      } catch (e) {
        console.log(
          'Firebase signOut skipped:',
          e
        );
      }
    };


  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout =
    async () => {
      try {
        toggleDrawer(false);

        await signOut(auth);

        try {
          await GoogleSignin.signOut();
        } catch (googleError) {
          console.log(
            'Google signOut skipped:',
            googleError
          );
        }

        await AsyncStorage.removeItem(
          STORAGE_KEYS.USER_SESSION
        );

        setUserRole(null);
        setAuthName('');
        setAuthPhone('');
        setOwnerName('');
        setMobileNumber('');
        setCustomerProfileUri(null);

      } catch (error) {
        console.error(
          'Logout Error:',
          error
        );

        Alert.alert(
          'Logout Error ❌',
          error?.message ||
            'Logout failed.'
        );
      }
    };


  // ==========================================================
  // CLOUD IMAGE URI
  // ==========================================================

  const ensureCloudImageUri =
    async (
      uri: string | null,
      type: string
    ) =>
      ensureCloudImageUriService(
        uri,
        type,
        authPhone
      );


  // ==========================================================
  // SAVE PROVIDER PROFILE
  // ==========================================================

  const saveProfileData =
    async () => {
      if (!shopName.trim()) {
        Alert.alert(
          'Error ⚠️',
          'Service Provider / Business ka naam zaroori hai!'
        );

        return;
      }

      try {
        const fixedMobile =
          authPhone || mobileNumber;

        // ----------------------------------------------------
        // Migrate old local image URI to Cloudinary
        // ----------------------------------------------------

        const cloudBannerUri =
          await ensureCloudImageUri(
            bannerUri,
            'banner'
          );

        const cloudProfileUri =
          await ensureCloudImageUri(
            profileUri,
            'profile'
          );

        const cloudFrontImageUri =
          await ensureCloudImageUri(
            frontImageUri,
            'front'
          );

        const cloudInsideImageUri =
          await ensureCloudImageUri(
            insideImageUri,
            'inside'
          );

        setBannerUri(
          cloudBannerUri
        );

        setProfileUri(
          cloudProfileUri
        );

        setFrontImageUri(
          cloudFrontImageUri
        );

        setInsideImageUri(
          cloudInsideImageUri
        );

        const dataToSave = {
          shopName,
          category,
          subcategory,

          ownerName:
            authName || ownerName,

          mobileNumber:
            fixedMobile,

          address,

          bannerUri:
            cloudBannerUri,

          profileUri:
            cloudProfileUri,

          frontImageUri:
            cloudFrontImageUri,

          insideImageUri:
            cloudInsideImageUri,

          region,

          avgRating:
            shopDetails.avgRating ||
            1.0,

          totalReviews:
            shopDetails.totalReviews ||
            0,
        };

        const docRef =
          fixedMobile
            ? doc(
                db,
                'profile',
                fixedMobile
              )
            : doc(
                db,
                'profile',
                'shop_info'
              );

        await setDoc(
          docRef,
          dataToSave,
          { merge: true }
        );

        setShopDetails(
          dataToSave
        );

        setIsEditingProfile(
          false
        );

        Alert.alert(
          'Success 🎉',
          'Profile Firestore Cloud par save ho gayi!'
        );

      } catch (e) {
        Alert.alert(
          'Database Error ❌',
          e.message
        );
      }
    };


  // ==========================================================
  // AUTO TIME SLOT GENERATION
  // ==========================================================

  const handleAddServiceWithAutoSlots =
    async () => {
      if (
        !newServiceName.trim() ||
        !newServicePrice.trim()
      ) {
        Alert.alert(
          'Error ⚠️',
          'Service Name aur Price zaroori hai!'
        );

        return;
      }

      const durationNum =
        parseInt(
          newServiceDuration,
          10
        ) || 30;

      if (durationNum <= 0) {
        Alert.alert(
          'Error ⚠️',
          'Sahi duration enter karein!'
        );

        return;
      }

      const calculatedSlots =
        generateAutoSlots(
          startTime,
          endTime,
          durationNum,
          slotCapacity
        );

      if (
        calculatedSlots.length === 0
      ) {
        Alert.alert(
          'Error ⚠️',
          'Selected Start aur End Time me Kam se kam 1 slot banna chahiye!'
        );

        return;
      }

      try {
        const shopPhoneKey =
          authPhone ||
          mobileNumber ||
          'shop_info';

        await addDoc(
          collection(
            db,
            'services'
          ),
          {
            name:
              newServiceName,

            price:
              newServicePrice,

            specialty:
              newServiceSpecialty,

            duration:
              `${durationNum} Mins`,

            category:
              category,

            shopPhone:
              shopPhoneKey,

            autoSlots:
              calculatedSlots,

            createdAt:
              new Date(),
          }
        );

        setNewServiceName('');
        setNewServicePrice('');
        setNewServiceSpecialty('');
        setNewServiceDuration('30');

        Alert.alert(
          'Success 🎉',
          `Service publish ho gayi aur Backend par ${calculatedSlots.length} Time Slots auto-generate ho gaye!`
        );

      } catch (e) {
        Alert.alert(
          'Database Error ❌',
          e.message
        );
      }
    };


  // ==========================================================
  // DELETE SERVICE
  // ==========================================================

  const handleDeleteService =
    async (id) => {
      try {
        await deleteDoc(
          doc(
            db,
            'services',
            id
          )
        );
      } catch (e) {
        Alert.alert(
          'Error ❌',
          e.message
        );
      }
    };


  // ==========================================================
  // CART TOGGLE
  // ==========================================================

  const toggleCartService =
    (service) => {
      setCart(
        (prevCart) => {
          const exists =
            prevCart.some(
              (item) =>
                item.id === service.id
            );

          if (exists) {
            return prevCart.filter(
              (item) =>
                item.id !== service.id
            );
          }

          if (
            prevCart.length > 0 &&
            prevCart[0].shopPhone !==
              service.shopPhone
          ) {
            Alert.alert(
              'Shop Conflict ⚠️',
              'Aap ek baar me ek hi shop ki multiple services book kar sakte hain!'
            );

            return prevCart;
          }

          return [
            ...prevCart,
            service,
          ];
        }
      );
    };


  // ==========================================================
  // BATCH BOOKING TRANSACTION
  // ==========================================================

  const handleConfirmCustomerBooking =
    async () => {
      const phoneToUse =
        authPhone ||
        custBookingPhone;

      const missingService =
        cart.find(
          (item) =>
            !selectedSlotForBooking[
              item.id
            ]
        );

      if (
        !phoneToUse.trim() ||
        cart.length === 0 ||
        missingService
      ) {
        Alert.alert(
          'Error ⚠️',
          missingService
            ? `Service "${missingService.name}" ke liye Time Slot select karein!`
            : 'At least 1 Service aur Phone number zaroori hai!'
        );

        return;
      }

      setIsSubmittingBooking(
        true
      );

      try {
        await runTransaction(
          db,
          async (transaction) => {

            // ------------------------------------------------
            // STEP 1: READ + VALIDATE
            // ------------------------------------------------

            const serviceDocsToUpdate =
              [];

            for (
              const serviceItem of cart
            ) {
              const serviceRef =
                doc(
                  db,
                  'services',
                  serviceItem.id
                );

              const serviceDoc =
                await transaction.get(
                  serviceRef
                );

              if (
                !serviceDoc.exists()
              ) {
                throw new Error(
                  `Service "${serviceItem.name}" ab available nahi hai.`
                );
              }

              const serviceData =
                serviceDoc.data();

              const autoSlots =
                serviceData.autoSlots ||
                [];

              const selectedSlot =
                selectedSlotForBooking[
                  serviceItem.id
                ];

              const targetSlotIndex =
                autoSlots.findIndex(
                  (s) =>
                    s.slotTime ===
                    selectedSlot.slotTime
                );

              if (
                targetSlotIndex === -1
              ) {
                throw new Error(
                  `Slot "${selectedSlot.slotTime}" service "${serviceItem.name}" me nahi mila.`
                );
              }

              if (
                autoSlots[
                  targetSlotIndex
                ].availableSeats <= 0
              ) {
                throw new Error(
                  `Slot "${selectedSlot.slotTime}" me "${serviceItem.name}" ki saari seats full ho chuki hain!`
                );
              }

              const updatedSlots =
                [...autoSlots];

              updatedSlots[
                targetSlotIndex
              ] = {
                ...updatedSlots[
                  targetSlotIndex
                ],

                availableSeats:
                  updatedSlots[
                    targetSlotIndex
                  ].availableSeats - 1,
              };

              serviceDocsToUpdate.push({
                ref: serviceRef,
                updatedSlots:
                  updatedSlots,
                serviceName:
                  serviceData.name,
                price:
                  serviceData.price ||
                  '0',
                shopPhone:
                  serviceData.shopPhone,
              });
            }

            // ------------------------------------------------
            // STEP 2: UPDATE SLOTS
            // ------------------------------------------------

            const bookingDate =
              new Date().toDateString();

            const combinedServiceName =
              cart
                .map(
                  (item) =>
                    item.name
                )
                .join(' + ');

            const totalPrice =
              cart.reduce(
                (sum, item) =>
                  sum +
                  (parseFloat(
                    item.price
                  ) || 0),
                0
              );

            for (
              const updateInfo of
                serviceDocsToUpdate
            ) {
              transaction.update(
                updateInfo.ref,
                {
                  autoSlots:
                    updateInfo.updatedSlots,
                }
              );
            }

            // ------------------------------------------------
            // STEP 3: CREATE BOOKING
            // ------------------------------------------------

            const newBookingRef =
              doc(
                collection(
                  db,
                  'bookings'
                )
              );

            transaction.set(
              newBookingRef,
              {
                customerName:
                  authName ||
                  'Customer',

                phone:
                  phoneToUse,

                service:
                  combinedServiceName,

                servicesList:
                  cart.map(
                    (item) => ({
                      id:
                        item.id,

                      name:
                        item.name,

                      price:
                        item.price,

                      slot:
                        selectedSlotForBooking[
                          item.id
                        ]?.slotTime ||
                        '',
                    })
                  ),

                price:
                  String(
                    totalPrice
                  ),

                slot:
                  cart
                    .map(
                      (item) =>
                        `${item.name}: ${selectedSlotForBooking[item.id]?.slotTime || ''}`
                    )
                    .join(' | '),

                date:
                  bookingDate,

                shopPhone:
                  cart[0]
                    .shopPhone ||
                  shopDetails.mobileNumber ||
                  authPhone ||
                  'shop_info',

                address:
                  shopDetails.address ||
                  'Shop Location',

                status:
                  'Pending',

                createdAt:
                  new Date(),
              }
            );
          }
        );

        setCart([]);

        setBookingModalVisible(
          false
        );

        Alert.alert(
          'Batch Booking Successful 🎉',
          'Aapki saari selected services ek sath book ho gayi hain!'
        );

      } catch (e) {
        Alert.alert(
          'Booking Failed ❌',
          e.message ||
            'Transaction error occurred.'
        );
      } finally {
        setIsSubmittingBooking(
          false
        );
      }
    };


  // ==========================================================
  // UPDATE BOOKING STATUS
  // ==========================================================

  const handleUpdateBookingStatus =
    async (
      bookingId,
      newStatus
    ) => {
      try {
        await updateDoc(
          doc(
            db,
            'bookings',
            bookingId
          ),
          {
            status:
              newStatus,
          }
        );

        Alert.alert(
          'Status Updated 🔔',
          `Appointment status "${newStatus}" kar diya gaya hai.`
        );

      } catch (e) {
        Alert.alert(
          'Error ❌',
          e.message
        );
      }
    };


  // ==========================================================
  // RATING
  // ==========================================================

  const handleSubmitRating =
    async () => {
      if (
        !selectedBookingForRating
      ) {
        return;
      }

      try {
        const targetShopPhone =
          selectedBookingForRating.shopPhone ||
          shopDetails.mobileNumber ||
          'shop_info';

        const reviewDocId =
          `${selectedBookingForRating.id}_${authPhone || custBookingPhone}`;

        await setDoc(
          doc(
            db,
            'reviews',
            reviewDocId
          ),
          {
            bookingId:
              selectedBookingForRating.id,

            customerPhone:
              authPhone ||
              custBookingPhone,

            customerName:
              authName ||
              'Customer',

            shopPhone:
              targetShopPhone,

            rating:
              Number(
                ratingValue
              ),

            feedback:
              feedbackText,

            createdAt:
              new Date(),
          },
          { merge: true }
        );

        await updateDoc(
          doc(
            db,
            'bookings',
            selectedBookingForRating.id
          ),
          {
            status:
              'Completed',

            userRating:
              Number(
                ratingValue
              ),
          }
        );

        const qReviews =
          query(
            collection(
              db,
              'reviews'
            ),
            where(
              'shopPhone',
              '==',
              targetShopPhone
            )
          );

        const querySnap =
          await getDocs(
            qReviews
          );

        let totalStars = 0;

        const reviewCount =
          querySnap.size;

        querySnap.forEach(
          (docSnap) => {
            const data =
              docSnap.data();

            if (data.rating) {
              totalStars +=
                Number(
                  data.rating
                );
            }
          }
        );

        const newAverage =
          reviewCount > 0
            ? (
                totalStars /
                reviewCount
              ).toFixed(1)
            : '1.0';

        const profileRef =
          doc(
            db,
            'profile',
            targetShopPhone
          );

        await setDoc(
          profileRef,
          {
            avgRating:
              parseFloat(
                newAverage
              ),

            totalReviews:
              reviewCount,
          },
          { merge: true }
        );

        setRatingModalVisible(
          false
        );

        setFeedbackText('');

        Alert.alert(
          'Thank You! ⭐',
          'Review submit ho gaya hai.'
        );

      } catch (e) {
        console.error(
          'Rating Error:',
          e
        );

        Alert.alert(
          'Rating Error ❌',
          e.message
        );
      }
    };


  // ==========================================================
  // IMAGE UPLOAD
  // ==========================================================

  const uploadImageToFirebaseLocal =
    async (
      localUri: string,
      type: string
    ) =>
      uploadImageToFirebase(
        localUri,
        type,
        authPhone
      );


  const pickImage =
    async (type) => {
      try {
        const result =
          await ImagePicker.launchImageLibraryAsync(
            {
              mediaTypes:
                ImagePicker
                  .MediaTypeOptions
                  .Images,

              allowsEditing:
                true,

              aspect:
                type === 'front' ||
                type === 'inside'
                  ? [4, 3]
                  : type === 'banner'
                  ? [16, 9]
                  : [1, 1],

              quality:
                0.82,
            }
          );

        if (
          result.canceled ||
          !result.assets?.[0]?.uri
        ) {
          return;
        }

        const localUri =
          result.assets[0].uri;

        const fileName =
          `upload_${Date.now()}.jpg`;

        const persistentUri =
          `${FileSystem.cacheDirectory}${fileName}`;

        await FileSystem.copyAsync({
          from: localUri,
          to: persistentUri,
        });

        console.log(
          'Image copied to persistent URI:',
          persistentUri
        );

        const cloudUri =
          await uploadImageToFirebaseLocal(
            persistentUri,
            type
          );

        if (
          type === 'banner'
        ) {
          setBannerUri(
            cloudUri
          );

        } else if (
          type === 'customer_profile'
        ) {
          setCustomerProfileUri(
            cloudUri
          );

          if (authPhone) {
            await setDoc(
              doc(
                db,
                'users',
                authPhone
              ),
              {
                profileUri:
                  cloudUri,
              },
              {
                merge: true,
              }
            );
          }

          Alert.alert(
            'Profile Updated ✨',
            'Customer profile photo Firebase Cloud par save ho gayi.'
          );

        } else if (
          type === 'front'
        ) {
          setFrontImageUri(
            cloudUri
          );

        } else if (
          type === 'inside'
        ) {
          setInsideImageUri(
            cloudUri
          );

        } else {
          setProfileUri(
            cloudUri
          );
        }

      } catch (e) {
        console.error(
          'Image upload error:',
          e
        );

        Alert.alert(
          'Image Upload Error ❌',
          e?.message ||
            'Image Firebase Storage par upload nahi ho saki.'
        );
      }
    };


  // ==========================================================
  // ADDRESS / MAP
  // ==========================================================

  const fetchAddressFromCoords =
    (
      lat: number,
      lon: number
    ) =>
      fetchAddressFromCoordsService(
        lat,
        lon,
        setAddress
      );


  const searchAddressOnMap =
    () =>
      searchAddressOnMapService(
        address,
        setAddress,
        setRegion,
        setLoadingMap
      );


  // ==========================================================
  // ADMIN COLLECTION
  // ==========================================================

  const loadAdminCollection =
    async (
      collectionName = adminCollection
    ) => {
      if (
        userRole !== 'admin'
      ) {
        return;
      }

      setAdminLoading(true);

      try {
        const snap =
          await getDocs(
            collection(
              db,
              collectionName
            )
          );

        setAdminDocs(
          snap.docs.map(
            (d) => ({
              id: d.id,
              ...d.data(),
            })
          )
        );

      } catch (e) {
        Alert.alert(
          'Admin Read Error ❌',
          e.message
        );

      } finally {
        setAdminLoading(
          false
        );
      }
    };


  // ==========================================================
  // ADMIN EDITOR
  // ==========================================================

  const openAdminEditor =
    (item = null) => {
      setAdminEditingDoc(
        item
      );

      const clone =
        item
          ? { ...item }
          : {
              createdAt:
                new Date().toISOString(),
            };

      delete clone.id;

      setAdminEditText(
        JSON.stringify(
          clone,
          null,
          2
        )
      );

      setAdminEditVisible(
        true
      );
    };


  // ==========================================================
  // ADMIN SAVE
  // ==========================================================

  const saveAdminDocument =
    async () => {
      try {
        const parsed =
          JSON.parse(
            adminEditText
          );

        const clean = {
          ...parsed,
        };

        delete clean.id;

        if (
          adminEditingDoc?.id
        ) {
          await setDoc(
            doc(
              db,
              adminCollection,
              adminEditingDoc.id
            ),
            clean,
            {
              merge: true,
            }
          );
        } else {
          await addDoc(
            collection(
              db,
              adminCollection
            ),
            clean
          );
        }

        setAdminEditVisible(
          false
        );

        await loadAdminCollection(
          adminCollection
        );

        Alert.alert(
          'Admin CRUD',
          'Document save ho gaya.'
        );

      } catch (e) {
        Alert.alert(
          'Invalid Data ❌',
          e.message ||
            'Valid JSON enter karein.'
        );
      }
    };


  // ==========================================================
  // ADMIN DELETE
  // ==========================================================

  const deleteAdminDocument =
    async (id) => {
      Alert.alert(
        'Delete Document?',
        `Collection: ${adminCollection}\nID: ${id}`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },

          {
            text: 'Delete',
            style: 'destructive',

            onPress:
              async () => {
                try {
                  await deleteDoc(
                    doc(
                      db,
                      adminCollection,
                      id
                    )
                  );

                  await loadAdminCollection(
                    adminCollection
                  );

                } catch (e) {
                  Alert.alert(
                    'Delete Error ❌',
                    e.message
                  );
                }
              },
          },
        ]
      );
    };


  // ==========================================================
  // PROVIDER CATEGORY
  // ==========================================================

  const selectProviderCategory =
    (value) => {
      setCategory(value);

      if (
        value !== 'Other'
      ) {
        const subs =
          getSubcategories(
            value
          );

        setSubcategory(
          subs.includes(
            subcategory
          )
            ? subcategory
            : ''
        );
      } else {
        setSubcategory(
          'Other'
        );
      }

      setCatalogPickerVisible(
        false
      );

      setCatalogPickerSearch(
        ''
      );
    };


  const selectProviderSubcategory =
    (value) => {
      setSubcategory(
        value
      );

      setCatalogPickerVisible(
        false
      );

      setCatalogPickerSearch(
        ''
      );
    };


  // ==========================================================
  // SHOP EXPAND
  // ==========================================================

  const toggleExpandShop =
    (shopKey) => {
      setExpandedShops(
        (prev) => ({
          ...prev,
          [shopKey]:
            !prev[shopKey],
        })
      );
    };


  // ==========================================================
  // GROUP SHOPS + SERVICES
  // ==========================================================

  const groupedShopsWithServices =
    services.reduce(
      (acc, service) => {
        const shopKey =
          service.shopPhone ||
          'shop_info';

        const matchesSearch =
          service.name
            ?.toLowerCase()
            .includes(
              searchQuery.toLowerCase()
            ) ||
          service.specialty
            ?.toLowerCase()
            .includes(
              searchQuery.toLowerCase()
            );

        const matchesCategory =
          selectedCategoryFilter ===
            'All' ||
          service.category ===
            selectedCategoryFilter;

        if (
          matchesSearch &&
          matchesCategory
        ) {
          if (
            !acc[shopKey]
          ) {
            const shopInfo =
              allShops.find(
                (s) =>
                  s.id ===
                    shopKey ||
                  s.mobileNumber ===
                    shopKey
              ) ||
              shopDetails;

            acc[shopKey] = {
              shopInfo,
              servicesList: [],
            };
          }

          acc[
            shopKey
          ].servicesList.push(
            service
          );
        }

        return acc;
      },
      {}
    );


  const localMatchCount =
    Object.keys(
      groupedShopsWithServices
    ).length;


  // ==========================================================
  // OPENSTREETMAP FALLBACK
  // ==========================================================

  useEffect(() => {
    if (
      userRole !==
      'customer'
    ) {
      return;
    }

    const typedQuery =
      searchQuery.trim();

    const hasSearchIntent =
      typedQuery.length > 0 ||
      selectedCategoryFilter !==
        'All';

    if (
      !hasSearchIntent ||
      localMatchCount > 0 ||
      !userLocation
    ) {
      setExternalResults(
        []
      );

      setExternalSearchedFor(
        ''
      );

      return;
    }

    const categoryForSearch =
      selectedCategoryFilter !==
      'All'
        ? selectedCategoryFilter
        : null;

    const debounceHandle =
      setTimeout(
        async () => {
          setExternalLoading(
            true
          );

          try {
            const results =
              await fetchExternalNearbyBusinesses(
                categoryForSearch,
                typedQuery,
                userLocation.latitude,
                userLocation.longitude
              );

            setExternalResults(
              results
            );

            setExternalSearchedFor(
              categoryForSearch ||
                typedQuery
            );
          } catch (error) {
            console.error(
              'External search error:',
              error
            );

            setExternalResults(
              []
            );
          } finally {
            setExternalLoading(
              false
            );
          }
        },
        700
      );

    return () =>
      clearTimeout(
        debounceHandle
      );

  }, [
    searchQuery,
    selectedCategoryFilter,
    localMatchCount,
    userLocation,
    userRole,
  ]);


  // ==========================================================
  // OPEN EXTERNAL MAP RESULT
  // ==========================================================

  const openExternalResultOnMap =
    (item) => {
      const url =
        `https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lon}`;

      Linking.openURL(
        url
      ).catch(() => {
        Alert.alert(
          'Error',
          'Map open nahi ho saka.'
        );
      });
    };


  // ==========================================================
  // CUSTOMER BOOKINGS
  // ==========================================================

  const myBookings =
    incomingBookings.filter(
      (b) =>
        b.phone ===
        (authPhone ||
          custBookingPhone)
    );


  const activeAppointments =
    myBookings.filter(
      (b) =>
        b.status ===
          'Pending' ||
        b.status ===
          'Confirmed'
    );


  const historyAppointments =
    myBookings.filter(
      (b) =>
        b.status ===
          'Completed' ||
        b.status ===
          'Canceled' ||
        b.status ===
          'No-Show'
    );


  // ==========================================================
  // PROVIDER BOOKINGS
  // ==========================================================

  const myProviderPhone =
    authPhone ||
    mobileNumber ||
    'shop_info';


  const providerUpcoming =
    incomingBookings.filter(
      (b) =>
        b.shopPhone ===
          myProviderPhone &&
        (
          b.status ===
            'Confirmed' ||
          b.status ===
            'Pending'
        )
    );


  const providerHistory =
    incomingBookings.filter(
      (b) => {
        if (
          b.shopPhone !==
          myProviderPhone
        ) {
          return false;
        }

        const isHistoryStatus =
          b.status ===
            'Completed' ||
          b.status ===
            'Canceled' ||
          b.status ===
            'No-Show';

        if (
          !isHistoryStatus
        ) {
          return false;
        }

        if (
          historyFilter ===
          'All'
        ) {
          return true;
        }

        return (
          b.status ===
          historyFilter
        );
      }
    );


  const providerServices =
    services.filter(
      (s) =>
        s.shopPhone ===
        myProviderPhone
    );


  // ==========================================================
  // CONTEXT VALUE
  // ==========================================================

  const value:
    AppContextValue = {
      // Auth
      isDataLoaded,
      userRole,
      setUserRole,
      authName,
      setAuthName,
      authPhone,
      setAuthPhone,
      selectedSignupRole,
      setSelectedSignupRole,

      // Google Auth
      handleGoogleSignIn,
      showGoogleOnboarding,
      pendingGoogleUser,
      completeGoogleProfile,
      cancelGoogleOnboarding,

      // Location
      userLocation,
      locationLoading,

      // Drawer
      isDrawerOpen,
      slideAnim,

      // Customer
      customerProfileUri,
      setCustomerProfileUri,
      customerPaid,

      // Shop Images
      shopImagesVisible,
      setShopImagesVisible,
      selectedShopImages,
      setSelectedShopImages,

      // Catalog
      catalogPickerVisible,
      setCatalogPickerVisible,
      catalogPickerType,
      setCatalogPickerType,
      catalogPickerSearch,
      setCatalogPickerSearch,
      customCategoryText,
      setCustomCategoryText,
      customSubcategoryText,
      setCustomSubcategoryText,

      // Admin
      adminCollection,
      setAdminCollection,
      adminDocs,
      adminLoading,
      adminSearch,
      setAdminSearch,
      adminEditVisible,
      setAdminEditVisible,
      adminEditingDoc,
      setAdminEditingDoc,
      adminEditText,
      setAdminEditText,

      // Customer Tabs
      customerActiveTab,
      setCustomerActiveTab,
      customerSubTab,
      setCustomerSubTab,

      // Provider Tabs
      providerBookingSubTab,
      setProviderBookingSubTab,
      historyFilter,
      setHistoryFilter,

      // Shop
      shopDetails,
      setShopDetails,
      allShops,

      bannerUri,
      setBannerUri,

      profileUri,
      setProfileUri,

      shopName,
      setShopName,

      category,
      setCategory,

      subcategory,
      setSubcategory,

      frontImageUri,
      setFrontImageUri,

      insideImageUri,
      setInsideImageUri,

      ownerName,
      setOwnerName,

      mobileNumber,
      setMobileNumber,

      address,
      setAddress,

      isEditingProfile,
      setIsEditingProfile,

      categories,

      // Map
      loadingMap,
      region,
      setRegion,

      // Services
      services,

      newServiceName,
      setNewServiceName,

      newServicePrice,
      setNewServicePrice,

      newServiceSpecialty,
      setNewServiceSpecialty,

      newServiceDuration,
      setNewServiceDuration,

      // Time
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

      // Bookings
      incomingBookings,

      activeTab,
      setActiveTab,

      searchQuery,
      setSearchQuery,

      selectedCategoryFilter,
      setSelectedCategoryFilter,

      // External
      externalResults,
      externalLoading,
      externalSearchedFor,

      // Cart
      cart,
      setCart,

      bookingModalVisible,
      setBookingModalVisible,

      selectedSlotForBooking,
      setSelectedSlotForBooking,

      custBookingPhone,
      setCustBookingPhone,

      isSubmittingBooking,
      setIsSubmittingBooking,

      // Rating
      ratingModalVisible,
      setRatingModalVisible,

      selectedBookingForRating,
      setSelectedBookingForRating,

      ratingValue,
      setRatingValue,

      feedbackText,
      setFeedbackText,

      // Expanded Shops
      expandedShops,

      // Functions
      toggleDrawer,
      handleSignUp,
      handleGoogleSignIn,
      handleLogout,
      saveProfileData,

      handleAddServiceWithAutoSlots,
      handleDeleteService,

      toggleCartService,

      handleConfirmCustomerBooking,

      handleUpdateBookingStatus,

      handleSubmitRating,

      pickImage,

      loadAdminCollection,
      openAdminEditor,
      saveAdminDocument,
      deleteAdminDocument,

      selectProviderCategory,
      selectProviderSubcategory,

      formatTime,

      toggleExpandShop,

      groupedShopsWithServices,

      localMatchCount,

      openExternalResultOnMap,

      fetchUserCurrentLocation,

      myBookings,
      activeAppointments,
      historyAppointments,

      myProviderPhone,
      providerUpcoming,
      providerHistory,
      providerServices,

      fetchAddressFromCoords,
      searchAddressOnMap,
    };


  // ==========================================================
  // PROVIDER
  // ==========================================================

  return (
    <AppContext.Provider
      value={value}
    >
      {children}
    </AppContext.Provider>
  );
}