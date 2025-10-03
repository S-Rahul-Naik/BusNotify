
import { useState } from 'react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  busCount: number;
}

export default function SearchBar({ searchQuery, onSearchChange, busCount }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onSearchChange('');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Search Buses</h2>
        <div className="text-sm text-gray-600">
          {busCount} bus{busCount !== 1 ? 'es' : ''} found
        </div>
      </div>
      
      <div className="relative">
        <div className={`relative flex items-center border-2 rounded-lg transition-colors ${
          isFocused ? 'border-blue-500' : 'border-gray-200'
        }`}>
          <div className="absolute left-3 w-5 h-5 flex items-center justify-center">
            <i className="ri-search-line text-gray-400"></i>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search by bus number, route, or stop name..."
            className="w-full pl-10 pr-10 py-3 text-sm border-0 rounded-lg focus:outline-none focus:ring-0"
          />
          {searchQuery && (
            <button
              onClick={handleClear}
              className="absolute right-3 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600"
            >
              <i className="ri-close-line"></i>
            </button>
          )}
        </div>
        
        {/* Search suggestions */}
        {searchQuery && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            <div className="p-3">
              <div className="text-xs font-medium text-gray-500 mb-2">Quick Filters</div>
              <div className="space-y-1">
                <button
                  onClick={() => onSearchChange('route-1')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                >
                  <i className="ri-route-line mr-2 text-blue-500"></i>
                  Route 42 - Downtown ↔ Airport
                </button>
                <button
                  onClick={() => onSearchChange('delayed')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                >
                  <i className="ri-time-line mr-2 text-red-500"></i>
                  Show only delayed buses
                </button>
                <button
                  onClick={() => onSearchChange('on-time')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                >
                  <i className="ri-check-line mr-2 text-green-500"></i>
                  Show only on-time buses
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search tips */}
      <div className="mt-4 text-xs text-gray-500">
        <div className="flex flex-wrap gap-4">
          <span><strong>Tips:</strong></span>
          <span>• Type bus number (e.g., "001")</span>
          <span>• Search route (e.g., "Route 42")</span>
          <span>• Find by stop (e.g., "Central Station")</span>
        </div>
      </div>
    </div>
  );
}
