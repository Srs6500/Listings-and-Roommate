import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sampleListings = [
  {
    title: 'Downtown Jersey City Condo',
    location: '100 Greene St, Jersey City, NJ',
    state: 'New Jersey',
    price: 1800,
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    description: 'Beautiful condo in the heart of Jersey City, close to all amenities and transportation.',
    availableFrom: '2023-06-01',
    roomType: 'private',
    savedBy: []
  },
  {
    title: 'Manhattan Studio Apartment',
    location: '200 W 50th St, New York, NY',
    state: 'New York',
    price: 2500,
    image: 'https://images.unsplash.com/photo-1502672260266-37c4b5e8f3d3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    description: 'Cozy studio in Midtown Manhattan, perfect for professionals.',
    availableFrom: '2023-05-15',
    roomType: 'entire',
    savedBy: []
  },
  // Add more sample listings as needed
];

async function addListings() {
  try {
    const listingsCollection = collection(db, 'listings');
    
    for (const listing of sampleListings) {
      await addDoc(listingsCollection, listing);
      console.log(`Added listing: ${listing.title}`);
    }
    
    console.log('All listings added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding listings:', error);
    process.exit(1);
  }
}

addListings();
