'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Search, X, Brain, TrendingUp, Target, Zap, Star, Lightbulb } from 'lucide-react';
import { voiceAI, VoiceAnalysisResult } from '@/lib/voiceAI';

interface AIVoiceSearchProps {
  onSearch: (query: string) => void;
  onLocationSearch: (location: string) => void;
  onLifestyleSearch: (lifestyle: string) => void;
  onAIRecommendations: (recommendations: any[]) => void;
  onPropertyCommand?: (command: string, propertyId?: string) => void;
  className?: string;
}

interface PropertyVoiceCommand {
  command: string;
  action: 'rent' | 'save' | 'share' | 'compare' | 'details' | 'contact' | 'directions';
  propertyId?: string;
  confidence: number;
}

interface AIInsights {
  personality: VoiceAnalysisResult['personality'];
  preferences: VoiceAnalysisResult['preferences'];
  compatibility: VoiceAnalysisResult['compatibility'];
  learning: VoiceAnalysisResult['learning'];
  recommendations: string[];
}

export default function AIVoiceSearch({ 
  onSearch, 
  onLocationSearch, 
  onLifestyleSearch, 
  onAIRecommendations,
  onPropertyCommand,
  className = '' 
}: AIVoiceSearchProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState('');
  const [aiInsights, setAIInsights] = useState<AIInsights | null>(null);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [detectedCommands, setDetectedCommands] = useState<PropertyVoiceCommand[]>([]);
  const [showCommands, setShowCommands] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    // Check for speech recognition support
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'en-US';
        
        recognitionInstance.onstart = () => {
          setIsListening(true);
          setError('');
          setIsAnalyzing(false);
        };
        
        recognitionInstance.onresult = async (event) => {
          const current = event.resultIndex;
          const transcript = event.results[current][0].transcript;
          setTranscript(transcript);
          
          if (event.results[current].isFinal) {
            await processVoiceCommand(transcript);
          }
        };
        
        recognitionInstance.onerror = (event) => {
          setError(`Speech recognition error: ${event.error}`);
          setIsListening(false);
          setIsAnalyzing(false);
        };
        
        recognitionInstance.onend = () => {
          setIsListening(false);
        };
        
        setRecognition(recognitionInstance);
        recognitionRef.current = recognitionInstance;
        setIsSupported(true);
      } else {
        setError('Speech recognition not supported in this browser');
      }
    }
  }, []);

  const processVoiceCommand = async (transcript: string) => {
    setIsAnalyzing(true);
    
    try {
      // Get audio data for AI analysis
      const audioData = await getAudioData();
      
      // Analyze voice with AI
      const analysis = voiceAI.analyzeVoicePattern(audioData, transcript);
      
      // Update user profile
      voiceAI.updateUserProfile('current-user', analysis);
      
      // Generate AI insights
      const insights: AIInsights = {
        personality: analysis.personality,
        preferences: analysis.preferences,
        compatibility: analysis.compatibility,
        learning: analysis.learning,
        recommendations: analysis.learning.recommendations
      };
      
      setAIInsights(insights);
      setShowAIInsights(true);
      
      // Process command based on analysis
      await processAICommand(transcript, analysis);
      
    } catch (error) {
      console.error('AI analysis error:', error);
      setError('AI analysis failed. Using basic voice recognition.');
      // Fallback to basic processing
      processBasicCommand(transcript);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getAudioData = async (): Promise<Float32Array> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      
      source.connect(analyser);
      analyser.fftSize = 2048;
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Float32Array(bufferLength);
      analyser.getFloatFrequencyData(dataArray);
      
      stream.getTracks().forEach(track => track.stop());
      audioContext.close();
      
      return dataArray;
    } catch (error) {
      console.error('Audio capture error:', error);
      // Return dummy data for testing
      return new Float32Array(1024).map(() => Math.random() * 2 - 1);
    }
  };

  const processAICommand = async (transcript: string, analysis: VoiceAnalysisResult) => {
    const lowerTranscript = transcript.toLowerCase();
    
    // Property-specific commands
    const propertyCommands = detectPropertyCommands(transcript);
    if (propertyCommands.length > 0) {
      setDetectedCommands(propertyCommands);
      setShowCommands(true);
      
      // Execute the highest confidence command
      const bestCommand = propertyCommands.reduce((prev, current) => 
        prev.confidence > current.confidence ? prev : current
      );
      
      if (onPropertyCommand) {
        onPropertyCommand(bestCommand.action, bestCommand.propertyId);
      }
    }
    
    // Use AI insights to enhance command processing
    else if (lowerTranscript.includes('near') || lowerTranscript.includes('in ') || lowerTranscript.includes('around')) {
      onLocationSearch(transcript);
    } else if (analysis.preferences.lifestyle.length > 0) {
      onLifestyleSearch(analysis.preferences.lifestyle[0]);
    } else if (analysis.preferences.food.length > 0) {
      onLifestyleSearch(`food:${analysis.preferences.food[0]}`);
    } else {
      onSearch(transcript);
    }
    
    // Generate AI recommendations
    const recommendations = voiceAI.getAIRecommendations('current-user', []);
    onAIRecommendations(recommendations);
  };

  // Detect property-specific voice commands
  const detectPropertyCommands = (transcript: string): PropertyVoiceCommand[] => {
    const commands: PropertyVoiceCommand[] = [];
    const lowerTranscript = transcript.toLowerCase();
    
    // Rent commands
    if (lowerTranscript.includes('rent') || lowerTranscript.includes('book') || lowerTranscript.includes('reserve')) {
      commands.push({
        command: transcript,
        action: 'rent',
        confidence: calculateCommandConfidence(transcript, ['rent', 'book', 'reserve', 'take', 'get'])
      });
    }
    
    // Save commands
    if (lowerTranscript.includes('save') || lowerTranscript.includes('favorite') || lowerTranscript.includes('bookmark')) {
      commands.push({
        command: transcript,
        action: 'save',
        confidence: calculateCommandConfidence(transcript, ['save', 'favorite', 'bookmark', 'keep'])
      });
    }
    
    // Share commands
    if (lowerTranscript.includes('share') || lowerTranscript.includes('send') || lowerTranscript.includes('forward')) {
      commands.push({
        command: transcript,
        action: 'share',
        confidence: calculateCommandConfidence(transcript, ['share', 'send', 'forward', 'tell'])
      });
    }
    
    // Compare commands
    if (lowerTranscript.includes('compare') || lowerTranscript.includes('vs') || lowerTranscript.includes('versus')) {
      commands.push({
        command: transcript,
        action: 'compare',
        confidence: calculateCommandConfidence(transcript, ['compare', 'vs', 'versus', 'difference'])
      });
    }
    
    // Details commands
    if (lowerTranscript.includes('details') || lowerTranscript.includes('more info') || lowerTranscript.includes('tell me more')) {
      commands.push({
        command: transcript,
        action: 'details',
        confidence: calculateCommandConfidence(transcript, ['details', 'more info', 'tell me more', 'show me'])
      });
    }
    
    // Contact commands
    if (lowerTranscript.includes('contact') || lowerTranscript.includes('call') || lowerTranscript.includes('message')) {
      commands.push({
        command: transcript,
        action: 'contact',
        confidence: calculateCommandConfidence(transcript, ['contact', 'call', 'message', 'reach'])
      });
    }
    
    // Directions commands
    if (lowerTranscript.includes('directions') || lowerTranscript.includes('how to get') || lowerTranscript.includes('navigate')) {
      commands.push({
        command: transcript,
        action: 'directions',
        confidence: calculateCommandConfidence(transcript, ['directions', 'how to get', 'navigate', 'route'])
      });
    }
    
    return commands.filter(cmd => cmd.confidence > 0.3);
  };

  // Calculate command confidence based on keyword matching
  const calculateCommandConfidence = (transcript: string, keywords: string[]): number => {
    const lowerTranscript = transcript.toLowerCase();
    const matches = keywords.filter(keyword => lowerTranscript.includes(keyword)).length;
    return Math.min(matches / keywords.length, 1);
  };

  const processBasicCommand = (transcript: string) => {
    const lowerTranscript = transcript.toLowerCase();
    
    if (lowerTranscript.includes('near') || lowerTranscript.includes('in ')) {
      onLocationSearch(transcript);
    } else if (lowerTranscript.includes('food') || lowerTranscript.includes('restaurant')) {
      onLifestyleSearch('food');
    } else if (lowerTranscript.includes('gym') || lowerTranscript.includes('fitness')) {
      onLifestyleSearch('fitness');
    } else {
      onSearch(transcript);
    }
  };

  const startListening = async () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setError('');
      setShowAIInsights(false);
      setAIInsights(null);
      
      try {
        // Start audio recording for AI analysis
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];
        
        mediaRecorder.ondataavailable = (event) => {
          chunks.push(event.data);
        };
        
        mediaRecorder.onstop = () => {
          setAudioChunks(chunks);
        };
        
        mediaRecorder.start();
        setMediaRecorder(mediaRecorder);
        mediaRecorderRef.current = mediaRecorder;
        
        // Start speech recognition
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting audio capture:', error);
        recognitionRef.current.start();
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setAIInsights(null);
    setShowAIInsights(false);
  };

  const getPersonalityIcon = (trait: string) => {
    switch (trait) {
      case 'high': return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'medium': return <Target className="w-4 h-4 text-blue-500" />;
      case 'low': return <Star className="w-4 h-4 text-green-500" />;
      default: return <Brain className="w-4 h-4 text-purple-500" />;
    }
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  if (!isSupported) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <p className="text-red-600 text-sm">
          AI Voice search is not supported in your browser. Please use Chrome, Safari, or Edge for the best experience.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* AI Voice Search Interface */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-lg border border-purple-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-600" />
            AI-Powered Voice Search
          </h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-600 font-medium">AI Active</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Speak or type your search... (AI will analyze your voice patterns)"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && transcript.trim()) {
                    processVoiceCommand(transcript);
                  }
                }}
              />
              <button
                onClick={clearTranscript}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={!isSupported}
            className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-purple-500 text-white hover:bg-purple-600'
            } ${!isSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
        </div>

        {/* Status Messages */}
        {isListening && (
          <div className="mt-3 flex items-center space-x-2 text-purple-600">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Listening... AI analyzing voice patterns</span>
          </div>
        )}

        {isAnalyzing && (
          <div className="mt-3 flex items-center space-x-2 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-sm font-medium">AI analyzing personality and preferences...</span>
          </div>
        )}

        {error && (
          <div className="mt-3 text-red-600 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Detected Commands Display */}
      {showCommands && detectedCommands.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center">
              <Target className="w-5 h-5 mr-2 text-green-500" />
              Detected Voice Commands
            </h4>
            <button
              onClick={() => setShowCommands(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-3">
            {detectedCommands.map((command, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    command.confidence > 0.7 ? 'bg-green-500' : 
                    command.confidence > 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <p className="font-medium text-gray-900 capitalize">{command.action}</p>
                    <p className="text-sm text-gray-600">"{command.command}"</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {Math.round(command.confidence * 100)}% confidence
                  </p>
                  <button
                    onClick={() => {
                      if (onPropertyCommand) {
                        onPropertyCommand(command.action, command.propertyId);
                      }
                      setShowCommands(false);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Execute →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Insights Display */}
      {showAIInsights && aiInsights && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
              AI Voice Analysis
            </h4>
            <button
              onClick={() => setShowAIInsights(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personality Analysis */}
            <div>
              <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                <Brain className="w-4 h-4 mr-2 text-purple-600" />
                Personality Traits
              </h5>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Energy Level</span>
                  <div className="flex items-center space-x-2">
                    {getPersonalityIcon(aiInsights.personality.energy)}
                    <span className="text-sm font-medium capitalize">{aiInsights.personality.energy}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Confidence</span>
                  <div className="flex items-center space-x-2">
                    {getPersonalityIcon(aiInsights.personality.confidence)}
                    <span className="text-sm font-medium capitalize">{aiInsights.personality.confidence}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Social Style</span>
                  <div className="flex items-center space-x-2">
                    {getPersonalityIcon(aiInsights.personality.social)}
                    <span className="text-sm font-medium capitalize">{aiInsights.personality.social}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Communication</span>
                  <div className="flex items-center space-x-2">
                    {getPersonalityIcon(aiInsights.personality.communication)}
                    <span className="text-sm font-medium capitalize">{aiInsights.personality.communication}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Preferences & Compatibility */}
            <div>
              <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                <Target className="w-4 h-4 mr-2 text-green-600" />
                Preferences & Compatibility
              </h5>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Compatibility Score</span>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getCompatibilityColor(aiInsights.compatibility.score)}`}>
                    {aiInsights.compatibility.score}%
                  </div>
                </div>
                
                {aiInsights.preferences.lifestyle.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-600">Lifestyle: </span>
                    <span className="text-sm font-medium text-gray-900">
                      {aiInsights.preferences.lifestyle.join(', ')}
                    </span>
                  </div>
                )}
                
                {aiInsights.preferences.food.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-600">Food: </span>
                    <span className="text-sm font-medium text-gray-900">
                      {aiInsights.preferences.food.join(', ')}
                    </span>
                  </div>
                )}
                
                {aiInsights.preferences.cultural.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-600">Cultural: </span>
                    <span className="text-sm font-medium text-gray-900">
                      {aiInsights.preferences.cultural.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          {aiInsights.recommendations.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
                AI Recommendations
              </h5>
              <div className="space-y-2">
                {aiInsights.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
