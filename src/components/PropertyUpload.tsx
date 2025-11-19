'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { generateFakeUser } from '@/lib/fakeData';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
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

      // Create property object for Firestore
      const propertyData = {
        id: propertyId,
        title: formData.title,
        description: formData.description,
        price: formData.price,
        location: formData.location,
        state: formData.state,
        roomType: formData.roomType,
        availableFrom: formData.availableFrom,
        amenities: formData.amenities,
        lifestyle: formData.lifestyle,
        cultural: formData.cultural,
        foodNearby: formData.foodNearby,
        transportation: formData.transportation,
        studySpots: formData.studySpots,
        nightlife: formData.nightlife,
        fitness: formData.fitness,
        uploadedBy: user.uid,
        uploadedAt: serverTimestamp(),
        status: 'approved', // Auto-approve for now, can be changed to 'pending' later
        type: 'community',
        image: formData.images[0] ? URL.createObjectURL(formData.images[0]) : '/images/placeholder-property.jpg',
        fakeUser: formData.fakeUser,
        // Add state laws based on state
        stateLaws: formData.state === 'New York' ? {
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
        }
      };

      // Save to Firestore
      const docRef = await addDoc(collection(db, 'communityListings'), propertyData);
      console.log('Property saved to Firestore with ID:', docRef.id);

      // Create property object for immediate UI update
      const newProperty = {
        ...propertyData,
        id: docRef.id, // Use Firestore document ID
        uploadedAt: Date.now() // Convert serverTimestamp to number for immediate display
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Upload Property</h2>
                <p className="text-sm text-gray-600">Share your property with the community</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center space-x-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full ${
                  i + 1 <= currentStep
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Step {currentStep} of {totalSteps}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Cozy Downtown Apartment"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Rent ($) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="2500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your property, what makes it special..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123 Main St"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Type *
                  </label>
                  <select
                    value={formData.roomType}
                    onChange={(e) => handleInputChange('roomType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="entire">Entire Place</option>
                    <option value="private">Private Room</option>
                    <option value="shared">Shared Room</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available From *
                </label>
                <input
                  type="date"
                  value={formData.availableFrom}
                  onChange={(e) => handleInputChange('availableFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Step 2: Images */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Property Images</h3>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Upload property photos</p>
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
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
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
              <h3 className="text-lg font-semibold text-gray-900">Amenities & Lifestyle</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Amenities
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {amenitiesOptions.map((amenity) => (
                    <button
                      key={amenity}
                      onClick={() => handleArrayToggle('amenities', amenity)}
                      className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                        formData.amenities.includes(amenity)
                          ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                          : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Lifestyle
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {lifestyleOptions.map((lifestyle) => (
                    <button
                      key={lifestyle}
                      onClick={() => handleArrayToggle('lifestyle', lifestyle)}
                      className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                        formData.lifestyle.includes(lifestyle)
                          ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                          : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {lifestyle}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Cultural Scene
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {culturalOptions.map((cultural) => (
                    <button
                      key={cultural}
                      onClick={() => handleArrayToggle('cultural', cultural)}
                      className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                        formData.cultural.includes(cultural)
                          ? 'bg-green-100 text-green-700 border-2 border-green-300'
                          : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
                      }`}
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
              <h3 className="text-lg font-semibold text-gray-900">Nearby Features</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Food & Dining
                  </label>
                  <div className="space-y-2">
                    {['Restaurants', 'Coffee shops', 'Food trucks', 'Grocery stores'].map((item) => (
                      <button
                        key={item}
                        onClick={() => handleArrayToggle('foodNearby', item)}
                        className={`w-full p-2 rounded-lg text-sm font-medium transition-colors text-left ${
                          formData.foodNearby.includes(item)
                            ? 'bg-orange-100 text-orange-700 border-2 border-orange-300'
                            : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Transportation
                  </label>
                  <div className="space-y-2">
                    {['Subway', 'Bus stops', 'Bike lanes', 'Walking distance', 'Parking'].map((item) => (
                      <button
                        key={item}
                        onClick={() => handleArrayToggle('transportation', item)}
                        className={`w-full p-2 rounded-lg text-sm font-medium transition-colors text-left ${
                          formData.transportation.includes(item)
                            ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                            : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Study Spots
                  </label>
                  <div className="space-y-2">
                    {['Library', 'Hotel Lobby', 'Quiet cafes', 'Study rooms', 'Campus nearby'].map((item) => (
                      <button
                        key={item}
                        onClick={() => handleArrayToggle('studySpots', item)}
                        className={`w-full p-2 rounded-lg text-sm font-medium transition-colors text-left ${
                          formData.studySpots.includes(item)
                            ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300'
                            : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
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
                        className={`w-full p-2 rounded-lg text-sm font-medium transition-colors text-left ${
                          formData.nightlife.includes(item) || formData.fitness.includes(item)
                            ? 'bg-pink-100 text-pink-700 border-2 border-pink-300'
                            : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
                        }`}
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
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Property uploaded successfully!</p>
                <p className="text-sm text-green-600">Your property is pending approval.</p>
              </div>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-medium text-red-800">Upload failed</p>
                <p className="text-sm text-red-600">Please try again.</p>
              </div>
            </div>
          )}

          {/* Step 5: Fake User Generation */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Create Property Owner Persona</h3>
              <p className="text-sm text-gray-600">
                Generate a fake persona that will represent this property in the community feed. 
                This helps create a more engaging and secure listing experience.
              </p>
              
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">👤</span>
                  </div>
                  
                  {!generatedFakeUser ? (
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900">Generate Property Owner</h4>
                      <p className="text-sm text-gray-600">
                        Click the button below to generate a unique fake persona for your property.
                      </p>
                      <button
                        onClick={generateNewFakeUser}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                      >
                        Generate Fake Owner
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className={`flex items-center justify-center space-x-4 p-4 rounded-lg border-2 ${
                        fakeUserSelected 
                          ? 'bg-green-50 border-green-300' 
                          : 'bg-white border-gray-200'
                      }`}>
                        <div className={`w-16 h-16 rounded-full ${generatedFakeUser.avatar} flex items-center justify-center text-white text-xl font-bold`}>
                          {generatedFakeUser.initials}
                        </div>
                        <div className="text-left">
                          <h4 className="text-xl font-bold text-gray-900">{generatedFakeUser.name}</h4>
                          <p className="text-sm text-gray-600">{generatedFakeUser.personality}</p>
                          {fakeUserSelected && (
                            <p className="text-sm text-green-600 font-medium">✓ Selected</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h5 className="font-semibold text-gray-900 mb-2">Interests & Traits</h5>
                        <div className="flex flex-wrap gap-2">
                          {generatedFakeUser.interests?.map((interest, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <button
                          onClick={regenerateFakeUser}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
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
                          className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                            fakeUserSelected
                              ? 'bg-green-100 text-green-700 cursor-not-allowed'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {fakeUserSelected ? '✓ Selected' : 'Use This Persona'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 text-blue-600 mt-0.5">ℹ️</div>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Why create a fake persona?</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700">
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
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
          <div className="flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              
              {currentStep < totalSteps ? (
                <button
                  onClick={nextStep}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <div className="flex flex-col items-end space-y-2">
                  {!fakeUserSelected && (
                    <p className="text-sm text-amber-600 font-medium">
                      ⚠️ Please generate and select a fake owner persona first
                    </p>
                  )}
                  <button
                    onClick={handleSubmit}
                    disabled={isUploading || !fakeUserSelected}
                    className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    {isUploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
