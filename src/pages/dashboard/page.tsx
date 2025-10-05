
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/feature/Header';
import BusMap from './components/BusMap';
import RouteSelector from './components/RouteSelector';
import NotificationPanel from './components/NotificationPanel';
import ETADisplay from './components/ETADisplay';
import SearchBar from './components/SearchBar';

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [busPositions, setBusPositions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBuses, setFilteredBuses] = useState<any[]>([]);
  const [mapFocusRoute, setMapFocusRoute] = useState<string | null>(null);

  useEffect(() => {
    // Simulate WebSocket connection for real-time updates
    const interval = setInterval(() => {
      // Mock real-time bus position updates
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

  // Filter buses based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredBuses(busPositions);
    } else {
      const filtered = busPositions.filter(bus => 
        bus.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bus.routeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bus.nextStop.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBuses(filtered);
    }
  }, [searchQuery, busPositions]);

  const handleRouteMapView = (routeId: string) => {
    setMapFocusRoute(routeId);
    // Reset focus after animation
    setTimeout(() => setMapFocusRoute(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Search Bar */}
        <div className="mb-6 sm:mb-8">
          <SearchBar 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            busCount={filteredBuses.length}
          />
        </div>

        {/* Quick Navigation */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <button 
            onClick={() => navigate('/routes')}
            className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all text-left"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="ri-route-line text-blue-600 text-lg sm:text-xl"></i>
              </div>
              <div className="ml-3 sm:ml-4 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">All Routes</h3>
                <p className="text-xs sm:text-sm text-gray-600 truncate">View route details</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => navigate('/live-tracking')}
            className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all text-left"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="ri-map-line text-green-600 text-lg sm:text-xl"></i>
              </div>
              <div className="ml-3 sm:ml-4 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Live Tracking</h3>
                <p className="text-xs sm:text-sm text-gray-600 truncate">Real-time bus map</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => navigate('/schedule')}
            className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all text-left"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="ri-calendar-line text-purple-600 text-lg sm:text-xl"></i>
              </div>
              <div className="ml-3 sm:ml-4 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Schedules</h3>
                <p className="text-xs sm:text-sm text-gray-600 truncate">Bus timetables</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => navigate('/notifications')}
            className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all text-left"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <i className="ri-notification-line text-yellow-600 text-lg sm:text-xl"></i>
              </div>
              <div className="ml-3 sm:ml-4 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Notifications</h3>
                <p className="text-xs sm:text-sm text-gray-600 truncate">Manage alerts</p>
              </div>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Route Selection */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <RouteSelector 
              selectedRoute={selectedRoute}
              onRouteSelect={setSelectedRoute}
              onRouteMapView={handleRouteMapView}
            />
          </div>

          {/* Main Map Area */}
          <div className="lg:col-span-2 order-1 lg:order-2" data-map-container>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 sm:p-6 border-b">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Live Bus Tracking</h2>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">Real-time bus positions and predicted arrivals</p>
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
          <div className="lg:col-span-1 space-y-4 sm:space-y-6 order-3">
            <ETADisplay selectedRoute={selectedRoute} />
            <NotificationPanel 
              notifications={notifications}
              setNotifications={setNotifications}
            />
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mt-6 sm:mt-8">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="ri-bus-line text-green-600 text-lg sm:text-xl"></i>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">On Time</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">18</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <i className="ri-time-line text-yellow-600 text-lg sm:text-xl"></i>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Minor Delays</p>
                <p className="text-xl sm:text-2xl font-bold text-yellow-600">4</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <i className="ri-alert-line text-red-600 text-lg sm:text-xl"></i>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Major Delays</p>
                <p className="text-xl sm:text-2xl font-bold text-red-600">2</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="ri-user-line text-purple-600 text-lg sm:text-xl"></i>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Students Tracking</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">1,247</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
