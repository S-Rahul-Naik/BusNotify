
import { useState, useEffect } from 'react';

interface BusPosition {
  id: string;
  routeId: string;
  position: {
    lat: number;
    lng: number;
  };
  eta: number;
  status: 'on-time' | 'delayed' | 'early';
  nextStop: string;
  delay: number;
  direction: string;
  finalDestination: string;
  completedStops: string[];
  upcomingStops: string[];
}

interface BusStop {
  id: string;
  name: string;
  position: { lat: number; lng: number };
  status: 'completed' | 'next' | 'upcoming';
  eta?: number;
}

interface BusMapProps {
  selectedRoute: string | null;
  busPositions: BusPosition[];
  setBusPositions: (positions: BusPosition[]) => void;
  focusRoute?: string | null;
}

export default function BusMap({ selectedRoute, busPositions, setBusPositions, focusRoute }: BusMapProps) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedBus, setSelectedBus] = useState<string | null>(null);
  const [mapHighlight, setMapHighlight] = useState<string | null>(null);
  const [busStops, setBusStops] = useState<BusStop[]>([]);

  // Initialize mock bus positions with enhanced data
  useEffect(() => {
    const mockBuses: BusPosition[] = [
      {
        id: 'BUS-001',
        routeId: 'route-1',
        position: { lat: 40.7128, lng: -74.0060 },
        eta: 8,
        status: 'on-time',
        nextStop: 'Central Station',
        delay: 0,
        direction: 'Northbound',
        finalDestination: 'Airport Terminal',
        completedStops: ['Downtown Hub', 'City Hall'],
        upcomingStops: ['Central Station', 'Main Street', 'Shopping Center', 'Airport Terminal']
      },
      {
        id: 'BUS-002',
        routeId: 'route-1',
        position: { lat: 40.7589, lng: -73.9851 },
        eta: 15,
        status: 'delayed',
        nextStop: 'Times Square',
        delay: 7,
        direction: 'Southbound',
        finalDestination: 'Downtown Hub',
        completedStops: ['Airport Terminal', 'Shopping Center'],
        upcomingStops: ['Times Square', 'Central Station', 'City Hall', 'Downtown Hub']
      },
      {
        id: 'BUS-003',
        routeId: 'route-2',
        position: { lat: 40.7505, lng: -73.9934 },
        eta: 5,
        status: 'early',
        nextStop: 'Broadway Junction',
        delay: -2,
        direction: 'Eastbound',
        finalDestination: 'University Campus',
        completedStops: ['Mall Entrance'],
        upcomingStops: ['Broadway Junction', 'Library', 'Student Center', 'University Campus']
      },
      {
        id: 'BUS-004',
        routeId: 'route-2',
        position: { lat: 40.7282, lng: -73.7949 },
        eta: 12,
        status: 'delayed',
        nextStop: 'University Campus',
        delay: 5,
        direction: 'Westbound',
        finalDestination: 'Shopping Mall',
        completedStops: ['University Campus', 'Student Center', 'Library'],
        upcomingStops: ['Broadway Junction', 'Shopping Mall']
      },
      {
        id: 'BUS-005',
        routeId: 'route-3',
        position: { lat: 40.6892, lng: -74.0445 },
        eta: 3,
        status: 'on-time',
        nextStop: 'Hospital District',
        delay: 1,
        direction: 'Northbound',
        finalDestination: 'Train Station',
        completedStops: ['Medical Center'],
        upcomingStops: ['Hospital District', 'City Park', 'Train Station']
      }
    ];
    
    setBusPositions(mockBuses);
    setMapLoaded(true);
  }, [setBusPositions]);

  // Generate bus stops when a bus is selected
  useEffect(() => {
    if (selectedBus) {
      const bus = busPositions.find(b => b.id === selectedBus);
      if (bus) {
        const mockStops: BusStop[] = [
          // Completed stops
          ...bus.completedStops.map((stop, index) => ({
            id: `completed-${index}`,
            name: stop,
            position: { 
              lat: 40.7128 + (index * 0.02), 
              lng: -74.0060 + (index * 0.015) 
            },
            status: 'completed' as const
          })),
          // Upcoming stops
          ...bus.upcomingStops.map((stop, index) => ({
            id: `upcoming-${index}`,
            name: stop,
            position: { 
              lat: 40.7128 + ((bus.completedStops.length + index) * 0.02), 
              lng: -74.0060 + ((bus.completedStops.length + index) * 0.015) 
            },
            status: index === 0 ? 'next' as const : 'upcoming' as const,
            eta: index === 0 ? bus.eta : bus.eta + (index * 5)
          }))
        ];
        setBusStops(mockStops);
      }
    } else {
      setBusStops([]);
    }
  }, [selectedBus, busPositions]);

  const filteredBuses = selectedRoute 
    ? busPositions.filter(bus => bus.routeId === selectedRoute)
    : busPositions;

  const getStatusColor = (status: string, delay: number) => {
    if (delay > 10) return 'bg-red-600'; // Major delay
    if (delay > 5) return 'bg-orange-500'; // Minor delay
    if (status === 'delayed') return 'bg-yellow-500';
    if (status === 'early') return 'bg-blue-500';
    return 'bg-green-500'; // On time
  };

  const getStatusText = (status: string, delay: number) => {
    if (delay > 10) return 'Major Delay';
    if (delay > 5) return 'Minor Delay';
    if (status === 'early') return 'Arriving Soon';
    return 'On Time';
  };

  const getStopColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-gray-400';
      case 'next': return 'bg-blue-500';
      case 'upcoming': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction.toLowerCase()) {
      case 'northbound': return 'ri-arrow-up-line';
      case 'southbound': return 'ri-arrow-down-line';
      case 'eastbound': return 'ri-arrow-right-line';
      case 'westbound': return 'ri-arrow-left-line';
      default: return 'ri-navigation-line';
    }
  };

  // Handle route focus animation
  useEffect(() => {
    if (focusRoute) {
      setMapHighlight(focusRoute);
      // Remove highlight after animation
      setTimeout(() => setMapHighlight(null), 2000);
    }
  }, [focusRoute]);

  const handleBusClick = (busId: string) => {
    setSelectedBus(selectedBus === busId ? null : busId);
  };

  return (
    <div className="relative h-96 bg-gray-100">
      {/* Google Maps Embed */}
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.15830869428!2d-74.119763973046!3d40.69766374874431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sus!4v1647834567890!5m2!1sen!2sus"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="rounded-b-xl"
      ></iframe>

      {/* Bus Stops Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {mapLoaded && selectedBus && busStops.map((stop, index) => (
          <div
            key={stop.id}
            className="absolute pointer-events-auto"
            style={{
              left: `${15 + index * 12}%`,
              top: `${20 + index * 8}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="relative">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg ${getStopColor(stop.status)} border-2 border-white`}>
                {stop.status === 'completed' ? (
                  <i className="ri-check-line text-xs"></i>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              
              {/* Stop Info Popup */}
              {(stop.status === 'next' || index < 3) && (
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl px-3 py-2 text-xs whitespace-nowrap border z-20">
                  <div className="font-bold text-gray-900">{stop.name}</div>
                  {stop.status === 'next' && (
                    <div className="text-blue-600 font-medium">Next Stop • {stop.eta} min</div>
                  )}
                  {stop.status === 'upcoming' && stop.eta && (
                    <div className="text-green-600">ETA: {stop.eta} min</div>
                  )}
                  {stop.status === 'completed' && (
                    <div className="text-gray-500">Completed</div>
                  )}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-white"></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Route Path Line */}
      {selectedBus && busStops.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full">
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#10B981" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#6B7280" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            <polyline
              points={busStops.map((_, index) => 
                `${15 + index * 12}%,${20 + index * 8}%`
              ).join(' ')}
              fill="none"
              stroke="url(#routeGradient)"
              strokeWidth="3"
              strokeDasharray="5,5"
              className="animate-pulse"
            />
          </svg>
        </div>
      )}

      {/* Bus Overlay with enhanced status indicators */}
      <div className="absolute inset-0 pointer-events-none">
        {mapLoaded && filteredBuses.map((bus, index) => {
          const isSelected = selectedBus === bus.id;
          return (
            <div
              key={bus.id}
              className={`absolute pointer-events-auto cursor-pointer transition-all duration-500 ${
                mapHighlight === bus.routeId ? 'scale-125 z-20' : isSelected ? 'scale-110 z-30' : 'z-10'
              }`}
              style={{
                left: `${20 + index * 15}%`,
                top: `${30 + index * 10}%`,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={() => handleBusClick(bus.id)}
            >
              <div className="relative">
                {/* Bus Icon with Status Ring */}
                <div className="relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg ${getStatusColor(bus.status, bus.delay)} border-2 border-white ${
                    mapHighlight === bus.routeId ? 'ring-4 ring-blue-400 ring-opacity-75' : ''
                  } ${isSelected ? 'ring-4 ring-purple-400 ring-opacity-75' : ''}`}>
                    <i className={`ri-bus-fill ${isSelected ? 'text-lg' : ''}`}></i>
                  </div>
                  
                  {/* Direction Arrow */}
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-lg">
                      <i className={`${getDirectionIcon(bus.direction)} text-xs`}></i>
                    </div>
                  )}

                  {/* Pulsing ring for delayed buses or highlighted route */}
                  {(bus.delay > 5 || mapHighlight === bus.routeId || isSelected) && (
                    <div className={`absolute inset-0 rounded-full animate-ping ${
                      isSelected ? 'bg-purple-400' :
                      mapHighlight === bus.routeId ? 'bg-blue-400' : getStatusColor(bus.status, bus.delay)
                    } opacity-75`}></div>
                  )}
                </div>

                {/* Enhanced Info Popup */}
                {(selectedBus === bus.id || index === 0 || mapHighlight === bus.routeId) && (
                  <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl px-4 py-3 text-xs whitespace-nowrap border z-10 min-w-48">
                    <div className="font-bold text-gray-900 flex items-center justify-between">
                      <span>{bus.id}</span>
                      {isSelected && (
                        <span className="text-purple-600 text-xs">SELECTED</span>
                      )}
                    </div>
                    <div className="text-gray-600 flex items-center">
                      <i className={`${getDirectionIcon(bus.direction)} mr-1`}></i>
                      {bus.direction} to {bus.finalDestination}
                    </div>
                    <div className="text-gray-600">{bus.eta} min to {bus.nextStop}</div>
                    <div className={`font-medium ${
                      bus.delay > 10 ? 'text-red-600' :
                      bus.delay > 5 ? 'text-orange-500' :
                      bus.delay > 0 ? 'text-yellow-600' :
                      bus.delay < 0 ? 'text-blue-600' : 'text-green-600'
                    }`}>
                      {getStatusText(bus.status, bus.delay)}
                      {bus.delay !== 0 && ` (${bus.delay > 0 ? '+' : ''}${bus.delay} min)`}
                    </div>
                    {mapHighlight === bus.routeId && (
                      <div className="text-blue-600 font-medium">Route Focused</div>
                    )}
                    {isSelected && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="text-gray-500 text-xs">
                          Completed: {bus.completedStops.length} stops
                        </div>
                        <div className="text-gray-500 text-xs">
                          Remaining: {bus.upcomingStops.length} stops
                        </div>
                      </div>
                    )}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 space-y-2">
        <button className="bg-white rounded-lg shadow-lg p-2 hover:bg-gray-50 transition-colors">
          <i className="ri-zoom-in-line text-gray-600"></i>
        </button>
        <button className="bg-white rounded-lg shadow-lg p-2 hover:bg-gray-50 transition-colors">
          <i className="ri-zoom-out-line text-gray-600"></i>
        </button>
        <button className="bg-white rounded-lg shadow-lg p-2 hover:bg-gray-50 transition-colors">
          <i className="ri-focus-3-line text-gray-600"></i>
        </button>
        <button className="bg-white rounded-lg shadow-lg p-2 hover:bg-gray-50 transition-colors">
          <i className="ri-refresh-line text-gray-600"></i>
        </button>
        {selectedBus && (
          <button 
            onClick={() => setSelectedBus(null)}
            className="bg-purple-600 text-white rounded-lg shadow-lg p-2 hover:bg-purple-700 transition-colors"
          >
            <i className="ri-close-line"></i>
          </button>
        )}
      </div>

      {/* Enhanced Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4">
        <div className="text-xs font-semibold text-gray-700 mb-3">
          {selectedBus ? 'Route & Stops' : 'Bus Status'}
        </div>
        <div className="space-y-2">
          {selectedBus ? (
            <>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-400 rounded-full mr-2"></div>
                <span className="text-xs text-gray-600">Completed Stops</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-xs text-gray-600">Next Stop</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                <span className="text-xs text-gray-600">Upcoming Stops</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-purple-600 rounded-full mr-2"></div>
                <span className="text-xs text-gray-600">Selected Bus</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                <span className="text-xs text-gray-600">On Time</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-xs text-gray-600">Minor Delay (1-5 min)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-orange-500 rounded-full mr-2"></div>
                <span className="text-xs text-gray-600">Moderate Delay (5-10 min)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-600 rounded-full mr-2"></div>
                <span className="text-xs text-gray-600">Major Delay (10+ min)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-xs text-gray-600">Arriving Soon</span>
              </div>
            </>
          )}
        </div>
        {selectedBus && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Click bus again to deselect
            </div>
          </div>
        )}
      </div>

      {/* Live Update Indicator */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg px-3 py-2">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          <span className="text-xs text-gray-600 font-medium">
            {selectedBus ? 'Route Tracking' : 'Live Updates'}
          </span>
        </div>
      </div>
    </div>
  );
}
