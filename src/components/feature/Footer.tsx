-import { useNavigate } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();

  const quickLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: 'ri-dashboard-line' },
    { name: 'Live Tracking', path: '/live-tracking', icon: 'ri-map-line' },
    { name: 'Routes', path: '/routes', icon: 'ri-route-line' },
    { name: 'Schedule', path: '/schedule', icon: 'ri-calendar-line' }
  ];

  const supportLinks = [
    { name: 'Help Center', icon: 'ri-question-line' },
    { name: 'Contact Support', icon: 'ri-customer-service-line' },
    { name: 'System Status', icon: 'ri-pulse-line' },
    { name: 'API Docs', icon: 'ri-code-line' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <i className="ri-bus-line text-white text-lg"></i>
              </div>
              <h3 className="text-xl font-bold" style={{ fontFamily: '"Pacifico", serif' }}>
                BusTracker
              </h3>
            </div>
            <p className="text-gray-400 text-sm">
              Advanced AI Transit System for smart campus transportation with real-time predictions and analytics.
            </p>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400">System Healthy</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="flex items-center text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    <i className={`${link.icon} mr-2`}></i>
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <button className="flex items-center text-gray-400 hover:text-white transition-colors text-sm">
                    <i className={`${link.icon} mr-2`}></i>
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* System Stats */}
          <div>
            <h4 className="font-semibold mb-4">Live Stats</h4>
            <div className="space-y-3">
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Active Buses</span>
                  <span className="text-green-400 font-semibold">263</span>
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">System Uptime</span>
                  <span className="text-blue-400 font-semibold">99.6%</span>
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">AI Accuracy</span>
                  <span className="text-purple-400 font-semibold">96.7%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2025 BusTracker. Phase 4: Advanced AI Transit System
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <i className="ri-shield-check-line text-green-500"></i>
              <span>Secure Connection</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <i className="ri-time-line text-blue-500"></i>
              <span>Last Updated: 2:00 AM</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}