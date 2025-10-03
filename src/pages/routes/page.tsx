
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/feature/Layout';

export default function Routes() {
  const navigate = useNavigate();
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);

  const routes = [
    {
      id: 'route-1',
      name: 'Route 42',
      description: 'Main Campus ↔ Engineering Building',
      color: 'blue',
      buses: 8,
      avgDelay: '+3 min',
      status: 'active',
      totalStops: 12,
      frequency: '15 min',
      operatingHours: '7:00 AM - 10:00 PM'
    },
    {
      id: 'route-2',
      name: 'Route 15',
      description: 'Dormitories ↔ Library Complex',
      color: 'green',
      buses: 6,
      avgDelay: '+1 min',
      status: 'active',
      totalStops: 8,
      frequency: '20 min',
      operatingHours: '6:30 AM - 11:30 PM'
    },
    {
      id: 'route-3',
      name: 'Route 88',
      description: 'Medical Center ↔ Sports Complex',
      color: 'purple',
      buses: 4,
      avgDelay: '+7 min',
      status: 'delayed',
      totalStops: 10,
      frequency: '25 min',
      operatingHours: '8:00 AM - 9:00 PM'
    },
    {
      id: 'route-4',
      name: 'Route 23',
      description: 'Student Housing ↔ Academic Center',
      color: 'orange',
      buses: 6,
      avgDelay: '+2 min',
      status: 'active',
      totalStops: 15,
      frequency: '12 min',
      operatingHours: '7:30 AM - 10:30 PM'
    }
  ];

  const getColorClasses = (color: string, selected: boolean = false) => {
    const colors = {
      blue: selected ? 'bg-blue-50 border-blue-200' : 'bg-blue-500',
      green: selected ? 'bg-green-50 border-green-200' : 'bg-green-500',
      purple: selected ? 'bg-purple-50 border-purple-200' : 'bg-purple-500',
      orange: selected ? 'bg-orange-50 border-orange-200' : 'bg-orange-500'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Layout className="pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Campus Bus Routes</h2>
          <p className="text-base sm:text-lg text-gray-600">
            Explore all available bus routes connecting different campus locations. 
            Tap on any route to view detailed information and real-time tracking.
          </p>
        </div>

        {/* Routes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {routes.map((route) => (
            <div 
              key={route.id}
              className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-200 hover:shadow-xl cursor-pointer ${
                selectedRoute === route.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedRoute(selectedRoute === route.id ? null : route.id)}
            >
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className={`w-3 h-3 sm:w-4 sm:h-4 ${getColorClasses(route.color)} rounded-full mr-2 sm:mr-3 flex-shrink-0`}></div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{route.name}</h3>
                      <p className="text-gray-600 text-sm sm:text-base truncate">{route.description}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <div className="text-sm font-medium text-gray-900">{route.buses} buses</div>
                    <div className={`text-xs ${route.avgDelay.includes('+') ? 'text-yellow-600' : 'text-green-600'}`}>
                      {route.avgDelay} avg
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-4">
                  <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <div className="text-base sm:text-lg font-bold text-gray-900">{route.totalStops}</div>
                    <div className="text-xs text-gray-600">Stops</div>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <div className="text-base sm:text-lg font-bold text-gray-900">{route.frequency}</div>
                    <div className="text-xs text-gray-600">Frequency</div>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <div className={`text-base sm:text-lg font-bold ${getStatusColor(route.status)}`}>
                      {route.status.charAt(0).toUpperCase() + route.status.slice(1)}
                    </div>
                    <div className="text-xs text-gray-600">Status</div>
                  </div>
                </div>

                <div className="mb-3 sm:mb-4">
                  <div className="text-sm text-gray-600 mb-1">Operating Hours</div>
                  <div className="text-sm font-medium text-gray-900">{route.operatingHours}</div>
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/live-tracking', { state: { selectedRoute: route.id } });
                    }}
                    className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors whitespace-nowrap text-sm"
                  >
                    <i className="ri-map-line mr-1"></i>
                    Track Live
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/schedule', { state: { selectedRoute: route.id } });
                    }}
                    className="flex-1 bg-green-100 text-green-700 px-3 py-2 rounded-lg hover:bg-green-200 transition-colors whitespace-nowrap text-sm"
                  >
                    <i className="ri-calendar-line mr-1"></i>
                    Schedule
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {selectedRoute === route.id && (
                <div className="border-t bg-gray-50 p-4 sm:p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Route Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Peak Hours:</span>
                      <span className="font-medium">8:00-10:00 AM, 4:00-6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Journey Time:</span>
                      <span className="font-medium">25-30 minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Wheelchair Accessible:</span>
                      <span className="font-medium text-green-600">Yes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Real-time Updates:</span>
                      <span className="font-medium text-green-600">Available</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <button 
                      onClick={() => navigate('/notifications', { state: { routeId: route.id } })}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap text-sm"
                    >
                      <i className="ri-notification-line mr-2"></i>
                      Subscribe to Route Alerts
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <button 
              onClick={() => navigate('/live-tracking')}
              className="p-3 sm:p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
            >
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center mb-2 sm:mb-3">
                <i className="ri-map-line text-white text-sm sm:text-base"></i>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Live Bus Tracking</h4>
              <p className="text-xs sm:text-sm text-gray-600">See real-time bus locations on campus map</p>
            </button>

            <button 
              onClick={() => navigate('/schedule')}
              className="p-3 sm:p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left"
            >
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-600 rounded-lg flex items-center justify-center mb-2 sm:mb-3">
                <i className="ri-calendar-line text-white text-sm sm:text-base"></i>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Bus Schedules</h4>
              <p className="text-xs sm:text-sm text-gray-600">View timetables and plan your journey</p>
            </button>

            <button 
              onClick={() => navigate('/notifications')}
              className="p-3 sm:p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left"
            >
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-600 rounded-lg flex items-center justify-center mb-2 sm:mb-3">
                <i className="ri-notification-line text-white text-sm sm:text-base"></i>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Notifications</h4>
              <p className="text-xs sm:text-sm text-gray-600">Manage alerts and subscriptions</p>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
