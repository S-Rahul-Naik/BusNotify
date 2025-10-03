
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', path: '/', icon: 'ri-home-line' },
    { name: 'Dashboard', path: '/dashboard', icon: 'ri-dashboard-line' },
    { name: 'Routes', path: '/routes', icon: 'ri-route-line' },
    { name: 'Live Tracking', path: '/live-tracking', icon: 'ri-map-line' },
    { name: 'Schedule', path: '/schedule', icon: 'ri-calendar-line' },
    { name: 'Notifications', path: '/notifications', icon: 'ri-notification-line' }
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <i className="ri-bus-line text-white text-lg"></i>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900" style={{ fontFamily: '"Pacifico", serif' }}>
                  BusTracker
                </h1>
              </button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    isActivePath(item.path)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <i className={`${item.icon} mr-2`}></i>
                  {item.name}
                </button>
              ))}
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              <button 
                onClick={() => navigate('/signin')}
                className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap text-sm font-medium"
              >
                Sign In
              </button>
              <button 
                onClick={() => navigate('/signup')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap text-sm font-medium"
              >
                Sign Up
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <i className={`${isMobileMenuOpen ? 'ri-close-line' : 'ri-menu-line'} text-xl`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-4 py-3 space-y-1">
              {/* Mobile Navigation */}
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center px-3 py-3 rounded-lg text-left transition-colors ${
                    isActivePath(item.path)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <i className={`${item.icon} mr-3 text-lg`}></i>
                  <span className="font-medium">{item.name}</span>
                </button>
              ))}
              
              {/* Mobile Auth Buttons */}
              <div className="pt-3 border-t space-y-2">
                <button 
                  onClick={() => handleNavigation('/signin')}
                  className="w-full text-left px-3 py-3 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors font-medium"
                >
                  <i className="ri-login-box-line mr-3 text-lg"></i>
                  Sign In
                </button>
                <button 
                  onClick={() => handleNavigation('/signup')}
                  className="w-full text-left px-3 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
                >
                  <i className="ri-user-add-line mr-3 text-lg"></i>
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </>
  );
}
