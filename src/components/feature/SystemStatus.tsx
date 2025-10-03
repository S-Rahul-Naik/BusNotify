interface SystemStatusProps {
  className?: string;
}

export default function SystemStatus({ className = "" }: SystemStatusProps) {
  const systemMetrics = [
    { label: 'Total Users', value: '12,851', icon: 'ri-user-line', color: 'blue' },
    { label: 'Active Trips', value: '263', icon: 'ri-map-pin-line', color: 'green' },
    { label: 'AI Predictions', value: '2,865', icon: 'ri-brain-line', color: 'purple' },
    { label: 'System Uptime', value: '99.6%', icon: 'ri-wifi-line', color: 'emerald' },
    { label: 'Avg Accuracy', value: '96.7%', icon: 'ri-award-line', color: 'amber' },
    { label: 'Data Points', value: '1.3M', icon: 'ri-database-line', color: 'indigo' }
  ];

  const recentActivity = [
    {
      type: 'weather',
      message: 'Weather API integration showing minor delays',
      time: '10/4/2025, 1:48:07 AM',
      icon: 'ri-cloudy-line',
      color: 'yellow'
    },
    {
      type: 'success',
      message: 'Multi-modal planner processed 1,247 routes in the last hour',
      time: '10/4/2025, 1:42:07 AM',
      icon: 'ri-check-line',
      color: 'green'
    },
    {
      type: 'alert',
      message: 'Traffic integration detected major incident on Route 42',
      time: '10/4/2025, 1:35:07 AM',
      icon: 'ri-alert-line',
      color: 'red'
    },
    {
      type: 'info',
      message: 'Neural network model retrained with 50K new data points',
      time: '10/4/2025, 1:25:07 AM',
      icon: 'ri-information-line',
      color: 'blue'
    }
  ];

  const getColorClasses = (color: string, type: 'bg' | 'text' | 'border') => {
    const colorMap = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
      green: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
      emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
      amber: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
      indigo: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
      red: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
      yellow: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' }
    };
    return colorMap[color as keyof typeof colorMap]?.[type] || colorMap.blue[type];
  };

  return (
    <div className={`bg-white ${className}`}>
      {/* System Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                <i className="ri-brain-line mr-3"></i>
                Phase 4: Advanced AI Transit System
              </h1>
              <p className="text-blue-100 mt-1">
                AI-powered predictions, analytics, integrations, and multi-modal planning
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-3 py-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">System Healthy</span>
              </div>
              <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                3
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {systemMetrics.map((metric, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getColorClasses(metric.color, 'bg')}`}>
                  <i className={`${metric.icon} ${getColorClasses(metric.color, 'text')} text-lg`}></i>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* System Health & Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Health Status */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">System Health Status</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <i className="ri-brain-line text-blue-600"></i>
                  <span className="font-medium">AI Prediction Engine</span>
                </div>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  healthy
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <i className="ri-bar-chart-line text-green-600"></i>
                  <span className="font-medium">Analytics Dashboard</span>
                </div>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  healthy
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <i className="ri-links-line text-yellow-600"></i>
                  <span className="font-medium">External Integrations</span>
                </div>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                  warning
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <i className="ri-route-line text-green-600"></i>
                  <span className="font-medium">Multi-Modal Planner</span>
                </div>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  healthy
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-4">
                Last health check: 2:00:07 AM
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getColorClasses(activity.color, 'bg')} flex-shrink-0`}>
                      <i className={`${activity.icon} ${getColorClasses(activity.color, 'text')} text-sm`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 mb-1">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}