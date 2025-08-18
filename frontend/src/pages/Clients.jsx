import React, { useEffect, useState } from 'react';
import api from '../api';
import ClientCard from '../componentes/ClientCard';
import StatsDashboard from '../componentes/StatsDashboard';
import SearchFilterBar from '../componentes/SearchFilterBar';
import ClientModal from '../componentes/ClientModal';

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

  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px'
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '30px'
  };

  const titleStyle = {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#333'
  };

  const subtitleStyle = {
    fontSize: '16px',
    color: '#666',
    marginBottom: '20px'
  };

  const addButtonStyle = {
    backgroundColor: '#2196f3',
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '20px'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
    marginTop: '20px'
  };

  const emptyStateStyle = {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#666'
  };

  const loadingStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px',
    fontSize: '18px',
    color: '#666'
  };

  const errorStyle = {
    textAlign: 'center',
    padding: '40px',
    backgroundColor: '#ffebee',
    border: '1px solid #f44336',
    color: '#d32f2f',
    marginBottom: '20px'
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={loadingStyle}>
          Loading clients...
        </div>
      </div>
    );
  }

  if (error && !showModal) {
    return (
      <div style={containerStyle}>
        <div style={errorStyle}>
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={fetchClients} style={addButtonStyle}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>Client Management</h1>
        <p style={subtitleStyle}>Manage your business relationships</p>
        
        <button onClick={openAddModal} style={addButtonStyle}>
          + Add New Client
        </button>
        
        <SearchFilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
        />
      </div>

      <StatsDashboard clients={clients} />

      {/* Client Grid */}
      <div style={gridStyle}>
        {filteredClients.map((client) => (
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
        <div style={emptyStateStyle}>
          <h3>No clients match your search</h3>
          <p>Try adjusting your search terms or filters</p>
          <button
            onClick={() => {setSearchTerm(''); setFilterStatus('all');}}
            style={addButtonStyle}
          >
            Clear Filters
          </button>
        </div>
      )}

      {clients.length === 0 && (
        <div style={emptyStateStyle}>
          <h3>No clients yet</h3>
          <p>Add your first client to get started</p>
          <button onClick={openAddModal} style={addButtonStyle}>
            Add Your First Client
          </button>
        </div>
      )}

      {/* Dead Clients Section */}
      {deadClients.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, marginRight: '15px' }}>Dead Clients ({deadClients.length})</h3>
            <button
              onClick={() => setShowDeadClients(!showDeadClients)}
              style={{ ...addButtonStyle, backgroundColor: '#666', padding: '8px 16px', fontSize: '14px' }}
            >
              {showDeadClients ? 'Hide' : 'Show'}
            </button>
          </div>
          
          {showDeadClients && (
            <div style={gridStyle}>
              {deadClients.map((client) => (
                <ClientCard
                  key={client._id}
                  client={client}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}

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