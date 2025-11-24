'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
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
  fakeUser?: {
    name: string;
    avatar: string;
    initials: string;
    personality?: string;
    interests?: string[];
  };
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
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get user's saved listing IDs from Supabase
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('saved_listings')
          .eq('id', user.id)
          .single();
        
        if (userError) {
          console.error('Error fetching user data:', userError);
          setSavedListings([]);
          setError(null);
          setLoading(false);
          return;
        }
        
        const savedListingIds = userData?.saved_listings || [];
        
        if (savedListingIds.length === 0) {
          setSavedListings([]);
          setError(null);
          setLoading(false);
          return;
        }
        
        // Fetch the actual listings from community_listings table
        const { data: listingsData, error: listingsError } = await supabase
          .from('community_listings')
          .select('*')
          .in('id', savedListingIds);
        
        if (listingsError) {
          throw listingsError;
        }
        
        if (listingsData) {
          // Transform Supabase data to Listing format
          const transformedListings = listingsData.map((listing: any) => ({
            id: listing.id,
            title: listing.title,
            description: listing.description,
            price: listing.price,
            location: listing.location,
            state: listing.state,
            image: listing.image,
            roomType: listing.room_type,
            fakeUser: listing.fake_user,
            ...listing
          })) as Listing[];
          
          setSavedListings(transformedListings);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching saved listings:', err);
        setError('Failed to load saved listings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchSavedListings();

    // Set up real-time subscription for user's saved listings
    const subscription = supabase
      .channel('user_saved_listings')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'users',
          filter: `id=eq.${user?.id}`
        },
        () => {
          fetchSavedListings(); // Reload when user's saved_listings changes
        }
      )
      .subscribe();

    // Clean up the subscription on component unmount
    return () => {
      subscription.unsubscribe();
    };
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
