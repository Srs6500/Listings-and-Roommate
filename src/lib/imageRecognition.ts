// Image Recognition System using TensorFlow.js
// This module handles property image analysis for amenity detection and quality assessment

export interface ImageAnalysisResult {
  amenities: {
    detected: string[];
    confidence: number;
  };
  roomType: {
    type: 'studio' | '1bedroom' | '2bedroom' | '3bedroom' | 'shared' | 'entire';
    confidence: number;
  };
  quality: {
    score: number; // 1-10
    factors: string[];
  };
  lifestyle: {
    modern: boolean;
    traditional: boolean;
    luxury: boolean;
    budget: boolean;
    student: boolean;
    professional: boolean;
  };
  features: {
    naturalLight: boolean;
    spacious: boolean;
    clean: boolean;
    furnished: boolean;
    balcony: boolean;
    kitchen: boolean;
    bathroom: boolean;
  };
}

export interface PropertyImage {
  url: string;
  alt?: string;
  type?: 'exterior' | 'interior' | 'kitchen' | 'bathroom' | 'bedroom' | 'living';
}

class ImageRecognitionService {
  private model: any = null;
  private isInitialized = false;
  private amenityKeywords = {
    gym: ['treadmill', 'weights', 'exercise', 'fitness', 'workout'],
    pool: ['pool', 'swimming', 'water', 'diving'],
    parking: ['car', 'vehicle', 'garage', 'parking space'],
    laundry: ['washer', 'dryer', 'laundry', 'washing machine'],
    balcony: ['balcony', 'terrace', 'outdoor', 'railing'],
    kitchen: ['stove', 'refrigerator', 'sink', 'counter', 'cabinet'],
    bathroom: ['toilet', 'shower', 'bathtub', 'sink', 'mirror'],
    bedroom: ['bed', 'dresser', 'nightstand', 'closet'],
    living: ['sofa', 'tv', 'coffee table', 'couch', 'entertainment'],
    dining: ['dining table', 'chairs', 'dinner', 'eat']
  };

  constructor() {
    this.initializeModel();
  }

  private async initializeModel() {
    try {
      if (typeof window !== 'undefined') {
        const tf = await import('@tensorflow/tfjs');
        await tf.ready();
        
        // Load MobileNet for image classification
        const mobilenet = await import('@tensorflow-models/mobilenet');
        this.model = await mobilenet.load();
        
        this.isInitialized = true;
        console.log('Image recognition model loaded successfully');
      }
    } catch (error) {
      console.error('Failed to initialize image recognition:', error);
    }
  }

  // Analyze property images for amenities and features
  async analyzePropertyImages(images: PropertyImage[]): Promise<ImageAnalysisResult> {
    if (!this.isInitialized || !this.model) {
      return this.getFallbackAnalysis();
    }

    try {
      const analysisPromises = images.map(image => this.analyzeSingleImage(image));
      const results = await Promise.all(analysisPromises);
      
      return this.aggregateResults(results);
    } catch (error) {
      console.error('Image analysis failed:', error);
      return this.getFallbackAnalysis();
    }
  }

  private async analyzeSingleImage(image: PropertyImage): Promise<Partial<ImageAnalysisResult>> {
    try {
      // Load and preprocess image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = image.url;
      });

      // Get predictions from MobileNet
      const predictions = await this.model.classify(img);
      
      // Extract amenities based on predictions
      const detectedAmenities = this.extractAmenities(predictions);
      
      // Determine room type based on image content
      const roomType = this.determineRoomType(predictions, image.type);
      
      // Assess quality and lifestyle indicators
      const quality = this.assessQuality(predictions);
      const lifestyle = this.assessLifestyle(predictions);
      const features = this.assessFeatures(predictions);

      return {
        amenities: {
          detected: detectedAmenities,
          confidence: this.calculateConfidence(predictions)
        },
        roomType,
        quality,
        lifestyle,
        features
      };
    } catch (error) {
      console.error('Single image analysis failed:', error);
      return {};
    }
  }

  private extractAmenities(predictions: any[]): string[] {
    const amenities: string[] = [];
    const predictionTexts = predictions.map(p => p.className.toLowerCase());
    
    Object.entries(this.amenityKeywords).forEach(([amenity, keywords]) => {
      const hasKeyword = keywords.some(keyword => 
        predictionTexts.some(text => text.includes(keyword))
      );
      if (hasKeyword) {
        amenities.push(amenity);
      }
    });

    return amenities;
  }

  private determineRoomType(predictions: any[], imageType?: string): { type: string; confidence: number } {
    const predictionTexts = predictions.map(p => p.className.toLowerCase()).join(' ');
    
    // Determine room type based on image content and type
    if (imageType === 'bedroom' || predictionTexts.includes('bed')) {
      return { type: 'bedroom', confidence: 0.8 };
    }
    if (imageType === 'kitchen' || predictionTexts.includes('kitchen')) {
      return { type: 'kitchen', confidence: 0.9 };
    }
    if (imageType === 'bathroom' || predictionTexts.includes('bathroom')) {
      return { type: 'bathroom', confidence: 0.9 };
    }
    if (imageType === 'living' || predictionTexts.includes('living room')) {
      return { type: 'living', confidence: 0.8 };
    }
    
    // Default to studio if we can't determine
    return { type: 'studio', confidence: 0.5 };
  }

  private assessQuality(predictions: any[]): { score: number; factors: string[] } {
    const factors: string[] = [];
    let score = 5; // Base score
    
    const predictionTexts = predictions.map(p => p.className.toLowerCase()).join(' ');
    
    // Quality indicators
    if (predictionTexts.includes('modern') || predictionTexts.includes('contemporary')) {
      score += 2;
      factors.push('Modern design');
    }
    if (predictionTexts.includes('clean') || predictionTexts.includes('tidy')) {
      score += 1;
      factors.push('Clean appearance');
    }
    if (predictionTexts.includes('spacious') || predictionTexts.includes('large')) {
      score += 1;
      factors.push('Spacious');
    }
    if (predictionTexts.includes('luxury') || predictionTexts.includes('high-end')) {
      score += 2;
      factors.push('Luxury features');
    }
    if (predictionTexts.includes('old') || predictionTexts.includes('worn')) {
      score -= 1;
      factors.push('Needs updating');
    }

    return {
      score: Math.max(1, Math.min(10, score)),
      factors
    };
  }

  private assessLifestyle(predictions: any[]): any {
    const predictionTexts = predictions.map(p => p.className.toLowerCase()).join(' ');
    
    return {
      modern: predictionTexts.includes('modern') || predictionTexts.includes('contemporary'),
      traditional: predictionTexts.includes('traditional') || predictionTexts.includes('classic'),
      luxury: predictionTexts.includes('luxury') || predictionTexts.includes('high-end'),
      budget: predictionTexts.includes('simple') || predictionTexts.includes('basic'),
      student: predictionTexts.includes('dorm') || predictionTexts.includes('student'),
      professional: predictionTexts.includes('office') || predictionTexts.includes('corporate')
    };
  }

  private assessFeatures(predictions: any[]): any {
    const predictionTexts = predictions.map(p => p.className.toLowerCase()).join(' ');
    
    return {
      naturalLight: predictionTexts.includes('window') || predictionTexts.includes('light'),
      spacious: predictionTexts.includes('spacious') || predictionTexts.includes('large'),
      clean: predictionTexts.includes('clean') || predictionTexts.includes('tidy'),
      furnished: predictionTexts.includes('furniture') || predictionTexts.includes('furnished'),
      balcony: predictionTexts.includes('balcony') || predictionTexts.includes('terrace'),
      kitchen: predictionTexts.includes('kitchen') || predictionTexts.includes('stove'),
      bathroom: predictionTexts.includes('bathroom') || predictionTexts.includes('toilet')
    };
  }

  private calculateConfidence(predictions: any[]): number {
    if (predictions.length === 0) return 0;
    
    const avgConfidence = predictions.reduce((sum, p) => sum + p.probability, 0) / predictions.length;
    return Math.round(avgConfidence * 100) / 100;
  }

  private aggregateResults(results: Partial<ImageAnalysisResult>[]): ImageAnalysisResult {
    // Aggregate amenities from all images
    const allAmenities = results
      .map(r => r.amenities?.detected || [])
      .flat();
    const uniqueAmenities = [...new Set(allAmenities)];

    // Get the most confident room type
    const roomTypes = results
      .map(r => r.roomType)
      .filter(rt => rt)
      .sort((a, b) => (b?.confidence || 0) - (a?.confidence || 0));

    // Average quality scores
    const qualityScores = results
      .map(r => r.quality?.score || 5)
      .filter(score => score > 0);
    const avgQuality = qualityScores.length > 0 
      ? qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length 
      : 5;

    // Combine all quality factors
    const allFactors = results
      .map(r => r.quality?.factors || [])
      .flat();
    const uniqueFactors = [...new Set(allFactors)];

    // Aggregate lifestyle indicators
    const lifestyle = {
      modern: results.some(r => r.lifestyle?.modern),
      traditional: results.some(r => r.lifestyle?.traditional),
      luxury: results.some(r => r.lifestyle?.luxury),
      budget: results.some(r => r.lifestyle?.budget),
      student: results.some(r => r.lifestyle?.student),
      professional: results.some(r => r.lifestyle?.professional)
    };

    // Aggregate features
    const features = {
      naturalLight: results.some(r => r.features?.naturalLight),
      spacious: results.some(r => r.features?.spacious),
      clean: results.some(r => r.features?.clean),
      furnished: results.some(r => r.features?.furnished),
      balcony: results.some(r => r.features?.balcony),
      kitchen: results.some(r => r.features?.kitchen),
      bathroom: results.some(r => r.features?.bathroom)
    };

    return {
      amenities: {
        detected: uniqueAmenities,
        confidence: this.calculateConfidence(results.map(r => r.amenities?.confidence || 0))
      },
      roomType: roomTypes[0] || { type: 'studio', confidence: 0.5 },
      quality: {
        score: Math.round(avgQuality * 10) / 10,
        factors: uniqueFactors
      },
      lifestyle,
      features
    };
  }

  private getFallbackAnalysis(): ImageAnalysisResult {
    return {
      amenities: {
        detected: [],
        confidence: 0
      },
      roomType: {
        type: 'studio',
        confidence: 0.5
      },
      quality: {
        score: 5,
        factors: ['Analysis unavailable']
      },
      lifestyle: {
        modern: false,
        traditional: false,
        luxury: false,
        budget: false,
        student: false,
        professional: false
      },
      features: {
        naturalLight: false,
        spacious: false,
        clean: false,
        furnished: false,
        balcony: false,
        kitchen: false,
        bathroom: false
      }
    };
  }
}

export const imageRecognitionService = new ImageRecognitionService();
