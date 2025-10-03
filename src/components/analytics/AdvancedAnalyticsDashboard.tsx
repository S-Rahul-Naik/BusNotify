/**
 * Advanced Analytics Dashboard
 * Phase 4: Comprehensive data analytics and business intelligence
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MapPin, 
  Clock, 
  AlertCircle,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Zap
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement);

interface AnalyticsMetrics {
  ridership: {
    total: number;
    dailyAverage: number;
    peakHour: string;
    growth: number;
    demographics: {
      students: number;
      faculty: number;
      visitors: number;
    };
  };
  performance: {
    onTimePerformance: number;
    averageDelay: number;
    customerSatisfaction: number;
    routeReliability: number;
  };
  operational: {
    totalBuses: number;
    activeRoutes: number;
    fuelEfficiency: number;
    maintenanceCosts: number;
  };
  predictions: {
    ridership7Day: number[];
    delayTrends: number[];
    maintenanceNeeds: string[];
    capacityOptimization: Record<string, number>;
  };
}

interface RouteAnalytics {
  routeId: string;
  routeName: string;
  ridership: number;
  onTimePerformance: number;
  averageDelay: number;
  customerRating: number;
  revenue: number;
  efficiency: number;
  trending: 'up' | 'down' | 'stable';
}

interface PredictiveInsight {
  id: string;
  type: 'warning' | 'opportunity' | 'maintenance' | 'optimization';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionRequired: boolean;
  deadline?: Date;
  recommendations: string[];
}

interface TimeSeriesData {
  timestamp: Date;
  ridership: number;
  delays: number;
  satisfaction: number;
  efficiency: number;
}

export default function AdvancedAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [routeAnalytics, setRouteAnalytics] = useState<RouteAnalytics[]>([]);
  const [insights, setInsights] = useState<PredictiveInsight[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'1d' | '7d' | '30d' | '90d'>('7d');
  const [selectedView, setSelectedView] = useState<'overview' | 'routes' | 'predictions' | 'insights'>('overview');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
    fetchRouteAnalytics();
    fetchPredictiveInsights();
    fetchTimeSeriesData();

    // Update data every 5 minutes
    const interval = setInterval(() => {
      fetchAnalyticsData();
      fetchTimeSeriesData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [selectedPeriod]);

  const fetchAnalyticsData = useCallback(async () => {
    try {
      // Mock comprehensive analytics data
      const mockMetrics: AnalyticsMetrics = {
        ridership: {
          total: 47823,
          dailyAverage: 6832,
          peakHour: '8:00 AM',
          growth: 12.5,
          demographics: {
            students: 68,
            faculty: 22,
            visitors: 10
          }
        },
        performance: {
          onTimePerformance: 87.3,
          averageDelay: 3.2,
          customerSatisfaction: 4.2,
          routeReliability: 91.8
        },
        operational: {
          totalBuses: 24,
          activeRoutes: 8,
          fuelEfficiency: 6.8,
          maintenanceCosts: 12400
        },
        predictions: {
          ridership7Day: [6500, 6800, 7200, 7100, 6900, 8200, 8500],
          delayTrends: [3.2, 3.8, 2.9, 4.1, 3.5, 2.8, 3.2],
          maintenanceNeeds: ['Bus #007', 'Bus #015', 'Bus #023'],
          capacityOptimization: {
            'route_42': 0.85,
            'route_15': 0.72,
            'route_88': 0.91,
            'route_23': 0.68
          }
        }
      };
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    }
  }, [selectedPeriod]);

  const fetchRouteAnalytics = useCallback(async () => {
    try {
      const mockRouteData: RouteAnalytics[] = [
        {
          routeId: 'route_42',
          routeName: 'Route 42 - Downtown ↔ Airport',
          ridership: 12847,
          onTimePerformance: 82.5,
          averageDelay: 4.2,
          customerRating: 4.1,
          revenue: 25694,
          efficiency: 76.3,
          trending: 'up'
        },
        {
          routeId: 'route_15',
          routeName: 'Route 15 - University ↔ Mall',
          ridership: 8923,
          onTimePerformance: 94.2,
          averageDelay: 1.8,
          customerRating: 4.6,
          revenue: 17846,
          efficiency: 88.9,
          trending: 'stable'
        },
        {
          routeId: 'route_88',
          routeName: 'Route 88 - Hospital ↔ Station',
          ridership: 6534,
          onTimePerformance: 76.8,
          averageDelay: 6.7,
          customerRating: 3.8,
          revenue: 13068,
          efficiency: 65.2,
          trending: 'down'
        },
        {
          routeId: 'route_23',
          routeName: 'Route 23 - Suburbs ↔ City Center',
          ridership: 10289,
          onTimePerformance: 89.4,
          averageDelay: 2.1,
          customerRating: 4.3,
          revenue: 20578,
          efficiency: 82.6,
          trending: 'up'
        }
      ];
      setRouteAnalytics(mockRouteData);
    } catch (error) {
      console.error('Failed to fetch route analytics:', error);
    }
  }, []);

  const fetchPredictiveInsights = useCallback(async () => {
    try {
      const mockInsights: PredictiveInsight[] = [
        {
          id: 'insight_1',
          type: 'warning',
          title: 'Route 88 Performance Degradation',
          description: 'Route 88 showing consistent decline in on-time performance over the past 14 days',
          impact: 'high',
          actionRequired: true,
          deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          recommendations: [
            'Investigate traffic pattern changes on Hospital Road',
            'Consider schedule adjustments during peak hours',
            'Deploy additional bus during rush periods'
          ]
        },
        {
          id: 'insight_2',
          type: 'opportunity',
          title: 'Ridership Growth Opportunity',
          description: 'University route showing 15% increase in demand during evening hours',
          impact: 'medium',
          actionRequired: false,
          recommendations: [
            'Add evening frequency on Route 15',
            'Market evening services to students',
            'Consider express service during exam periods'
          ]
        },
        {
          id: 'insight_3',
          type: 'maintenance',
          title: 'Predictive Maintenance Alert',
          description: 'Bus #007, #015, and #023 showing early signs of mechanical issues',
          impact: 'high',
          actionRequired: true,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          recommendations: [
            'Schedule immediate inspection for flagged vehicles',
            'Order replacement parts proactively',
            'Plan maintenance during low-demand periods'
          ]
        },
        {
          id: 'insight_4',
          type: 'optimization',
          title: 'Fuel Efficiency Improvement',
          description: 'Route optimization could reduce fuel consumption by 8-12%',
          impact: 'medium',
          actionRequired: false,
          recommendations: [
            'Implement AI-driven route optimization',
            'Driver training on eco-friendly driving',
            'Consider electric bus pilot program'
          ]
        }
      ];
      setInsights(mockInsights);
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    }
  }, []);

  const fetchTimeSeriesData = useCallback(async () => {
    try {
      // Generate mock time series data
      const now = new Date();
      const data: TimeSeriesData[] = [];
      
      for (let i = 30; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        data.push({
          timestamp,
          ridership: 6000 + Math.random() * 3000 + Math.sin(i * 0.2) * 1000,
          delays: 2.5 + Math.random() * 3 + Math.sin(i * 0.15) * 1.5,
          satisfaction: 3.8 + Math.random() * 1.2,
          efficiency: 75 + Math.random() * 20
        });
      }
      
      setTimeSeriesData(data);
    } catch (error) {
      console.error('Failed to fetch time series data:', error);
    }
  }, [selectedPeriod]);

  const generateReport = useCallback(async () => {
    setIsGeneratingReport(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, this would trigger a PDF/Excel download
      const reportData = {
        period: selectedPeriod,
        metrics,
        routes: routeAnalytics,
        insights,
        generatedAt: new Date()
      };
      
      console.log('Generated report:', reportData);
      
      // Mock download
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transit-analytics-report-${selectedPeriod}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  }, [selectedPeriod, metrics, routeAnalytics, insights]);

  const getInsightIcon = (type: PredictiveInsight['type']) => {
    switch (type) {
      case 'warning': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'opportunity': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'maintenance': return <Clock className="w-5 h-5 text-orange-500" />;
      case 'optimization': return <Zap className="w-5 h-5 text-blue-500" />;
      default: return <Eye className="w-5 h-5 text-gray-500" />;
    }
  };

  const getInsightColor = (type: PredictiveInsight['type']) => {
    switch (type) {
      case 'warning': return 'bg-red-50 border-red-200';
      case 'opportunity': return 'bg-green-50 border-green-200';
      case 'maintenance': return 'bg-orange-50 border-orange-200';
      case 'optimization': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (trend: RouteAnalytics['trending']) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                Advanced Analytics
              </h1>
              <p className="text-gray-600 mt-2">
                Comprehensive transit system analytics and predictive insights
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="1d">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
              <button
                onClick={generateReport}
                disabled={isGeneratingReport}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isGeneratingReport ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'routes', label: 'Route Performance', icon: MapPin },
                { id: 'predictions', label: 'Predictive Analytics', icon: TrendingUp },
                { id: 'insights', label: 'AI Insights', icon: Zap }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setSelectedView(id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    selectedView === id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {selectedView === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Ridership</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.ridership.total.toLocaleString()}</p>
                      <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3 h-3" />
                        +{metrics.ridership.growth}%
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">On-Time Performance</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.performance.onTimePerformance}%</p>
                      <p className="text-sm text-gray-500 mt-1">System average</p>
                    </div>
                    <Clock className="w-8 h-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Customer Satisfaction</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.performance.customerSatisfaction}/5.0</p>
                      <p className="text-sm text-gray-500 mt-1">Average rating</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Buses</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.operational.totalBuses}</p>
                      <p className="text-sm text-gray-500 mt-1">{metrics.operational.activeRoutes} routes</p>
                    </div>
                    <MapPin className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ridership Trend */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Ridership Trends</h3>
                  <Line
                    data={{
                      labels: timeSeriesData.map(d => d.timestamp.toLocaleDateString()),
                      datasets: [
                        {
                          label: 'Daily Ridership',
                          data: timeSeriesData.map(d => d.ridership),
                          borderColor: '#3b82f6',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          tension: 0.4
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { position: 'top' },
                        title: { display: false }
                      },
                      scales: {
                        y: { beginAtZero: false }
                      }
                    }}
                  />
                </div>

                {/* Performance Metrics */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
                  <Line
                    data={{
                      labels: timeSeriesData.map(d => d.timestamp.toLocaleDateString()),
                      datasets: [
                        {
                          label: 'Average Delay (min)',
                          data: timeSeriesData.map(d => d.delays),
                          borderColor: '#ef4444',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          tension: 0.4,
                          yAxisID: 'y'
                        },
                        {
                          label: 'Efficiency (%)',
                          data: timeSeriesData.map(d => d.efficiency),
                          borderColor: '#10b981',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          tension: 0.4,
                          yAxisID: 'y1'
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { position: 'top' }
                      },
                      scales: {
                        y: {
                          type: 'linear',
                          display: true,
                          position: 'left',
                          title: { display: true, text: 'Delay (minutes)' }
                        },
                        y1: {
                          type: 'linear',
                          display: true,
                          position: 'right',
                          title: { display: true, text: 'Efficiency (%)' },
                          grid: { drawOnChartArea: false }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Demographics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Rider Demographics</h3>
                  <Doughnut
                    data={{
                      labels: ['Students', 'Faculty', 'Visitors'],
                      datasets: [
                        {
                          data: [
                            metrics.ridership.demographics.students,
                            metrics.ridership.demographics.faculty,
                            metrics.ridership.demographics.visitors
                          ],
                          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
                          borderWidth: 2,
                          borderColor: '#ffffff'
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { position: 'bottom' }
                      }
                    }}
                  />
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Operational Metrics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Fuel Efficiency</div>
                      <div className="text-2xl font-bold text-green-600">{metrics.operational.fuelEfficiency} MPG</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Monthly Maintenance</div>
                      <div className="text-2xl font-bold text-blue-600">${metrics.operational.maintenanceCosts.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Route Reliability</div>
                      <div className="text-2xl font-bold text-purple-600">{metrics.performance.routeReliability}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Peak Hour</div>
                      <div className="text-2xl font-bold text-orange-600">{metrics.ridership.peakHour}</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {selectedView === 'routes' && (
            <motion.div
              key="routes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Route Performance Analysis</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ridership</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">On-Time %</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Delay</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Efficiency</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {routeAnalytics.map((route) => (
                        <tr key={route.routeId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{route.routeName}</div>
                            <div className="text-sm text-gray-500">{route.routeId}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {route.ridership.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              route.onTimePerformance >= 90 ? 'bg-green-100 text-green-800' :
                              route.onTimePerformance >= 80 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {route.onTimePerformance}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {route.averageDelay.toFixed(1)} min
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {route.customerRating.toFixed(1)}/5.0
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${route.revenue.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {route.efficiency.toFixed(1)}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getTrendIcon(route.trending)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {selectedView === 'predictions' && (
            <motion.div
              key="predictions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 7-Day Ridership Forecast */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">7-Day Ridership Forecast</h3>
                  <Bar
                    data={{
                      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                      datasets: [
                        {
                          label: 'Predicted Ridership',
                          data: metrics.predictions.ridership7Day,
                          backgroundColor: 'rgba(59, 130, 246, 0.8)',
                          borderColor: '#3b82f6',
                          borderWidth: 1
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { position: 'top' }
                      },
                      scales: {
                        y: { beginAtZero: true }
                      }
                    }}
                  />
                </div>

                {/* Delay Trends */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Delay Trend Prediction</h3>
                  <Line
                    data={{
                      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                      datasets: [
                        {
                          label: 'Predicted Delays (min)',
                          data: metrics.predictions.delayTrends,
                          borderColor: '#ef4444',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          tension: 0.4
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { position: 'top' }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Maintenance Predictions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Predictive Maintenance</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {metrics.predictions.maintenanceNeeds.map((bus, index) => (
                    <div key={bus} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                        <span className="font-medium text-gray-900">{bus}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Maintenance recommended within {(index + 1) * 3} days
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Capacity Optimization */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Route Capacity Optimization</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(metrics.predictions.capacityOptimization).map(([routeId, utilization]) => (
                    <div key={routeId} className="border border-gray-200 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-2">{routeId.replace('_', ' ').toUpperCase()}</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              utilization > 0.8 ? 'bg-red-500' :
                              utilization > 0.6 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${utilization * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{Math.round(utilization * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {selectedView === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid gap-6">
                {insights.map((insight) => (
                  <div key={insight.id} className={`border rounded-xl p-6 ${getInsightColor(insight.type)}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getInsightIcon(insight.type)}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{insight.title}</h3>
                          <p className="text-sm text-gray-600">{insight.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          insight.impact === 'high' ? 'bg-red-100 text-red-800' :
                          insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {insight.impact} impact
                        </span>
                        {insight.actionRequired && (
                          <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                            Action Required
                          </span>
                        )}
                      </div>
                    </div>

                    {insight.deadline && (
                      <div className="mb-4 p-3 bg-white/50 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Calendar className="w-4 h-4" />
                          <span>Deadline: {insight.deadline.toLocaleDateString()}</span>
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Recommended Actions:</h4>
                      <ul className="space-y-1">
                        {insight.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}