'use client';

import { useState, useEffect } from 'react';
import { Camera, Eye, CheckCircle, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { imageRecognitionService, ImageAnalysisResult, PropertyImage } from '@/lib/imageRecognition';
import { useAuth } from '@/context/AuthContext';

interface PropertyImageAnalyzerProps {
  property: {
    id: string;
    title: string;
    image: string;
    images?: string[];
    uploadedBy?: string;
  };
  onAnalysisComplete?: (analysis: ImageAnalysisResult) => void;
  onRemoveProperty?: (propertyId: string) => void;
  onBlockUser?: (userId: string) => void;
  className?: string;
}

export default function PropertyImageAnalyzer({ 
  property, 
  onAnalysisComplete,
  onRemoveProperty,
  onBlockUser,
  className = '' 
}: PropertyImageAnalyzerProps) {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<ImageAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showAdminPopup, setShowAdminPopup] = useState(false);

  useEffect(() => {
    if (property.image || property.images) {
      analyzeImages();
    }
  }, [property]);

  const analyzeImages = async () => {
    setIsAnalyzing(true);
    
    try {
      const images: PropertyImage[] = [];
      
      // Add main image
      if (property.image) {
        images.push({
          url: property.image,
          alt: property.title,
          type: 'interior'
        });
      }
      
      // Add additional images if available
      if (property.images) {
        property.images.forEach((img, index) => {
          images.push({
            url: img,
            alt: `${property.title} - Image ${index + 1}`,
            type: 'interior'
          });
        });
      }

      const result = await imageRecognitionService.analyzePropertyImages(images);
      setAnalysis(result);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
    } catch (error) {
      console.error('Image analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityLabel = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Fair';
    return 'Poor';
  };

  const isAdmin = user?.email === 'admin@loyveil.edu';

  const handleEyeClick = () => {
    if (isAdmin) {
      setShowAdminPopup(true);
    } else {
      setShowDetails(!showDetails);
    }
  };

  const handleRemovePost = () => {
    if (onRemoveProperty) {
      onRemoveProperty(property.id);
    }
    setShowAdminPopup(false);
  };

  const handleBlockUser = () => {
    if (onBlockUser && property.uploadedBy) {
      onBlockUser(property.uploadedBy);
    }
    setShowAdminPopup(false);
  };

  if (isAnalyzing) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Analyzing property images...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <button
          onClick={analyzeImages}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Camera className="w-4 h-4" />
          <span>Analyze Images</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Eye className="w-5 h-5 mr-2 text-blue-600" />
          AI Image Analysis
        </h3>
        <button
          onClick={handleEyeClick}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {isAdmin ? 'Admin Actions' : (showDetails ? 'Hide Details' : 'Show Details')}
        </button>
      </div>

      {/* Quality Score */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Quality Score</span>
          <span className={`text-lg font-bold ${getQualityColor(analysis.quality.score)}`}>
            {analysis.quality.score}/10
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              analysis.quality.score >= 8 ? 'bg-green-500' :
              analysis.quality.score >= 6 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${(analysis.quality.score / 10) * 100}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-1">{getQualityLabel(analysis.quality.score)}</p>
      </div>

      {/* Detected Amenities */}
      {analysis.amenities.detected.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Detected Amenities</h4>
          <div className="flex flex-wrap gap-2">
            {analysis.amenities.detected.map((amenity, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                {amenity}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Room Type */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Detected Room Type</h4>
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
            {analysis.roomType.type}
          </span>
          <span className="text-xs text-gray-600">
            {Math.round(analysis.roomType.confidence * 100)}% confidence
          </span>
        </div>
      </div>

      {/* Detailed Analysis */}
      {showDetails && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          {/* Lifestyle Indicators */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Lifestyle Match</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(analysis.lifestyle).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  {value ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-600 capitalize">{key}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Detected Features</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(analysis.features).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  {value ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quality Factors */}
          {analysis.quality.factors.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Quality Factors</h4>
              <div className="space-y-1">
                {analysis.quality.factors.map((factor, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-sm text-gray-600">{factor}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Admin Popup */}
      {showAdminPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-center">Admin Actions</h3>
            <div className="space-y-3">
              <button
                onClick={handleRemovePost}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
                <span>Remove Post</span>
              </button>
              
              {property.uploadedBy && (
                <button
                  onClick={handleBlockUser}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <AlertCircle className="w-5 h-5" />
                  <span>Block User</span>
                </button>
              )}
              
              <button
                onClick={() => setShowAdminPopup(false)}
                className="w-full px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
