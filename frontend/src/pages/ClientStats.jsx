import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClientsAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function ClientStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [periodClients, setPeriodClients] = useState([]);
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateClients, setDateClients] = useState([]);
  const [dailyGoal, setDailyGoal] = useState(4);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState('');
  const [goalStartDate, setGoalStartDate] = useState('');
  const [goalEndDate, setGoalEndDate] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const navigate = useNavigate();
  const { user, updateDailyGoal, addGoalPeriod, updateGoalPeriod, deleteGoalPeriod } = useAuth();

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (user?.dailyGoal) {
      setDailyGoal(user.dailyGoal);
    }
  }, [user]);

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

  function navigateMonth(direction) {
    let newMonth = currentMonth + direction;
    let newYear = currentYear;

    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  }

  function goToToday() {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  }

  function handleClientClick(clientId) {
    navigate(`/clients?editId=${clientId}`);
  }

  async function handleUpdateGoal() {
    const goal = parseInt(newGoal);
    if (goal >= 1 && goal <= 50) {
      try {
        if (goalStartDate && goalEndDate) {
          // Create a new goal period
          await addGoalPeriod(goal, goalStartDate, goalEndDate);
        } else {
          // Update the default daily goal
          await updateDailyGoal(goal);
          setDailyGoal(goal);
        }
        setShowGoalModal(false);
        setNewGoal('');
        setGoalStartDate('');
        setGoalEndDate('');
      } catch (e) {
        alert('Failed to update goal: ' + e.message);
      }
    } else {
      alert('Daily goal must be between 1 and 50');
    }
  }

  function getGoalForDate(dateStr) {
    if (!user?.goalPeriods) return dailyGoal;

    const date = new Date(dateStr);
    const activePeriod = user.goalPeriods.find(period => {
      if (!period.isActive) return false;
      const start = new Date(period.startDate);
      const end = new Date(period.endDate);
      return date >= start && date <= end;
    });

    return activePeriod ? activePeriod.goal : dailyGoal;
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
        <p className="text-gray-600 mb-4">Track your client acquisition progress</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setNewGoal(dailyGoal.toString());
              setGoalStartDate('');
              setGoalEndDate('');
              setShowGoalModal(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Set Default Goal ({dailyGoal})
          </button>
          <button
            onClick={() => {
              setNewGoal('');
              setGoalStartDate('');
              setGoalEndDate('');
              setShowGoalModal(true);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Add Goal Period
          </button>
        </div>
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Daily Additions ({new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Previous month"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={goToToday}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  title="Go to today"
                >
                  Today
                </button>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Next month"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2 sm:gap-4">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
              {/* Calendar days */}
              {(() => {
                const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
                const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
                const startDate = new Date(firstDayOfMonth);
                startDate.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());
                const endDate = new Date(lastDayOfMonth);
                endDate.setDate(lastDayOfMonth.getDate() + (6 - lastDayOfMonth.getDay()));

                const days = [];
                const currentDate = new Date(startDate);

                while (currentDate <= endDate) {
                  const dateStr = currentDate.toISOString().split('T')[0];
                  const dayData = stats.daily.find(d => d.date === dateStr) || { count: 0 };
                  const isToday = currentDate.toDateString() === new Date().toDateString();
                  const isCurrentMonth = currentDate.getMonth() === currentMonth;
                  const goalForDate = getGoalForDate(dateStr);

                  let bgColor = 'bg-gray-100';
                  let textColor = 'text-gray-400';
                  let tooltip = '';
                  let ringColor = '';
                  let opacity = isCurrentMonth ? '' : 'opacity-30';

                  if (isToday) {
                    ringColor = 'ring-2 ring-yellow-400 ring-offset-2';
                  }

                  if (dayData.count > 0 && dayData.count < goalForDate) {
                    bgColor = 'bg-green-200';
                    textColor = 'text-green-800';
                    tooltip = `${goalForDate - dayData.count} remaining`;
                  } else if (dayData.count === goalForDate) {
                    bgColor = 'bg-green-500';
                    textColor = 'text-white';
                  } else if (dayData.count > goalForDate) {
                    bgColor = 'bg-blue-500';
                    textColor = 'text-white';
                    tooltip = `Exceeded by ${dayData.count - goalForDate}`;
                  }

                  days.push(
                    <div
                      key={dateStr}
                      className={`h-12 sm:h-16 ${bgColor} ${ringColor} ${opacity} rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md relative group`}
                      title={tooltip}
                      onClick={() => handleDateClick(dateStr)}
                    >
                      <div className={`text-xs sm:text-sm font-medium ${textColor}`}>
                        {currentDate.getDate()}
                      </div>
                      {dayData.count > 0 && (
                        <div className={`text-xs sm:text-sm font-bold ${textColor}`}>
                          {dayData.count < dailyGoal ? `-${dailyGoal - dayData.count}` : dayData.count === dailyGoal ? '✓' : `+${dayData.count - dailyGoal}`}
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
                          {dayData.count < goalForDate ? (
                            // Orange pulsing dot for remaining
                            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                          ) : dayData.count === goalForDate ? (
                            // Green static dot for goal met
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          ) : (
                            // Blue bouncing dot for exceeded
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                          )}
                          {/* Progress dots */}
                          {Array.from({ length: Math.min(dayData.count, goalForDate) }, (_, i) => (
                            <div
                              key={i}
                              className={`w-1 h-1 rounded-full ${
                                dayData.count >= goalForDate ? 'bg-green-500' : 'bg-green-300'
                              }`}
                            ></div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                  currentDate.setDate(currentDate.getDate() + 1);
                }
                return days;
              })()}
            </div>
            <div className="mt-6 text-center text-sm text-gray-500 space-y-2">
              <div>Hover over days to see details. Default goal: {dailyGoal} clients/day</div>
              {user?.goalPeriods && user.goalPeriods.length > 0 && (
                <div className="text-xs space-y-1">
                  <div className="font-medium">Active Goal Periods:</div>
                  {user.goalPeriods.filter(p => p.isActive).map((period, idx) => (
                    <div key={idx} className="flex items-center justify-center gap-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                        {new Date(period.startDate).toLocaleDateString()} - {new Date(period.endDate).toLocaleDateString()}: {period.goal} clients/day
                      </span>
                    </div>
                  ))}
                </div>
              )}
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

            {/* Goal Modal */}
            {showGoalModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {goalStartDate && goalEndDate ? 'Add Goal Period' : 'Set Default Daily Goal'}
                      </h3>
                      <button
                        onClick={() => setShowGoalModal(false)}
                        className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Number of clients per day
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={newGoal}
                          onChange={(e) => setNewGoal(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg font-semibold"
                          placeholder={goalStartDate && goalEndDate ? "Enter goal" : dailyGoal.toString()}
                        />
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          Range: 1-50 clients per day
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start Date
                          </label>
                          <input
                            type="date"
                            value={goalStartDate}
                            onChange={(e) => setGoalStartDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            End Date
                          </label>
                          <input
                            type="date"
                            value={goalEndDate}
                            onChange={(e) => setGoalEndDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {goalStartDate && goalEndDate && (
                        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                          <div className="font-medium">Goal Period Preview:</div>
                          <div>{new Date(goalStartDate).toLocaleDateString()} - {new Date(goalEndDate).toLocaleDateString()}</div>
                          <div>Goal: {newGoal || '?'} clients/day</div>
                        </div>
                      )}

                      {!goalStartDate && !goalEndDate && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          <div className="font-medium">Default Goal:</div>
                          <div>This will be your default goal for all days without specific periods.</div>
                          <div>Current: {dailyGoal} clients/day</div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => setShowGoalModal(false)}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateGoal}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        disabled={!newGoal || (goalStartDate && goalEndDate && (!goalStartDate || !goalEndDate || new Date(goalStartDate) >= new Date(goalEndDate)))}
                      >
                        {goalStartDate && goalEndDate ? 'Add Goal Period' : 'Update Default Goal'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
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