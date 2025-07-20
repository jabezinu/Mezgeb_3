import React, { useEffect, useState } from 'react';
import api from '../api';
import ClientCard from '../componentes/ClientCard';
import StatsDashboard from '../componentes/StatsDashboard';
import SearchFilterBar from '../componentes/SearchFilterBar';
import ClientModal from '../componentes/ClientModal';
import DeadClientsSection from '../componentes/DeadClientsSection';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDeadClients, setShowDeadClients] = useState(false);
  const [form, setForm] = useState({
    businessName: '',
    managerName: '',
    phone: '',
    firstVisit: '',
    nextVisit: '',
    place: '',
    status: 'started',
    deal: '',
    description: '',
  });
  const [editingId, setEditingId] = useState(null);

  const fetchClients = () => {
    setLoading(true);
    api.get('/clients')
      .then(res => {
        setClients(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch clients');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSubmit = () => {
    setError(null);
    if (editingId) {
      api.put(`/clients/${editingId}`, form)
        .then(() => {
          fetchClients();
          resetForm();
        })
        .catch(() => setError('Failed to update client'));
    } else {
      api.post('/clients', form)
        .then(() => {
          fetchClients();
          resetForm();
        })
        .catch(() => setError('Failed to add client'));
    }
  };

  const resetForm = () => {
    setForm({
      businessName: '', managerName: '', phone: '', firstVisit: '', nextVisit: '', place: '', status: 'started', deal: '', description: ''
    });
    setEditingId(null);
    setShowModal(false);
  };

  const handleEdit = client => {
    setForm({
      businessName: client.businessName || '',
      managerName: client.managerName || '',
      phone: client.phone || '',
      firstVisit: client.firstVisit ? client.firstVisit.slice(0, 10) : '',
      nextVisit: client.nextVisit ? client.nextVisit.slice(0, 10) : '',
      place: client.place || '',
      status: client.status || 'started',
      deal: client.deal || '',
      description: client.description || '',
    });
    setEditingId(client._id);
    setShowModal(true);
  };

  const handleDelete = id => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      api.delete(`/clients/${id}`)
        .then(() => fetchClients())
        .catch(() => setError('Failed to delete client'));
    }
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  // Filter clients based on search and status, separating dead clients
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.managerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.place.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
    return matchesSearch && matchesStatus && client.status !== 'dead';
  });

  // Separate dead clients
  const deadClients = clients.filter(client => {
    const matchesSearch = client.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.managerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.place.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && client.status === 'dead';
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
        {/* Loading spinner and message */}
        <div className="absolute inset-0 animate-pulse" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}}></div>
        <div className="text-center z-10">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-transparent border-t-cyan-400 border-r-purple-400 border-b-pink-400 border-l-blue-400 rounded-full animate-spin mx-auto mb-8"></div>
            <div className="absolute inset-0 w-24 h-24 border-4 border-transparent border-t-purple-400 border-r-pink-400 border-b-cyan-400 border-l-blue-400 rounded-full animate-spin mx-auto animate-reverse"></div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl px-8 py-6 border border-white/20">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              Loading Clients
            </h3>
            <p className="text-gray-300">Preparing your magnificent dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !showModal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-rose-900 to-pink-900 flex items-center justify-center">
        <div className="text-center bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-red-500/20 shadow-2xl">
          <div className="text-8xl mb-6 animate-bounce">💥</div>
          <h3 className="text-3xl font-bold text-white mb-4">Oops! Something went wrong</h3>
          <p className="text-xl text-red-200 mb-6">{error}</p>
          <button 
            onClick={fetchClients}
            className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-3 rounded-2xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background and Floating Particles (unchanged) */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-pink-400/20 to-red-600/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-green-400/20 to-teal-600/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-6000"></div>
      </div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/10 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>
      <div className="container mx-auto px-6 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="relative inline-block">
            <h1 className="text-7xl md:text-8xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6 animate-pulse">
              CLIENT NEXUS
            </h1>
            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400/20 via-purple-400/20 to-pink-400/20 blur-2xl rounded-full animate-pulse"></div>
          </div>
          <p className="text-2xl text-gray-300 mb-8 font-light">Where Business Relationships Transform Into Success</p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <button
              onClick={openAddModal}
              className="group relative px-10 py-5 text-xl font-bold text-white bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 rounded-full hover:shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative flex items-center">
                <svg className="w-8 h-8 mr-3 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Launch New Client
              </div>
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full blur-xl"></div>
            </button>
          </div>
          <SearchFilterBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
          />
        </div>
        <StatsDashboard clients={clients} />
        {/* Client Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredClients.map(client => (
            <ClientCard
              key={client._id}
              client={client}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
        {/* Empty State */}
        {filteredClients.length === 0 && clients.length > 0 && deadClients.length === 0 && (
          <div className="text-center py-20">
            <div className="text-8xl mb-8 animate-bounce">🔍</div>
            <h3 className="text-3xl font-bold text-white mb-4">No clients match your search</h3>
            <p className="text-gray-400 text-lg mb-8">Try adjusting your search terms or filters</p>
            <button
              onClick={() => {setSearchTerm(''); setFilterStatus('all');}}
              className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-3 rounded-2xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              Clear Filters
            </button>
          </div>
        )}
        {clients.length === 0 && (
          <div className="text-center py-20">
            <div className="text-9xl mb-8 animate-pulse">🌟</div>
            <h3 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
              Your Client Journey Begins Here
            </h3>
            <p className="text-gray-400 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
              Transform your business relationships into a powerful network of success. Add your first client and watch your empire grow.
            </p>
            <button
              onClick={openAddModal}
              className="bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 text-white px-12 py-5 rounded-full text-xl font-bold hover:shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-500"
            >
              🚀 Launch Your First Client
            </button>
          </div>
        )}
        {/* Dead Clients Section */}
        {deadClients.length > 0 && (
          <DeadClientsSection
            deadClients={deadClients}
            showDeadClients={showDeadClients}
            setShowDeadClients={setShowDeadClients}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>
      {/* Modal */}
      <ClientModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        form={form}
        setForm={setForm}
        editingId={editingId}
        error={error}
      />
    </div>
  );
};

export default Clients;