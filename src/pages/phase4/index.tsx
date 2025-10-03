import Layout from '../../components/feature/Layout';

export default function Phase4() {
  const tabItems = [
    { id: 'overview', name: 'System Overview', icon: 'ri-dashboard-line', active: true },
    { id: 'ai-engine', name: 'AI Prediction Engine', icon: 'ri-brain-line', active: false },
    { id: 'analytics', name: 'Advanced Analytics', icon: 'ri-bar-chart-line', active: false },
    { id: 'integrations', name: 'External Integrations', icon: 'ri-links-line', active: false },
    { id: 'planning', name: 'Multi-Modal Planning', icon: 'ri-route-line', active: false }
  ];

  const features = [
    {
      icon: 'ri-brain-line',
      title: 'AI Prediction Engine',
      description: 'Advanced machine learning models for accurate delay prediction and route optimization',
      color: 'from-blue-500 to-purple-600',
      stats: ['96.7% Accuracy', '2,865 Predictions/day', 'Real-time Learning']
    },
    {
      icon: 'ri-bar-chart-line',
      title: 'Advanced Analytics',
      description: 'Comprehensive data visualization and insights for operational excellence',
      color: 'from-green-500 to-teal-600',
      stats: ['1.3M Data Points', 'Live Dashboards', 'Custom Reports']
    },
    {
      icon: 'ri-links-line',
      title: 'External Integrations',
      description: 'Seamless connectivity with weather, traffic, and campus management systems',
      color: 'from-orange-500 to-red-600',
      stats: ['Weather API', 'Traffic Data', 'Campus Systems']
    },
    {
      icon: 'ri-route-line',
      title: 'Multi-Modal Planning',
      description: 'Intelligent route planning combining buses, walking, and alternative transport',
      color: 'from-purple-500 to-pink-600',
      stats: ['1,247 Routes/hour', 'Multi-Modal', 'Optimized Paths']
    }
  ];

  return (
    <Layout showSystemStatus={true} className="pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="border-b">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabItems.map((tab) => (
                <button
                  key={tab.id}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    tab.active
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <i className={tab.icon}></i>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Phase 4 Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-lg transition-shadow">
              <div className={`h-2 bg-gradient-to-r ${feature.color}`}></div>
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center`}>
                    <i className={`${feature.icon} text-white text-xl`}></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {feature.stats.map((stat, statIndex) => (
                        <span
                          key={statIndex}
                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium"
                        >
                          {stat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Advanced Metrics Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Metrics */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">263</div>
                  <div className="text-sm text-gray-600">Active Trips</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">2,865</div>
                  <div className="text-sm text-gray-600">AI Predictions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">99.6%</div>
                  <div className="text-sm text-gray-600">System Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">96.7%</div>
                  <div className="text-sm text-gray-600">Avg Accuracy</div>
                </div>
              </div>
              
              {/* Mock Chart Area */}
              <div className="mt-8 h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <i className="ri-line-chart-line text-4xl text-gray-400 mb-2"></i>
                  <p className="text-gray-500">Real-time Performance Charts</p>
                  <p className="text-sm text-gray-400">Live analytics visualization</p>
                </div>
              </div>
            </div>
          </div>

          {/* System Components */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">System Components</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i className="ri-brain-line text-blue-600"></i>
                  </div>
                  <div>
                    <div className="font-medium text-sm">Neural Networks</div>
                    <div className="text-xs text-gray-500">Deep Learning Models</div>
                  </div>
                </div>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Active</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <i className="ri-database-line text-green-600"></i>
                  </div>
                  <div>
                    <div className="font-medium text-sm">Data Pipeline</div>
                    <div className="text-xs text-gray-500">Real-time Processing</div>
                  </div>
                </div>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Healthy</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <i className="ri-cloud-line text-purple-600"></i>
                  </div>
                  <div>
                    <div className="font-medium text-sm">Cloud Services</div>
                    <div className="text-xs text-gray-500">Scalable Infrastructure</div>
                  </div>
                </div>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Online</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <i className="ri-links-line text-orange-600"></i>
                  </div>
                  <div>
                    <div className="font-medium text-sm">API Gateway</div>
                    <div className="text-xs text-gray-500">External Connections</div>
                  </div>
                </div>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Warning</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}