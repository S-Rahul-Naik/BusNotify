
import { useState, useEffect } from 'react';

interface TimelineStop {
  id: string;
  name: string;
  scheduledTime: string;
  predictedTime: string;
  actualTime?: string;
  status: 'completed' | 'current' | 'upcoming';
  delay: number;
  passengers: number;
}

interface BusTimelineProps {
  selectedRoute: string | null;
  busId?: string;
}

export default function BusTimeline({ selectedRoute, busId }: BusTimelineProps) {
  const [timelineData, setTimelineData] = useState<TimelineStop[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update current time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Mock timeline data
    const mockTimeline: TimelineStop[] = [
      {
        id: 'stop-1',
        name: 'Central Station',
        scheduledTime: '14:00',
        predictedTime: '14:00',
        actualTime: '14:01',
        status: 'completed',
        delay: 1,
        passengers: 45
      },
      {
        id: 'stop-2',
        name: 'Main Street Plaza',
        scheduledTime: '14:08',
        predictedTime: '14:10',
        actualTime: '14:11',
        status: 'completed',
        delay: 3,
        passengers: 38
      },
      {
        id: 'stop-3',
        name: 'Shopping Center',
        scheduledTime: '14:15',
        predictedTime: '14:18',
        status: 'current',
        delay: 3,
        passengers: 42
      },
      {
        id: 'stop-4',
        name: 'University Campus',
        scheduledTime: '14:22',
        predictedTime: '14:26',
        status: 'upcoming',
        delay: 4,
        passengers: 0
      },
      {
        id: 'stop-5',
        name: 'Hospital District',
        scheduledTime: '14:30',
        predictedTime: '14:35',
        status: 'upcoming',
        delay: 5,
        passengers: 0
      },
      {
        id: 'stop-6',
        name: 'Airport Terminal',
        scheduledTime: '14:45',
        predictedTime: '14:52',
        status: 'upcoming',
        delay: 7,
        passengers: 0
      }
    ];

    setTimelineData(mockTimeline);
  }, [selectedRoute, busId]);

  const getStatusColor = (status: string, delay: number) => {
    if (status === 'completed') return 'bg-gray-400';
    if (status === 'current') return 'bg-blue-500';
    if (delay > 10) return 'bg-red-500';
    if (delay > 5) return 'bg-orange-500';
    if (delay > 0) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'completed') return 'ri-check-line';
    if (status === 'current') return 'ri-bus-line';
    return 'ri-time-line';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Bus Timeline</h2>
            <p className="text-gray-600 mt-1">
              {busId ? `Bus ${busId}` : 'Route progress'} • Updated {currentTime.toLocaleTimeString()}
            </p>
          </div>
          <div className="text-sm text-gray-500">
            <i className="ri-route-line mr-1"></i>
            {selectedRoute || 'All Routes'}
          </div>
        </div>
      </div>

      <div className="p-6">
        {!selectedRoute ? (
          <div className="text-center py-8">
            <i className="ri-route-line text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">Select a route to view timeline</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            <div className="space-y-6">
              {timelineData.map((stop, index) => (
                <div key={stop.id} className="relative flex items-start">
                  {/* Timeline Dot */}
                  <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(stop.status, stop.delay)} text-white shadow-lg`}>
                    <i className={`${getStatusIcon(stop.status)} text-lg`}></i>
                  </div>

                  {/* Stop Information */}
                  <div className="ml-6 flex-1">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{stop.name}</h3>
                        <div className="flex items-center space-x-2">
                          {stop.status === 'current' && (
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                              Current Stop
                            </span>
                          )}
                          {stop.passengers > 0 && (
                            <span className="text-xs text-gray-500">
                              <i className="ri-user-line mr-1"></i>
                              {stop.passengers} passengers
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Scheduled:</span>
                          <span className="ml-2 font-medium">{stop.scheduledTime}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">
                            {stop.status === 'completed' ? 'Actual:' : 'Predicted:'}
                          </span>
                          <span className={`ml-2 font-medium ${
                            stop.delay > 5 ? 'text-red-600' :
                            stop.delay > 0 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {stop.actualTime || stop.predictedTime}
                          </span>
                        </div>
                      </div>

                      {stop.delay !== 0 && (
                        <div className="mt-2">
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            stop.delay > 5 ? 'bg-red-100 text-red-800' :
                            stop.delay > 0 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {stop.delay > 0 ? `+${stop.delay}` : stop.delay} min
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Timeline Summary */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
              <span className="text-gray-600">Completed</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Current</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-gray-600">On Schedule</span>
            </div>
          </div>
          <div className="text-gray-500">
            <i className="ri-time-line mr-1"></i>
            Next update in 30s
          </div>
        </div>
      </div>
    </div>
  );
}
