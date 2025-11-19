// Enhanced Voice Search with Advanced Natural Language Processing
// This module provides intelligent property matching based on voice queries

export interface EnhancedQuery {
  originalQuery: string;
  intent: 'search' | 'filter' | 'compare' | 'recommend';
  entities: {
    locations: string[];
    priceRange: { min?: number; max?: number };
    roomTypes: string[];
    amenities: string[];
    lifestyle: string[];
    cultural: string[];
    transportation: string[];
    study: string[];
    nightlife: string[];
    fitness: string[];
  };
  modifiers: {
    urgency: 'low' | 'medium' | 'high';
    budget: 'low' | 'medium' | 'high';
    lifestyle: 'quiet' | 'lively' | 'balanced';
    social: 'introverted' | 'extroverted' | 'balanced';
  };
  confidence: number;
  suggestions: string[];
}

export interface PropertyMatch {
  property: any;
  score: number;
  reasons: string[];
  matchedEntities: string[];
}

class VoiceSearchEnhancer {
  private locationKeywords = [
    'near', 'around', 'close to', 'in', 'at', 'by', 'next to', 'walking distance to',
    'brooklyn', 'manhattan', 'queens', 'bronx', 'jersey city', 'hoboken', 'newark',
    'downtown', 'uptown', 'midtown', 'east village', 'west village', 'soho', 'tribeca',
    'central park', 'times square', 'wall street', 'financial district', 'columbia',
    'nyu', 'cuny', 'university', 'campus', 'college'
  ];

  private priceKeywords = {
    cheap: ['cheap', 'affordable', 'budget', 'low cost', 'inexpensive', 'under'],
    expensive: ['expensive', 'luxury', 'high-end', 'premium', 'over', 'above'],
    specific: ['dollar', '$', 'per month', 'monthly', 'rent']
  };

  private roomTypeKeywords = {
    studio: ['studio', 'efficiency', 'small'],
    onebedroom: ['1 bedroom', 'one bedroom', '1br', '1 br'],
    twobedroom: ['2 bedroom', 'two bedroom', '2br', '2 br'],
    threebedroom: ['3 bedroom', 'three bedroom', '3br', '3 br'],
    entire: ['entire', 'whole', 'full apartment'],
    private: ['private room', 'private', 'own room'],
    shared: ['shared', 'roommate', 'roommates', 'shared room']
  };

  private amenityKeywords = {
    gym: ['gym', 'fitness', 'workout', 'exercise', 'fitness center'],
    pool: ['pool', 'swimming', 'swim'],
    parking: ['parking', 'garage', 'car', 'vehicle'],
    laundry: ['laundry', 'washer', 'dryer', 'washing machine'],
    wifi: ['wifi', 'internet', 'high speed', 'broadband'],
    ac: ['air conditioning', 'ac', 'cooling'],
    heating: ['heating', 'heat', 'warm'],
    balcony: ['balcony', 'terrace', 'outdoor space'],
    doorman: ['doorman', 'concierge', 'security'],
    elevator: ['elevator', 'lift']
  };

  private lifestyleKeywords = {
    quiet: ['quiet', 'peaceful', 'calm', 'serene', 'tranquil'],
    lively: ['lively', 'vibrant', 'energetic', 'bustling', 'active'],
    professional: ['professional', 'business', 'corporate', 'office'],
    student: ['student', 'academic', 'university', 'college', 'study'],
    family: ['family', 'family-friendly', 'kids', 'children'],
    young: ['young', 'youth', 'millennial', 'gen z'],
    artsy: ['artsy', 'artistic', 'creative', 'bohemian', 'hipster'],
    tech: ['tech', 'startup', 'innovation', 'digital', 'tech-focused']
  };

  private culturalKeywords = {
    diverse: ['diverse', 'multicultural', 'international', 'global'],
    indian: ['indian', 'south asian', 'curry', 'spicy', 'authentic indian'],
    chinese: ['chinese', 'asian', 'dim sum', 'authentic chinese'],
    mexican: ['mexican', 'latin', 'tacos', 'authentic mexican'],
    italian: ['italian', 'pasta', 'pizza', 'authentic italian'],
    japanese: ['japanese', 'sushi', 'ramen', 'authentic japanese'],
    korean: ['korean', 'korean bbq', 'kimchi', 'authentic korean'],
    american: ['american', 'traditional', 'classic', 'local']
  };

  private transportationKeywords = {
    subway: ['subway', 'metro', 'train', 'transit', 'public transport'],
    bus: ['bus', 'buses', 'public bus'],
    walking: ['walking', 'walkable', 'pedestrian', 'on foot'],
    biking: ['biking', 'bike', 'cycling', 'bike-friendly'],
    car: ['car', 'driving', 'parking', 'vehicle'],
    ferry: ['ferry', 'boat', 'water transport']
  };

  private studyKeywords = {
    library: ['library', 'libraries', 'study', 'studying', 'academic'],
    quiet: ['quiet', 'silent', 'peaceful', 'calm'],
    coffee: ['coffee', 'coffee shop', 'cafe', 'cafes'],
    wifi: ['wifi', 'internet', 'online', 'digital']
  };

  private nightlifeKeywords = {
    bars: ['bars', 'bar', 'pub', 'pubs', 'drinking'],
    clubs: ['clubs', 'club', 'dancing', 'nightclub'],
    music: ['music', 'live music', 'concerts', 'concerts'],
    entertainment: ['entertainment', 'fun', 'nightlife', 'social']
  };

  private fitnessKeywords = {
    gym: ['gym', 'fitness', 'workout', 'exercise'],
    running: ['running', 'jogging', 'marathon', 'cardio'],
    yoga: ['yoga', 'meditation', 'mindfulness', 'zen'],
    sports: ['sports', 'athletic', 'active', 'outdoor activities']
  };

  // Main function to parse and enhance voice queries
  parseQuery(query: string): EnhancedQuery {
    const lowerQuery = query.toLowerCase();
    
    return {
      originalQuery: query,
      intent: this.detectIntent(lowerQuery),
      entities: {
        locations: this.extractLocations(lowerQuery),
        priceRange: this.extractPriceRange(lowerQuery),
        roomTypes: this.extractRoomTypes(lowerQuery),
        amenities: this.extractAmenities(lowerQuery),
        lifestyle: this.extractLifestyle(lowerQuery),
        cultural: this.extractCultural(lowerQuery),
        transportation: this.extractTransportation(lowerQuery),
        study: this.extractStudy(lowerQuery),
        nightlife: this.extractNightlife(lowerQuery),
        fitness: this.extractFitness(lowerQuery)
      },
      modifiers: {
        urgency: this.detectUrgency(lowerQuery),
        budget: this.detectBudget(lowerQuery),
        lifestyle: this.detectLifestyleModifier(lowerQuery),
        social: this.detectSocialModifier(lowerQuery)
      },
      confidence: this.calculateConfidence(lowerQuery),
      suggestions: this.generateSuggestions(lowerQuery)
    };
  }

  // Match properties based on enhanced query
  matchProperties(properties: any[], query: EnhancedQuery): PropertyMatch[] {
    return properties.map(property => {
      const match = this.calculatePropertyMatch(property, query);
      return {
        property,
        score: match.score,
        reasons: match.reasons,
        matchedEntities: match.matchedEntities
      };
    }).sort((a, b) => b.score - a.score);
  }

  private detectIntent(query: string): 'search' | 'filter' | 'compare' | 'recommend' {
    if (query.includes('compare') || query.includes('vs') || query.includes('versus')) {
      return 'compare';
    }
    if (query.includes('recommend') || query.includes('suggest') || query.includes('best')) {
      return 'recommend';
    }
    if (query.includes('with') || query.includes('that has') || query.includes('including')) {
      return 'filter';
    }
    return 'search';
  }

  private extractLocations(query: string): string[] {
    const locations: string[] = [];
    
    this.locationKeywords.forEach(keyword => {
      if (query.includes(keyword)) {
        locations.push(keyword);
      }
    });

    // Extract specific locations mentioned
    const locationPatterns = [
      /\b\d+\s+\w+\s+street\b/gi,
      /\b\d+\s+\w+\s+avenue\b/gi,
      /\b\d+\s+\w+\s+boulevard\b/gi,
      /\b\d+\s+\w+\s+road\b/gi,
      /\b\d+\s+\w+\s+way\b/gi
    ];

    locationPatterns.forEach(pattern => {
      const matches = query.match(pattern);
      if (matches) {
        locations.push(...matches);
      }
    });

    return [...new Set(locations)];
  }

  private extractPriceRange(query: string): { min?: number; max?: number } {
    const priceRange: { min?: number; max?: number } = {};
    
    // Extract specific prices
    const priceMatches = query.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/g);
    if (priceMatches) {
      const prices = priceMatches.map(match => 
        parseInt(match.replace(/[$,]/g, ''))
      );
      
      if (prices.length === 1) {
        if (query.includes('under') || query.includes('below') || query.includes('less than')) {
          priceRange.max = prices[0];
        } else if (query.includes('over') || query.includes('above') || query.includes('more than')) {
          priceRange.min = prices[0];
        } else {
          priceRange.max = prices[0] * 1.2; // 20% tolerance
          priceRange.min = prices[0] * 0.8;
        }
      } else if (prices.length === 2) {
        priceRange.min = Math.min(...prices);
        priceRange.max = Math.max(...prices);
      }
    }

    // Extract budget keywords
    if (query.includes('cheap') || query.includes('affordable') || query.includes('budget')) {
      priceRange.max = 2000;
    }
    if (query.includes('expensive') || query.includes('luxury') || query.includes('high-end')) {
      priceRange.min = 3000;
    }

    return priceRange;
  }

  private extractRoomTypes(query: string): string[] {
    const roomTypes: string[] = [];
    
    Object.entries(this.roomTypeKeywords).forEach(([type, keywords]) => {
      if (keywords.some(keyword => query.includes(keyword))) {
        roomTypes.push(type);
      }
    });

    return roomTypes;
  }

  private extractAmenities(query: string): string[] {
    const amenities: string[] = [];
    
    Object.entries(this.amenityKeywords).forEach(([amenity, keywords]) => {
      if (keywords.some(keyword => query.includes(keyword))) {
        amenities.push(amenity);
      }
    });

    return amenities;
  }

  private extractLifestyle(query: string): string[] {
    const lifestyle: string[] = [];
    
    Object.entries(this.lifestyleKeywords).forEach(([type, keywords]) => {
      if (keywords.some(keyword => query.includes(keyword))) {
        lifestyle.push(type);
      }
    });

    return lifestyle;
  }

  private extractCultural(query: string): string[] {
    const cultural: string[] = [];
    
    Object.entries(this.culturalKeywords).forEach(([type, keywords]) => {
      if (keywords.some(keyword => query.includes(keyword))) {
        cultural.push(type);
      }
    });

    return cultural;
  }

  private extractTransportation(query: string): string[] {
    const transportation: string[] = [];
    
    Object.entries(this.transportationKeywords).forEach(([type, keywords]) => {
      if (keywords.some(keyword => query.includes(keyword))) {
        transportation.push(type);
      }
    });

    return transportation;
  }

  private extractStudy(query: string): string[] {
    const study: string[] = [];
    
    Object.entries(this.studyKeywords).forEach(([type, keywords]) => {
      if (keywords.some(keyword => query.includes(keyword))) {
        study.push(type);
      }
    });

    return study;
  }

  private extractNightlife(query: string): string[] {
    const nightlife: string[] = [];
    
    Object.entries(this.nightlifeKeywords).forEach(([type, keywords]) => {
      if (keywords.some(keyword => query.includes(keyword))) {
        nightlife.push(type);
      }
    });

    return nightlife;
  }

  private extractFitness(query: string): string[] {
    const fitness: string[] = [];
    
    Object.entries(this.fitnessKeywords).forEach(([type, keywords]) => {
      if (keywords.some(keyword => query.includes(keyword))) {
        fitness.push(type);
      }
    });

    return fitness;
  }

  private detectUrgency(query: string): 'low' | 'medium' | 'high' {
    if (query.includes('urgent') || query.includes('asap') || query.includes('immediately') || query.includes('right now')) {
      return 'high';
    }
    if (query.includes('soon') || query.includes('quickly') || query.includes('fast')) {
      return 'medium';
    }
    return 'low';
  }

  private detectBudget(query: string): 'low' | 'medium' | 'high' {
    if (query.includes('cheap') || query.includes('affordable') || query.includes('budget')) {
      return 'low';
    }
    if (query.includes('expensive') || query.includes('luxury') || query.includes('high-end')) {
      return 'high';
    }
    return 'medium';
  }

  private detectLifestyleModifier(query: string): 'quiet' | 'lively' | 'balanced' {
    if (query.includes('quiet') || query.includes('peaceful') || query.includes('calm')) {
      return 'quiet';
    }
    if (query.includes('lively') || query.includes('vibrant') || query.includes('energetic')) {
      return 'lively';
    }
    return 'balanced';
  }

  private detectSocialModifier(query: string): 'introverted' | 'extroverted' | 'balanced' {
    if (query.includes('social') || query.includes('party') || query.includes('outgoing')) {
      return 'extroverted';
    }
    if (query.includes('quiet') || query.includes('private') || query.includes('introverted')) {
      return 'introverted';
    }
    return 'balanced';
  }

  private calculateConfidence(query: string): number {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence based on specific keywords found
    const keywordCount = [
      ...this.locationKeywords,
      ...Object.values(this.priceKeywords).flat(),
      ...Object.values(this.roomTypeKeywords).flat(),
      ...Object.values(this.amenityKeywords).flat(),
      ...Object.values(this.lifestyleKeywords).flat(),
      ...Object.values(this.culturalKeywords).flat()
    ].filter(keyword => query.includes(keyword)).length;
    
    confidence += Math.min(keywordCount * 0.1, 0.4);
    
    // Increase confidence for longer, more specific queries
    if (query.length > 20) confidence += 0.1;
    if (query.length > 50) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  private generateSuggestions(query: string): string[] {
    const suggestions: string[] = [];
    
    if (query.includes('near') && !query.includes('food')) {
      suggestions.push('Try: "Find apartments near good Indian food"');
    }
    if (query.includes('gym') && !query.includes('near')) {
      suggestions.push('Try: "I need good gyms nearby"');
    }
    if (query.includes('quiet') && !query.includes('study')) {
      suggestions.push('Try: "Find quiet study areas"');
    }
    if (query.includes('student') && !query.includes('budget')) {
      suggestions.push('Try: "Student-friendly budget apartments"');
    }
    
    return suggestions;
  }

  private calculatePropertyMatch(property: any, query: EnhancedQuery): { score: number; reasons: string[]; matchedEntities: string[] } {
    let score = 0;
    const reasons: string[] = [];
    const matchedEntities: string[] = [];

    // Location matching
    if (query.entities.locations.length > 0) {
      const locationMatch = query.entities.locations.some(location => 
        property.location?.toLowerCase().includes(location.toLowerCase()) ||
        property.title?.toLowerCase().includes(location.toLowerCase())
      );
      if (locationMatch) {
        score += 0.3;
        reasons.push('Matches your location preferences');
        matchedEntities.push('location');
      }
    }

    // Price matching
    if (query.entities.priceRange.min || query.entities.priceRange.max) {
      const price = property.price || 0;
      const min = query.entities.priceRange.min || 0;
      const max = query.entities.priceRange.max || Infinity;
      
      if (price >= min && price <= max) {
        score += 0.25;
        reasons.push('Fits your budget');
        matchedEntities.push('price');
      }
    }

    // Room type matching
    if (query.entities.roomTypes.length > 0) {
      const roomTypeMatch = query.entities.roomTypes.some(type => 
        property.roomType?.toLowerCase().includes(type.toLowerCase())
      );
      if (roomTypeMatch) {
        score += 0.2;
        reasons.push('Matches your room type preference');
        matchedEntities.push('roomType');
      }
    }

    // Amenity matching
    if (query.entities.amenities.length > 0) {
      const amenityMatches = query.entities.amenities.filter(amenity =>
        property.amenities?.some((propAmenity: string) =>
          propAmenity.toLowerCase().includes(amenity.toLowerCase())
        )
      );
      if (amenityMatches.length > 0) {
        score += amenityMatches.length * 0.05;
        reasons.push(`Has ${amenityMatches.join(', ')}`);
        matchedEntities.push(...amenityMatches);
      }
    }

    // Lifestyle matching
    if (query.entities.lifestyle.length > 0) {
      const lifestyleMatches = query.entities.lifestyle.filter(lifestyle =>
        property.lifestyle?.some((propLifestyle: string) =>
          propLifestyle.toLowerCase().includes(lifestyle.toLowerCase())
        )
      );
      if (lifestyleMatches.length > 0) {
        score += lifestyleMatches.length * 0.05;
        reasons.push(`Matches ${lifestyleMatches.join(', ')} lifestyle`);
        matchedEntities.push(...lifestyleMatches);
      }
    }

    // Cultural matching
    if (query.entities.cultural.length > 0) {
      const culturalMatches = query.entities.cultural.filter(cultural =>
        property.cultural?.some((propCultural: string) =>
          propCultural.toLowerCase().includes(cultural.toLowerCase())
        )
      );
      if (culturalMatches.length > 0) {
        score += culturalMatches.length * 0.05;
        reasons.push(`Matches ${culturalMatches.join(', ')} cultural preferences`);
        matchedEntities.push(...culturalMatches);
      }
    }

    return { score, reasons, matchedEntities };
  }
}

export const voiceSearchEnhancer = new VoiceSearchEnhancer();
