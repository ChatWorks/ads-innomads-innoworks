'use client';

import { useState } from 'react';

export default function GoogleAdsPage() {
  const [connectionStatus, setConnectionStatus] = useState('Not tested');
  const [accountInfo, setAccountInfo] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    setConnectionStatus('Testing...');

    try {
      const response = await fetch('/api/google-ads/test', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setConnectionStatus('Connected ✅');
        setAccountInfo(data);
      } else {
        setConnectionStatus('Failed ❌');
        setError(data.error || 'Unknown error');
      }
    } catch (err) {
      setConnectionStatus('Failed ❌');
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/google-ads/dashboard', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setDashboardData(data.data);
      } else {
        setError(data.error || 'Failed to load dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('nl-NL').format(num || 0);
  };

  const formatPercentage = (num) => {
    return `${(num || 0).toFixed(2)}%`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Google Ads Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Manage en monitor je Google Ads campagnes</p>
          </div>

          {/* Connection Section */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`text-sm font-medium ${
                    connectionStatus === 'Connected ✅' ? 'text-green-600' :
                    connectionStatus === 'Failed ❌' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {connectionStatus}
                  </span>
                </div>
                {accountInfo && (
                  <div className="text-sm text-gray-900">
                    Account: {accountInfo.accountName} ({accountInfo.customerId})
                  </div>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={testConnection}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium py-2 px-4 rounded-md transition duration-200"
                >
                  {loading ? 'Testing...' : 'Test Connection'}
                </button>
                <button
                  onClick={loadDashboard}
                  disabled={loading || connectionStatus !== 'Connected ✅'}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-sm font-medium py-2 px-4 rounded-md transition duration-200"
                >
                  {loading ? 'Loading...' : 'Load Dashboard'}
                </button>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mx-6 my-4 bg-red-50 border-l-4 border-red-400 p-4">
              <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Dashboard Content */}
          {dashboardData && (
            <div className="px-6 py-4">
              {/* Summary Cards */}
              {dashboardData.summary && !dashboardData.summary.error && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-800">Impressions</h3>
                    <p className="text-3xl font-bold text-blue-900">{formatNumber(dashboardData.summary.impressions)}</p>
                    <p className="text-sm text-blue-600">Last 30 days</p>
                  </div>
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-800">Clicks</h3>
                    <p className="text-3xl font-bold text-green-900">{formatNumber(dashboardData.summary.clicks)}</p>
                    <p className="text-sm text-green-600">CTR: {formatPercentage(dashboardData.summary.ctr)}</p>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-purple-800">Cost</h3>
                    <p className="text-3xl font-bold text-purple-900">{formatCurrency(dashboardData.summary.cost)}</p>
                    <p className="text-sm text-purple-600">Avg CPC: {formatCurrency(dashboardData.summary.average_cpc)}</p>
                  </div>
                  <div className="bg-orange-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-orange-800">Conversions</h3>
                    <p className="text-3xl font-bold text-orange-900">{formatNumber(dashboardData.summary.conversions)}</p>
                    <p className="text-sm text-orange-600">Rate: {formatPercentage(dashboardData.summary.conversion_rate)}</p>
                  </div>
                </div>
              )}

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  {[
                    { id: 'overview', name: 'Overview' },
                    { id: 'campaigns', name: 'Campaigns' },
                    { id: 'keywords', name: 'Keywords' },
                    { id: 'search-terms', name: 'Search Terms' },
                    { id: 'devices', name: 'Devices' },
                    { id: 'geographic', name: 'Geographic' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="space-y-6">
                {/* Error Display for Individual Sections */}
                {dashboardData.campaigns && dashboardData.campaigns.error && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <h3 className="text-lg font-medium text-red-800 mb-2">Campaigns Error</h3>
                    <p className="text-red-700 text-sm">{dashboardData.campaigns.error}</p>
                  </div>
                )}
                
                {dashboardData.keywords && dashboardData.keywords.error && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <h3 className="text-lg font-medium text-red-800 mb-2">Keywords Error</h3>
                    <p className="text-red-700 text-sm">{dashboardData.keywords.error}</p>
                  </div>
                )}
                
                {dashboardData.search_terms && dashboardData.search_terms.error && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <h3 className="text-lg font-medium text-red-800 mb-2">Search Terms Error</h3>
                    <p className="text-red-700 text-sm">{dashboardData.search_terms.error}</p>
                  </div>
                )}
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Account Info */}
                    {dashboardData.account && !dashboardData.account.error && (
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                        <div className="space-y-2 text-sm text-gray-900">
                          <div><strong>Account Name:</strong> {dashboardData.account.descriptive_name}</div>
                          <div><strong>Customer ID:</strong> {dashboardData.account.id}</div>
                          <div><strong>Currency:</strong> {dashboardData.account.currency_code}</div>
                          <div><strong>Time Zone:</strong> {dashboardData.account.time_zone}</div>
                          <div><strong>Auto Tagging:</strong> {dashboardData.account.auto_tagging_enabled ? 'Enabled' : 'Disabled'}</div>
                          <div><strong>Conversion Tracking:</strong> {dashboardData.account.conversion_tracking_enabled ? 'Enabled' : 'Disabled'}</div>
                        </div>
                      </div>
                    )}

                    {/* Budgets */}
                    {dashboardData.budgets && Array.isArray(dashboardData.budgets) && (
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Budgets</h3>
                        <div className="space-y-3">
                          {dashboardData.budgets.length === 0 ? (
                                                         <div className="text-center text-gray-900 py-4">
                               No budget data available
                             </div>
                          ) : dashboardData.budgets.slice(0, 5).map((budget, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                              <div>
                                <div className="font-medium text-gray-900">{budget.name}</div>
                                <div className="text-sm text-gray-900">{budget.delivery_method} - {budget.status}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-gray-900">{formatCurrency(budget.amount)}</div>
                                <div className="text-sm text-gray-900">{budget.period}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'campaigns' && dashboardData.campaigns && Array.isArray(dashboardData.campaigns) && (
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Campaigns Performance</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impressions</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {dashboardData.campaigns.length === 0 ? (
                            <tr>
                                                             <td colSpan="7" className="px-6 py-4 text-center text-gray-900">
                                 No campaign data available for the last 30 days
                               </td>
                            </tr>
                          ) : dashboardData.campaigns.slice(0, 10).map((campaign, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                                <div className="text-sm text-gray-900">{campaign.bidding_strategy_type}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  campaign.status === 'ENABLED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {campaign.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{campaign.advertising_channel_type}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatNumber(campaign.metrics?.impressions)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatNumber(campaign.metrics?.clicks)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(campaign.metrics?.cost)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatNumber(campaign.metrics?.conversions)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'keywords' && dashboardData.keywords && Array.isArray(dashboardData.keywords) && (
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Keywords Performance</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keyword</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Match Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quality Score</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impressions</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CTR</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {dashboardData.keywords.length === 0 ? (
                            <tr>
                                                             <td colSpan="7" className="px-6 py-4 text-center text-gray-900">
                                 No keyword data available for the last 30 days
                               </td>
                            </tr>
                          ) : dashboardData.keywords.slice(0, 20).map((keyword, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">{keyword.keyword}</div>
                                <div className="text-sm text-gray-900">{keyword.campaign_name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{keyword.match_type}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  keyword.quality_score >= 7 ? 'bg-green-100 text-green-800' :
                                  keyword.quality_score >= 5 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {keyword.quality_score || 'N/A'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatNumber(keyword.metrics?.impressions)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatNumber(keyword.metrics?.clicks)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(keyword.metrics?.cost)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatPercentage(keyword.metrics?.ctr)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'search-terms' && dashboardData.search_terms && Array.isArray(dashboardData.search_terms) && (
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Search Terms</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Search Term</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impressions</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {dashboardData.search_terms.length === 0 ? (
                            <tr>
                                                             <td colSpan="6" className="px-6 py-4 text-center text-gray-900">
                                 No search terms data available for the last 30 days
                               </td>
                            </tr>
                          ) : dashboardData.search_terms.slice(0, 20).map((term, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">{term.search_term}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  term.status === 'ADDED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {term.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">{term.campaign_name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatNumber(term.metrics?.impressions)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatNumber(term.metrics?.clicks)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(term.metrics?.cost)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'devices' && dashboardData.devices && Array.isArray(dashboardData.devices) && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Performance</h3>
                    <div className="space-y-4">
                      {dashboardData.devices.length === 0 ? (
                        <div className="text-center text-gray-900 py-8">
                          No device data available for the last 30 days
                        </div>
                      ) : dashboardData.devices.slice(0, 5).map((device, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900">{device.device}</h4>
                              <div className="mt-1 text-sm text-gray-900">
                                CTR: {formatPercentage(device.metrics?.ctr)} | 
                                Conversion Rate: {formatPercentage(device.metrics?.conversion_rate)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-gray-900">{formatCurrency(device.metrics?.cost)}</div>
                              <div className="text-sm text-gray-900">
                                {formatNumber(device.metrics?.impressions)} impressions
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'geographic' && dashboardData.geographic && Array.isArray(dashboardData.geographic) && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Performance</h3>
                    <div className="space-y-4">
                      {dashboardData.geographic.length === 0 ? (
                        <div className="text-center text-gray-900 py-8">
                          No geographic data available for the last 30 days
                        </div>
                      ) : dashboardData.geographic.slice(0, 10).map((geo, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-gray-900">Country ID: {geo.country_criterion_id}</div>
                              <div className="text-sm text-gray-900">Type: {geo.location_type}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">{formatCurrency(geo.metrics?.cost)}</div>
                              <div className="text-sm text-gray-900">
                                {formatNumber(geo.metrics?.clicks)} clicks
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

         
        </div>
      </div>
    </div>
  );
} 