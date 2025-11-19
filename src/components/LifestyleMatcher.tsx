'use client';

import { useState, useEffect } from 'react';
import { 
  Utensils, 
  Dumbbell, 
  BookOpen, 
  Moon, 
  Car, 
  Coffee, 
  Heart, 
  MapPin, 
  Star,
  Users,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

interface LifestyleProfile {
  id: string;
  name: string;
  preferences: {
    food: string[];
    fitness: string[];
    study: string[];
    nightlife: string[];
    transportation: string[];
    cultural: string[];
  };
  location: string;
  compatibility: number;
  matchReasons: string[];
}

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  amenities: string[];
  lifestyle: string[];
  cultural: string[];
  foodNearby: string[];
  transportation: string[];
  studySpots: string[];
  nightlife: string[];
  fitness: string[];
}

interface LifestyleMatcherProps {
  userProfile: LifestyleProfile;
  properties: Property[];
  onPropertySelect: (property: Property) => void;
  className?: string;
}

const lifestyleCategories = {
  food: {
    icon: Utensils,
    label: 'Food & Dining',
    colors: 'from-orange-400 to-red-500'
  },
  fitness: {
    icon: Dumbbell,
    label: 'Fitness & Health',
    colors: 'from-green-400 to-emerald-500'
  },
  study: {
    icon: BookOpen,
    label: 'Study & Work',
    colors: 'from-blue-400 to-indigo-500'
  },
  nightlife: {
    icon: Moon,
    label: 'Nightlife & Entertainment',
    colors: 'from-purple-400 to-pink-500'
  },
  transportation: {
    icon: Car,
    label: 'Transportation',
    colors: 'from-gray-400 to-slate-500'
  },
  cultural: {
    icon: Heart,
    label: 'Cultural & Lifestyle',
    colors: 'from-rose-400 to-pink-500'
  }
};

export default function LifestyleMatcher({ 
  userProfile, 
  properties, 
  onPropertySelect, 
  className = '' 
}: LifestyleMatcherProps) {
  const [matchedProperties, setMatchedProperties] = useState<Property[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'compatibility' | 'price' | 'location'>('compatibility');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  // Calculate compatibility scores
  useEffect(() => {
    const scoredProperties = properties.map(property => {
      let compatibilityScore = 0;
      let matchReasons: string[] = [];
      let totalChecks = 0;

      // Food compatibility
      const foodMatches = property.foodNearby.filter(food => 
        userProfile.preferences.food.some(pref => 
          food.toLowerCase().includes(pref.toLowerCase())
        )
      ).length;
      if (foodMatches > 0) {
        compatibilityScore += (foodMatches / userProfile.preferences.food.length) * 20;
        matchReasons.push(`${foodMatches} food preferences matched`);
      }
      totalChecks++;

      // Fitness compatibility
      const fitnessMatches = property.fitness.filter(fitness => 
        userProfile.preferences.fitness.some(pref => 
          fitness.toLowerCase().includes(pref.toLowerCase())
        )
      ).length;
      if (fitnessMatches > 0) {
        compatibilityScore += (fitnessMatches / userProfile.preferences.fitness.length) * 20;
        matchReasons.push(`${fitnessMatches} fitness preferences matched`);
      }
      totalChecks++;

      // Study compatibility
      const studyMatches = property.studySpots.filter(study => 
        userProfile.preferences.study.some(pref => 
          study.toLowerCase().includes(pref.toLowerCase())
        )
      ).length;
      if (studyMatches > 0) {
        compatibilityScore += (studyMatches / userProfile.preferences.study.length) * 20;
        matchReasons.push(`${studyMatches} study preferences matched`);
      }
      totalChecks++;

      // Nightlife compatibility
      const nightlifeMatches = property.nightlife.filter(nightlife => 
        userProfile.preferences.nightlife.some(pref => 
          nightlife.toLowerCase().includes(pref.toLowerCase())
        )
      ).length;
      if (nightlifeMatches > 0) {
        compatibilityScore += (nightlifeMatches / userProfile.preferences.nightlife.length) * 15;
        matchReasons.push(`${nightlifeMatches} nightlife preferences matched`);
      }
      totalChecks++;

      // Transportation compatibility
      const transportMatches = property.transportation.filter(transport => 
        userProfile.preferences.transportation.some(pref => 
          transport.toLowerCase().includes(pref.toLowerCase())
        )
      ).length;
      if (transportMatches > 0) {
        compatibilityScore += (transportMatches / userProfile.preferences.transportation.length) * 15;
        matchReasons.push(`${transportMatches} transportation preferences matched`);
      }
      totalChecks++;

      // Cultural compatibility
      const culturalMatches = property.cultural.filter(cultural => 
        userProfile.preferences.cultural.some(pref => 
          cultural.toLowerCase().includes(pref.toLowerCase())
        )
      ).length;
      if (culturalMatches > 0) {
        compatibilityScore += (culturalMatches / userProfile.preferences.cultural.length) * 10;
        matchReasons.push(`${culturalMatches} cultural preferences matched`);
      }
      totalChecks++;

      return {
        ...property,
        compatibility: Math.round(compatibilityScore),
        matchReasons
      };
    });

    // Sort by selected criteria
    const sorted = scoredProperties.sort((a, b) => {
      switch (sortBy) {
        case 'compatibility':
          return b.compatibility - a.compatibility;
        case 'price':
          return a.price - b.price;
        case 'location':
          return a.location.localeCompare(b.location);
        default:
          return b.compatibility - a.compatibility;
      }
    });

    setMatchedProperties(sorted);
  }, [userProfile, properties, sortBy]);

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getCompatibilityLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Poor Match';
  };

  const filteredProperties = selectedCategory === 'all' 
    ? matchedProperties 
    : matchedProperties.filter(property => 
        property.lifestyle.includes(selectedCategory) || 
        property.cultural.includes(selectedCategory)
      );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* User Profile Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-blue-600" />
          Your Lifestyle Profile
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(lifestyleCategories).map(([key, category]) => {
            const Icon = category.icon;
            const preferences = userProfile.preferences[key as keyof typeof userProfile.preferences];
            return (
              <div key={key} className="flex items-center space-x-2">
                <div className={`w-8 h-8 bg-gradient-to-r ${category.colors} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{category.label}</p>
                  <p className="text-xs text-gray-600">{preferences.length} preferences</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Categories
            </button>
            {Object.entries(lifestyleCategories).map(([key, category]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="compatibility">Compatibility</option>
              <option value="price">Price</option>
              <option value="location">Location</option>
            </select>
          </div>
        </div>
      </div>

      {/* Matched Properties */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Matched Properties ({filteredProperties.length})
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <TrendingUp className="w-4 h-4" />
            <span>Sorted by {sortBy}</span>
          </div>
        </div>

        {filteredProperties.map((property) => (
          <div
            key={property.id}
            className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">{property.title}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{property.location}</span>
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      ${property.price.toLocaleString()}/mo
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getCompatibilityColor(property.compatibility)}`}>
                    {property.compatibility}% Match
                  </div>
                  <button
                    onClick={() => setShowDetails(showDetails === property.id ? null : property.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Compatibility Reasons */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>{getCompatibilityLabel(property.compatibility)}</strong> - {property.matchReasons.join(', ')}
                </p>
              </div>

              {/* Property Details */}
              {showDetails === property.id && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Amenities</h5>
                      <div className="flex flex-wrap gap-1">
                        {property.amenities.slice(0, 5).map((amenity, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Nearby Features</h5>
                      <div className="space-y-1 text-sm text-gray-600">
                        {property.foodNearby.slice(0, 3).map((food, index) => (
                          <div key={index} className="flex items-center space-x-1">
                            <Utensils className="w-3 h-3" />
                            <span>{food}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-600">
                    {property.matchReasons.length} lifestyle matches
                  </span>
                </div>
                <button
                  onClick={() => onPropertySelect(property)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
            <p className="text-gray-600">
              Try adjusting your preferences or expanding your search criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
