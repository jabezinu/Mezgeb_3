import React, { useEffect, useState } from 'react'
import api from '../api';

const statusColors = {
  started: 'from-amber-400 via-orange-500 to-red-500',
  active: 'from-emerald-400 via-green-500 to-teal-600',
  onaction: 'from-blue-400 via-indigo-500 to-purple-600',
  closed: 'from-gray-400 via-slate-500 to-stone-600',
};

const statusGlow = {
  started: 'shadow-amber-500/25',
  active: 'shadow-emerald-500/25',
  onaction: 'shadow-blue-500/25',
  closed: 'shadow-gray-500/25',
};

const statusIcons = {
  started: '🚀',
  active: '⚡',
  onaction: '🎯',
  closed: '🔒',
};

const CallToday = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await api.get('/clients');
        const today = new Date();
        today.setHours(0,0,0,0);
        const filtered = res.data.filter(client => {
          if (!client.nextVisit) return false;
          const nextVisitDate = new Date(client.nextVisit);
          nextVisitDate.setHours(0,0,0,0);
          // Keep clients whose nextVisit is today or before today
          return nextVisitDate <= today;
        });
        setClients(filtered);
      } catch {
        setClients([]);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    try {
      await api.delete(`/clients/${id}`);
      setClients(clients.filter(c => c._id !== id));
    } catch (err) {
      console.log(err)
      alert('Failed to delete client.');
    }
  };

  const handleEditClick = (client) => {
    setEditingId(client._id);
    setEditData({ ...client });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async () => {
    try {
      const res = await api.put(`/clients/${editingId}`, editData);
      // Check if the updated nextVisit is today or before today
      const today = new Date();
      today.setHours(0,0,0,0);
      const updatedNextVisit = new Date(res.data.nextVisit);
      updatedNextVisit.setHours(0,0,0,0);
      if (updatedNextVisit <= today) {
        setClients(clients.map(c => c._id === editingId ? res.data : c));
      } else {
        setClients(clients.filter(c => c._id !== editingId));
      }
      setEditingId(null);
    } catch (error) {
      console.error('Error updating client:', error);
      alert('Failed to update client.');
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-pink-400/20 to-red-600/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-green-400/20 to-teal-600/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-6000"></div>
      </div>
      <div className="container mx-auto px-6 py-8 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 animate-pulse">
            Call Today
          </h1>
          <p className="text-xl text-gray-300 font-light">Clients scheduled for a call today</p>
        </div>
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <div className="w-20 h-20 border-4 border-transparent border-t-cyan-400 border-r-purple-400 border-b-pink-400 border-l-blue-400 rounded-full animate-spin mb-6"></div>
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl px-8 py-6 border border-white/20">
              <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                Loading Clients
              </h3>
              <p className="text-gray-300">Preparing your dashboard...</p>
            </div>
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-8xl mb-8 animate-bounce">📞</div>
            <h3 className="text-3xl font-bold text-white mb-4">No clients to call today.</h3>
            <p className="text-gray-400 text-lg mb-8">You're all caught up!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {clients.map(client => {
              const nextVisitDate = new Date(client.nextVisit);
              nextVisitDate.setHours(0,0,0,0);
              const today = new Date();
              today.setHours(0,0,0,0);
              const isMissed = nextVisitDate < today;
              return (
                <div
                  key={client._id}
                  className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-700 hover:scale-105 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/50 via-purple-500/50 to-pink-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl blur-sm"></div>
                  <div className="relative z-10">
                    {editingId === client._id ? (
                      <form
                        onSubmit={e => { e.preventDefault(); handleEditSave(); }}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input name="businessName" value={editData.businessName || ''} onChange={handleEditChange} placeholder="Business Name" className="w-full px-4 py-3 border border-gray-600 bg-slate-900/40 text-white rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors" />
                          <input name="managerName" value={editData.managerName || ''} onChange={handleEditChange} placeholder="Manager Name" className="w-full px-4 py-3 border border-gray-600 bg-slate-900/40 text-white rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors" />
                          <input name="phone" value={editData.phone || ''} onChange={handleEditChange} placeholder="Phone" className="w-full px-4 py-3 border border-gray-600 bg-slate-900/40 text-white rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors" />
                          <input name="place" value={editData.place || ''} onChange={handleEditChange} placeholder="Place" className="w-full px-4 py-3 border border-gray-600 bg-slate-900/40 text-white rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors" />
                          <input name="firstVisit" type="date" value={editData.firstVisit ? editData.firstVisit.slice(0,10) : ''} onChange={handleEditChange} placeholder="First Visit" className="w-full px-4 py-3 border border-gray-600 bg-slate-900/40 text-white rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors" />
                          <input name="nextVisit" type="date" value={editData.nextVisit ? editData.nextVisit.slice(0,10) : ''} onChange={handleEditChange} placeholder="Next Visit" className="w-full px-4 py-3 border border-gray-600 bg-slate-900/40 text-white rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors" />
                          <select name="status" value={editData.status || ''} onChange={handleEditChange} className="w-full px-4 py-3 border border-gray-600 bg-slate-900/40 text-white rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors">
                            <option value="started">🚀 Started</option>
                            <option value="active">✅ Active</option>
                            <option value="onaction">⚡ On Action</option>
                            <option value="closed">🔒 Closed</option>
                          </select>
                          <input name="deal" type="number" value={editData.deal || ''} onChange={handleEditChange} placeholder="Deal" className="w-full px-4 py-3 border border-gray-600 bg-slate-900/40 text-white rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors" />
                        </div>
                        <input name="description" value={editData.description || ''} onChange={handleEditChange} placeholder="Description" className="w-full px-4 py-3 border border-gray-600 bg-slate-900/40 text-white rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors" />
                        <div className="flex gap-4 pt-2">
                          <button type="submit" className="flex-1 bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-bold hover:from-cyan-400 hover:to-pink-500 transition-all duration-300 hover:shadow-lg hover:scale-105">Save</button>
                          <button type="button" onClick={handleEditCancel} className="flex-1 bg-gray-200/20 text-gray-200 py-3 px-6 rounded-xl font-bold hover:bg-gray-300/30 transition-all duration-200">Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <div>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-2xl font-black text-white mb-2 group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-purple-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                              {client.businessName}
                            </h3>
                            <div className="flex items-center text-gray-300 mb-2">
                              <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {client.managerName}
                            </div>
                          </div>
                          <div className={`px-4 py-2 rounded-2xl bg-gradient-to-r ${statusColors[client.status]} text-white font-bold text-sm shadow-lg ${statusGlow[client.status]} group-hover:shadow-xl transition-all duration-300`}>
                            {statusIcons[client.status]} {client.status?.toUpperCase()}
                          </div>
                        </div>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-gray-300 bg-white/5 rounded-2xl p-3 group-hover:bg-white/10 transition-all duration-300">
                            <svg className="w-5 h-5 mr-3 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {client.phone}
                          </div>
                          <div className="flex items-center text-gray-300 bg-white/5 rounded-2xl p-3 group-hover:bg-white/10 transition-all duration-300">
                            <svg className="w-5 h-5 mr-3 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {client.place}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-2xl p-3 border border-blue-500/30">
                            <p className="text-blue-400 font-bold text-xs mb-1">First Visit</p>
                            <p className="text-white text-xs">{client.firstVisit ? new Date(client.firstVisit).toLocaleDateString() : ''}</p>
                          </div>
                          <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-2xl p-3 border border-green-500/30 flex items-center justify-between">
                            <div>
                              <p className="text-green-400 font-bold text-xs mb-1">Next Visit</p>
                              <p className="text-white text-xs">{client.nextVisit ? new Date(client.nextVisit).toLocaleDateString() : ''}</p>
                            </div>
                            {isMissed && (
                              <span className="ml-2 px-2 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-xl animate-pulse">Missed</span>
                            )}
                          </div>
                        </div>
                        {client.deal && (
                          <div className="bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-2xl p-3 border border-emerald-500/30 mb-4">
                            <p className="text-emerald-400 font-bold text-xs mb-1">Deal Value</p>
                            <p className="text-xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                              {parseFloat(client.deal).toLocaleString()} Birr.
                            </p>
                          </div>
                        )}
                        {client.description && (
                          <div className="bg-white/5 rounded-2xl p-3 mb-4 group-hover:bg-white/10 transition-all duration-300">
                            <p className="text-gray-400 font-bold text-xs mb-1">Notes</p>
                            <p className="text-gray-300 text-xs leading-relaxed">{client.description}</p>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <button onClick={() => handleEditClick(client)} className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white py-2 px-3 rounded-2xl font-bold hover:from-amber-400 hover:to-orange-500 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25 transform hover:scale-105">✏️ Edit</button>
                          <button onClick={() => handleDelete(client._id)} className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white py-2 px-3 rounded-2xl font-bold hover:from-red-400 hover:to-pink-500 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25 transform hover:scale-105">🗑️ Delete</button>
                          <a href={`tel:${client.phone}`} className="flex-1"><button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-2 px-3 rounded-2xl font-bold hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25 transform hover:scale-105">📞 Call</button></a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default CallToday
