
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/feature/Header';
import BusMap from '../dashboard/components/BusMap';
import RouteSelector from '../dashboard/components/RouteSelector';
import ETADisplay from '../dashboard/components/ETADisplay';

export default function LiveTracking() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedRoute, setSelectedRoute] = useState<string | null>(
    location.state?.selectedRoute || null
  );
  const [busPositions, setBusPositions] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [mapFocusRoute, setMapFocusRoute] = useState<string | null>(null);

  useEffect(() => {
    // Initialize mock bus positions
    const mockBuses = [
      {
        id: 'BUS-001',
        routeId: 'route-1',
        position: { lat: 40.7128, lng: -74.0060 },
        eta: 8,
        status: 'on-time',
        nextStop: 'Engineering Building',
        delay: 0,
        direction: 'Northbound',
        finalDestination: 'Main Campus',
        completedStops: ['Dormitory A', 'Student Center'],
        upcomingStops: ['Engineering Building', 'Library', 'Main Campus']
      },
      {
        id: 'BUS-002',
        routeId: 'route-1',
        position: { lat: 40.7589, lng: -73.9851 },
        eta: 15,
        status: 'delayed',
        nextStop: 'Library',
        delay: 7,
        direction: 'Southbound',
        finalDestination: 'Dormitory Complex',
        completedStops: ['Main Campus', 'Engineering Building'],
        upcomingStops: ['Library', 'Student Center', 'Dormitory Complex']
      },
      {
        id: 'BUS-003',
        routeId: 'route-2',
        position: { lat: 40.7505, lng: -73.9934 },
        eta: 5,
        status: 'early',
        nextStop: 'Medical Center',
        delay: -2,
        direction: 'Eastbound',
        finalDestination: 'Sports Complex',
        completedStops: ['Dormitory B'],
        upcomingStops: ['Medical Center', 'Library', 'Sports Complex']
      },
      {
        id: 'BUS-004',
        routeId: 'route-2',
        position: { lat: 40.7282, lng: -73.7949 },
        eta: 12,
        status: 'delayed',
        nextStop: 'Sports Complex',
        delay: 5,
        direction: 'Westbound',
        finalDestination: 'Dormitory B',
        completedStops: ['Sports Complex', 'Library', 'Medical Center'],
        upcomingStops: ['Dormitory B']
      },
      {
        id: 'BUS-005',
        routeId: 'route-3',
        position: { lat: 40.6892, lng: -74.0445 },
        eta: 3,
        status: 'on-time',
        nextStop: 'Medical Center',
        delay: 1,
        direction: 'Northbound',
        finalDestination: 'Academic Building',
        completedStops: ['Student Housing'],
        upcomingStops: ['Medical Center', 'Academic Building']
      }
    ];
    
    setBusPositions(mockBuses);

    // Simulate WebSocket connection for real-time updates
    const interval = setInterval(() => {
      setBusPositions(prev => prev.map(bus => ({
        ...bus,
        position: {
          lat: bus.position.lat + (Math.random() - 0.5) * 0.001,
          lng: bus.position.lng + (Math.random() - 0.5) * 0.001
        },
        eta: Math.max(0, bus.eta - 1)
      })));
    }, 10000);

    setIsConnected(true);
    return () => clearInterval(interval);
  }, []);

  const routes = [
    { id: 'route-1', name: 'Route 42', color: 'bg-blue-500', description: 'Main Campus ↔ Engineering', activeBuses: 2, avgDelay: 3 },
    { id: 'route-2', name: 'Route 15', color: 'bg-green-500', description: 'Dormitories ↔ Library', activeBuses: 2, avgDelay: 1 },
    { id: 'route-3', name: 'Route 88', color: 'bg-purple-500', description: 'Medical Center ↔ Sports', activeBuses: 1, avgDelay: 1 },
    { id: 'route-4', name: 'Route 23', color: 'bg-orange-500', description: 'Student Housing ↔ Academic', activeBuses: 0, avgDelay: 0 }
  ];

  // Filter buses based on selected route
  const filteredBuses = selectedRoute 
    ? busPositions.filter(bus => bus.routeId === selectedRoute)
    : busPositions;

  const handleRouteClick = (routeId: string) => {
    // Navigate to routes page with the specific route highlighted
    navigate(`/routes?route=${routeId}`);
  };

  const handleRouteSelect = (routeId: string | null) => {
    setSelectedRoute(routeId);
  };

  const handleRouteMapView = (routeId: string) => {
    setMapFocusRoute(routeId);
    setSelectedRoute(routeId);
    // Reset focus after animation
    setTimeout(() => setMapFocusRoute(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Route Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Active Routes</h2>
                <p className="text-gray-600 mt-1">Click to view route details</p>
              </div>
              
              <div className="p-4">
                <div className="space-y-3">
                  {routes.map((route) => (
                    <button
                      key={route.id}
                      onClick={() => handleRouteClick(route.id)}
                      className={`w-full text-left p-4 rounded-lg transition-all duration-200 hover:shadow-md hover:bg-blue-50 border-2 border-transparent hover:border-blue-200 ${
                        selectedRoute === route.id 
                          ? 'bg-blue-50 border-blue-200 shadow-sm' 
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-4 h-4 ${route.color} rounded-full mr-3`}></div>
                          <div>
                            <div className="font-semibold text-gray-900">{route.name}</div>
                            <div className="text-sm text-gray-600">{route.description}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{route.activeBuses} buses</div>
                          <div className={`text-xs ${route.avgDelay > 5 ? 'text-red-600' : route.avgDelay > 2 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {route.avgDelay > 0 ? `+${route.avgDelay}` : route.avgDelay} min avg
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <button
                    onClick={() => handleRouteSelect(null)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                      selectedRoute === null 
                        ? 'bg-blue-50 border-2 border-blue-200' 
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-gray-400 rounded-full mr-3"></div>
                      <div>
                        <div className="font-semibold text-gray-900">All Routes</div>
                        <div className="text-sm text-gray-600">View all buses</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Map Area */}
          <div className="lg:col-span-2" data-map-container>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Real-Time Bus Map</h2>
                <p className="text-gray-600 mt-1">Live bus positions and route tracking</p>
              </div>
              <BusMap 
                selectedRoute={selectedRoute}
                busPositions={filteredBuses}
                setBusPositions={setBusPositions}
                focusRoute={mapFocusRoute}
              />
            </div>
          </div>

          {/* Side Panel */}
          <div className="lg:col-span-1">
            <ETADisplay selectedRoute={selectedRoute} />
          </div>
        </div>
      </div>
    </div>
  );
}
