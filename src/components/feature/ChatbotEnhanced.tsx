
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  VolumeX, 
  Settings, 
  MapPin, 
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isVoice?: boolean;
  metadata?: {
    busInfo?: {
      route?: string;
      stop?: string;
      delay?: number;
      nextBus?: string;
    };
    location?: {
      lat: number;
      lng: number;
      name: string;
    };
  };
}

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

const ChatbotEnhanced: React.FC = () => {
  // Core state management
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  
  // Voice and audio state
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  
  // Settings and UI state
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  
  // Refs for DOM manipulation
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize connection to backend
  const initializeAgent = useCallback(async () => {
    setConnectionStatus('connecting');
    try {
      // Test backend connection
      const response = await fetch('http://localhost:8001/api/health');
      if (response.ok) {
        setConnectionStatus('connected');
        addMessage('🚌 Welcome to BusTracker! I\'m Readdy, your smart bus assistant. I can help with routes, schedules, and real-time tracking. How can I assist you today?', 'system');
      } else {
        throw new Error('Backend not responding');
      }
    } catch (error) {
      setConnectionStatus('error');
      addMessage('❌ Connection failed. Please ensure the backend is running on port 8001.', 'system');
    }
  }, []);

  // Add new message to chat
  const addMessage = useCallback((content: string, type: ChatMessage['type'], isVoice = false, metadata?: ChatMessage['metadata']) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      isVoice,
      metadata
    };
    
    setMessages(prev => [...prev, newMessage]);
  }, []);

  // Send message to Readdy agent
  const sendToReaddy = async (message: string, type: 'text' | 'voice', audioData?: string) => {
    if (connectionStatus !== 'connected') {
      addMessage('❌ Cannot send message. Please check the connection and try again.', 'system');
      return;
    }

    setIsLoading(true);
    try {
      // Get bus data from backend
      const backendResponse = await fetch('http://localhost:8001/api/routes');
      const routeData = await backendResponse.json();
      
      // Create a smart Readdy response based on user input
      let responseMessage = `Hello! I'm Readdy, your BusTracker assistant.`;
      
      if (message.toLowerCase().includes('bus') || message.toLowerCase().includes('route')) {
        responseMessage = `I can see we have ${routeData.routes?.length || 0} active bus routes available right now. How can I help you with your bus journey today?`;
      } else if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
        responseMessage = `Hello! I'm here to help with bus schedules, routes, and real-time information. What would you like to know?`;
      } else {
        responseMessage = `I received your ${type} message. I can help with bus routes, schedules, and real-time tracking. What specific information do you need?`;
      }

      addMessage(responseMessage, 'assistant', false, { busInfo: routeData });
      
      // Text-to-speech for responses
      if (isSpeechEnabled && type === 'voice') {
        await speakText(responseMessage);
      }
    } catch (error) {
      console.error('Error sending to Readdy:', error);
      addMessage('❌ Sorry, I\'m having trouble processing your request. Please try again.', 'system');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle text message submission
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    addMessage(userMessage, 'user');
    await sendToReaddy(userMessage, 'text');
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processVoiceInput(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      addMessage('🎤 Listening...', 'system');
    } catch (error) {
      console.error('Error starting recording:', error);
      addMessage('❌ Could not access microphone. Please check permissions.', 'system');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Process voice input
  const processVoiceInput = async (audioBlob: Blob) => {
    setIsLoading(true);
    try {
      // For now, simulate speech-to-text
      const simulatedText = "Hello, I need help with bus routes";
      addMessage(simulatedText, 'user', true);
      await sendToReaddy(simulatedText, 'voice');
    } catch (error) {
      console.error('Error processing voice:', error);
      addMessage('❌ Could not process voice input. Please try again.', 'system');
    } finally {
      setIsLoading(false);
    }
  };

  // Text-to-speech function
  const speakText = async (text: string) => {
    if (!isSpeechEnabled) return;
    
    try {
      setIsPlayingAudio(true);
      
      // Use Web Speech API for TTS
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onend = () => {
        setIsPlayingAudio(false);
      };
      
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error with text-to-speech:', error);
      setIsPlayingAudio(false);
    }
  };

  // Stop current audio
  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    speechSynthesis.cancel();
    setIsPlayingAudio(false);
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  // Initialize on mount
  useEffect(() => {
    initializeAgent();
  }, [initializeAgent]);

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Connection status indicator
  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'connecting': return <AlertCircle className="w-4 h-4 text-yellow-500 animate-pulse" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  // Message rendering
  const renderMessage = (message: ChatMessage) => (
    <div
      key={message.id}
      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-3`}
    >
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          message.type === 'user'
            ? 'bg-blue-500 text-white'
            : message.type === 'system'
            ? 'bg-gray-100 text-gray-700 text-sm'
            : 'bg-gray-200 text-gray-800'
        }`}
      >
        <p className="text-sm">{message.content}</p>
        {message.isVoice && (
          <span className="text-xs opacity-75 flex items-center mt-1">
            <Mic className="w-3 h-3 mr-1" />
            Voice message
          </span>
        )}
        {message.metadata?.busInfo && (
          <div className="mt-2 p-2 bg-white bg-opacity-20 rounded text-xs">
            <div className="flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              Bus info available
            </div>
          </div>
        )}
        <span className="text-xs opacity-50 block mt-1">
          {message.timestamp.toLocaleTimeString()}
        </span>
      </div>
    </div>
  );

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${isMinimized ? 'w-16 h-16' : 'w-96 h-[600px]'} transition-all duration-300`}>
      {isMinimized ? (
        // Minimized state
        <button
          onClick={() => setIsMinimized(false)}
          className="w-16 h-16 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
        >
          💬
        </button>
      ) : (
        // Full chatbot interface
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 h-full flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                🚌
              </div>
              <div>
                <h3 className="font-semibold text-sm">Readdy Assistant</h3>
                <div className="flex items-center space-x-1 text-xs opacity-90">
                  {getConnectionStatusIcon()}
                  <span className="capitalize">{connectionStatus}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              >
                ➖
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="p-3 border-b border-gray-200 bg-gray-50 text-sm">
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isSpeechEnabled}
                    onChange={(e) => setIsSpeechEnabled(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span>Enable speech</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={autoScroll}
                    onChange={(e) => setAutoScroll(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span>Auto-scroll</span>
                </label>
              </div>
              <button
                onClick={() => setMessages([])}
                className="text-red-600 hover:text-red-800 text-xs"
              >
                Clear chat history
              </button>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.map(renderMessage)}
            {isLoading && (
              <div className="flex justify-start mb-3">
                <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg max-w-xs">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    <span className="text-sm">Readdy is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask Readdy about bus routes, schedules..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  disabled={isLoading || connectionStatus !== 'connected'}
                />
              </div>
              
              {/* Voice button */}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isLoading || connectionStatus !== 'connected'}
                className={`p-2 rounded-lg transition-colors ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Audio control button */}
              {isPlayingAudio && (
                <button
                  onClick={stopAudio}
                  className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                >
                  <VolumeX className="w-4 h-4" />
                </button>
              )}

              {/* Send button */}
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading || connectionStatus !== 'connected'}
                className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            
            {/* Status indicators */}
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <div className="flex items-center space-x-2">
                {connectionStatus === 'connected' && (
                  <>
                    <Clock className="w-3 h-3" />
                    <span>Real-time updates active</span>
                  </>
                )}
              </div>
              <div className="flex items-center space-x-1">
                {isSpeechEnabled && <Volume2 className="w-3 h-3" />}
                <span>BusTracker v2.0</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotEnhanced;
