import fs from 'fs';
import path from 'path';

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  description: string;
  images: string[];
  coordinates: [number, number];
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  type: 'api' | 'community';
  uploadedBy?: string;
  status?: 'pending' | 'approved' | 'rejected';
  datePosted: string;
  amenities: string[];
}

// Real NYC/NJ area coordinates
const NYC_COORDINATES = [
  [40.7128, -74.0060], // Manhattan Financial District
  [40.7589, -73.9851], // Times Square
  [40.7505, -73.9934], // Chelsea
  [40.7831, -73.9712], // Upper East Side
  [40.7614, -73.9776], // Midtown
  [40.7282, -74.0776], // Jersey City
  [40.7431, -74.0324], // Hoboken
  [40.6892, -74.0445], // Staten Island
  [40.6782, -73.9442], // Brooklyn Heights
  [40.7282, -73.7949], // Queens
  [40.7614, -73.9776], // Hell's Kitchen
  [40.7505, -73.9934], // West Village
  [40.7831, -73.9712], // Upper West Side
  [40.7282, -74.0776], // Downtown Jersey City
  [40.7431, -74.0324], // Hoboken Waterfront
];

const PROPERTY_TITLES = [
  'Beautiful Studio Apartment',
  'Modern 1BR with City Views',
  'Spacious 2BR Near Campus',
  'Cozy Apartment in Historic Building',
  'Luxury High-Rise Apartment',
  'Charming Brownstone Apartment',
  'Contemporary Loft Space',
  'Renovated Apartment with Amenities',
  'Bright and Airy 1BR',
  'Stylish Studio in Prime Location',
  'Updated Apartment with Hardwood Floors',
  'Modern Living in Heart of City',
  'Quiet Apartment with Garden Access',
  'Newly Renovated 2BR',
  'Penthouse-Style Apartment',
  'Historic Building with Modern Amenities',
  'Corner Apartment with Great Light',
  'Top-Floor Apartment with Views',
  'Garden-Level Apartment',
  'Duplex Apartment with Private Entrance'
];

const LOCATIONS = [
  'Manhattan, NY', 'Brooklyn, NY', 'Queens, NY', 'Jersey City, NJ',
  'Hoboken, NJ', 'Staten Island, NY', 'Bronx, NY', 'Upper East Side, NY',
  'Upper West Side, NY', 'Chelsea, NY', 'West Village, NY', 'East Village, NY',
  'SoHo, NY', 'Tribeca, NY', 'Financial District, NY', 'Midtown, NY',
  'Hell\'s Kitchen, NY', 'Greenwich Village, NY', 'Downtown Brooklyn, NY',
  'Williamsburg, NY', 'Astoria, NY', 'Long Island City, NY'
];

const AMENITIES = [
  'gym', 'laundry', 'parking', 'elevator', 'doorman', 
  'rooftop', 'balcony', 'dishwasher', 'ac', 'heating',
  'hardwood floors', 'granite countertops', 'marble bathroom',
  'walk-in closet', 'high ceilings', 'exposed brick'
];

const COMMUNITY_USERS = [
  'student-user-1', 'professional-user-2', 'artist-user-3',
  'grad-student-4', 'working-professional-5', 'researcher-6',
  'creative-user-7', 'tech-professional-8', 'medical-student-9'
];

// Curated list of working property images
const PROPERTY_IMAGES = [
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
];

function generateRealisticProperties(): Property[] {
  const properties: Property[] = [];
  
  console.log('Generating 100 realistic NYC/NJ properties...');
  
  for (let i = 0; i < 100; i++) {
    const title = PROPERTY_TITLES[Math.floor(Math.random() * PROPERTY_TITLES.length)];
    const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
    const price = Math.floor(Math.random() * 3000) + 1500; // $1500-$4500
    const bedrooms = Math.floor(Math.random() * 3) + 1; // 1-3 bedrooms
    const bathrooms = Math.floor(Math.random() * 2) + 1; // 1-2 bathrooms
    const sqft = Math.floor(Math.random() * 800) + 400; // 400-1200 sqft
    const coordinates = NYC_COORDINATES[Math.floor(Math.random() * NYC_COORDINATES.length)];
    const isCommunity = Math.random() < 0.2; // 20% community, 80% API
    
    const randomAmenities = AMENITIES
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 4) + 2);
    
    const property: Property = {
      id: `property-${i + 1}`,
      title: `${title} - ${bedrooms}BR/${bathrooms}BA`,
      price: price,
      location: location,
      description: `${title} in ${location}. ${bedrooms} bedroom, ${bathrooms} bathroom apartment with ${sqft} sqft. Features include ${randomAmenities.join(', ')}. Perfect for students and professionals.`,
      images: [
        PROPERTY_IMAGES[Math.floor(Math.random() * PROPERTY_IMAGES.length)],
        PROPERTY_IMAGES[Math.floor(Math.random() * PROPERTY_IMAGES.length)],
        PROPERTY_IMAGES[Math.floor(Math.random() * PROPERTY_IMAGES.length)]
      ],
      coordinates: coordinates,
      bedrooms: bedrooms,
      bathrooms: bathrooms,
      sqft: sqft,
      type: isCommunity ? 'community' : 'api',
      uploadedBy: isCommunity ? COMMUNITY_USERS[Math.floor(Math.random() * COMMUNITY_USERS.length)] : undefined,
      status: isCommunity ? (Math.random() < 0.8 ? 'approved' : 'pending') : 'approved',
      datePosted: new Date('2024-01-01').toISOString(),
      amenities: randomAmenities
    };
    
    properties.push(property);
    console.log(`Generated property ${i + 1}/100: ${property.title} - $${property.price}`);
  }
  
  return properties;
}

async function saveProperties(properties: Property[]) {
  const outputPath = path.join(process.cwd(), 'src', 'lib', 'scraped-properties.json');
  
  try {
    await fs.promises.writeFile(outputPath, JSON.stringify(properties, null, 2));
    console.log(`Saved ${properties.length} properties to ${outputPath}`);
  } catch (error) {
    console.error('Error saving properties:', error);
  }
}

async function main() {
  console.log('🚀 Starting property generation...');
  
  const properties = generateRealisticProperties();
  
  if (properties.length > 0) {
    await saveProperties(properties);
    console.log(`✅ Successfully generated ${properties.length} properties!`);
    
    // Show summary
    const apiCount = properties.filter(p => p.type === 'api').length;
    const communityCount = properties.filter(p => p.type === 'community').length;
    
    console.log(`📊 Summary:`);
    console.log(`   - API Listings: ${apiCount}`);
    console.log(`   - Community Listings: ${communityCount}`);
    console.log(`   - Total Properties: ${properties.length}`);
  } else {
    console.log('❌ No properties generated');
  }
}

// Run the scraper
main().catch(console.error);
