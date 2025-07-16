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

const testListings = [
  {
    title: 'Cozy Studio in Downtown',
    location: 'New York, NY',
    state: 'New York',
    price: 1800,
    image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
    description: 'Beautiful studio apartment in the heart of the city. Close to all amenities and public transportation.',
    availableFrom: '2023-07-01',
    roomType: 'entire',
  },
  {
    title: 'Private Room in Shared Apartment',
    location: 'Los Angeles, CA',
    state: 'California',
    price: 1200,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    description: 'Spacious private room in a 3-bedroom apartment. Shared kitchen and living area with 2 other roommates.',
    availableFrom: '2023-06-15',
    roomType: 'private',
  },
  {
    title: 'Luxury Apartment with City View',
    location: 'Chicago, IL',
    state: 'Illinois',
    price: 2500,
    image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?w=800',
    description: 'Modern 2-bedroom apartment with stunning city views. Amenities include gym, pool, and 24/7 security.',
    availableFrom: '2023-07-10',
    roomType: 'entire',
  },
  {
    title: 'Shared Room in Quiet Neighborhood',
    location: 'Austin, TX',
    state: 'Texas',
    price: 800,
    image: 'https://images.unsplash.com/photo-1502672260266-37eb5ae3c5c7?w=800',
    description: 'Comfortable shared room in a quiet neighborhood. Perfect for students or young professionals.',
    availableFrom: '2023-06-20',
    roomType: 'shared',
  },
  {
    title: 'Modern Loft in Arts District',
    location: 'Denver, CO',
    state: 'Colorado',
    price: 2000,
    image: 'https://images.unsplash.com/photo-1493804714600-6edb1cd93080?w=800',
    description: 'Stylish loft with high ceilings and industrial design. Walking distance to restaurants and galleries.',
    availableFrom: '2023-07-05',
    roomType: 'entire',
  },
];

async function addListings() {
  try {
    for (const listing of testListings) {
      const docRef = await addDoc(collection(db, 'listings'), listing);
      console.log('Document written with ID: ', docRef.id);
    }
    console.log('All test listings added successfully!');
  } catch (e) {
    console.error('Error adding documents: ', e);
  }
}

addListings().then(() => process.exit(0));
