'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { generateFakeUser } from '@/lib/fakeData';
import { supabase } from '@/lib/supabase';
import { 
  Upload, 
  MapPin, 
  DollarSign, 
  Home, 
  Camera, 
  X, 
  Plus,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface PropertyUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onPropertyUploaded: (property: any) => void;
}

interface PropertyFormData {
  title: string;
  description: string;
  price: number;
  location: string;
  state: string;
  roomType: 'entire' | 'private' | 'shared';
  availableFrom: string;
  images: File[];
  amenities: string[];
  lifestyle: string[];
  cultural: string[];
  foodNearby: string[];
  transportation: string[];
  studySpots: string[];
  nightlife: string[];
  fitness: string[];
  fakeUser?: {
    name: string;
    avatar: string;
    initials: string;
    personality?: string;
    interests?: string[];
  };
}

const defaultFormData: PropertyFormData = {
  title: '',
  description: '',
  price: 0,
  location: '',
  state: '',
  roomType: 'entire',
  availableFrom: '',
  images: [],
  amenities: [],
  lifestyle: [],
  cultural: [],
  foodNearby: [],
  transportation: [],
  studySpots: [],
  nightlife: [],
  fitness: []
};

const amenitiesOptions = [
  'Gym', 'Pool', 'Doorman', 'Laundry', 'Parking', 'Balcony', 
  'Dishwasher', 'AC', 'Heating', 'WiFi', 'Pet Friendly'
];

const lifestyleOptions = [
  'urban', 'suburban', 'quiet', 'lively', 'professional', 'student', 'family-friendly'
];

const culturalOptions = [
  'diverse', 'traditional', 'international', 'artsy', 'tech-focused', 'academic'
];

export default function PropertyUpload({ isOpen, onClose, onPropertyUploaded }: PropertyUploadProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<PropertyFormData>(defaultFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [generatedFakeUser, setGeneratedFakeUser] = useState<any>(null);
  const [fakeUserSelected, setFakeUserSelected] = useState(false);

  const totalSteps = 5;

  const handleInputChange = (field: keyof PropertyFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ 
      ...prev, 
      images: prev.images.filter((_, i) => i !== index) 
    }));
  };

  const handleArrayToggle = (field: keyof PropertyFormData, value: string) => {
    setFormData(prev => {
      const currentArray = prev[field] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [field]: newArray };
    });
  };

  const generateNewFakeUser = () => {
    const fakeUser = generateFakeUser(`upload-${Date.now()}-${Math.random()}`);
    setGeneratedFakeUser(fakeUser);
    setFakeUserSelected(false);
  };

  const regenerateFakeUser = () => {
    generateNewFakeUser();
  };

  const handleSubmit = async () => {
    if (!user) return;

    setIsUploading(true);
    setUploadStatus('idle');

    try {
      // Generate property ID
      const propertyId = `community-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Prepare property data for Supabase
      const stateLaws = formData.state === 'New York' ? {
        securityDeposit: 'No statutory limit, but typically 1 month\'s rent.',
        noticePeriod: '30 days for month-to-month tenancies, 60-90 days for rent-stabilized units.',
        evictionRules: 'Strict eviction process requiring court order. Eviction moratoriums may apply in some cases.',
        rentControl: 'Rent stabilization applies to buildings built before 1974 with 6+ units in NYC and some other cities.',
        securityDepositLimit: 'No statutory limit, but typically 1 month\'s rent.'
      } : {
        securityDeposit: 'Maximum of 1.5 times the monthly rent.',
        noticePeriod: '1 month for month-to-month tenancies, 3 months for eviction after 1+ year of tenancy.',
        evictionRules: 'Strict eviction process with required court order. Good cause eviction laws in some cities.',
        rentControl: 'Some cities like Jersey City and Newark have rent control ordinances.',
        securityDepositLimit: '1.5 times the monthly rent'
      };

      const propertyData = {
        id: propertyId,
        title: formData.title,
        description: formData.description,
        price: formData.price,
        location: formData.location,
        state: formData.state,
        room_type: formData.roomType,
        available_from: formData.availableFrom,
        amenities: formData.amenities,
        lifestyle: formData.lifestyle,
        cultural: formData.cultural,
        food_nearby: formData.foodNearby,
        transportation: formData.transportation,
        study_spots: formData.studySpots,
        nightlife: formData.nightlife,
        fitness: formData.fitness,
        uploaded_by: user.id,
        status: 'approved', // Auto-approve for now, can be changed to 'pending' later
        type: 'community',
        image: formData.images[0] ? URL.createObjectURL(formData.images[0]) : '/images/placeholder-property.jpg',
        fake_user: formData.fakeUser,
        state_laws: stateLaws
      };

      // Save to Supabase
      const { data, error } = await supabase
        .from('community_listings')
        .insert(propertyData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log('Property saved to Supabase with ID:', data.id);

      // Create property object for immediate UI update (transform back to frontend format)
      const newProperty = {
        id: data.id,
        title: data.title,
        description: data.description,
        price: data.price,
        location: data.location,
        state: data.state,
        roomType: data.room_type,
        availableFrom: data.available_from,
        amenities: data.amenities,
        lifestyle: data.lifestyle,
        cultural: data.cultural,
        foodNearby: data.food_nearby,
        transportation: data.transportation,
        studySpots: data.study_spots,
        nightlife: data.nightlife,
        fitness: data.fitness,
        uploadedBy: data.uploaded_by,
        uploadedAt: Date.now(),
        status: data.status,
        type: data.type,
        image: data.image,
        fakeUser: data.fake_user,
        stateLaws: data.state_laws
      };

      // Callback to parent for immediate UI update
      onPropertyUploaded(newProperty);

      setUploadStatus('success');
      setTimeout(() => {
        onClose();
        setFormData(defaultFormData);
        setCurrentStep(1);
        setUploadStatus('idle');
        setGeneratedFakeUser(null);
        setFakeUserSelected(false);
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(15, 15, 15, 0.8)' }}
    >
      <div 
        className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--surface-primary)' }}
      >
        {/* Header */}
        <div 
          className="sticky top-0 border-b p-6 rounded-t-2xl"
          style={{ 
            backgroundColor: 'var(--surface-primary)', 
            borderBottomColor: 'var(--border-default)'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              >
                <Home className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Upload Property</h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Share your property with the community</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center space-x-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className="h-2 flex-1 rounded-full"
                style={{
                  backgroundColor: i + 1 <= currentStep
                    ? 'var(--accent-primary)'
                    : 'var(--surface-secondary)'
                }}
              />
            ))}
          </div>
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
            Step {currentStep} of {totalSteps}
          </p>
        </div>

        {/* Content */}
        <div className="p-6" style={{ color: 'var(--text-primary)' }}>
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Property Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-all"
                    style={{
                      backgroundColor: 'var(--surface-secondary)',
                      borderColor: 'var(--border-default)',
                      color: 'var(--text-primary)'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-primary)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-light)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-default)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    placeholder="e.g., Cozy Downtown Apartment"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Monthly Rent ($) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-all"
                    style={{
                      backgroundColor: 'var(--surface-secondary)',
                      borderColor: 'var(--border-default)',
                      color: 'var(--text-primary)'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-primary)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-light)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-default)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    placeholder="2500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-all"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    borderColor: 'var(--border-default)',
                    color: 'var(--text-primary)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-light)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-default)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  placeholder="Describe your property, what makes it special..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Location *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-all"
                    style={{
                      backgroundColor: 'var(--surface-secondary)',
                      borderColor: 'var(--border-default)',
                      color: 'var(--text-primary)'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-primary)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-light)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-default)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    placeholder="123 Main St"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    State *
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-all"
                    style={{
                      backgroundColor: 'var(--surface-secondary)',
                      borderColor: 'var(--border-default)',
                      color: 'var(--text-primary)'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-primary)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-light)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-default)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <option value="">Select State</option>
                    <option value="New York">New York</option>
                    <option value="New Jersey">New Jersey</option>
                    <option value="California">California</option>
                    <option value="Texas">Texas</option>
                    <option value="Florida">Florida</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Room Type *
                  </label>
                  <select
                    value={formData.roomType}
                    onChange={(e) => handleInputChange('roomType', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-all"
                    style={{
                      backgroundColor: 'var(--surface-secondary)',
                      borderColor: 'var(--border-default)',
                      color: 'var(--text-primary)'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-primary)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-light)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-default)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <option value="entire">Entire Place</option>
                    <option value="private">Private Room</option>
                    <option value="shared">Shared Room</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Available From *
                </label>
                <input
                  type="date"
                  value={formData.availableFrom}
                  onChange={(e) => handleInputChange('availableFrom', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-all"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    borderColor: 'var(--border-default)',
                    color: 'var(--text-primary)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-light)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-default)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>
          )}

          {/* Step 2: Images */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Property Images</h3>
              
              <div 
                className="border-2 border-dashed rounded-lg p-6 text-center"
                style={{ borderColor: 'var(--border-default)' }}
              >
                <Camera className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Upload property photos</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="inline-flex items-center px-4 py-2 rounded-lg cursor-pointer transition-colors"
                  style={{ 
                    backgroundColor: 'var(--accent-primary)', 
                    color: 'var(--text-primary)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Images
                </label>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Property ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Amenities & Lifestyle */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Amenities & Lifestyle</h3>
              
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                  Amenities
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {amenitiesOptions.map((amenity) => (
                    <button
                      key={amenity}
                      onClick={() => handleArrayToggle('amenities', amenity)}
                      className="p-2 rounded-lg text-sm font-medium transition-colors border-2"
                      style={{
                        backgroundColor: formData.amenities.includes(amenity)
                          ? 'var(--accent-light)'
                          : 'var(--surface-secondary)',
                        borderColor: formData.amenities.includes(amenity)
                          ? 'var(--accent-primary)'
                          : 'var(--border-default)',
                        color: formData.amenities.includes(amenity)
                          ? 'var(--accent-primary)'
                          : 'var(--text-secondary)'
                      }}
                      onMouseEnter={(e) => {
                        if (!formData.amenities.includes(amenity)) {
                          e.currentTarget.style.backgroundColor = 'var(--surface-elevated)';
                          e.currentTarget.style.color = 'var(--text-primary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!formData.amenities.includes(amenity)) {
                          e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                          e.currentTarget.style.color = 'var(--text-secondary)';
                        }
                      }}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                  Lifestyle
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {lifestyleOptions.map((lifestyle) => (
                    <button
                      key={lifestyle}
                      onClick={() => handleArrayToggle('lifestyle', lifestyle)}
                      className="p-2 rounded-lg text-sm font-medium transition-colors border-2"
                      style={{
                        backgroundColor: formData.lifestyle.includes(lifestyle)
                          ? 'var(--accent-light)'
                          : 'var(--surface-secondary)',
                        borderColor: formData.lifestyle.includes(lifestyle)
                          ? 'var(--accent-primary)'
                          : 'var(--border-default)',
                        color: formData.lifestyle.includes(lifestyle)
                          ? 'var(--accent-primary)'
                          : 'var(--text-secondary)'
                      }}
                      onMouseEnter={(e) => {
                        if (!formData.lifestyle.includes(lifestyle)) {
                          e.currentTarget.style.backgroundColor = 'var(--surface-elevated)';
                          e.currentTarget.style.color = 'var(--text-primary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!formData.lifestyle.includes(lifestyle)) {
                          e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                          e.currentTarget.style.color = 'var(--text-secondary)';
                        }
                      }}
                    >
                      {lifestyle}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                  Cultural Scene
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {culturalOptions.map((cultural) => (
                    <button
                      key={cultural}
                      onClick={() => handleArrayToggle('cultural', cultural)}
                      className="p-2 rounded-lg text-sm font-medium transition-colors border-2"
                      style={{
                        backgroundColor: formData.cultural.includes(cultural)
                          ? 'var(--accent-light)'
                          : 'var(--surface-secondary)',
                        borderColor: formData.cultural.includes(cultural)
                          ? 'var(--accent-primary)'
                          : 'var(--border-default)',
                        color: formData.cultural.includes(cultural)
                          ? 'var(--accent-primary)'
                          : 'var(--text-secondary)'
                      }}
                      onMouseEnter={(e) => {
                        if (!formData.cultural.includes(cultural)) {
                          e.currentTarget.style.backgroundColor = 'var(--surface-elevated)';
                          e.currentTarget.style.color = 'var(--text-primary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!formData.cultural.includes(cultural)) {
                          e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                          e.currentTarget.style.color = 'var(--text-secondary)';
                        }
                      }}
                    >
                      {cultural}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Nearby Features */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Nearby Features</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                    Food & Dining
                  </label>
                  <div className="space-y-2">
                    {['Restaurants', 'Coffee shops', 'Food trucks', 'Grocery stores'].map((item) => (
                      <button
                        key={item}
                        onClick={() => handleArrayToggle('foodNearby', item)}
                        className="w-full p-2 rounded-lg text-sm font-medium transition-colors text-left border-2"
                        style={{
                          backgroundColor: formData.foodNearby.includes(item)
                            ? 'var(--accent-light)'
                            : 'var(--surface-secondary)',
                          borderColor: formData.foodNearby.includes(item)
                            ? 'var(--accent-primary)'
                            : 'var(--border-default)',
                          color: formData.foodNearby.includes(item)
                            ? 'var(--accent-primary)'
                            : 'var(--text-secondary)'
                        }}
                        onMouseEnter={(e) => {
                          if (!formData.foodNearby.includes(item)) {
                            e.currentTarget.style.backgroundColor = 'var(--surface-elevated)';
                            e.currentTarget.style.color = 'var(--text-primary)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!formData.foodNearby.includes(item)) {
                            e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                          }
                        }}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                    Transportation
                  </label>
                  <div className="space-y-2">
                    {['Subway', 'Bus stops', 'Bike lanes', 'Walking distance', 'Parking'].map((item) => (
                      <button
                        key={item}
                        onClick={() => handleArrayToggle('transportation', item)}
                        className="w-full p-2 rounded-lg text-sm font-medium transition-colors text-left border-2"
                        style={{
                          backgroundColor: formData.transportation.includes(item)
                            ? 'var(--accent-light)'
                            : 'var(--surface-secondary)',
                          borderColor: formData.transportation.includes(item)
                            ? 'var(--accent-primary)'
                            : 'var(--border-default)',
                          color: formData.transportation.includes(item)
                            ? 'var(--accent-primary)'
                            : 'var(--text-secondary)'
                        }}
                        onMouseEnter={(e) => {
                          if (!formData.transportation.includes(item)) {
                            e.currentTarget.style.backgroundColor = 'var(--surface-elevated)';
                            e.currentTarget.style.color = 'var(--text-primary)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!formData.transportation.includes(item)) {
                            e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                          }
                        }}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                    Study Spots
                  </label>
                  <div className="space-y-2">
                    {['Library', 'Hotel Lobby', 'Quiet cafes', 'Study rooms', 'Campus nearby'].map((item) => (
                      <button
                        key={item}
                        onClick={() => handleArrayToggle('studySpots', item)}
                        className="w-full p-2 rounded-lg text-sm font-medium transition-colors text-left border-2"
                        style={{
                          backgroundColor: formData.studySpots.includes(item)
                            ? 'var(--accent-light)'
                            : 'var(--surface-secondary)',
                          borderColor: formData.studySpots.includes(item)
                            ? 'var(--accent-primary)'
                            : 'var(--border-default)',
                          color: formData.studySpots.includes(item)
                            ? 'var(--accent-primary)'
                            : 'var(--text-secondary)'
                        }}
                        onMouseEnter={(e) => {
                          if (!formData.studySpots.includes(item)) {
                            e.currentTarget.style.backgroundColor = 'var(--surface-elevated)';
                            e.currentTarget.style.color = 'var(--text-primary)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!formData.studySpots.includes(item)) {
                            e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                          }
                        }}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                    Nightlife & Fitness
                  </label>
                  <div className="space-y-2">
                    {['Clubs', 'Tennis court', 'Yoga studios', 'Parks'].map((item) => (
                      <button
                        key={item}
                        onClick={() => {
                          if (['Clubs'].includes(item)) {
                            handleArrayToggle('nightlife', item);
                          } else {
                            handleArrayToggle('fitness', item);
                          }
                        }}
                        className="w-full p-2 rounded-lg text-sm font-medium transition-colors text-left border-2"
                        style={{
                          backgroundColor: formData.nightlife.includes(item) || formData.fitness.includes(item)
                            ? 'var(--accent-light)'
                            : 'var(--surface-secondary)',
                          borderColor: formData.nightlife.includes(item) || formData.fitness.includes(item)
                            ? 'var(--accent-primary)'
                            : 'var(--border-default)',
                          color: formData.nightlife.includes(item) || formData.fitness.includes(item)
                            ? 'var(--accent-primary)'
                            : 'var(--text-secondary)'
                        }}
                        onMouseEnter={(e) => {
                          if (!formData.nightlife.includes(item) && !formData.fitness.includes(item)) {
                            e.currentTarget.style.backgroundColor = 'var(--surface-elevated)';
                            e.currentTarget.style.color = 'var(--text-primary)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!formData.nightlife.includes(item) && !formData.fitness.includes(item)) {
                            e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                          }
                        }}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upload Status */}
          {uploadStatus === 'success' && (
            <div 
              className="border rounded-lg p-4 flex items-center space-x-3"
              style={{ 
                backgroundColor: 'rgba(34, 197, 94, 0.1)', 
                borderColor: 'var(--success)'
              }}
            >
              <CheckCircle className="w-5 h-5" style={{ color: 'var(--success)' }} />
              <div>
                <p className="font-medium" style={{ color: 'var(--success)' }}>Property uploaded successfully!</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Your property is pending approval.</p>
              </div>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div 
              className="border rounded-lg p-4 flex items-center space-x-3"
              style={{ 
                backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                borderColor: 'var(--error)'
              }}
            >
              <AlertCircle className="w-5 h-5" style={{ color: 'var(--error)' }} />
              <div>
                <p className="font-medium" style={{ color: 'var(--error)' }}>Upload failed</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Please try again.</p>
              </div>
            </div>
          )}

          {/* Step 5: Fake User Generation */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Create Property Owner Persona</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Generate a fake persona that will represent this property in the community feed. 
                This helps create a more engaging and secure listing experience.
              </p>
              
              <div 
                className="rounded-lg p-6 border"
                style={{ 
                  backgroundColor: 'var(--accent-light)', 
                  borderColor: 'var(--border-default)'
                }}
              >
                <div className="text-center">
                  <div 
                    className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ backgroundColor: 'var(--accent-primary)' }}
                  >
                    <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>👤</span>
                  </div>
                  
                  {!generatedFakeUser ? (
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Generate Property Owner</h4>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Click the button below to generate a unique fake persona for your property.
                      </p>
                      <button
                        onClick={generateNewFakeUser}
                        className="px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                        style={{ 
                          backgroundColor: 'var(--accent-primary)', 
                          color: 'var(--text-primary)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
                      >
                        Generate Fake Owner
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div 
                        className="flex items-center justify-center space-x-4 p-4 rounded-lg border-2"
                        style={{
                          backgroundColor: fakeUserSelected 
                            ? 'rgba(34, 197, 94, 0.1)' 
                            : 'var(--surface-secondary)',
                          borderColor: fakeUserSelected 
                            ? 'var(--success)' 
                            : 'var(--border-default)'
                        }}
                      >
                        <div className={`w-16 h-16 rounded-full ${generatedFakeUser.avatar} flex items-center justify-center text-white text-xl font-bold`}>
                          {generatedFakeUser.initials}
                        </div>
                        <div className="text-left">
                          <h4 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{generatedFakeUser.name}</h4>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{generatedFakeUser.personality}</p>
                          {fakeUserSelected && (
                            <p className="text-sm font-medium" style={{ color: 'var(--success)' }}>✓ Selected</p>
                          )}
                        </div>
                      </div>
                      
                      <div 
                        className="rounded-lg p-4 border"
                        style={{ 
                          backgroundColor: 'var(--surface-secondary)', 
                          borderColor: 'var(--border-default)'
                        }}
                      >
                        <h5 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Interests & Traits</h5>
                        <div className="flex flex-wrap gap-2">
                          {generatedFakeUser.interests?.map((interest, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 rounded-full text-sm font-medium"
                              style={{ 
                                backgroundColor: 'var(--accent-light)', 
                                color: 'var(--accent-primary)'
                              }}
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <button
                          onClick={regenerateFakeUser}
                          className="px-4 py-2 rounded-lg transition-colors font-medium"
                          style={{ 
                            backgroundColor: 'var(--surface-secondary)', 
                            color: 'var(--text-secondary)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--surface-elevated)';
                            e.currentTarget.style.color = 'var(--text-primary)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                          }}
                        >
                          Generate Another
                        </button>
                        <button
                          onClick={() => {
                            setFormData(prev => ({ ...prev, fakeUser: generatedFakeUser }));
                            setFakeUserSelected(true);
                            console.log('Fake user selected:', generatedFakeUser);
                          }}
                          disabled={fakeUserSelected}
                          className="px-4 py-2 rounded-lg transition-colors font-medium"
                          style={{
                            backgroundColor: fakeUserSelected
                              ? 'var(--surface-primary)'
                              : 'var(--success)',
                            color: fakeUserSelected
                              ? 'var(--text-muted)'
                              : 'var(--text-primary)',
                            cursor: fakeUserSelected ? 'not-allowed' : 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            if (!fakeUserSelected) {
                              e.currentTarget.style.opacity = '0.9';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!fakeUserSelected) {
                              e.currentTarget.style.opacity = '1';
                            }
                          }}
                        >
                          {fakeUserSelected ? '✓ Selected' : 'Use This Persona'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div 
                className="border rounded-lg p-4"
                style={{ 
                  backgroundColor: 'var(--accent-light)', 
                  borderColor: 'var(--border-default)'
                }}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 mt-0.5" style={{ color: 'var(--accent-primary)' }}>ℹ️</div>
                  <div className="text-sm" style={{ color: 'var(--accent-primary)' }}>
                    <p className="font-medium mb-1">Why create a fake persona?</p>
                    <ul className="list-disc list-inside space-y-1" style={{ color: 'var(--text-secondary)' }}>
                      <li>Protects your privacy while maintaining community engagement</li>
                      <li>Creates a more authentic and secure listing experience</li>
                      <li>Allows potential renters to connect with a "property owner" persona</li>
                      <li>Maintains the social aspect of the platform safely</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div 
          className="sticky bottom-0 border-t p-6 rounded-b-2xl"
          style={{ 
            backgroundColor: 'var(--surface-primary)', 
            borderTopColor: 'var(--border-default)'
          }}
        >
          <div className="flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ color: currentStep === 1 ? 'var(--text-muted)' : 'var(--text-secondary)' }}
              onMouseEnter={(e) => {
                if (currentStep !== 1) {
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentStep !== 1) {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              Previous
            </button>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                Cancel
              </button>
              
              {currentStep < totalSteps ? (
                <button
                  onClick={nextStep}
                  className="px-6 py-2 rounded-lg transition-colors"
                  style={{ 
                    backgroundColor: 'var(--accent-primary)', 
                    color: 'var(--text-primary)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
                >
                  Next
                </button>
              ) : (
                <div className="flex flex-col items-end space-y-2">
                  {!fakeUserSelected && (
                    <p className="text-sm font-medium" style={{ color: 'var(--warning)' }}>
                      ⚠️ Please generate and select a fake owner persona first
                    </p>
                  )}
                  <button
                    onClick={handleSubmit}
                    disabled={isUploading || !fakeUserSelected}
                    className="px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    style={{ 
                      backgroundColor: isUploading || !fakeUserSelected 
                        ? 'var(--surface-primary)' 
                        : 'var(--success)',
                      color: isUploading || !fakeUserSelected 
                        ? 'var(--text-muted)' 
                        : 'var(--text-primary)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isUploading && fakeUserSelected) {
                        e.currentTarget.style.opacity = '0.9';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isUploading && fakeUserSelected) {
                        e.currentTarget.style.opacity = '1';
                      }
                    }}
                  >
                    {isUploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--text-primary)' }} />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Upload Property</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
