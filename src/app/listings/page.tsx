'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  onSnapshot,
  writeBatch,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import ProtectedRoute from '@/components/ProtectedRoute';
import PaymentModal from '@/components/PaymentModal';
import Image from 'next/image';

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

const sampleListings: Listing[] = [
  {
    id: '1',
    title: 'Downtown Jersey City Condo',
    location: '100 Greene St, Jersey City, NJ',
    state: 'New Jersey',
    price: 3200,
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    description: 'Modern condo in the heart of Jersey City with stunning Manhattan views. Walking distance to PATH train and local restaurants.',
    availableFrom: '2023-08-01',
    roomType: 'entire',
    savedBy: [],
    stateLaws: stateLaws['New Jersey']
  },
  {
    id: '2',
    title: 'Upper West Side Classic',
    location: '200 W 86th St, New York, NY',
    state: 'New York',
    price: 3200,
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    description: 'Classic pre-war apartment with high ceilings and original details. Close to Central Park and subway lines.',
    availableFrom: '2023-07-20',
    roomType: 'entire',
    savedBy: [],
    stateLaws: stateLaws['New York']
  },
  {
    id: '3',
    title: 'Jersey City High-Rise',
    location: '101 Hudson St, Jersey City, NJ',
    state: 'New Jersey',
    price: 3800,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    description: 'Stunning high-rise apartment with panoramic city views. Building amenities include 24/7 doorman, fitness center, and more.',
    availableFrom: '2023-07-10',
    roomType: 'entire',
    savedBy: [],
    stateLaws: stateLaws['New Jersey']
  },
  {
    id: '4',
    title: 'Hoboken Brownstone',
    location: '500 Garden St, Hoboken, NJ',
    state: 'New Jersey',
    price: 2950,
    image: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    description: 'Charming brownstone apartment with modern updates. Just steps from the PATH train to NYC.',
    availableFrom: '2023-07-25',
    roomType: 'entire',
    savedBy: [],
    stateLaws: stateLaws['New Jersey']
  },
  {
    id: '5',
    title: 'Financial District Studio',
    location: '85 Broad St, New York, NY',
    state: 'New York',
    price: 3100,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    description: 'Modern studio apartment in the heart of the Financial District. Walking distance to Wall Street and South Street Seaport.',
    availableFrom: '2023-08-01',
    roomType: 'entire',
    savedBy: [],
    stateLaws: stateLaws['New York']
  }
];

function ListingsContent() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedListings, setSavedListings] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<{ [key: string]: 'saving' | 'saved' | 'error' | 'unsaved' | undefined }>({});
  const [isClient, setIsClient] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedListingForPayment, setSelectedListingForPayment] = useState<Listing | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // This effect only runs on the client
    setIsClient(true);
    
    // Only use sample listings for now
    const filteredListings = sampleListings.filter(listing => 
      listing.state === 'New York' || listing.state === 'New Jersey'
    );
    
    setListings(filteredListings);
    if (filteredListings.length > 0) {
      setSelectedListing(filteredListings[0]);
    } else {
      setSelectedListing(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!user) {
      setSavedListings([]);
      return;
    }

    const fetchSavedListings = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setSavedListings(userData.savedListings || []);
        }
        const userData = userDoc.data();
        if (userData?.savedListings) {
          setSavedListings(userData.savedListings);
        }
      } catch (error) {
        console.error('Error fetching saved listings:', error);
      }
    };
    
    fetchSavedListings();
    
    // Set up real-time listener for saved listings
    const listingsRef = collection(db, 'listings');
    const unsubscribe = onSnapshot(listingsRef, (snapshot: { 
      docs: QueryDocumentSnapshot<DocumentData>[] 
    }) => {
      if (!user) return;
      
      const userSavedListings = snapshot.docs
        .filter((doc: QueryDocumentSnapshot<DocumentData>) => 
          (doc.data().savedBy as string[] | undefined)?.includes(user.uid)
        )
        .map(doc => doc.id);
        
      setSavedListings(userSavedListings);
    });
    
    return () => unsubscribe();
  }, [user]);

  if (!isClient || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading listings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-4">
            Find Your Perfect Property
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Browse through our curated selection of properties
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <div 
              key={listing.id}
              className={`group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300 ${
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
                </div>
                
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{listing.title || 'Untitled Listing'}</h3>
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
                  
                  <div className="space-y-2">
                    <button 
                      onClick={() => {
                        setSelectedListingForPayment(listing);
                        setShowPaymentModal(true);
                      }}
                      className="w-full py-2 px-4 rounded-lg font-medium transition-colors duration-200 bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 flex items-center justify-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      <span>Rent Now</span>
                    </button>
                    
                    <button 
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 ${
                        savedListings.includes(listing.id || '')
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : saveStatus[listing.id || ''] === 'saving' 
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90'
                      }`}
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (!user) {
                          router.push('/auth/signin');
                          return;
                        }
                        
                        const isSaved = savedListings.includes(listing.id || '');
                        setSaveStatus(prev => ({ ...prev, [listing.id || '']: 'saving' }));
                        
                        try {
                          const listingRef = doc(db, 'listings', listing.id || '');
                          const userRef = doc(db, 'users', user.uid);
                          const batch = writeBatch(db);
                          
                          // First, ensure the listing exists
                          const listingDoc = await getDoc(listingRef);
                          if (!listingDoc.exists()) {
                            // Create the listing if it doesn't exist
                            batch.set(listingRef, {
                              ...listing,
                              savedBy: isSaved ? [] : [user.uid],
                              createdAt: serverTimestamp()
                            });
                          } else {
                            // Update existing listing
                            batch.update(listingRef, {
                              savedBy: isSaved ? arrayRemove(user.uid) : arrayUnion(user.uid)
                            });
                          }
                          
                          // Update user's saved listings
                          const updateData = isSaved
                            ? { savedListings: arrayRemove(listing.id) }
                            : { savedListings: arrayUnion(listing.id) };
                          
                          batch.set(userRef, updateData, { merge: true });
                          
                          await batch.commit();
                          
                          // Update local state
                          setSavedListings(prev => {
                            if (isSaved) {
                              return prev.filter(id => id !== listing.id);
                            } else {
                              return [...prev, listing.id || ''];
                            }
                          });
                          
                          setSaveStatus(prev => ({
                            ...prev,
                            [listing.id || '']: isSaved ? 'unsaved' : 'saved'
                          }));
                          
                          // Reset status after 2 seconds
                          setTimeout(() => {
                            setSaveStatus(prev => ({
                              ...prev,
                              [listing.id || '']: undefined
                            }));
                          }, 2000);
                        } catch (error) {
                          console.error('Error saving listing:', error);
                          setSaveStatus(prev => ({
                            ...prev,
                            [listing.id || '']: 'error'
                          }));
                          
                          // Revert local state on error
                          setSavedListings(prev => {
                            if (isSaved) {
                              return [...prev, listing.id || ''];
                            } else {
                              return prev.filter(id => id !== listing.id);
                            }
                          });
                        }
                      }}
                      disabled={saveStatus[listing.id || ''] === 'saving'}
                    >
                      {saveStatus[listing.id || ''] === 'saving' ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : saveStatus[listing.id || ''] === 'saved' ? (
                        <>
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Saved!
                        </>
                      ) : saveStatus[listing.id || ''] === 'error' ? (
                        'Error!'
                      ) : savedListings.includes(listing.id || '') ? (
                        <>
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                          Saved
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                          Save
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedListing ? (
          <div className="mt-12 bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedListing.title}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="relative h-64 w-full rounded-lg overflow-hidden mb-4">
                    <Image
                      src={selectedListing.image || '/images/placeholder-property.jpg'}
                      alt={selectedListing.title || 'Property image'}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {selectedListing.location}, {selectedListing.state}
                  </div>
                  <div className="flex items-center text-gray-600 mb-4">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Available from: {selectedListing.availableFrom}
                  </div>
                  <p className="text-gray-700 mb-6">{selectedListing.description}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Rental Laws in {selectedListing.state}</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900">Security Deposit</h4>
                      <p className="text-gray-600">{selectedListing.stateLaws?.securityDeposit || 'Not specified'}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Notice Period</h4>
                      <p className="text-gray-600">{selectedListing.stateLaws?.noticePeriod || 'Not specified'}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Eviction Rules</h4>
                      <p className="text-gray-600">{selectedListing.stateLaws?.evictionRules || 'Not specified'}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Rent Control</h4>
                      <p className="text-gray-600">{selectedListing.stateLaws?.rentControl || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Monthly Rent</h4>
                    <p className="text-3xl font-bold text-blue-600">${selectedListing.price?.toLocaleString() || '0'}<span className="text-lg font-normal text-gray-600">/month</span></p>
                  </div>
                  <button 
                    className={`mt-6 w-full py-3 px-6 rounded-lg font-medium transition-colors duration-200 ${
                      savedListings.includes(selectedListing.id || '')
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                    onClick={async () => {
                      if (!user) {
                        router.push('/auth/signin');
                        return;
                      }
                      
                      const isSaved = savedListings.includes(selectedListing.id || '');
                      setSaveStatus(prev => ({ ...prev, [selectedListing.id || '']: 'saving' }));
                      
                      try {
                        // Update local state
                        setSavedListings(prev => 
                          isSaved 
                            ? prev.filter(id => id !== selectedListing.id)
                            : [...prev, selectedListing.id || '']
                        );
                        
                        // Simulate API call
                        await new Promise(resolve => setTimeout(resolve, 500));
                        
                        setSaveStatus(prev => ({
                          ...prev,
                          [selectedListing.id || '']: isSaved ? 'unsaved' : 'saved'
                        }));
                        
                        // Reset status after 2 seconds
                        setTimeout(() => {
                          setSaveStatus(prev => ({
                            ...prev,
                            [selectedListing.id || '']: undefined
                          }));
                        }, 2000);
                        
                      } catch (error) {
                        console.error('Error saving listing:', error);
                        setSaveStatus(prev => ({
                          ...prev,
                          [selectedListing.id || '']: 'error'
                        }));
                        
                        // Reset error status after 2 seconds
                        setTimeout(() => {
                          setSaveStatus(prev => ({
                            ...prev,
                            [selectedListing.id || '']: undefined
                          }));
                        }, 2000);
                      }
                    }}
                    disabled={saveStatus[selectedListing.id || ''] === 'saving'}
                  >
                    {saveStatus[selectedListing.id || ''] === 'saving' ? (
                      'Saving...'
                    ) : saveStatus[selectedListing.id || ''] === 'saved' ? (
                      'Saved!'
                    ) : saveStatus[selectedListing.id || ''] === 'error' ? (
                      'Error!'
                    ) : savedListings.includes(selectedListing.id || '') ? (
                      'Saved'
                    ) : (
                      'Save to Mailbox'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-12 bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-500">Select a listing to view details</p>
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
            onPaymentSuccess={() => {
              setShowPaymentModal(false);
              setSelectedListingForPayment(null);
              // You could add a success notification here
            }}
          />
        )}
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