// AI Voice Analysis System with TensorFlow.js
// This module handles voice pattern analysis, personality detection, and preference learning

export interface VoiceAnalysisResult {
  personality: {
    energy: 'high' | 'medium' | 'low';
    confidence: 'high' | 'medium' | 'low';
    social: 'extroverted' | 'ambivert' | 'introverted';
    communication: 'direct' | 'indirect' | 'balanced';
  };
  preferences: {
    lifestyle: string[];
    cultural: string[];
    food: string[];
    transportation: string[];
    study: string[];
    nightlife: string[];
  };
  compatibility: {
    score: number;
    factors: string[];
  };
  learning: {
    confidence: number;
    patterns: string[];
    recommendations: string[];
  };
}

export interface VoicePattern {
  duration: number;
  pitch: number;
  volume: number;
  pace: number;
  pauses: number;
  emphasis: number;
  clarity: number;
}

export interface UserVoiceProfile {
  userId: string;
  totalInteractions: number;
  averagePattern: VoicePattern;
  personalityHistory: VoiceAnalysisResult['personality'][];
  preferenceHistory: VoiceAnalysisResult['preferences'][];
  learningData: {
    successfulMatches: number;
    failedMatches: number;
    improvementAreas: string[];
  };
}

class VoiceAI {
  private userProfiles: Map<string, UserVoiceProfile> = new Map();
  private learningModel: any = null;
  private isInitialized = false;

  constructor() {
    this.initializeAI();
  }

  private async initializeAI() {
    try {
      // Initialize TensorFlow.js for voice analysis
      if (typeof window !== 'undefined') {
        const tf = await import('@tensorflow/tfjs');
        await tf.ready();
        
        // Create a simple neural network for voice pattern analysis
        this.learningModel = tf.sequential({
          layers: [
            tf.layers.dense({ inputShape: [7], units: 16, activation: 'relu' }),
            tf.layers.dense({ units: 8, activation: 'relu' }),
            tf.layers.dense({ units: 4, activation: 'sigmoid' })
          ]
        });
        
        this.isInitialized = true;
        console.log('Voice AI initialized successfully');
      }
    } catch (error) {
      console.error('Failed to initialize Voice AI:', error);
    }
  }

  // Analyze voice patterns and extract personality traits using TensorFlow.js
  async analyzeVoicePattern(audioData: Float32Array, transcript: string): Promise<VoiceAnalysisResult> {
    const pattern = this.extractVoicePattern(audioData);
    
    // Use TensorFlow.js model for enhanced analysis
    let enhancedPersonality = this.analyzePersonality(pattern, transcript);
    if (this.isInitialized && this.learningModel) {
      enhancedPersonality = await this.enhanceWithTensorFlow(pattern, transcript);
    }
    
    const preferences = this.extractPreferences(transcript);
    const compatibility = this.calculateCompatibility(enhancedPersonality, preferences);
    const learning = this.generateLearningInsights(pattern, preferences);

    return {
      personality: enhancedPersonality,
      preferences,
      compatibility,
      learning
    };
  }

  // Enhanced personality analysis using TensorFlow.js
  private async enhanceWithTensorFlow(pattern: VoicePattern, transcript: string): Promise<VoiceAnalysisResult['personality']> {
    try {
      const tf = await import('@tensorflow/tfjs');
      
      // Prepare input data for the model
      const inputData = tf.tensor2d([[
        pattern.duration,
        pattern.pitch,
        pattern.volume,
        pattern.pace,
        pattern.pauses,
        pattern.emphasis,
        pattern.clarity
      ]]);
      
      // Get predictions from the model
      const predictions = this.learningModel.predict(inputData) as tf.Tensor;
      const predictionArray = await predictions.data();
      
      // Convert predictions to personality traits
      const energyScore = predictionArray[0];
      const confidenceScore = predictionArray[1];
      const socialScore = predictionArray[2];
      const communicationScore = predictionArray[3];
      
      // Clean up tensors
      inputData.dispose();
      predictions.dispose();
      
      return {
        energy: energyScore > 0.7 ? 'high' : energyScore > 0.4 ? 'medium' : 'low',
        confidence: confidenceScore > 0.6 ? 'high' : confidenceScore > 0.3 ? 'medium' : 'low',
        social: socialScore > 0.6 ? 'extroverted' : socialScore > 0.3 ? 'ambivert' : 'introverted',
        communication: communicationScore > 0.6 ? 'direct' : communicationScore > 0.3 ? 'balanced' : 'indirect'
      };
    } catch (error) {
      console.error('TensorFlow enhancement failed:', error);
      // Fallback to basic analysis
      return this.analyzePersonality(pattern, transcript);
    }
  }

  // Extract voice patterns from audio data
  private extractVoicePattern(audioData: Float32Array): VoicePattern {
    const duration = audioData.length / 44100; // Assuming 44.1kHz sample rate
    const volume = this.calculateRMS(audioData);
    const pitch = this.calculatePitch(audioData);
    const pace = this.calculatePace(audioData);
    const pauses = this.countPauses(audioData);
    const emphasis = this.calculateEmphasis(audioData);
    const clarity = this.calculateClarity(audioData);

    return {
      duration,
      pitch,
      volume,
      pace,
      pauses,
      emphasis,
      clarity
    };
  }

  // Analyze personality from voice patterns and transcript
  private analyzePersonality(pattern: VoicePattern, transcript: string): VoiceAnalysisResult['personality'] {
    // Energy level based on volume, pace, and emphasis
    const energyScore = (pattern.volume + pattern.pace + pattern.emphasis) / 3;
    const energy = energyScore > 0.7 ? 'high' : energyScore > 0.4 ? 'medium' : 'low';

    // Confidence based on clarity, volume, and pauses
    const confidenceScore = (pattern.clarity + pattern.volume - pattern.pauses) / 3;
    const confidence = confidenceScore > 0.6 ? 'high' : confidenceScore > 0.3 ? 'medium' : 'low';

    // Social tendencies based on transcript length and complexity
    const socialScore = transcript.length > 50 ? 0.8 : transcript.length > 20 ? 0.5 : 0.2;
    const social = socialScore > 0.6 ? 'extroverted' : socialScore > 0.3 ? 'ambivert' : 'introverted';

    // Communication style based on transcript analysis
    const directWords = ['need', 'want', 'must', 'require', 'exactly'];
    const indirectWords = ['maybe', 'perhaps', 'might', 'could', 'possibly'];
    const directCount = directWords.filter(word => transcript.toLowerCase().includes(word)).length;
    const indirectCount = indirectWords.filter(word => transcript.toLowerCase().includes(word)).length;
    const communication = directCount > indirectCount ? 'direct' : indirectCount > directCount ? 'indirect' : 'balanced';

    return { energy, confidence, social, communication };
  }

  // Extract preferences from transcript using NLP
  private extractPreferences(transcript: string): VoiceAnalysisResult['preferences'] {
    const lowerTranscript = transcript.toLowerCase();
    
    // Lifestyle preferences
    const lifestyleKeywords = {
      urban: ['city', 'downtown', 'urban', 'metro', 'skyscraper'],
      suburban: ['suburb', 'quiet', 'family', 'residential', 'neighborhood'],
      modern: ['modern', 'contemporary', 'new', 'updated', 'fresh'],
      classic: ['classic', 'traditional', 'vintage', 'historic', 'charming']
    };

    // Cultural preferences
    const culturalKeywords = {
      diverse: ['diverse', 'multicultural', 'international', 'global'],
      local: ['local', 'community', 'neighborhood', 'authentic'],
      artsy: ['artsy', 'creative', 'artistic', 'cultural', 'gallery'],
      professional: ['professional', 'business', 'corporate', 'executive']
    };

    // Food preferences
    const foodKeywords = {
      indian: ['indian', 'curry', 'spicy', 'south asian'],
      chinese: ['chinese', 'dim sum', 'asian', 'oriental'],
      italian: ['italian', 'pasta', 'pizza', 'mediterranean'],
      mexican: ['mexican', 'tacos', 'latin', 'hispanic'],
      healthy: ['healthy', 'organic', 'fresh', 'natural', 'vegan']
    };

    // Transportation preferences
    const transportKeywords = {
      walking: ['walking', 'walkable', 'pedestrian', 'foot'],
      driving: ['driving', 'car', 'parking', 'garage'],
      public: ['public transport', 'metro', 'bus', 'transit'],
      biking: ['biking', 'cycling', 'bike', 'bicycle']
    };

    // Study preferences
    const studyKeywords = {
      quiet: ['quiet', 'silent', 'peaceful', 'calm'],
      library: ['library', 'study', 'academic', 'university'],
      coffee: ['coffee', 'cafe', 'coffee shop', 'study cafe'],
      home: ['home', 'remote', 'work from home', 'study at home']
    };

    // Nightlife preferences
    const nightlifeKeywords = {
      active: ['nightlife', 'bars', 'clubs', 'entertainment', 'party'],
      quiet: ['quiet', 'peaceful', 'calm', 'relaxing'],
      cultural: ['cultural', 'theater', 'museum', 'gallery', 'arts'],
      social: ['social', 'meet people', 'community', 'friends']
    };

    // Extract preferences based on keyword matching
    const extractCategory = (keywords: Record<string, string[]>) => {
      return Object.entries(keywords)
        .filter(([_, words]) => words.some(word => lowerTranscript.includes(word)))
        .map(([key, _]) => key);
    };

    return {
      lifestyle: extractCategory(lifestyleKeywords),
      cultural: extractCategory(culturalKeywords),
      food: extractCategory(foodKeywords),
      transportation: extractCategory(transportKeywords),
      study: extractCategory(studyKeywords),
      nightlife: extractCategory(nightlifeKeywords)
    };
  }

  // Calculate compatibility score
  private calculateCompatibility(personality: VoiceAnalysisResult['personality'], preferences: VoiceAnalysisResult['preferences']): VoiceAnalysisResult['compatibility'] {
    let score = 0;
    const factors: string[] = [];

    // Personality-based scoring
    if (personality.energy === 'high') {
      score += 20;
      factors.push('High energy lifestyle match');
    }
    if (personality.confidence === 'high') {
      score += 15;
      factors.push('Confident decision-making');
    }
    if (personality.social === 'extroverted') {
      score += 10;
      factors.push('Social compatibility');
    }

    // Preference-based scoring
    if (preferences.lifestyle.length > 0) {
      score += 15;
      factors.push('Lifestyle preferences identified');
    }
    if (preferences.food.length > 0) {
      score += 10;
      factors.push('Food preferences matched');
    }
    if (preferences.cultural.length > 0) {
      score += 10;
      factors.push('Cultural compatibility');
    }

    return {
      score: Math.min(score, 100),
      factors
    };
  }

  // Generate learning insights and recommendations
  private generateLearningInsights(pattern: VoicePattern, preferences: VoiceAnalysisResult['preferences']): VoiceAnalysisResult['learning'] {
    const confidence = this.calculateLearningConfidence(pattern);
    const patterns = this.identifyPatterns(pattern, preferences);
    const recommendations = this.generateRecommendations(preferences);

    return {
      confidence,
      patterns,
      recommendations
    };
  }

  // Calculate learning confidence based on voice pattern consistency
  private calculateLearningConfidence(pattern: VoicePattern): number {
    // Simple confidence calculation based on pattern consistency
    const consistency = 1 - (Math.abs(pattern.pitch - 0.5) + Math.abs(pattern.volume - 0.5) + Math.abs(pattern.pace - 0.5)) / 3;
    return Math.max(0, Math.min(1, consistency));
  }

  // Identify patterns in voice and preferences
  private identifyPatterns(pattern: VoicePattern, preferences: VoiceAnalysisResult['preferences']): string[] {
    const patterns: string[] = [];

    if (pattern.emphasis > 0.7) patterns.push('High emphasis in speech');
    if (pattern.pace > 0.6) patterns.push('Fast speaking pace');
    if (pattern.clarity > 0.8) patterns.push('Clear articulation');
    if (preferences.food.length > 2) patterns.push('Food-focused preferences');
    if (preferences.lifestyle.length > 1) patterns.push('Diverse lifestyle interests');

    return patterns;
  }

  // Generate recommendations based on preferences
  private generateRecommendations(preferences: VoiceAnalysisResult['preferences']): string[] {
    const recommendations: string[] = [];

    if (preferences.food.includes('indian')) {
      recommendations.push('Consider Jersey City or Edison for authentic Indian cuisine');
    }
    if (preferences.food.includes('chinese')) {
      recommendations.push('Look into Chinatown areas or Flushing for Chinese food');
    }
    if (preferences.lifestyle.includes('urban')) {
      recommendations.push('Downtown areas would be perfect for your urban lifestyle');
    }
    if (preferences.study.includes('quiet')) {
      recommendations.push('University districts offer quiet study environments');
    }

    return recommendations;
  }

  // Utility functions for audio analysis
  private calculateRMS(audioData: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < audioData.length; i++) {
      sum += audioData[i] * audioData[i];
    }
    return Math.sqrt(sum / audioData.length);
  }

  private calculatePitch(audioData: Float32Array): number {
    // Simplified pitch calculation
    const max = Math.max(...audioData);
    const min = Math.min(...audioData);
    return (max - min) / 2;
  }

  private calculatePace(audioData: Float32Array): number {
    // Calculate speaking pace based on audio variations
    let variations = 0;
    for (let i = 1; i < audioData.length; i++) {
      if (Math.abs(audioData[i] - audioData[i - 1]) > 0.1) {
        variations++;
      }
    }
    return variations / audioData.length;
  }

  private countPauses(audioData: Float32Array): number {
    // Count silent periods (pauses) in audio
    let pauses = 0;
    let inPause = false;
    const threshold = 0.01;

    for (let i = 0; i < audioData.length; i++) {
      if (Math.abs(audioData[i]) < threshold) {
        if (!inPause) {
          pauses++;
          inPause = true;
        }
      } else {
        inPause = false;
      }
    }

    return pauses;
  }

  private calculateEmphasis(audioData: Float32Array): number {
    // Calculate emphasis based on volume variations
    const volume = this.calculateRMS(audioData);
    const variations = this.calculatePace(audioData);
    return (volume + variations) / 2;
  }

  private calculateClarity(audioData: Float32Array): number {
    // Calculate clarity based on signal-to-noise ratio
    const signal = this.calculateRMS(audioData);
    const noise = this.calculateRMS(audioData.slice(0, Math.floor(audioData.length / 10)));
    return signal / (noise + 0.001);
  }

  // Update user profile with new voice data
  updateUserProfile(userId: string, analysis: VoiceAnalysisResult): void {
    const existingProfile = this.userProfiles.get(userId);
    
    if (existingProfile) {
      // Update existing profile
      existingProfile.totalInteractions++;
      existingProfile.personalityHistory.push(analysis.personality);
      existingProfile.preferenceHistory.push(analysis.preferences);
      
      // Update learning data
      if (analysis.compatibility.score > 70) {
        existingProfile.learningData.successfulMatches++;
      } else {
        existingProfile.learningData.failedMatches++;
      }
      
      // Update average pattern
      const newPattern = this.extractVoicePattern(new Float32Array(1000)); // Placeholder
      existingProfile.averagePattern = this.averagePatterns(existingProfile.averagePattern, newPattern);
    } else {
      // Create new profile
      this.userProfiles.set(userId, {
        userId,
        totalInteractions: 1,
        averagePattern: this.extractVoicePattern(new Float32Array(1000)), // Placeholder
        personalityHistory: [analysis.personality],
        preferenceHistory: [analysis.preferences],
        learningData: {
          successfulMatches: analysis.compatibility.score > 70 ? 1 : 0,
          failedMatches: analysis.compatibility.score <= 70 ? 1 : 0,
          improvementAreas: []
        }
      });
    }
  }

  // Average two voice patterns
  private averagePatterns(pattern1: VoicePattern, pattern2: VoicePattern): VoicePattern {
    return {
      duration: (pattern1.duration + pattern2.duration) / 2,
      pitch: (pattern1.pitch + pattern2.pitch) / 2,
      volume: (pattern1.volume + pattern2.volume) / 2,
      pace: (pattern1.pace + pattern2.pace) / 2,
      pauses: (pattern1.pauses + pattern2.pauses) / 2,
      emphasis: (pattern1.emphasis + pattern2.emphasis) / 2,
      clarity: (pattern1.clarity + pattern2.clarity) / 2
    };
  }

  // Get user profile
  getUserProfile(userId: string): UserVoiceProfile | undefined {
    return this.userProfiles.get(userId);
  }

  // Get AI recommendations based on voice analysis
  getAIRecommendations(userId: string, properties: any[]): any[] {
    const profile = this.getUserProfile(userId);
    if (!profile) return properties;

    // Sort properties based on voice analysis
    return properties.sort((a, b) => {
      const scoreA = this.calculatePropertyScore(a, profile);
      const scoreB = this.calculatePropertyScore(b, profile);
      return scoreB - scoreA;
    });
  }

  // Calculate property score based on voice profile
  private calculatePropertyScore(property: any, profile: UserVoiceProfile): number {
    let score = 0;
    
    // Match based on personality
    const latestPersonality = profile.personalityHistory[profile.personalityHistory.length - 1];
    
    if (latestPersonality.energy === 'high' && property.lifestyle?.includes('urban')) {
      score += 20;
    }
    if (latestPersonality.social === 'extroverted' && property.nightlife?.length > 0) {
      score += 15;
    }
    
    // Match based on preferences
    const latestPreferences = profile.preferenceHistory[profile.preferenceHistory.length - 1];
    
    latestPreferences.food.forEach(food => {
      if (property.foodNearby?.some((f: string) => f.toLowerCase().includes(food))) {
        score += 10;
      }
    });
    
    latestPreferences.lifestyle.forEach(lifestyle => {
      if (property.lifestyle?.includes(lifestyle)) {
        score += 15;
      }
    });
    
    return score;
  }
}

// Export singleton instance
export const voiceAI = new VoiceAI();
export default voiceAI;
