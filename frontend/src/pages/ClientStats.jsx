import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClientsAPI } from '../api/client';

export default function ClientStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [periodClients, setPeriodClients] = useState([]);
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateClients, setDateClients] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setLoading(true);
    setError('');
    try {
      const data = await ClientsAPI.getStats();
      setStats(data);
    } catch (e) {
      setError(e.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  }

  async function handlePeriodClick(period) {
    try {
      const clients = await ClientsAPI.getByPeriod(period);
      setPeriodClients(clients);
      setSelectedPeriod(period);
      setShowPeriodModal(true);
    } catch (e) {
      alert('Failed to load clients for this period: ' + e.message);
    }
  }

  async function handleDateClick(dateStr) {
    try {
      const clients = await ClientsAPI.getByDate(dateStr);
      setDateClients(clients);
      setSelectedDate(dateStr);
    } catch (e) {
      alert('Failed to load clients for this date: ' + e.message);
    }
  }

  function handleClientClick(clientId) {
    navigate(`/clients?editId=${clientId}`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
          <div className="text-gray-500">Loading statistics...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">Error: {error}</div>
        <button
          onClick={loadStats}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Client Addition Statistics</h1>
        <p className="text-gray-600">Track your client acquisition progress</p>
      </div>

      {stats && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => handlePeriodClick('today')}
              className="bg-white border rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer text-left"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.523 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Today</h3>
                  <p className="text-2xl font-bold text-blue-600">{stats.today}</p>
                  <p className="text-sm text-gray-500">clients added</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handlePeriodClick('week')}
              className="bg-white border rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer text-left"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">This Week</h3>
                  <p className="text-2xl font-bold text-green-600">{stats.week}</p>
                  <p className="text-sm text-gray-500">clients added</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handlePeriodClick('month')}
              className="bg-white border rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer text-left"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">This Month</h3>
                  <p className="text-2xl font-bold text-purple-600">{stats.month}</p>
                  <p className="text-sm text-gray-500">clients added</p>
                </div>
              </div>
            </button>
          </div>

          {/* Daily Calendar */}
          <div className="bg-white border rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Daily Additions (Last 30 Days)</h2>
            <div className="grid grid-cols-7 gap-2 sm:gap-4">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
              {/* Calendar days */}
              {(() => {
                const today = new Date();
                const startDate = new Date(today);
                startDate.setDate(today.getDate() - 29);
                const startDay = startDate.getDay();
                const days = [];

                // Add empty cells for days before start
                for (let i = 0; i < startDay; i++) {
                  days.push(<div key={`empty-${i}`} className="h-12 sm:h-16"></div>);
                }

                // Add the 30 days
                for (let i = 0; i < 30; i++) {
                  const date = new Date(startDate);
                  date.setDate(startDate.getDate() + i);
                  const dateStr = date.toISOString().split('T')[0];
                  const dayData = stats.daily.find(d => d.date === dateStr) || { count: 0 };
                  let bgColor = 'bg-gray-100';
                  let textColor = 'text-gray-400';
                  let tooltip = '';
                  if (dayData.count > 0 && dayData.count < 4) {
                    bgColor = 'bg-green-200';
                    textColor = 'text-green-800';
                    tooltip = `${4 - dayData.count} remaining`;
                  } else if (dayData.count === 4) {
                    bgColor = 'bg-green-500';
                    textColor = 'text-white';
                  } else if (dayData.count > 4) {
                    bgColor = 'bg-blue-500';
                    textColor = 'text-white';
                    tooltip = `Exceeded by ${dayData.count - 4}`;
                  }
                  days.push(
                    <div
                      key={dateStr}
                      className={`h-12 sm:h-16 ${bgColor} rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md relative group`}
                      title={tooltip}
                      onClick={() => handleDateClick(dateStr)}
                    >
                      <div className={`text-xs sm:text-sm font-medium ${textColor}`}>
                        {date.getDate()}
                      </div>
                      {dayData.count > 0 && (
                        <div className={`text-xs sm:text-sm font-bold ${textColor}`}>
                          {dayData.count < 4 ? `-${4 - dayData.count}` : dayData.count === 4 ? '✓' : `+${dayData.count - 4}`}
                        </div>
                      )}
                      {/* Mobile tooltip - always visible on touch devices */}
                      {tooltip && (
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap md:hidden">
                          {tooltip}
                        </div>
                      )}
                      {/* Goal indicator dots */}
                      {dayData.count > 0 && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                          {dayData.count < 4 ? (
                            // Orange pulsing dot for remaining
                            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                          ) : dayData.count === 4 ? (
                            // Green static dot for goal met
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          ) : (
                            // Blue bouncing dot for exceeded
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                          )}
                          {/* Progress dots */}
                          {Array.from({ length: Math.min(dayData.count, 4) }, (_, i) => (
                            <div
                              key={i}
                              className={`w-1 h-1 rounded-full ${
                                dayData.count >= 4 ? 'bg-green-500' : 'bg-green-300'
                              }`}
                            ></div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                return days;
              })()}
            </div>
            <div className="mt-6 text-center text-sm text-gray-500 space-y-2">
              <div>Hover over days to see details. Goal: 4 clients/day</div>
              <div className="flex justify-center items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
                  <span>Remaining to goal</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span>Goal achieved</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
                  <span>Goal exceeded</span>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Date Clients */}
          {selectedDate && (
            <div className="bg-white border rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Clients Added on {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h3>
              {dateClients.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No clients added on this date
                </div>
              ) : (
                <div className="space-y-4">
                  {dateClients.map((client) => (
                    <div
                      key={client._id}
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleClientClick(client._id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-gray-900">{client.businessName || 'Unnamed Client'}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              client.status === 'dead'
                                ? 'bg-red-100 text-red-800'
                                : client.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {client.status || 'No status'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Manager: {client.managerName || 'N/A'}</div>
                            <div>Place: {client.place || 'N/A'}</div>
                            <div>First Visit: {client.firstVisit ? new Date(client.firstVisit).toLocaleDateString() : 'N/A'}</div>
                            {client.phoneNumbers && client.phoneNumbers.length > 0 && (
                              <div>Phone: {client.phoneNumbers[0]}{client.phoneNumbers.length > 1 && ` (+${client.phoneNumbers.length - 1} more)`}</div>
                            )}
                          </div>
                        </div>
                        <div className="ml-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Detailed Table */}
          <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Daily Breakdown</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Clients Added
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.daily.slice().reverse().map((day, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(day.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {day.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Period Clients Modal */}
      {showPeriodModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-5 border-b flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Clients Added {selectedPeriod === 'today' ? 'Today' : selectedPeriod === 'week' ? 'This Week' : 'This Month'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {periodClients.length} client{periodClients.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <button
                onClick={() => setShowPeriodModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {periodClients.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No clients found for this period
                </div>
              ) : (
                <div className="space-y-4">
                  {periodClients.map((client) => (
                    <div
                      key={client._id}
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleClientClick(client._id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-gray-900">{client.businessName || 'Unnamed Client'}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              client.status === 'dead'
                                ? 'bg-red-100 text-red-800'
                                : client.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {client.status || 'No status'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Manager: {client.managerName || 'N/A'}</div>
                            <div>Place: {client.place || 'N/A'}</div>
                            <div>First Visit: {client.firstVisit ? new Date(client.firstVisit).toLocaleDateString() : 'N/A'}</div>
                            {client.phoneNumbers && client.phoneNumbers.length > 0 && (
                              <div>Phone: {client.phoneNumbers[0]}{client.phoneNumbers.length > 1 && ` (+${client.phoneNumbers.length - 1} more)`}</div>
                            )}
                          </div>
                        </div>
                        <div className="ml-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="px-5 py-3 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowPeriodModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}