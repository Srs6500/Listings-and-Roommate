'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Search, Filter, Layers, Info, Utensils, Dumbbell, BookOpen, Music, Car, Palette, Mic, MicOff } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  image: string;
  description: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  amenities: string[];
  lifestyle: string[];
  cultural: string[];
}

interface PropertyMapProps {
  properties: Property[];
  selectedProperty?: Property | null;
  onPropertySelect: (property: Property) => void;
  onLocationSearch: (location: string) => void;
  onVoiceSearch?: (query: string) => void;
  className?: string;
}

interface NearbyAmenity {
  name: string;
  type: 'restaurant' | 'gym' | 'library' | 'nightlife' | 'transportation' | 'cultural';
  rating: number;
  distance: number;
  placeId: string;
  coordinates: { lat: number; lng: number };
}

interface MapMarker {
  position: { lat: number; lng: number };
  property: Property;
  isSelected: boolean;
}

export default function PropertyMap({ 
  properties, 
  selectedProperty, 
  onPropertySelect, 
  onLocationSearch,
  onVoiceSearch,
  className = '' 
}: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const amenityMarkersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(properties);
  const [searchQuery, setSearchQuery] = useState('');
  const [nearbyAmenities, setNearbyAmenities] = useState<NearbyAmenity[]>([]);
  const [showAmenities, setShowAmenities] = useState(false);
  const [isVoiceSearching, setIsVoiceSearching] = useState(false);
  const [voiceQuery, setVoiceQuery] = useState('');
  const [selectedAmenityType, setSelectedAmenityType] = useState<string | null>(null);

  // Initialize Google Maps
  useEffect(() => {
    const initializeMap = () => {
      if (typeof window !== 'undefined' && window.google && mapRef.current) {
        const map = new google.maps.Map(mapRef.current, {
          center: { lat: 40.7128, lng: -74.0060 }, // NYC coordinates
          zoom: 12,
          mapTypeId: mapType,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ],
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true
        });

        mapInstanceRef.current = map;
        infoWindowRef.current = new google.maps.InfoWindow();
        placesServiceRef.current = new google.maps.places.PlacesService(map);
        autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
        setIsMapLoaded(true);
      }
    };

    // Check if Google Maps is already loaded
    if (window.google) {
      initializeMap();
    } else {
      // Load Google Maps script if not already loaded
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    }
  }, []);

  // Update map type
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setMapTypeId(mapType);
    }
  }, [mapType]);

  // Create markers for properties
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Create new markers
    filteredProperties.forEach(property => {
      // Generate coordinates if not provided
      const coordinates = property.coordinates || generateCoordinates(property.location);
      
      const marker = new google.maps.Marker({
        position: coordinates,
        map: mapInstanceRef.current,
        title: property.title,
        icon: {
          url: selectedProperty?.id === property.id 
            ? 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="12" fill="#3B82F6" stroke="#FFFFFF" stroke-width="3"/>
                  <circle cx="16" cy="16" r="6" fill="#FFFFFF"/>
                </svg>
              `)
            : 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="8" fill="#EF4444" stroke="#FFFFFF" stroke-width="2"/>
                </svg>
              `),
          scaledSize: new google.maps.Size(32, 32),
          anchor: new google.maps.Point(16, 16)
        }
      });

      // Add click listener
      marker.addListener('click', () => {
        onPropertySelect(property);
        showPropertyInfo(property);
      });

      markersRef.current.push(marker);
    });

    // Fit map to show all markers
    if (filteredProperties.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      filteredProperties.forEach(property => {
        const coordinates = property.coordinates || generateCoordinates(property.location);
        bounds.extend(coordinates);
      });
      mapInstanceRef.current.fitBounds(bounds);
    }
  }, [filteredProperties, selectedProperty, isMapLoaded, onPropertySelect]);

  // Generate coordinates for properties without them
  const generateCoordinates = (location: string) => {
    // Simple coordinate generation based on location
    const baseCoords = { lat: 40.7128, lng: -74.0060 }; // NYC default
    const randomOffset = () => (Math.random() - 0.5) * 0.1; // ±0.05 degrees
    
    return {
      lat: baseCoords.lat + randomOffset(),
      lng: baseCoords.lng + randomOffset()
    };
  };

  const showPropertyInfo = (property: Property) => {
    if (!infoWindowRef.current || !mapInstanceRef.current) return;

    const content = `
      <div class="p-4 max-w-sm">
        <div class="flex items-center space-x-3 mb-3">
          <img src="${property.image}" alt="${property.title}" class="w-16 h-16 object-cover rounded-lg">
          <div>
            <h3 class="font-semibold text-gray-900 text-sm">${property.title}</h3>
            <p class="text-gray-600 text-xs">${property.location}</p>
            <p class="text-blue-600 font-bold text-sm">$${property.price.toLocaleString()}/mo</p>
          </div>
        </div>
        <div class="space-y-2">
          ${property.amenities.slice(0, 3).map(amenity => 
            `<span class="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full mr-1">${amenity}</span>`
          ).join('')}
        </div>
        <button 
          onclick="window.selectProperty('${property.id}')" 
          class="w-full mt-3 px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
        >
          View Details
        </button>
      </div>
    `;

    infoWindowRef.current.setContent(content);
    infoWindowRef.current.open(mapInstanceRef.current, markersRef.current.find(m => 
      m.getPosition()?.lat() === property.coordinates.lat && 
      m.getPosition()?.lng() === property.coordinates.lng
    ));
  };

  // Add global function for property selection
  useEffect(() => {
    (window as any).selectProperty = (propertyId: string) => {
      const property = properties.find(p => p.id === propertyId);
      if (property) {
        onPropertySelect(property);
      }
    };
  }, [properties, onPropertySelect]);

  // Find nearby amenities for selected property
  const findNearbyAmenities = async (property: Property) => {
    if (!placesServiceRef.current || !property.coordinates) return;

    const coordinates = property.coordinates;
    const request = {
      location: new google.maps.LatLng(coordinates.lat, coordinates.lng),
      radius: 1000, // 1km radius
      type: ['restaurant', 'gym', 'library', 'night_club', 'transit_station', 'museum']
    };

    placesServiceRef.current.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        const amenities: NearbyAmenity[] = results.map((place: any) => ({
          name: place.name,
          type: getAmenityType(place.types),
          rating: place.rating || 0,
          distance: calculateDistance(coordinates, place.geometry.location),
          placeId: place.place_id,
          coordinates: {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          }
        }));
        setNearbyAmenities(amenities);
      }
    });
  };

  // Get amenity type from Google Places types
  const getAmenityType = (types: string[]): NearbyAmenity['type'] => {
    if (types.includes('restaurant') || types.includes('food')) return 'restaurant';
    if (types.includes('gym') || types.includes('health')) return 'gym';
    if (types.includes('library') || types.includes('school')) return 'library';
    if (types.includes('night_club') || types.includes('bar')) return 'nightlife';
    if (types.includes('transit_station') || types.includes('subway_station')) return 'transportation';
    if (types.includes('museum') || types.includes('art_gallery')) return 'cultural';
    return 'restaurant';
  };

  // Calculate distance between two points
  const calculateDistance = (point1: { lat: number; lng: number }, point2: google.maps.LatLng) => {
    const R = 6371; // Earth's radius in km
    const dLat = (point2.lat() - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng() - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat() * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c * 1000; // Distance in meters
  };

  // Voice search functionality
  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice search not supported in this browser');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    setIsVoiceSearching(true);
    setVoiceQuery('');

    recognition.onstart = () => {
      console.log('Voice recognition started');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setVoiceQuery(transcript);
      handleVoiceSearch(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Voice recognition error:', event.error);
      setIsVoiceSearching(false);
    };

    recognition.onend = () => {
      setIsVoiceSearching(false);
    };

    recognition.start();
  };

  const handleVoiceSearch = (query: string) => {
    if (onVoiceSearch) {
      onVoiceSearch(query);
    }
    
    // Process location-based voice commands
    if (query.toLowerCase().includes('near') || query.toLowerCase().includes('close to')) {
      // Extract location from voice query
      const locationMatch = query.match(/near\s+(.+)|close\s+to\s+(.+)/i);
      if (locationMatch) {
        const location = locationMatch[1] || locationMatch[2];
        onLocationSearch(location.trim());
      }
    } else {
      // General property search
      handleSearch(query);
    }
  };

  // Show amenities when property is selected
  useEffect(() => {
    if (selectedProperty) {
      findNearbyAmenities(selectedProperty);
    }
  }, [selectedProperty]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onLocationSearch(query);
    
    // Filter properties based on search query
    const filtered = properties.filter(property => 
      property.title.toLowerCase().includes(query.toLowerCase()) ||
      property.location.toLowerCase().includes(query.toLowerCase()) ||
      property.description.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredProperties(filtered);
  };

  const filterByLifestyle = (lifestyle: string) => {
    const filtered = properties.filter(property => 
      property.lifestyle.includes(lifestyle) || 
      property.cultural.includes(lifestyle)
    );
    setFilteredProperties(filtered);
  };

  const resetFilters = () => {
    setFilteredProperties(properties);
    setSearchQuery('');
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 ${className}`}>
      {/* Map Controls */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-blue-600" />
            Property Map
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Filter className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMapType(mapType === 'roadmap' ? 'satellite' : 'roadmap')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Bar with Voice Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by location, property name, or amenities..."
            className="w-full pl-10 pr-20 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={startVoiceSearch}
            disabled={isVoiceSearching}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-blue-500 disabled:opacity-50"
          >
            {isVoiceSearching ? (
              <MicOff className="w-4 h-4 animate-pulse" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Voice Query Display */}
        {voiceQuery && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Voice: </span>
              {voiceQuery}
            </p>
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Filter by Lifestyle</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['Food', 'Fitness', 'Study', 'Nightlife', 'Transportation', 'Cultural'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => filterByLifestyle(filter.toLowerCase())}
                  className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  {filter}
                </button>
              ))}
            </div>
            <button
              onClick={resetFilters}
              className="mt-3 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="relative">
        <div 
          ref={mapRef} 
          className="w-full h-96 rounded-b-xl"
          style={{ minHeight: '400px' }}
        />
        
        {/* Map Loading Overlay */}
        {!isMapLoaded && (
          <div className="absolute inset-0 bg-gray-100 rounded-b-xl flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">Loading map...</p>
            </div>
          </div>
        )}

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Selected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nearby Amenities Section */}
      {selectedProperty && nearbyAmenities.length > 0 && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900 flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-green-600" />
              Nearby Amenities
            </h4>
            <button
              onClick={() => setShowAmenities(!showAmenities)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showAmenities ? 'Hide' : 'Show All'}
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
            {['restaurant', 'gym', 'library', 'nightlife', 'transportation', 'cultural'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedAmenityType(selectedAmenityType === type ? null : type)}
                className={`px-3 py-2 text-xs rounded-lg transition-colors ${
                  selectedAmenityType === type
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type === 'restaurant' && <Utensils className="w-3 h-3 inline mr-1" />}
                {type === 'gym' && <Dumbbell className="w-3 h-3 inline mr-1" />}
                {type === 'library' && <BookOpen className="w-3 h-3 inline mr-1" />}
                {type === 'nightlife' && <Music className="w-3 h-3 inline mr-1" />}
                {type === 'transportation' && <Car className="w-3 h-3 inline mr-1" />}
                {type === 'cultural' && <Palette className="w-3 h-3 inline mr-1" />}
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          <div className="max-h-32 overflow-y-auto">
            {nearbyAmenities
              .filter(amenity => !selectedAmenityType || amenity.type === selectedAmenityType)
              .slice(0, showAmenities ? nearbyAmenities.length : 6)
              .map((amenity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-900">{amenity.name}</span>
                    <span className="text-xs text-gray-500">
                      {Math.round(amenity.distance)}m
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-yellow-600">★</span>
                    <span className="text-xs text-gray-600">{amenity.rating.toFixed(1)}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Property Count */}
      <div className="p-4 bg-gray-50 rounded-b-xl">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{filteredProperties.length} properties found</span>
          <div className="flex items-center space-x-2">
            <Navigation className="w-4 h-4" />
            <span>Click markers for details</span>
          </div>
        </div>
      </div>
    </div>
  );
}
