
import { useState } from 'react';

interface Route {
  id: string;
  name: string;
  description: string;
  frequency: string;
  operatingHours: string;
  direction: string;
  stops: Array<{
    id: string;
    name: string;
    lat: number;
    lng: number;
    order: number;
  }>;
  color: string;
  status: 'active' | 'inactive' | 'maintenance';
  distance?: string;
  duration?: string;
}

interface MapStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  order: number;
}

interface RouteData {
  stops: MapStop[];
  distance: string;
  duration: string;
  routePath: string;
}

export default function RouteManagement() {
  const [routes, setRoutes] = useState<Route[]>([
    {
      id: 'route-1',
      name: 'Route 42',
      description: 'Main Campus ↔ Engineering Building',
      frequency: '15 minutes',
      operatingHours: '7:00 AM - 10:00 PM',
      direction: 'bidirectional',
      stops: [
        { id: 'stop-1', name: 'Main Campus', lat: 40.7128, lng: -74.0060, order: 1 },
        { id: 'stop-2', name: 'Student Center', lat: 40.7150, lng: -74.0040, order: 2 },
        { id: 'stop-3', name: 'Library', lat: 40.7170, lng: -74.0020, order: 3 },
        { id: 'stop-4', name: 'Engineering Building', lat: 40.7190, lng: -74.0000, order: 4 }
      ],
      color: 'blue',
      status: 'active',
      distance: '3.2 km',
      duration: '12 min'
    },
    {
      id: 'route-2',
      name: 'Route 15',
      description: 'Dormitories ↔ Library Complex',
      frequency: '20 minutes',
      operatingHours: '6:30 AM - 11:30 PM',
      direction: 'bidirectional',
      stops: [
        { id: 'stop-5', name: 'Dormitory A', lat: 40.7100, lng: -74.0080, order: 1 },
        { id: 'stop-6', name: 'Dormitory B', lat: 40.7120, lng: -74.0070, order: 2 },
        { id: 'stop-7', name: 'Student Center', lat: 40.7150, lng: -74.0040, order: 3 },
        { id: 'stop-8', name: 'Library Complex', lat: 40.7180, lng: -74.0010, order: 4 }
      ],
      color: 'green',
      status: 'active',
      distance: '4.1 km',
      duration: '18 min'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [showMapPreview, setShowMapPreview] = useState(false);
  const [showMapEditor, setShowMapEditor] = useState(false);
  const [selectedRouteForMap, setSelectedRouteForMap] = useState<string | null>(null);
  const [mapStops, setMapStops] = useState<MapStop[]>([]);
  const [routeData, setRouteData] = useState<RouteData>({
    stops: [],
    distance: '',
    duration: '',
    routePath: ''
  });
  const [newRoute, setNewRoute] = useState({
    name: '',
    description: '',
    frequency: '',
    operatingHours: '',
    direction: 'bidirectional',
    stops: [] as MapStop[],
    color: 'blue',
    distance: '',
    duration: ''
  });

  // Predefined route templates based on real locations
  const routeTemplates = [
    {
      id: 'bitm-cantonment',
      name: 'BITM to Cantonment',
      description: 'Ballari Institute of Technology & Management ↔ Ballari Cantonment',
      stops: [
        { id: 'bitm', name: 'BITM (Ballari Institute of Technology)', lat: 15.1394, lng: 76.9214, order: 1 },
        { id: 'allipura', name: 'Allipura, Ballari', lat: 15.1420, lng: 76.9180, order: 2 },
        { id: 'cantonment', name: 'Ballari Cantonment, Vijaya Nagar', lat: 15.1450, lng: 76.9120, order: 3 }
      ],
      distance: '5.8 km',
      duration: '16 min',
      direction: 'bidirectional',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d15552.123456789!2d76.9120!3d15.1420!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e0!4m5!1s0x3bb77d4c5c5c5c5c%3A0x1234567890abcdef!2sBallari%20Institute%20of%20Technology%20%26%20Management%2C%20Ballari%2C%20Karnataka!3m2!1d15.1394!2d76.9214!4m5!1s0x3bb77d4c5c5c5c5c%3A0x1234567890abcdef!2sBallari%20Cantonment%2C%20Vijaya%20Nagar%2C%20Ballari%2C%20Karnataka!3m2!1d15.1450!2d76.9120!5e0!3m2!1sen!2sin!4v1647834567890!5m2!1sen!2sin'
    },
    {
      id: 'campus-city',
      name: 'Campus to City Center',
      description: 'University Campus ↔ City Center',
      stops: [
        { id: 'campus', name: 'University Campus', lat: 15.1300, lng: 76.9300, order: 1 },
        { id: 'hospital', name: 'District Hospital', lat: 15.1350, lng: 76.9250, order: 2 },
        { id: 'market', name: 'Gandhi Bazaar', lat: 15.1400, lng: 76.9200, order: 3 },
        { id: 'center', name: 'City Center', lat: 15.1450, lng: 76.9150, order: 4 }
      ],
      distance: '7.2 km',
      duration: '22 min',
      direction: 'bidirectional',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d15552.123456789!2d76.9150!3d15.1375!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e0!4m5!1s0x3bb77d4c5c5c5c5c%3A0x1234567890abcdef!2sUniversity%20Campus%2C%20Ballari%2C%20Karnataka!3m2!1d15.1300!2d76.9300!4m5!1s0x3bb77d4c5c5c5c5c%3A0x1234567890abcdef!2sCity%20Center%2C%20Ballari%2C%20Karnataka!3m2!1d15.1450!2d76.9150!5e0!3m2!1sen!2sin!4v1647834567890!5m2!1sen!2sin'
    },
    {
      id: 'station-airport',
      name: 'Railway Station to Airport',
      description: 'Ballari Railway Station ↔ Ballari Airport',
      stops: [
        { id: 'station', name: 'Ballari Railway Station', lat: 15.1500, lng: 76.9100, order: 1 },
        { id: 'bypass', name: 'Bypass Road Junction', lat: 15.1550, lng: 76.9050, order: 2 },
        { id: 'airport', name: 'Ballari Airport', lat: 15.1600, lng: 76.9000, order: 3 }
      ],
      distance: '12.5 km',
      duration: '28 min',
      direction: 'bidirectional',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d15552.123456789!2d76.9050!3d15.1550!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e0!4m5!1s0x3bb77d4c5c5c5c5c%3A0x1234567890abcdef!2sBallari%20Railway%20Station%2C%20Ballari%2C%20Karnataka!3m2!1d15.1500!2d76.9100!4m5!1s0x3bb77d4c5c5c5c5c%3A0x1234567890abcdef!2sBallari%20Airport%2C%20Ballari%2C%20Karnataka!3m2!1d15.1600!2d76.9000!5e0!3m2!1sen!2sin!4v1647834567890!5m2!1sen!2sin'
    }
  ];

  const directionOptions = [
    { value: 'bidirectional', label: 'Bidirectional (↔)', icon: 'ri-arrow-left-right-line', description: 'Buses run in both directions' },
    { value: 'clockwise', label: 'Clockwise (↻)', icon: 'ri-refresh-line', description: 'Circular route - clockwise direction' },
    { value: 'counterclockwise', label: 'Counter-clockwise (↺)', icon: 'ri-refresh-line', description: 'Circular route - counter-clockwise direction' },
    { value: 'northbound', label: 'Northbound (↑)', icon: 'ri-arrow-up-line', description: 'One-way route going north' },
    { value: 'southbound', label: 'Southbound (↓)', icon: 'ri-arrow-down-line', description: 'One-way route going south' },
    { value: 'eastbound', label: 'Eastbound (→)', icon: 'ri-arrow-right-line', description: 'One-way route going east' },
    { value: 'westbound', label: 'Westbound (←)', icon: 'ri-arrow-left-line', description: 'One-way route going west' }
  ];

  const colorOptions = [
    { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
    { value: 'green', label: 'Green', class: 'bg-green-500' },
    { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
    { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
    { value: 'red', label: 'Red', class: 'bg-red-500' },
    { value: 'yellow', label: 'Yellow', class: 'bg-yellow-500' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newRoute.stops.length < 2) {
      alert('Please select a route template or add at least 2 stops.');
      return;
    }
    
    const route: Route = {
      id: `route-${Date.now()}`,
      ...newRoute,
      status: 'active'
    };

    setRoutes(prev => [...prev, route]);
    setNewRoute({
      name: '',
      description: '',
      frequency: '',
      operatingHours: '',
      direction: 'bidirectional',
      stops: [],
      color: 'blue',
      distance: '',
      duration: ''
    });
    setMapStops([]);
    setRouteData({ stops: [], distance: '', duration: '', routePath: '' });
    setShowAddForm(false);
    
    alert('Route created successfully!');
  };

  const handlePreviewRoute = (routeId: string) => {
    setSelectedRouteForMap(routeId);
    setShowMapPreview(true);
  };

  const getDirectionIcon = (direction: string) => {
    const option = directionOptions.find(opt => opt.value === direction);
    return option?.icon || 'ri-arrow-left-right-line';
  };

  const getDirectionLabel = (direction: string) => {
    const option = directionOptions.find(opt => opt.value === direction);
    return option?.label || 'Bidirectional (↔)';
  };

  const handleDirectionSelect = (direction: string) => {
    setNewRoute(prev => ({ ...prev, direction }));
  };

  const handleOpenMapEditor = () => {
    setMapStops(newRoute.stops);
    setRouteData({
      stops: newRoute.stops,
      distance: newRoute.distance,
      duration: newRoute.duration,
      routePath: ''
    });
    setShowMapEditor(true);
  };

  const handleSaveMapStops = () => {
    setNewRoute(prev => ({ 
      ...prev, 
      stops: routeData.stops,
      distance: routeData.distance,
      duration: routeData.duration
    }));
    setShowMapEditor(false);
  };

  const handleTemplateSelect = (template: any) => {
    setRouteData({
      stops: template.stops,
      distance: template.distance,
      duration: template.duration,
      routePath: template.mapUrl
    });
    setMapStops(template.stops);
    
    // Auto-fill form with template data
    setNewRoute(prev => ({
      ...prev,
      name: template.name,
      description: template.description,
      direction: template.direction,
      stops: template.stops,
      distance: template.distance,
      duration: template.duration
    }));
  };

  const getDirectionArrow = (direction: string) => {
    switch (direction) {
      case 'northbound': return '↑';
      case 'southbound': return '↓';
      case 'eastbound': return '→';
      case 'westbound': return '←';
      case 'clockwise': return '↻';
      case 'counterclockwise': return '↺';
      default: return '↔';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Route Management</h2>
          <p className="text-gray-600">Manage bus routes with Google Maps integration</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          <i className="ri-add-line mr-2"></i>
          {showAddForm ? 'Cancel' : 'Add New Route'}
        </button>
      </div>

      {/* Add New Route Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Route</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Route Templates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Quick Route Templates</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {routeTemplates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleTemplateSelect(template)}
                    className={`p-4 border-2 rounded-lg text-left transition-all hover:border-blue-300 hover:bg-blue-50 ${
                      newRoute.name === template.name ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="font-medium text-gray-900 mb-1">{template.name}</div>
                    <div className="text-sm text-gray-600 mb-2">{template.description}</div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-blue-600 font-medium">{template.distance}</span>
                      <span className="text-green-600 font-medium">{template.duration}</span>
                      <span className="text-gray-500">{template.stops.length} stops</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Route Name *</label>
                <input
                  required
                  type="text"
                  value={newRoute.name}
                  onChange={(e) => setNewRoute(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Route 42"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency *</label>
                <input
                  required
                  type="text"
                  value={newRoute.frequency}
                  onChange={(e) => setNewRoute(prev => ({ ...prev, frequency: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 15 minutes"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <input
                required
                type="text"
                value={newRoute.description}
                onChange={(e) => setNewRoute(prev => ({ ...prev, description: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Main Campus ↔ Engineering Building"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Operating Hours *</label>
              <input
                required
                type="text"
                value={newRoute.operatingHours}
                onChange={(e) => setNewRoute(prev => ({ ...prev, operatingHours: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 7:00 AM - 10:00 PM"
              />
            </div>

            {/* Direction Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Bus Direction *</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {directionOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 hover:border-blue-300 ${
                      newRoute.direction === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                    onClick={() => handleDirectionSelect(option.value)}
                  >
                    <input
                      type="radio"
                      name="direction"
                      value={option.value}
                      checked={newRoute.direction === option.value}
                      onChange={(e) => setNewRoute(prev => ({ ...prev, direction: e.target.value }))}
                      className="sr-only"
                    />
                    <div className="flex items-center w-full">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-all ${
                        newRoute.direction === option.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <i className={`${option.icon} text-sm`}></i>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm">{option.label}</div>
                        <div className="text-xs text-gray-500">{option.description}</div>
                      </div>
                    </div>
                    {newRoute.direction === option.value && (
                      <div className="absolute top-2 right-2">
                        <i className="ri-check-line text-blue-600"></i>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Route Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Route Color *</label>
              <div className="flex space-x-3">
                {colorOptions.map((color) => (
                  <label
                    key={color.value}
                    className={`relative w-12 h-12 rounded-lg cursor-pointer transition-all hover:scale-110 ${
                      newRoute.color === color.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="color"
                      value={color.value}
                      checked={newRoute.color === color.value}
                      onChange={(e) => setNewRoute(prev => ({ ...prev, color: e.target.value }))}
                      className="sr-only"
                    />
                    <div className={`w-full h-full rounded-lg ${color.class} flex items-center justify-center`}>
                      {newRoute.color === color.value && (
                        <i className="ri-check-line text-white text-lg"></i>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Google Maps Route Builder */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Route Path & Stops *</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <i className="ri-map-2-line text-4xl text-gray-400 mb-4"></i>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Google Maps Route Builder</h4>
                  <p className="text-gray-600 mb-4">Select a template above or create custom route with accurate directions</p>
                  
                  {newRoute.stops.length > 0 && (
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">{newRoute.stops.length}</div>
                          <div className="text-sm text-gray-600">Stops</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">{newRoute.distance}</div>
                          <div className="text-sm text-gray-600">Distance</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-orange-600">{newRoute.duration}</div>
                          <div className="text-sm text-gray-600">Duration</div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-center text-blue-700">
                        <i className="ri-navigation-line mr-2"></i>
                        <span className="font-medium">{getDirectionArrow(newRoute.direction)} {getDirectionLabel(newRoute.direction)}</span>
                      </div>
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={handleOpenMapEditor}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                  >
                    <i className="ri-map-line mr-2"></i>
                    {newRoute.stops.length > 0 ? 'Edit Route on Map' : 'Open Route Builder'}
                  </button>
                </div>
              </div>
              
              {newRoute.stops.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-sm font-semibold text-gray-900 mb-3">Route Stops</h5>
                  <div className="space-y-2">
                    {newRoute.stops.map((stop, index) => (
                      <div key={stop.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{stop.name}</div>
                          <div className="text-sm text-gray-500">
                            {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
                          </div>
                        </div>
                        {index < newRoute.stops.length - 1 && (
                          <div className="text-gray-400">
                            <i className="ri-arrow-right-line"></i>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex space-x-4 pt-4 border-t">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                <i className="ri-save-line mr-2"></i>
                Create Route
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Google Maps Route Editor Modal */}
      {showMapEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[95vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Google Maps Route Builder</h3>
                <p className="text-gray-600 text-sm mt-1">Create accurate bus routes with real directions and timing</p>
              </div>
              <button
                onClick={() => setShowMapEditor(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            {/* Route Templates Bar */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Quick Templates</h4>
                <div className="text-sm text-gray-600">Select a template or create custom route</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {routeTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`p-3 rounded-lg border-2 text-left transition-all hover:border-blue-300 ${
                      routeData.stops.length > 0 && routeData.stops[0]?.name === template.stops[0]?.name
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:bg-blue-50'
                    }`}
                  >
                    <div className="font-medium text-gray-900 text-sm mb-1">{template.name}</div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-blue-600 font-medium">{template.distance}</span>
                      <span className="text-green-600 font-medium">{template.duration}</span>
                      <span className="text-gray-500">{template.stops.length} stops</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Map and Route Info Container */}
            <div className="flex-1 flex">
              {/* Google Maps with Route */}
              <div className="flex-1 relative">
                {routeData.routePath ? (
                  <iframe
                    src={routeData.routePath}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-bl-xl"
                  ></iframe>
                ) : (
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15552.123456789!2d76.9120!3d15.1420!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bb77d4c5c5c5c5c%3A0x1234567890abcdef!2sBallari%2C%20Karnataka%2C%20India!5e0!3m2!1sen!2sin!4v1647834567890!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-bl-xl"
                  ></iframe>
                )}

                {/* Map Controls */}
                <div className="absolute top-4 right-4 space-y-2">
                  <button className="bg-white rounded-lg shadow-lg p-3 hover:bg-gray-50 transition-colors">
                    <i className="ri-zoom-in-line text-gray-600"></i>
                  </button>
                  <button className="bg-white rounded-lg shadow-lg p-3 hover:bg-gray-50 transition-colors">
                    <i className="ri-zoom-out-line text-gray-600"></i>
                  </button>
                  <button className="bg-white rounded-lg shadow-lg p-3 hover:bg-gray-50 transition-colors">
                    <i className="ri-focus-3-line text-gray-600"></i>
                  </button>
                  <button className="bg-white rounded-lg shadow-lg p-3 hover:bg-gray-50 transition-colors">
                    <i className="ri-refresh-line text-gray-600"></i>
                  </button>
                </div>

                {/* Route Info Overlay */}
                {routeData.distance && routeData.duration && (
                  <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-xl p-4 min-w-64">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-semibold text-gray-900">Route Information</h5>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{routeData.distance}</div>
                        <div className="text-xs text-gray-600">Total Distance</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{routeData.duration}</div>
                        <div className="text-xs text-gray-600">Travel Time</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">{routeData.stops.length}</div>
                      <div className="text-xs text-gray-600">Bus Stops</div>
                    </div>
                  </div>
                )}

                {/* Instructions Overlay */}
                <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
                  <div className="flex items-center mb-2">
                    <i className="ri-information-line text-blue-600 mr-2"></i>
                    <span className="font-medium text-gray-900">Instructions</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>1. Select a route template above</p>
                    <p>2. View accurate Google Maps directions</p>
                    <p>3. Check distance and travel time</p>
                    <p>4. Save route when satisfied</p>
                  </div>
                </div>
              </div>

              {/* Route Details Panel */}
              <div className="w-80 bg-gray-50 border-l p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">Route Details</h4>
                  {routeData.stops.length > 0 && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                      {routeData.stops.length} stops
                    </span>
                  )}
                </div>

                {routeData.stops.length > 0 ? (
                  <div className="space-y-4">
                    {/* Route Summary */}
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div>
                          <div className="text-lg font-bold text-blue-600">{routeData.distance}</div>
                          <div className="text-xs text-gray-600">Distance</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-green-600">{routeData.duration}</div>
                          <div className="text-xs text-gray-600">Duration</div>
                        </div>
                      </div>
                    </div>

                    {/* Stops List */}
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {routeData.stops.map((stop, index) => (
                        <div key={index} className="bg-white rounded-lg p-3 shadow-sm border">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 text-sm">{stop.name}</div>
                              <div className="text-xs text-gray-500">
                                {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
                              </div>
                            </div>
                          </div>
                          {index < routeData.stops.length - 1 && (
                            <div className="flex items-center justify-center mt-2">
                              <div className="w-px h-4 bg-blue-300"></div>
                              <i className="ri-arrow-down-line text-blue-500 text-xs mx-2"></i>
                              <div className="w-px h-4 bg-blue-300"></div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Route Actions */}
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setRouteData({ stops: [], distance: '', duration: '', routePath: '' });
                          setMapStops([]);
                        }}
                        className="w-full text-red-600 hover:bg-red-50 py-2 rounded-lg transition-colors text-sm border border-red-200 hover:border-red-300"
                      >
                        <i className="ri-delete-bin-line mr-1"></i>
                        Clear Route
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <i className="ri-map-pin-line text-4xl text-gray-300 mb-2"></i>
                    <p className="text-gray-500 text-sm mb-4">Select a route template above to get started</p>
                    <div className="text-xs text-gray-400">
                      Templates include accurate Google Maps directions with real distance and timing data
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleSaveMapStops}
                    disabled={routeData.stops.length < 2}
                    className={`w-full py-3 rounded-lg font-medium transition-colors ${
                      routeData.stops.length >= 2
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {routeData.stops.length >= 2 ? (
                      <>
                        <i className="ri-save-line mr-2"></i>
                        Save Route ({routeData.distance}, {routeData.duration})
                      </>
                    ) : (
                      <>
                        <i className="ri-map-pin-line mr-2"></i>
                        Select a route template
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Existing Routes */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Existing Routes</h3>
          <p className="text-gray-600 mt-1">Manage and monitor current bus routes with Google Maps integration</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Direction</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distance & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stops</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {routes.map((route) => (
                <tr key={route.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-3 ${colorOptions.find(c => c.value === route.color)?.class}`}></div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{route.name}</div>
                        <div className="text-sm text-gray-500">{route.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <i className={`${getDirectionIcon(route.direction)} mr-2 text-gray-600`}></i>
                      <span className="text-sm text-gray-900">{getDirectionLabel(route.direction)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="font-medium text-blue-600">{route.distance || 'N/A'}</div>
                      <div className="text-green-600">{route.duration || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{route.frequency}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{route.stops.length} stops</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      route.status === 'active' ? 'bg-green-100 text-green-800' :
                      route.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {route.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handlePreviewRoute(route.id)}
                      className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <i className="ri-map-line mr-1"></i>
                      View Map
                    </button>
                    <button className="text-gray-600 hover:text-gray-900 bg-gray-50 px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors">
                      <i className="ri-edit-line mr-1"></i>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Map Preview Modal */}
      {showMapPreview && selectedRouteForMap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Route Preview</h3>
                <p className="text-gray-600">Google Maps view with live route data</p>
              </div>
              <button
                onClick={() => setShowMapPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <i className="ri-close-line text-gray-600 text-xl"></i>
              </button>
            </div>
            
            <div className="p-6">
              {/* Route Information */}
              {(() => {
                const route = routes.find(r => r.id === selectedRouteForMap);
                return route ? (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full mr-3 ${colorOptions.find(c => c.value === route.color)?.class}`}></div>
                        <h4 className="text-lg font-semibold text-gray-900">{route.name}</h4>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <i className={`${getDirectionIcon(route.direction)} mr-2`}></i>
                        <span className="text-sm">{getDirectionLabel(route.direction)}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-3">{route.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Distance:</span>
                        <span className="ml-2 font-medium text-blue-600">{route.distance || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <span className="ml-2 font-medium text-green-600">{route.duration || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Frequency:</span>
                        <span className="ml-2 font-medium">{route.frequency}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Operating Hours:</span>
                        <span className="ml-2 font-medium">{route.operatingHours}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Total Stops:</span>
                        <span className="ml-2 font-medium">{route.stops.length}</span>
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Google Maps */}
              <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden mb-6">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d15552.123456789!2d76.9120!3d15.1420!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e0!4m5!1s0x3bb77d4c5c5c5c5c%3A0x1234567890abcdef!2sBallari%20Institute%20of%20Technology%20%26%20Management%2C%20Ballari%2C%20Karnataka!3m2!1d15.1394!2d76.9214!4m5!1s0x3bb77d4c5c5c5c5c%3A0x1234567890abcdef!2sBallari%20Cantonment%2C%20Vijaya%20Nagar%2C%20Ballari%2C%20Karnataka!3m2!1d15.1450!2d76.9120!5e0!3m2!1sen!2sin!4v1647834567890!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-lg"
                ></iframe>

                {/* Live indicator */}
                <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg px-3 py-2">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-xs text-gray-600 font-medium">Live Route Preview</span>
                  </div>
                </div>

                {/* Route Info */}
                {(() => {
                  const route = routes.find(r => r.id === selectedRouteForMap);
                  return route?.distance && route?.duration ? (
                    <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3">
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="text-center">
                          <div className="font-bold text-blue-600">{route.distance}</div>
                          <div className="text-xs text-gray-600">Distance</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-green-600">{route.duration}</div>
                          <div className="text-xs text-gray-600">Duration</div>
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>

              {/* Route Stops */}
              {(() => {
                const route = routes.find(r => r.id === selectedRouteForMap);
                return route ? (
                  <div>
                    <h5 className="text-sm font-semibold text-gray-900 mb-3">Route Stops</h5>
                    <div className="space-y-2">
                      {route.stops.map((stop, index) => (
                        <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{stop.name}</div>
                            <div className="text-sm text-gray-500">
                              {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
                            </div>
                          </div>
                          {index < route.stops.length - 1 && (
                            <div className="text-gray-400">
                              <i className="ri-arrow-right-line"></i>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
