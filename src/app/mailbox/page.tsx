'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { collection, getDocs, query, where, onSnapshot, doc, getDoc, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ProtectedRoute from '@/components/ProtectedRoute';

// Define the Listing interface
interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  state: string;
  image: string;
  roomType?: string;
  savedBy?: string[];
  [key: string]: any; // For any additional properties
}

function MailboxContent() {
  const { user } = useAuth();
  const [savedListings, setSavedListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect only runs on the client
    setIsClient(true);
    
    if (!user) return;

    const fetchSavedListings = async () => {
      try {
        setLoading(true);
        
        // First, get the user's saved listing IDs
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          setSavedListings([]);
          setError(null);
          return;
        }
        
        const userData = userDoc.data();
        const savedListingIds = userData.savedListings || [];
        
        if (savedListingIds.length === 0) {
          setSavedListings([]);
          setError(null);
          return;
        }
        
        // Then fetch the actual listings
        const listingsQuery = query(
          collection(db, 'listings'),
          where('__name__', 'in', savedListingIds)
        );
        
        const querySnapshot = await getDocs(listingsQuery);
        const listingsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Listing[];
        
        setSavedListings(listingsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching saved listings:', err);
        setError('Failed to load saved listings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    // Set up real-time listener for user's saved listings
    const userRef = doc(db, 'users', user.uid);
    
    const unsubscribe = onSnapshot(userRef, (doc: DocumentData) => {
      if (doc.exists()) {
        const userData = doc.data();
        const savedListingIds = userData.savedListings || [];
        
        if (savedListingIds.length === 0) {
          setSavedListings([]);
          return;
        }
        
        // Fetch the actual listings
        const listingsQuery = query(
          collection(db, 'listings'),
          where('__name__', 'in', savedListingIds)
        );
        
        getDocs(listingsQuery).then(querySnapshot => {
          const updatedListings = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Listing[];
          
          setSavedListings(updatedListings);
          setError(null);
        }).catch(error => {
          console.error('Error fetching listings:', error);
          setError('Error loading saved listings.');
        });
      } else {
        setSavedListings([]);
      }
    }, (error: Error) => {
      console.error('Error in real-time listener:', error);
      setError('Error updating saved listings. Please refresh the page.');
    });

    // Initial fetch
    fetchSavedListings();

    // Clean up the listener on component unmount
    return () => unsubscribe();
  }, [user]);

  if (!isClient || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Saved Listings</h1>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your saved listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Saved Listings</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {savedListings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">You haven't saved any listings yet.</p>
          <a 
            href="/" 
            className="text-blue-600 hover:underline"
          >
            Browse listings
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedListings.map((listing) => (
            <div key={listing.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={listing.image}
                alt={listing.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold">{listing.title}</h3>
                <p className="text-gray-600">{listing.location}, {listing.state}</p>
                <p className="text-blue-600 font-bold mt-2">${listing.price}/month</p>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{listing.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}

export default function MailboxPage() {
  return (
    <ProtectedRoute>
      <MailboxContent />
    </ProtectedRoute>
  );
}
