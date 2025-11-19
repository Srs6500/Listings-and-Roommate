'use client';

import { useState, useEffect } from 'react';
import { Users, UserPlus, MessageCircle, Heart, Star, Coffee, BookOpen, Dumbbell, Music, Palette, Laptop, GraduationCap } from 'lucide-react';

interface RoommateAvatarProps {
  property: {
    id: string;
    title: string;
    lifestyle?: string[];
    cultural?: string[];
    roommateRequired?: boolean;
    type?: 'api' | 'community';
  };
  className?: string;
}

interface AvatarPersonality {
  name: string;
  emoji: string;
  color: string;
  interests: string[];
  icon: React.ReactNode;
  description: string;
}

const avatarPersonalities: AvatarPersonality[] = [
  {
    name: 'Alex',
    emoji: '🎓',
    color: 'bg-blue-500',
    interests: ['studying', 'coffee', 'libraries'],
    icon: <GraduationCap className="w-4 h-4" />,
    description: 'Graduate student who loves quiet study sessions'
  },
  {
    name: 'Sam',
    emoji: '💻',
    color: 'bg-green-500',
    interests: ['tech', 'coding', 'startups'],
    icon: <Laptop className="w-4 h-4" />,
    description: 'Tech professional working on exciting projects'
  },
  {
    name: 'Jordan',
    emoji: '🎨',
    color: 'bg-purple-500',
    interests: ['art', 'music', 'creativity'],
    icon: <Palette className="w-4 h-4" />,
    description: 'Creative soul who brings artistic energy'
  },
  {
    name: 'Casey',
    emoji: '💪',
    color: 'bg-orange-500',
    interests: ['fitness', 'gym', 'healthy living'],
    icon: <Dumbbell className="w-4 h-4" />,
    description: 'Fitness enthusiast who loves active lifestyle'
  },
  {
    name: 'Riley',
    emoji: '☕',
    color: 'bg-yellow-500',
    interests: ['coffee', 'cafes', 'socializing'],
    icon: <Coffee className="w-4 h-4" />,
    description: 'Social butterfly who loves meeting new people'
  },
  {
    name: 'Taylor',
    emoji: '📚',
    color: 'bg-indigo-500',
    interests: ['reading', 'learning', 'intellectual discussions'],
    icon: <BookOpen className="w-4 h-4" />,
    description: 'Book lover who enjoys deep conversations'
  },
  {
    name: 'Morgan',
    emoji: '🎵',
    color: 'bg-pink-500',
    interests: ['music', 'concerts', 'creative expression'],
    icon: <Music className="w-4 h-4" />,
    description: 'Music lover who brings rhythm to the space'
  }
];

export default function RoommateAvatar({ property, className = '' }: RoommateAvatarProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarPersonality | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Select avatar based on property characteristics
    const matchingAvatars = avatarPersonalities.filter(avatar => {
      if (!property.lifestyle || !property.cultural) return true;
      
      const lifestyleMatch = property.lifestyle.some(lifestyle => 
        avatar.interests.some(interest => 
          lifestyle.toLowerCase().includes(interest.toLowerCase()) ||
          interest.toLowerCase().includes(lifestyle.toLowerCase())
        )
      );
      
      const culturalMatch = property.cultural?.some(cultural => 
        avatar.interests.some(interest => 
          cultural.toLowerCase().includes(interest.toLowerCase()) ||
          interest.toLowerCase().includes(cultural.toLowerCase())
        )
      );
      
      return lifestyleMatch || culturalMatch;
    });
    
    const randomAvatar = matchingAvatars.length > 0 
      ? matchingAvatars[Math.floor(Math.random() * matchingAvatars.length)]
      : avatarPersonalities[Math.floor(Math.random() * avatarPersonalities.length)];
    
    setSelectedAvatar(randomAvatar);
  }, [property]);

  const handleAvatarClick = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setShowDetails(!showDetails);
      setIsAnimating(false);
    }, 200);
  };

  // Only show avatars for community properties that require roommates
  if (!property.roommateRequired || property.type !== 'community') {
    return null;
  }

  if (!selectedAvatar) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Avatar Button */}
      <button
        onClick={handleAvatarClick}
        className={`relative group transition-all duration-300 transform hover:scale-110 ${
          isAnimating ? 'animate-bounce' : ''
        }`}
      >
        {/* Avatar Circle */}
        <div className={`w-16 h-16 ${selectedAvatar.color} rounded-full flex items-center justify-center text-white text-2xl shadow-lg group-hover:shadow-xl transition-all duration-300`}>
          {selectedAvatar.emoji}
        </div>
        
        {/* Online Status Indicator */}
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        </div>
        
        {/* Hover Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
          <div className="flex items-center space-x-2">
            {selectedAvatar.icon}
            <span>{selectedAvatar.name} - Looking for roommate!</span>
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </button>

      {/* Detailed Avatar Card */}
      {showDetails && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 p-6 z-20 animate-fadeIn">
          <div className="text-center">
            {/* Avatar Header */}
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className={`w-12 h-12 ${selectedAvatar.color} rounded-full flex items-center justify-center text-white text-xl`}>
                {selectedAvatar.emoji}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedAvatar.name}</h3>
                <p className="text-sm text-gray-600">Potential Roommate</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-700 text-sm mb-4">{selectedAvatar.description}</p>

            {/* Interests */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Interests</h4>
              <div className="flex flex-wrap gap-2 justify-center">
                {selectedAvatar.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            {/* Property Match */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Property Match</h4>
              <div className="flex items-center justify-center space-x-2">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">85% Match</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span>Message</span>
              </button>
              <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Heart className="w-4 h-4" />
                <span>Like</span>
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowDetails(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Overlay to close details */}
      {showDetails && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowDetails(false)}
        />
      )}
    </div>
  );
}
