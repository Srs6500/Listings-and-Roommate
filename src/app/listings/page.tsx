'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useWeb3 } from '@/context/Web3Context';
import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc,
  updateDoc, 
  deleteDoc,
  arrayUnion, 
  arrayRemove, 
  onSnapshot,
  writeBatch,
  serverTimestamp,
  query,
  where,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import ProtectedRoute from '@/components/ProtectedRoute';
import PaymentModal from '@/components/PaymentModal';
import AIVoiceSearch from '@/components/AIVoiceSearch';
import PropertyMap from '@/components/PropertyMap';
import LifestyleMatcher from '@/components/LifestyleMatcher';
import CryptoReceipt from '@/components/CryptoReceipt';
import ReceiptMailbox from '@/components/ReceiptMailbox';
import PropertyUpload from '@/components/PropertyUpload';
import PropertyOwnerDashboard from '@/components/PropertyOwnerDashboard';
import RoommateAvatar from '@/components/RoommateAvatar';
import PropertyImageAnalyzer from '@/components/PropertyImageAnalyzer';
import PropertyRequestSystem from '@/components/PropertyRequestSystem';
import LoadingOverlay from '@/components/LoadingOverlay';
import Image from 'next/image';
import scrapedProperties from '@/lib/scraped-properties.json';
import { generateFakeUser } from '@/lib/fakeData';

interface StateLaws {
  securityDeposit: string;
  noticePeriod: string;
  evictionRules: string;
  rentControl: string;
  securityDepositLimit: string;
}

interface Listing {
  id?: string;
  title?: string;
  location?: string;
  state?: string;
  price?: number;
  image?: string;
  description?: string;
  availableFrom?: string;
  roomType?: 'entire' | 'private' | 'shared';
  savedBy?: string[];
  stateLaws?: StateLaws;
  coordinates?: {
    lat: number;
    lng: number;
  };
  amenities?: string[];
  lifestyle?: string[];
  cultural?: string[];
  foodNearby?: string[];
  transportation?: string[];
  studySpots?: string[];
  nightlife?: string[];
  fitness?: string[];
  type?: 'api' | 'community';
  uploadedBy?: string;
  status?: 'pending' | 'approved' | 'rejected';
  roommateRequired?: boolean;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  datePosted?: string;
  fakeUser?: {
    name: string;
    avatar: string;
    initials: string;
    personality?: string;
    interests?: string[];
  };
}

interface ReceiptData {
  id: string;
  propertyId: string;
  userAddress: string;
  timestamp: number;
  status: 'pending' | 'approved' | 'rejected';
  transactionHash: string;
  property: Listing;
}

const stateLaws = {
  'New York': {
    securityDeposit: 'No statutory limit, but typically 1 month\'s rent.',
    noticePeriod: '30 days for month-to-month tenancies, 60-90 days for rent-stabilized units.',
    evictionRules: 'Strict eviction process requiring court order. Eviction moratoriums may apply in some cases.',
    rentControl: 'Rent stabilization applies to buildings built before 1974 with 6+ units in NYC and some other cities.',
    securityDepositLimit: 'No statutory limit, but typically 1 month\'s rent.'
  },
  'New Jersey': {
    securityDeposit: 'Maximum of 1.5 times the monthly rent.',
    noticePeriod: '1 month for month-to-month tenancies, 3 months for eviction after 1+ year of tenancy.',
    evictionRules: 'Strict eviction process with required court order. Good cause eviction laws in some cities.',
    rentControl: 'Some cities like Jersey City and Newark have rent control ordinances.',
    securityDepositLimit: '1.5 times the monthly rent'
  },
  'California': {
    securityDeposit: '2 months\' rent for unfurnished, 3 months\' if furnished.',
    noticePeriod: '30 days for month-to-month tenancies, 60 days if tenant has lived there for a year or more.',
    evictionRules: 'Strict eviction process with just cause required in some cities.',
    rentControl: 'Statewide rent control applies to buildings older than 15 years.',
    securityDepositLimit: '2 months\' rent (3 months if furnished)'
  },
  'Texas': {
    securityDeposit: 'No statutory limit',
    noticePeriod: 'No statute for notice to terminate month-to-month tenancy',
    evictionRules: 'Landlord must provide 3-day notice to vacate before filing for eviction',
    rentControl: 'Prohibited by state law',
    securityDepositLimit: 'No statutory limit'
  },
  'Florida': {
    securityDeposit: 'No statutory limit',
    noticePeriod: '15 days for month-to-month tenancies',
    evictionRules: 'Landlord must provide 3-day notice for non-payment of rent',
    rentControl: 'Prohibited by state law except in declared housing emergencies',
    securityDepositLimit: 'No statutory limit'
  }
};

// Convert scraped properties to our Listing format
const convertScrapedToListing = (property: any): Listing => {
  const state = property.location.includes('NY') ? 'New York' : 'New Jersey';
  return {
    id: property.id,
    title: property.title,
    location: property.location,
    state: state,
    price: property.price,
    image: property.images[0],
    description: property.description,
    availableFrom: new Date().toISOString().split('T')[0],
    roomType: 'entire',
    savedBy: [],
    stateLaws: stateLaws[state],
    coordinates: { lat: property.coordinates[0], lng: property.coordinates[1] },
    amenities: property.amenities,
    lifestyle: ['urban', 'professional'],
    cultural: ['diverse'],
    foodNearby: ['Restaurants', 'Coffee shops', 'Food trucks'],
    transportation: ['Public transit', 'Walking distance'],
    studySpots: ['Hotel Lobby', 'Libraries'],
    nightlife: ['Bars', 'Entertainment'],
    fitness: ['Tennis court', 'Fitness centers'],
    type: property.type,
    uploadedBy: property.uploadedBy,
    status: property.status,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    sqft: property.sqft,
    datePosted: property.datePosted,
    fakeUser: generateFakeUser(property.id || property.title || `property-${Math.random()}`)
  };
};

// Convert all scraped properties
const allProperties: Listing[] = scrapedProperties.map(convertScrapedToListing);

// Log name distribution for verification
console.log('=== PROPERTY NAME DISTRIBUTION ===');
const maleNames = allProperties.filter(p => {
  const firstName = p.fakeUser?.name.split(' ')[0] || '';
  const maleNameList = ['Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn', 'Sage', 'River', 'Phoenix', 'Blake', 'Cameron', 'Drew', 'Emery', 'Finley', 'Hayden', 'Jamie', 'Kendall', 'Logan', 'Parker', 'Reese', 'Sawyer', 'Skyler', 'Kai', 'Atlas', 'Orion', 'Eli', 'Noah', 'Liam', 'Ethan', 'Mason', 'Lucas', 'Jackson', 'Aiden', 'Oliver', 'Sebastian', 'Caleb', 'Ryan', 'Luke', 'Nathan', 'Isaac', 'Owen', 'Wyatt', 'Henry', 'Leo', 'Aaron', 'Charles', 'Thomas', 'Connor', 'Jeremy', 'Hunter', 'Christian', 'Landon', 'Jonathan', 'Nolan', 'Easton', 'Tyler', 'Miles', 'Colton', 'Jaxon', 'Bryce', 'Adam', 'Adrian', 'Cooper', 'Ian', 'Carson', 'Xavier', 'Bentley', 'Dominic', 'Jason', 'Jose', 'Zachary', 'Chase', 'Gavin', 'Cole'];
  return maleNameList.includes(firstName);
});
const femaleNames = allProperties.filter(p => !maleNames.includes(p));

console.log(`Total properties: ${allProperties.length}`);
console.log(`Male names: ${maleNames.length} (${(maleNames.length/allProperties.length*100).toFixed(1)}%)`);
console.log(`Female names: ${femaleNames.length} (${(femaleNames.length/allProperties.length*100).toFixed(1)}%)`);

// Check for duplicates
const allNames = allProperties.map(p => p.fakeUser?.name).filter(Boolean);
const uniqueNames = new Set(allNames);
console.log(`Unique names: ${uniqueNames.size}/${allNames.length} (${uniqueNames.size === allNames.length ? '✅ All unique' : '❌ Duplicates found'})`);

console.log('First 10 property owners:');
allProperties.slice(0, 10).forEach((p, i) => {
  console.log(`${i+1}. ${p.fakeUser?.name} (${p.fakeUser?.personality})`);
});
console.log('================================');

// Shuffle properties for Instagram-style random feed (deterministic)
const shuffleArray = (array: Listing[], seed: number = 0) => {
  const shuffled = [...array];
  let currentIndex = shuffled.length;
  let randomIndex = seed;
  
  while (currentIndex !== 0) {
    randomIndex = (randomIndex * 9301 + 49297) % 233280;
    const j = Math.floor((randomIndex / 233280) * currentIndex);
    currentIndex--;
    [shuffled[currentIndex], shuffled[j]] = [shuffled[j], shuffled[currentIndex]];
  }
  
  return shuffled;
};

function ListingsContent() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Instagram-style pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const itemsPerPage = 15;
  const [isClient, setIsClient] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedListingForPayment, setSelectedListingForPayment] = useState<Listing | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high'>('default');
  const [showAIVoiceSearch, setShowAIVoiceSearch] = useState(false);
  const [showLifestyleMatcher, setShowLifestyleMatcher] = useState(false);
  const [aiRecommendations, setAIRecommendations] = useState<any[]>([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedPropertyForReceipt, setSelectedPropertyForReceipt] = useState<Listing | null>(null);
  const [selectedReceiptForView, setSelectedReceiptForView] = useState<any>(null);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [showMailbox, setShowMailbox] = useState(false);
  const [showPropertyUpload, setShowPropertyUpload] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'browse' | 'upload' | 'requests' | 'mailbox' | 'admin'>('browse');
  const [userProfile, setUserProfile] = useState({
    id: 'user-1',
    name: 'Student User',
    preferences: {
      food: ['indian', 'chinese', 'italian'],
      fitness: ['gym', 'yoga', 'running'],
      study: ['library', 'quiet', 'coffee shops'],
      nightlife: ['bars', 'clubs', 'live music'],
      transportation: ['public transport', 'walking', 'biking'],
      cultural: ['diverse', 'international', 'artsy']
    },
    location: 'New York/NJ Area',
    compatibility: 0,
    matchReasons: []
  });
  const { user, isAdmin, signOut } = useAuth();
  const { disconnectWallet } = useWeb3();
  const router = useRouter();

  // Check URL parameters for admin tab
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get('tab');
      if (tab === 'admin' && isAdmin) {
        setActiveTab('admin');
      }
    }
  }, [isAdmin]);

  // Load receipts from Firestore
  const loadReceipts = async () => {
    if (!user) {
      console.log('❌ No user found, cannot load receipts');
      return;
    }
    
    try {
      console.log('📥 Loading receipts from Firestore for user:', user.uid);
      
      // Get user document to get receipt IDs
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        console.log('❌ User document not found for user:', user.uid);
        setReceipts([]);
        return;
      }
      
      const userData = userDoc.data();
      console.log('📄 User data:', userData);
      const receiptIds = userData.receipts || [];
      console.log('📋 Receipt IDs found:', receiptIds);
      
      if (receiptIds.length === 0) {
        console.log('📭 No receipts found for user');
        setReceipts([]);
        return;
      }
      
      // Fetch receipt documents using the receipt IDs
      // Use individual document gets instead of query to avoid __name__ issues
      const receiptsData: ReceiptData[] = [];
      
      for (const receiptId of receiptIds) {
        try {
          const receiptDoc = await getDoc(doc(db, 'receipts', receiptId));
          if (receiptDoc.exists()) {
            receiptsData.push({
              id: receiptDoc.id,
              ...receiptDoc.data()
            } as ReceiptData);
            console.log('✅ Loaded receipt:', receiptId);
          } else {
            console.log('❌ Receipt not found:', receiptId);
          }
        } catch (error) {
          console.error('❌ Error loading receipt:', receiptId, error);
        }
      }
      
      console.log('📊 Total receipts loaded:', receiptsData.length);
      
      // Sort by timestamp (newest first)
      receiptsData.sort((a, b) => b.timestamp - a.timestamp);
      
      setReceipts(receiptsData);
      console.log('✅ Loaded receipts from Firestore:', receiptsData.length);
      console.log('📋 Receipts data:', receiptsData);
    } catch (error) {
      console.error('❌ Error loading receipts from Firestore:', error);
      console.error('❌ Error details:', error);
      setReceipts([]);
    }
  };

  useEffect(() => {
    // Set client immediately
    setIsClient(true);
    
    // Load receipts from Firestore when user changes
    if (user) {
      console.log('👤 User detected, loading receipts for:', user.uid);
      loadReceipts();
    } else {
      console.log('👤 No user detected, clearing receipts');
      setReceipts([]); // Clear receipts when user signs out
    }
    
    // Load listings with Instagram-style pagination
    const loadListings = async () => {
      try {
        setLoading(true);
        
        // Shuffle all properties for random feed (deterministic)
        const shuffledProperties = shuffleArray(allProperties, 12345);
        
        // Load first page (15 properties) - show immediately
        const firstPage = shuffledProperties.slice(0, itemsPerPage);
        setListings(firstPage);
        
        // Set pagination state
        setCurrentPage(1);
        setHasMore(shuffledProperties.length > itemsPerPage);
        
        // Set first property as selected
        if (firstPage.length > 0) {
          setSelectedListing(firstPage[0]);
        } else {
          setSelectedListing(null);
        }
        
        // Stop loading here - show properties immediately
        setLoading(false);
        
        // Load community listings from Firestore in background (non-blocking)
        try {
          const communityQuery = collection(db, 'communityListings');
          const communitySnapshot = await getDocs(communityQuery);
          const communityListings = communitySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              fakeUser: data.fakeUser || generateFakeUser(doc.id || data.title || `community-${Math.random()}`)
            };
          }) as Listing[];
          
          // Add community listings to the mix if any
          if (communityListings.length > 0) {
            const allWithCommunity = [...shuffledProperties, ...communityListings];
            const shuffledAll = shuffleArray(allWithCommunity);
            const firstPageWithCommunity = shuffledAll.slice(0, itemsPerPage);
            setListings(firstPageWithCommunity);
            if (firstPageWithCommunity.length > 0) {
              setSelectedListing(firstPageWithCommunity[0]);
            }
          }
        } catch (communityError) {
          console.error('Error loading community listings:', communityError);
          // Don't block the UI for community listings
        }

        // Set up real-time listener for community listings
        const unsubscribe = onSnapshot(collection(db, 'communityListings'), (snapshot) => {
          const newCommunityListings = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              fakeUser: data.fakeUser || generateFakeUser(doc.id || data.title || `community-${Math.random()}`)
            };
          }) as Listing[];

          // Update listings with new community properties
          const allWithCommunity = [...shuffledProperties, ...newCommunityListings];
          const shuffledAll = shuffleArray(allWithCommunity);
          const firstPageWithCommunity = shuffledAll.slice(0, itemsPerPage);
          setListings(firstPageWithCommunity);
          if (firstPageWithCommunity.length > 0 && !selectedListing) {
            setSelectedListing(firstPageWithCommunity[0]);
          }
        });

        // Cleanup listener on unmount
        return () => unsubscribe();
        
      } catch (error) {
        console.error('Error loading listings:', error);
        setLoading(false);
      }
    };

    loadListings();
  }, [user]); // Add user dependency to reload receipts when user changes

  // Load receipts when component mounts and user is already authenticated
  useEffect(() => {
    if (user && isClient) {
      console.log('🔄 Loading receipts on component mount for user:', user.uid);
      loadReceipts();
    } else if (!user && isClient) {
      console.log('🔄 No user on component mount, clearing receipts');
      setReceipts([]);
    }
  }, [isClient, user]); // Run when component becomes client-side or user changes

  // Load more properties for infinite scroll
  const loadMoreProperties = async () => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    
    try {
      // Shuffle all properties again for variety
      const shuffledProperties = shuffleArray(allProperties);
      
      // Calculate next page
      const nextPage = currentPage + 1;
      const startIndex = (nextPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      
      // Get next batch of properties
      const nextBatch = shuffledProperties.slice(startIndex, endIndex);
      
      if (nextBatch.length > 0) {
        setListings(prev => [...prev, ...nextBatch]);
        setCurrentPage(nextPage);
        setHasMore(endIndex < shuffledProperties.length);
      } else {
        setHasMore(false);
      }
      
    } catch (error) {
      console.error('Error loading more properties:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Infinite scroll handler
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 100) {
      loadMoreProperties();
    }
  };

  const handleVoiceSearch = (query: string) => {
    setSearchQuery(query);
    // Filter listings based on voice search query
    const filtered = allProperties.filter(listing => 
      listing.title?.toLowerCase().includes(query.toLowerCase()) ||
      listing.location?.toLowerCase().includes(query.toLowerCase()) ||
      listing.description?.toLowerCase().includes(query.toLowerCase()) ||
      listing.foodNearby?.some(food => food.toLowerCase().includes(query.toLowerCase())) ||
      listing.lifestyle?.some(lifestyle => lifestyle.toLowerCase().includes(query.toLowerCase()))
    );
    setListings(filtered);
  };

  const handleLocationSearch = (location: string) => {
    const filtered = allProperties.filter((listing: Listing) => 
      listing.location?.toLowerCase().includes(location.toLowerCase()) ||
      listing.state?.toLowerCase().includes(location.toLowerCase())
    );
    setListings(filtered);
  };

  const handleLifestyleSearch = (lifestyle: string) => {
    const filtered = allProperties.filter((listing: Listing) => 
      listing.lifestyle?.includes(lifestyle) ||
      listing.cultural?.includes(lifestyle) ||
      listing.foodNearby?.some((food: string) => food.toLowerCase().includes(lifestyle.toLowerCase()))
    );
    setListings(filtered);
  };

  const handleAIRecommendations = (recommendations: any[]) => {
    setAIRecommendations(recommendations);
    // Apply AI recommendations to listings
    if (recommendations.length > 0) {
      setListings(recommendations);
    }
  };

  const handleRentNow = (property: Listing) => {
    setSelectedListingForPayment(property);
    setShowPaymentModal(true);
  };

  const handleGetInfo = (property: Listing) => {
    // Show payment modal to create receipt - wallet should already be connected
    setSelectedListingForPayment(property);
    setShowPaymentModal(true);
    console.log('📋 Opening payment modal for:', property.title);
  };

  const handleSaveToMailbox = async (receipt: any) => {
    try {
      if (!user) {
        console.log('❌ No user found, cannot save receipt');
        return;
      }
      
      console.log('💾 Saving receipt to Firestore:', receipt.id);
      console.log('👤 User ID:', user.uid);
      
      // Create receipt document in Firestore
      const receiptRef = doc(db, 'receipts', receipt.id);
      const receiptData = {
        ...receipt,
        userId: user.uid, // Add user ID to receipt for bidirectional linking
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      console.log('📝 Receipt data to save:', receiptData);
      await setDoc(receiptRef, receiptData);
      console.log('✅ Receipt document created in Firestore:', receipt.id);
      
      // Update user document to include receipt ID
      const userRef = doc(db, 'users', user.uid);
      console.log('🔄 Updating user document with receipt ID:', receipt.id);
      await updateDoc(userRef, {
        receipts: arrayUnion(receipt.id) // Add receipt ID to user's receipts array
      });
      console.log('✅ Receipt ID added to user document');
      
      // Update local state
      setReceipts(prev => {
        const newReceipts = [receipt, ...prev];
        console.log('📋 Updated local receipts state:', newReceipts.length, 'receipts');
        return newReceipts;
      });
      setShowReceipt(false);
      setSelectedPropertyForReceipt(null);
      
      console.log('✅ Receipt saved and linked to user:', receipt.id);
    } catch (error) {
      console.error('❌ Error saving receipt to Firestore:', error);
      console.error('❌ Error details:', error);
      // Still update local state as fallback
      setReceipts(prev => [receipt, ...prev]);
      setShowReceipt(false);
      setSelectedPropertyForReceipt(null);
    }
  };

  const handleReceiptClick = (receipt: any) => {
    // View existing receipt details - no duplication
    setSelectedPropertyForReceipt(receipt.property);
    setSelectedReceiptForView(receipt);
    setShowReceipt(true);
  };

  const handleRemoveReceipt = async (receiptId: string) => {
    try {
      if (!user) return;
      
      console.log('🗑️ Removing receipt from Firestore:', receiptId);
      
      // Remove receipt document from Firestore
      await deleteDoc(doc(db, 'receipts', receiptId));
      console.log('✅ Receipt document deleted from Firestore');
      
      // Remove receipt ID from user's receipts array
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        receipts: arrayRemove(receiptId) // Remove receipt ID from user's receipts array
      });
      console.log('✅ Receipt ID removed from user document');
      
      // Update local state
      setReceipts(prev => prev.filter(receipt => receipt.id !== receiptId));
      
      console.log('✅ Receipt completely removed:', receiptId);
    } catch (error) {
      console.error('❌ Error removing receipt from Firestore:', error);
      // Still update local state as fallback
      setReceipts(prev => prev.filter(receipt => receipt.id !== receiptId));
    }
  };

  const handlePropertyUploaded = (property: any) => {
    // Add new property to listings
    setListings(prev => [property, ...prev]);
  };

  const handlePaymentSuccess = async (property: Listing) => {
    // Generate receipt after successful payment
    const receipt = {
      id: `PF-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase(),
      propertyId: property.id || '',
      userAddress: user?.uid || 'anonymous',
      timestamp: Date.now(),
      status: 'pending',
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      property: property
    };
    
    try {
      if (user) {
        // Save to Firestore
        const receiptRef = doc(db, 'receipts', receipt.id);
        await setDoc(receiptRef, {
          ...receipt,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        console.log('✅ Payment receipt saved to Firestore:', receipt.id);
      }
      
      // Save to local state
      setReceipts(prev => [receipt, ...prev]);
      
      // Show confirmation toast
      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 3000);
      
      // Close payment modal
      setShowPaymentModal(false);
      setSelectedListingForPayment(null);
    } catch (error) {
      console.error('❌ Error saving payment receipt to Firestore:', error);
      // Still update local state as fallback
      setReceipts(prev => [receipt, ...prev]);
      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 3000);
      setShowPaymentModal(false);
      setSelectedListingForPayment(null);
    }
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading properties...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex justify-between items-center mb-8">
            <div className="flex-1"></div>
            <div className="flex-1 text-center">
              <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-4">
                PropertyFinder Platform
              </h1>
              <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
                Community-based property matching with voice search and AI-powered recommendations
              </p>
            </div>
            <div className="flex-1 flex justify-end">
              {user ? (
                <button
                  onClick={async () => {
                    if (isSigningOut) return;
                    try {
                      setIsSigningOut(true);
                      setLoadingMessage('Signing you out...');
                      setShowLoadingOverlay(true);
                      
                      // Disconnect wallet first for security
                      try {
                        await disconnectWallet();
                        console.log('🔒 Wallet disconnected during sign out');
                      } catch (walletError) {
                        console.log('Wallet disconnect failed (may not be connected):', walletError);
                      }
                      
                      await signOut();
                      
                      // Keep loading overlay for smooth transition (shorter timeout like Navigation)
                      setTimeout(() => {
                        setShowLoadingOverlay(false);
                        setIsSigningOut(false);
                        router.push('/'); // Redirect to home page like Navigation does
                      }, 1500);
                    } catch (error) {
                      console.error('Error signing out:', error);
                      setShowLoadingOverlay(false);
                      setIsSigningOut(false);
                    }
                  }}
                  disabled={isSigningOut}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-2 border-2 ${
                    isSigningOut 
                      ? 'border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed' 
                      : 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-400 hover:shadow-lg transform hover:-translate-y-0.5'
                  }`}
                >
                  {isSigningOut ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent"></div>
                      <span>Signing Out...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign Out</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => router.push('/auth/signin')}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'browse', label: 'Browse Properties', icon: '🏠' },
                { key: 'upload', label: 'Upload Property', icon: '📤' },
                { key: 'requests', label: 'Manage Requests', icon: '📋' },
                { key: 'mailbox', label: 'Mailbox', icon: '📬' },
                ...(isAdmin ? [{ key: 'admin', label: 'Admin', icon: '⚙️' }] : [])
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'browse' && (
          <div className="space-y-8" onScroll={handleScroll}>
            {/* Fake Persona Disclaimer Banner */}
            <div className="privacy-banner bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl">🛡️</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Privacy-First Property Platform
                  </h3>
                  <p className="text-sm text-gray-700 mb-3">
                    All property owners shown here are <strong>AI-generated personas</strong> to protect privacy and ensure security. 
                    Real contact information is only shared after you <strong>request access</strong> and the owner <strong>approves your request</strong>.
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">🔒 Privacy Protected</span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">✅ Secure Communication</span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">🤝 Real Connections</span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    // Hide banner (you could add state to make this persistent)
                    const banner = document.querySelector('.privacy-banner') as HTMLElement;
                    if (banner) banner.style.display = 'none';
                  }}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* AI Voice Search Controls */}
            <div className="flex justify-center">
              <button
                onClick={() => setShowAIVoiceSearch(!showAIVoiceSearch)}
                className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl text-lg font-semibold"
              >
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI Voice Search (TensorFlow Ready)
              </button>
            </div>

            {/* AI Voice Search Component */}
            {showAIVoiceSearch && (
              <AIVoiceSearch
                onSearch={handleVoiceSearch}
                onLocationSearch={handleLocationSearch}
                onLifestyleSearch={handleLifestyleSearch}
                onAIRecommendations={handleAIRecommendations}
                className="mb-6"
              />
            )}

            {/* Price Sorting Controls */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <span className="text-sm font-medium text-gray-700">Sort by Price:</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSortBy('default')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      sortBy === 'default'
                        ? 'bg-gray-900 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Default
                  </button>
                  <button
                    onClick={() => setSortBy('price-low')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      sortBy === 'price-low'
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Low to High
                  </button>
                  <button
                    onClick={() => setSortBy('price-high')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      sortBy === 'price-high'
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    High to Low
                  </button>
                </div>
              </div>
            </div>
        
            {/* Properties Grid */}
            <div className="flex flex-wrap gap-8 justify-center">
              {listings
                .sort((a, b) => {
                  if (sortBy === 'price-low') {
                    return (a.price || 0) - (b.price || 0);
                  }
                  if (sortBy === 'price-high') {
                    return (b.price || 0) - (a.price || 0);
                  }
                  return 0; // default order
                })
                .map((listing) => (
            <div 
              key={listing.id}
              className={`group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300 w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] ${
                selectedListing?.id === listing.id ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div 
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedListing(listing);
                }}
              >
                <div className="relative h-56 w-full">
                  <Image
                    src={listing.image || '/images/placeholder-property.jpg'}
                    alt={listing.title || 'Property image'}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <div className="flex justify-between items-center">
                      <span className="px-3 py-1 bg-blue-600 rounded-full text-xs font-medium">
                        {listing.roomType ? 
                          (listing.roomType.charAt(0).toUpperCase() + listing.roomType.slice(1)) : 
                          'Room'}
                      </span>
                      <span className="px-2 py-1 bg-black/50 rounded text-sm">
                        ${listing.price?.toLocaleString() || '0'}/mo
                      </span>
                    </div>
                  </div>
                  
                  {/* Property Owner Avatar */}
                  <div className="absolute top-4 right-4">
                    {listing.fakeUser ? (
                      <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-2 shadow-lg">
                        <div className={`w-8 h-8 rounded-full ${listing.fakeUser.avatar} flex items-center justify-center text-white text-sm font-semibold`}>
                          {listing.fakeUser.initials}
                        </div>
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{listing.fakeUser.name}</div>
                          {listing.fakeUser.personality && (
                            <div className="text-xs text-gray-600">{listing.fakeUser.personality}</div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <RoommateAvatar property={{
                        id: listing.id || '',
                        title: listing.title || '',
                        lifestyle: listing.lifestyle,
                        cultural: listing.cultural,
                        roommateRequired: listing.roommateRequired,
                        type: listing.type
                      }} />
                    )}
                  </div>
                  
                  {/* Community Badge */}
                  {listing.type === 'community' && (
                    <div className="absolute top-4 left-4">
                      <span className="px-2 py-1 bg-purple-600 text-white text-xs font-medium rounded-full">
                        Community
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{listing.title || 'Untitled Listing'}</h3>
                  
                  {/* Property Owner Info */}
                  {listing.fakeUser && (
                    <div className="flex items-center space-x-2 mb-3 p-2 bg-gray-50 rounded-lg">
                      <div className={`w-6 h-6 rounded-full ${listing.fakeUser.avatar} flex items-center justify-center text-white text-xs font-semibold`}>
                        {listing.fakeUser.initials}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">Posted by {listing.fakeUser.name}</div>
                        {listing.fakeUser.personality && (
                          <div className="text-xs text-gray-600">{listing.fakeUser.personality} • {listing.fakeUser.interests?.slice(0, 2).join(', ')}</div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-gray-600 mb-3">
                    <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {listing.location || 'Location not specified'}, {listing.state || 'State not specified'}
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {listing.availableFrom || 'Check availability'}
                    </span>
                  </div>
                  
                  {/* AI Image Analysis */}
                  <PropertyImageAnalyzer 
                    property={{
                      id: listing.id || '',
                      title: listing.title || '',
                      image: listing.image || '',
                      images: listing.image ? [listing.image] : [],
                      uploadedBy: listing.uploadedBy
                    }} 
                    className="mb-4"
                    onRemoveProperty={(propertyId) => {
                      // Remove property from listings
                      setListings(prev => prev.filter(l => l.id !== propertyId));
                    }}
                    onBlockUser={(userId) => {
                      // Block user - remove all their properties
                      setListings(prev => prev.filter(l => l.uploadedBy !== userId));
                    }}
                  />

                  {/* Rent Now Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGetInfo(listing);
                    }}
                    className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 mb-4"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span>Get Info - Test Coins</span>
                  </button>

                  {/* Property Request System */}
                  <PropertyRequestSystem
                    property={{
                      id: listing.id || '',
                      title: listing.title || '',
                      uploadedBy: listing.uploadedBy || '',
                      type: listing.type || 'api',
                      fakeUser: listing.fakeUser
                    }}
                    onRequestSent={(request) => {
                      console.log('Request sent:', request);
                      // Show success message or update UI
                    }}
                    onRequestApproved={(request) => {
                      console.log('Request approved:', request);
                      // Enable chat or show success message
                    }}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
              ))}
            </div>
            
            {/* Infinite Scroll Loading Indicator */}
            {isLoadingMore && (
              <div className="flex justify-center py-8">
                <div className="flex items-center space-x-2 text-gray-600">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                  <span className="text-sm">Loading more properties...</span>
                </div>
              </div>
            )}
            
            {/* Load More Button (fallback) */}
            {hasMore && !isLoadingMore && (
              <div className="flex justify-center py-8">
                <button
                  onClick={loadMoreProperties}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Load More Properties
                </button>
              </div>
            )}
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Upload Your Property</h2>
              <p className="text-gray-600 mb-6">Share your property with the community</p>
              <button
                onClick={() => setShowPropertyUpload(true)}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl text-lg font-semibold"
              >
                Start Upload Process
              </button>
            </div>
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div className="space-y-8">
            <PropertyOwnerDashboard />
          </div>
        )}

        {/* Mailbox Tab */}
        {activeTab === 'mailbox' && (
          <div className="space-y-8">
            {/* Debug Info */}
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Debug Info:</h3>
              <p>Receipts count: {receipts.length}</p>
              <p>User ID: {user?.uid || 'No user'}</p>
              <button 
                onClick={loadReceipts}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Reload Receipts
              </button>
            </div>
            
            <ReceiptMailbox
              receipts={receipts}
              onReceiptClick={handleReceiptClick}
              onRemoveReceipt={handleRemoveReceipt}
            />
          </div>
        )}

        {/* Admin Tab - Only visible to admin users */}
        {activeTab === 'admin' && isAdmin && (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Admin Dashboard
              </h2>
              <p className="text-gray-600 mb-4">
                Welcome, Admin! You have full access to property moderation.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Admin Features Available:</strong><br/>
                  1. Click the eye icon on any property<br/>
                  2. Choose "Remove Post" or "Block User"<br/>
                  3. Actions happen immediately<br/>
                  4. Monitor community uploads
                </p>
              </div>
            </div>
          </div>
        )}


        {/* Payment Modal */}
        {selectedListingForPayment && (
          <PaymentModal
            isOpen={showPaymentModal}
            onClose={() => {
              setShowPaymentModal(false);
              setSelectedListingForPayment(null);
            }}
            listing={selectedListingForPayment}
            onPaymentSuccess={() => handlePaymentSuccess(selectedListingForPayment)}
          />
        )}

        {/* Confirmation Toast */}
        {showConfirmation && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">Receipt generated! Check your mailbox.</span>
            </div>
          </div>
        )}

        {/* Crypto Receipt Modal */}
        {selectedPropertyForReceipt && (
          <CryptoReceipt
            property={selectedPropertyForReceipt as any}
            userAddress={user?.uid || 'anonymous'}
            isOpen={showReceipt}
            onClose={() => {
              setShowReceipt(false);
              setSelectedPropertyForReceipt(null);
              setSelectedReceiptForView(null);
            }}
            onSaveToMailbox={handleSaveToMailbox}
            existingReceipt={selectedReceiptForView}
          />
        )}

        {/* Property Upload Modal */}
        <PropertyUpload
          isOpen={showPropertyUpload}
          onClose={() => setShowPropertyUpload(false)}
          onPropertyUploaded={handlePropertyUploaded}
        />

        {/* Loading Overlay */}
        <LoadingOverlay 
          isVisible={showLoadingOverlay} 
          message={loadingMessage}
          type="signout"
        />
      </div>
    </div>
  );
}

export default function ListingsPage() {
  return (
    <ProtectedRoute>
      <ListingsContent />
    </ProtectedRoute>
  );
}