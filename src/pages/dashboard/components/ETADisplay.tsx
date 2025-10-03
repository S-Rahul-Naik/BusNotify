
import { useState, useEffect } from 'react';
import BusTimeline from './BusTimeline';

interface Stop {
  id: string;
  name: string;
  scheduledTime: string;
  predictedTime: string;
  delay: number;
  status: 'on-time' | 'delayed' | 'early';
  confidence: number;
  passengers: number;
}

interface ETADisplayProps {
  selectedRoute: string | null;
}

export default function ETADisplay({ selectedRoute }: ETADisplayProps) {
  const [stops, setStops] = useState<Stop[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [showTimeline, setShowTimeline] = useState(false);
  const [selectedBus, setSelectedBus] = useState<string | null>(null);

  useEffect(() => {
    // Mock ETA data based on selected route
    const mockStops: Stop[] = [
      {
        id: 'stop-1',
        name: 'Central Station',
        scheduledTime: '14:30',
        predictedTime: '14:33',
        delay: 3,
        status: 'delayed',
        confidence: 87,
        passengers: 45
      },
      {
        id: 'stop-2',
        name: 'Main Street',
        scheduledTime: '14:35',
        predictedTime: '14:37',
        delay: 2,
        status: 'delayed',
        confidence: 92,
        passengers: 38
      },
      {
        id: 'stop-3',
        name: 'Shopping Center',
        scheduledTime: '14:42',
        predictedTime: '14:42',
        delay: 0,
        status: 'on-time',
        confidence: 95,
        passengers: 52
      },
      {
        id: 'stop-4',
        name: 'University Campus',
        scheduledTime: '14:48',
        predictedTime: '14:46',
        delay: -2,
        status: 'early',
        confidence: 89,
        passengers: 67
      },
      {
        id: 'stop-5',
        name: 'Airport Terminal',
        scheduledTime: '15:00',
        predictedTime: '15:03',
        delay: 3,
        status: 'delayed',
        confidence: 84,
        passengers: 23
      }
    ];

    setStops(mockStops);
    setLastUpdated(new Date());

    // Update ETAs every 30 seconds
    const interval = setInterval(() => {
      setStops(prev => prev.map(stop => ({
        ...stop,
        delay: Math.max(-5, Math.min(15, stop.delay + (Math.random() - 0.5) * 2)),
        confidence: Math.max(75, Math.min(98, stop.confidence + (Math.random() - 0.5) * 5)),
        predictedTime: new Date(Date.now() + stop.delay * 60000).toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      })));
      setLastUpdated(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedRoute]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (status: string, delay: number) => {
    if (delay > 10) return 'bg-red-100 text-red-800';
    if (delay > 5) return 'bg-orange-100 text-orange-800';
    if (status === 'delayed') return 'bg-yellow-100 text-yellow-800';
    if (status === 'early') return 'bg-blue-100 text-blue-800';
    return 'bg-green-100 text-green-800';
  };

  if (showTimeline) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setShowTimeline(false)}
          className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          <i className="ri-arrow-left-line mr-1"></i>
          Back to ETA Display
        </button>
        <BusTimeline selectedRoute={selectedRoute} busId={selectedBus} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Next Arrivals</h2>
            <p className="text-gray-600 mt-1">AI-powered predictions</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowTimeline(true)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium whitespace-nowrap"
            >
              <i className="ri-timeline-view mr-1"></i>
              Timeline View
            </button>
            <div className="text-xs text-gray-500">
              Updated {lastUpdated.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {!selectedRoute ? (
          <div className="text-center py-8">
            <i className="ri-map-pin-line text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">Select a route to view arrival times</p>
          </div>
        ) : (
          <div className="space-y-4">
            {stops.map((stop, index) => (
              <div key={stop.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{stop.name}</div>
                      <div className="text-sm text-gray-600 flex items-center">
                        <i className="ri-user-line mr-1"></i>
                        {stop.passengers} passengers waiting
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-gray-900">{stop.predictedTime}</div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusBadge(stop.status, stop.delay)}`}>
                        {stop.delay > 0 ? `+${stop.delay}` : stop.delay} min
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-600">
                    Scheduled: {stop.scheduledTime}
                  </div>
                  <div className="flex items-center">
                    <span className={`${getConfidenceColor(stop.confidence)} font-medium`}>
                      {stop.confidence}% confidence
                    </span>
                    <div className="ml-2 w-16 bg-gray-200 rounded-full h-1">
                      <div 
                        className={`h-1 rounded-full ${
                          stop.confidence >= 90 ? 'bg-green-500' :
                          stop.confidence >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${stop.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-600">
            <i className="ri-brain-line mr-1"></i>
            ML-powered predictions
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              <span className="text-xs text-gray-600">High confidence</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
              <span className="text-xs text-gray-600">Medium confidence</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
              <span className="text-xs text-gray-600">Low confidence</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
