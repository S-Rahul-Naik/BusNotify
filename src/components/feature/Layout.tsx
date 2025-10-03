import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import SystemStatus from './SystemStatus';

interface LayoutProps {
  children: ReactNode;
  showSystemStatus?: boolean;
  className?: string;
}

export default function Layout({ children, showSystemStatus = false, className = "" }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Static Header - Always Present */}
      <Header />
      
      {/* Optional System Status - For admin/advanced pages */}
      {showSystemStatus && <SystemStatus />}
      
      {/* Main Content Area */}
      <main className={`flex-1 ${className}`}>
        {children}
      </main>
      
      {/* Static Footer - Always Present */}
      <Footer />
      
      {/* Fixed Bottom Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-600 font-medium">Live</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <i className="ri-bus-line"></i>
                <span>263 Active Buses</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <i className="ri-time-line"></i>
                <span>Updated 30s ago</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <i className="ri-wifi-line text-green-500"></i>
                <span>99.6% Uptime</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <i className="ri-brain-line text-purple-500"></i>
                <span>96.7% AI Accuracy</span>
              </div>
              <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-700 transition-colors">
                <i className="ri-customer-service-line mr-1"></i>
                Talk with Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}