
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/feature/Header';

export default function Schedule() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedRoute, setSelectedRoute] = useState<string>(
    location.state?.selectedRoute || 'route-1'
  );
  const [selectedDay, setSelectedDay] = useState<string>('weekday');

  const routes = [
    { id: 'route-1', name: 'Route 42', description: 'Main Campus ↔ Engineering Building', color: 'blue' },
    { id: 'route-2', name: 'Route 15', description: 'Dormitories ↔ Library Complex', color: 'green' },
    { id: 'route-3', name: 'Route 88', description: 'Medical Center ↔ Sports Complex', color: 'purple' },
    { id: 'route-4', name: 'Route 23', description: 'Student Housing ↔ Academic Center', color: 'orange' }
  ];

  const scheduleData = {
    'route-1': {
      weekday: {
        frequency: '15 minutes',
        firstBus: '7:00 AM',
        lastBus: '10:00 PM',
        peakHours: '8:00-10:00 AM, 4:00-6:00 PM',
        times: [
          '7:00', '7:15', '7:30', '7:45', '8:00', '8:15', '8:30', '8:45', '9:00', '9:15', '9:30', '9:45',
          '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45', '12:00', '12:15', '12:30', '12:45',
          '1:00', '1:15', '1:30', '1:45', '2:00', '2:15', '2:30', '2:45', '3:00', '3:15', '3:30', '3:45',
          '4:00', '4:15', '4:30', '4:45', '5:00', '5:15', '5:30', '5:45', '6:00', '6:15', '6:30', '6:45',
          '7:00', '7:15', '7:30', '7:45', '8:00', '8:15', '8:30', '8:45', '9:00', '9:15', '9:30', '9:45', '10:00'
        ]
      },
      weekend: {
        frequency: '30 minutes',
        firstBus: '9:00 AM',
        lastBus: '8:00 PM',
        peakHours: 'N/A',
        times: [
          '9:00', '9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
          '1:00', '1:30', '2:00', '2:30', '3:00', '3:30', '4:00', '4:30',
          '5:00', '5:30', '6:00', '6:30', '7:00', '7:30', '8:00'
        ]
      }
    }
  };

  const currentRoute = routes.find(r => r.id === selectedRoute);
  const currentSchedule = scheduleData[selectedRoute as keyof typeof scheduleData]?.[selectedDay as keyof typeof scheduleData['route-1']] || scheduleData['route-1'].weekday;

  const getCurrentTime = () => {
    const now = new Date();
    return now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();
  };

  const getNextBuses = () => {
    const currentTime = getCurrentTime();
    const [currentHour, currentMinute] = currentTime.split(':').map(Number);
    const currentTotalMinutes = currentHour * 60 + currentMinute;

    return currentSchedule.times
      .map(time => {
        const [hour, minute] = time.split(':').map(Number);
        const totalMinutes = hour * 60 + minute;
        return { time, totalMinutes };
      })
      .filter(({ totalMinutes }) => totalMinutes > currentTotalMinutes)
      .slice(0, 3);
  };

  const nextBuses = getNextBuses();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Route and Day Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Route Selection */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Route</h2>
            <div className="space-y-3">
              {routes.map((route) => (
                <button
                  key={route.id}
                  onClick={() => setSelectedRoute(route.id)}
                  className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                    selectedRoute === route.id 
                      ? 'bg-blue-50 border-2 border-blue-200' 
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-4 h-4 bg-${route.color}-500 rounded-full mr-3`}></div>
                    <div>
                      <div className="font-semibold text-gray-900">{route.name}</div>
                      <div className="text-sm text-gray-600">{route.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Day Selection */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Schedule Type</h2>
            <div className="space-y-3">
              <button
                onClick={() => setSelectedDay('weekday')}
                className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                  selectedDay === 'weekday' 
                    ? 'bg-blue-50 border-2 border-blue-200' 
                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">Weekdays</div>
                    <div className="text-sm text-gray-600">Monday - Friday</div>
                  </div>
                  <i className="ri-calendar-line text-gray-400"></i>
                </div>
              </button>

              <button
                onClick={() => setSelectedDay('weekend')}
                className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                  selectedDay === 'weekend' 
                    ? 'bg-blue-50 border-2 border-blue-200' 
                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">Weekends</div>
                    <div className="text-sm text-gray-600">Saturday - Sunday</div>
                  </div>
                  <i className="ri-calendar-2-line text-gray-400"></i>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Schedule Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Next Buses */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Buses</h3>
            <div className="space-y-3">
              {nextBuses.map((bus, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                      <i className="ri-bus-line text-white text-sm"></i>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{bus.time} {parseInt(bus.time.split(':')[0]) < 12 ? 'AM' : 'PM'}</div>
                      <div className="text-sm text-gray-600">
                        {index === 0 ? 'Next bus' : `In ${Math.ceil((bus.totalMinutes - (new Date().getHours() * 60 + new Date().getMinutes())) / 60)} hours`}
                      </div>
                    </div>
                  </div>
                  {index === 0 && (
                    <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Coming Soon
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Schedule Info */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Info</h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600">Frequency</div>
                <div className="font-medium text-gray-900">{currentSchedule.frequency}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">First Bus</div>
                <div className="font-medium text-gray-900">{currentSchedule.firstBus}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Last Bus</div>
                <div className="font-medium text-gray-900">{currentSchedule.lastBus}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Peak Hours</div>
                <div className="font-medium text-gray-900">{currentSchedule.peakHours}</div>
              </div>
            </div>
          </div>

          {/* Route Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/live-tracking', { state: { selectedRoute } })}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                <i className="ri-map-line mr-2"></i>
                Track This Route
              </button>
              <button 
                onClick={() => navigate('/notifications', { state: { routeId: selectedRoute } })}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
              >
                <i className="ri-notification-line mr-2"></i>
                Set Alerts
              </button>
              <button className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap">
                <i className="ri-download-line mr-2"></i>
                Download Schedule
              </button>
            </div>
          </div>
        </div>

        {/* Full Schedule */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {currentRoute?.name} - Full Schedule
                </h3>
                <p className="text-gray-600 mt-1">
                  {selectedDay === 'weekday' ? 'Monday - Friday' : 'Saturday - Sunday'} schedule
                </p>
              </div>
              <div className="text-sm text-gray-600">
                All times shown in 24-hour format
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-3">
              {currentSchedule.times.map((time, index) => {
                const currentTime = getCurrentTime();
                const [currentHour, currentMinute] = currentTime.split(':').map(Number);
                const [timeHour, timeMinute] = time.split(':').map(Number);
                const isNext = timeHour * 60 + timeMinute > currentHour * 60 + currentMinute;
                const isCurrentNext = isNext && index === currentSchedule.times.findIndex(t => {
                  const [h, m] = t.split(':').map(Number);
                  return h * 60 + m > currentHour * 60 + currentMinute;
                });

                return (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg text-center transition-all ${
                      isCurrentNext 
                        ? 'bg-blue-100 border-2 border-blue-500 text-blue-700 font-bold' 
                        : isNext 
                          ? 'bg-green-50 text-green-700' 
                          : 'bg-gray-50 text-gray-500'
                    }`}
                  >
                    <div className="text-sm font-medium">
                      {time}
                    </div>
                    {isCurrentNext && (
                      <div className="text-xs mt-1">Next</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
