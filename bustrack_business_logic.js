// BusTracker Business Logic Handler
// This JavaScript code can be used in n8n Code node for specialized responses

const businessLogic = {
  // BusTracker business information
  businessInfo: {
    name: "BusTracker",
    description: "Intelligent bus delay prediction and passenger notification system",
    accuracy: "87%",
    updateFrequency: "10 seconds",
    uptime: "99.8%",
    activeUsers: "12,847",
    activeBuses: "247"
  },

  // Service categories
  services: {
    prediction: "AI-powered bus delay prediction system",
    tracking: "Real-time tracking with interactive maps",
    notifications: "Multi-channel alerts via push, SMS, and email",
    management: "Route management dashboard for transit authorities",
    analytics: "Comprehensive analytics for transit optimization"
  },

  // Common response patterns
  responsePatterns: {
    greeting: [
      "Hi! I'm Readdy, your BusTracker voice assistant.",
      "Hello! I'm here to help with your transit needs.",
      "Welcome to BusTracker! How can I assist you today?"
    ],
    
    scheduleInquiry: [
      "Let me check the real-time schedule for you.",
      "I'll look up the latest bus times.",
      "Checking current schedules now."
    ],
    
    delayUpdate: [
      "Let me check for any current delays.",
      "I'll get you the latest delay information.",
      "Checking real-time delay status."
    ],
    
    routePlanning: [
      "I can help you plan your route.",
      "Let me find the best transit options for you.",
      "I'll check available routes for your trip."
    ]
  }
};

// Main processing function
function processBusTrackerQuery(input) {
  const message = input.message || input.text || '';
  const messageType = input.type || 'text';
  
  // Intent detection
  const intent = detectIntent(message.toLowerCase());
  
  // Generate appropriate response
  const response = generateResponse(intent, message, messageType);
  
  return {
    intent: intent,
    response: response,
    needsBusData: needsRealTimeData(intent),
    businessContext: getBusinessContext(intent),
    voiceOptimized: optimizeForVoice(response, messageType === 'voice')
  };
}

// Intent detection logic
function detectIntent(message) {
  const intents = {
    greeting: ['hello', 'hi', 'hey', 'good morning', 'good afternoon'],
    schedule: ['schedule', 'next bus', 'when', 'time', 'arrival'],
    delay: ['delay', 'late', 'delayed', 'running behind', 'on time'],
    route: ['route', 'how to get', 'directions', 'way to', 'travel to'],
    location: ['near me', 'nearby', 'closest', 'location', 'where'],
    service: ['what do you do', 'services', 'features', 'about bustrack'],
    notification: ['alerts', 'notifications', 'notify', 'remind', 'updates'],
    help: ['help', 'how does this work', 'what can you do', 'commands']
  };
  
  for (const [intentName, keywords] of Object.entries(intents)) {
    if (keywords.some(keyword => message.includes(keyword))) {
      return intentName;
    }
  }
  
  return 'general';
}

// Response generation
function generateResponse(intent, originalMessage, messageType) {
  const isVoice = messageType === 'voice';
  
  switch (intent) {
    case 'greeting':
      return isVoice 
        ? "Hi! I'm Readdy, your BusTracker voice assistant. What can I help you with today?"
        : "👋 Hi! I'm Readdy, your BusTracker assistant. How can I help with your transit needs?";
        
    case 'schedule':
      return isVoice
        ? "Let me check the real-time schedule for you. Which route or stop are you interested in?"
        : "🚌 Let me check the real-time schedule. Which route or stop would you like to know about?";
        
    case 'delay':
      return isVoice
        ? "I'll check current delays on our system. Are you looking for a specific route?"
        : "⏰ Checking current delays... Are you asking about a specific route?";
        
    case 'route':
      return isVoice
        ? "I can help you plan your route. What's your starting location and destination?"
        : "🗺️ I can help with route planning. Where are you starting from and where do you want to go?";
        
    case 'location':
      return isVoice
        ? "I can find nearby bus stops and routes. May I access your location for accurate results?"
        : "📍 I can find nearby stops and routes. Would you like me to use your current location?";
        
    case 'service':
      return isVoice
        ? "BusTracker provides AI-powered delay predictions with eighty-seven percent accuracy, real-time tracking, and smart notifications. What specific feature interests you?"
        : "🤖 BusTracker offers AI-powered delay predictions (87% accuracy), real-time tracking, smart notifications, and transit analytics. What would you like to know more about?";
        
    case 'notification':
      return isVoice
        ? "We offer smart notifications via push, SMS, and email. Would you like help setting up delay alerts?"
        : "🔔 We provide notifications via push, SMS, and email. Need help setting up alerts for your routes?";
        
    case 'help':
      return isVoice
        ? "I can help with bus schedules, delays, route planning, and notifications. I also provide real-time tracking updates. What would you like to try?"
        : "ℹ️ I can assist with:\n• Real-time schedules & delays\n• Route planning\n• Live tracking\n• Notification setup\n\nWhat can I help you with?";
        
    default:
      return isVoice
        ? "I specialize in bus tracking and transit information. Could you ask about schedules, routes, or delays?"
        : "🚌 I'm here to help with bus schedules, routes, delays, and transit information. What would you like to know?";
  }
}

// Check if real-time data is needed
function needsRealTimeData(intent) {
  const dataRequiredIntents = ['schedule', 'delay', 'route', 'location'];
  return dataRequiredIntents.includes(intent);
}

// Get business context for response
function getBusinessContext(intent) {
  const contextMap = {
    service: businessLogic.businessInfo,
    schedule: { feature: "Real-time tracking", update: businessLogic.businessInfo.updateFrequency },
    delay: { feature: "Delay prediction", accuracy: businessLogic.businessInfo.accuracy },
    notification: { feature: "Multi-channel notifications", channels: ["push", "SMS", "email"] }
  };
  
  return contextMap[intent] || null;
}

// Optimize response for voice output
function optimizeForVoice(response, isVoice) {
  if (!isVoice) return response;
  
  return response
    .replace(/🚌|👋|🗺️|📍|🤖|🔔|ℹ️|⏰/g, '') // Remove emojis
    .replace(/\n•/g, ', ') // Convert bullets to speech
    .replace(/\n/g, '. ') // Convert line breaks
    .replace(/87%/g, 'eighty-seven percent') // Spell out percentages
    .replace(/99.8%/g, 'ninety-nine point eight percent')
    .replace(/&/g, 'and') // Convert symbols
    .trim();
}

// Example usage in n8n Code node:
const input = $input.first().json;
const result = processBusTrackerQuery(input);

return {
  ...input,
  ...result,
  timestamp: new Date().toISOString(),
  processed: true
};