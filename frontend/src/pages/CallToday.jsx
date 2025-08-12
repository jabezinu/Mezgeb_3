import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion';
import api from '../api';
import CallTodayCard from '../componentes/CallTodayCard';
import ClientModal from '../componentes/ClientModal';
import FloatingActionMenu from '../componentes/FloatingActionMenu';
import GestureOverlay from '../componentes/GestureOverlay';
import SmartNotifications from '../componentes/SmartNotifications';

const CallToday = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
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
    phoneNumbers: ['']
  });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await api.get('/clients');
        const today = new Date();
        today.setHours(0,0,0,0);
        
        const filtered = res.data.filter(client => {
          // Skip clients with status 'dead' or no nextVisit date
          if (client.status === 'dead' || !client.nextVisit) return false;
          
          // Check if nextVisit is today or in the past
          const nextVisitDate = new Date(client.nextVisit);
          nextVisitDate.setHours(0,0,0,0);
          return nextVisitDate <= today;
        });
        
        // Sort by nextVisit date (soonest first)
        filtered.sort((a, b) => new Date(a.nextVisit) - new Date(b.nextVisit));
        
        setClients(filtered);
      } catch (error) {
        console.error('Error fetching clients:', error);
        setClients([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchClients();
    
    // Refresh the list every 5 minutes
    const interval = setInterval(fetchClients, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
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



  const handleEdit = (client) => {
    console.log('Editing client:', client);
    console.log('Client status:', client.status);
    setForm({
      businessName: client.businessName || '',
      managerName: client.managerName || '',
      phone: client.phone || '',
      firstVisit: client.firstVisit || '',
      nextVisit: client.nextVisit || '',
      place: client.place || '',
      status: client.status || 'started',
      deal: client.deal || '',
      description: client.description || '',
      phoneNumbers: client.phone ? [client.phone] : [''],
    });
    setEditingClient(client);
    setShowModal(true);
  };

  const handleSubmit = async (formData) => {
    try {
      const res = await api.put(`/clients/${editingClient._id}`, formData);
      const updatedClient = res.data;
      
      // Check if the updated nextVisit is today or before today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const updatedNextVisit = new Date(updatedClient.nextVisit);
      updatedNextVisit.setHours(0, 0, 0, 0);
      
      // Update the clients list
      if (updatedNextVisit <= today && updatedClient.status !== 'dead') {
        setClients(clients.map(c => c._id === editingClient._id ? updatedClient : c));
      } else {
        setClients(clients.filter(c => c._id !== editingClient._id));
      }
      
      setShowModal(false);
    } catch (error) {
      console.error('Error updating client:', error);
      alert('Failed to update client.');
    }
  };

  const resetForm = () => {
    setForm({
      businessName: '',
      managerName: '',
      phone: '',
      firstVisit: '',
      nextVisit: '',
      place: '',
      status: 'started',
      deal: '',
      description: '',
      phoneNumbers: ['']
    });
    setEditingClient(null);
    setShowModal(false);
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
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            📞 Call Today
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 font-light px-4">Clients scheduled for a call today</p>
          <div className="mt-4 text-sm text-gray-400">
            Tap cards to expand • Quick call with phone icon
          </div>
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
            <div className="text-8xl mb-8">📞</div>
            <h3 className="text-3xl font-bold text-white mb-4">No clients to call today.</h3>
            <p className="text-gray-400 text-lg mb-8">You're all caught up!</p>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8,
              staggerChildren: 0.15,
              delayChildren: 0.3
            }}
          >
            {clients.map((client, index) => {
              const nextVisitDate = new Date(client.nextVisit);
              nextVisitDate.setHours(0,0,0,0);
              const today = new Date();
              today.setHours(0,0,0,0);
              const isMissed = nextVisitDate < today;
              return (
                <motion.div
                  key={client._id}
                  initial={{ opacity: 0, y: 60, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.7,
                    delay: index * 0.15,
                    ease: [0.23, 1, 0.32, 1]
                  }}
                  whileInView={{ 
                    opacity: 1,
                    transition: { duration: 0.6 }
                  }}
                  viewport={{ once: true, margin: "-50px" }}
                >
                  <CallTodayCard
                    client={client}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isMissed={isMissed}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Revolutionary Floating Action Menu */}
        <FloatingActionMenu
          onAddClient={() => window.location.href = '/clients'}
          onQuickCall={() => {
            const urgentClient = clients.find(c => {
              const nextVisitDate = new Date(c.nextVisit);
              const today = new Date();
              return nextVisitDate < today;
            });
            if (urgentClient) window.open(`tel:${urgentClient.phone}`, '_self');
          }}
          onViewStats={() => window.location.href = '/clients'}
        />

        {/* Revolutionary Gesture System */}
        <GestureOverlay
          onGesture={(gesture) => {
            switch (gesture) {
              case 'swipe-up':
                window.location.href = '/clients';
                break;
              case 'swipe-down':
                window.location.href = '/clients';
                break;
              case 'swipe-left':
                const urgentClient = clients.find(c => {
                  const nextVisitDate = new Date(c.nextVisit);
                  const today = new Date();
                  return nextVisitDate < today;
                });
                if (urgentClient) window.open(`tel:${urgentClient.phone}`, '_self');
                break;
              case 'swipe-right':
                // Mark all as completed
                clients.forEach(client => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 7);
                  const updatedClient = {
                    ...client,
                    nextVisit: tomorrow.toISOString().split('T')[0],
                    status: 'active'
                  };
                  handleEdit(updatedClient);
                });
                break;
            }
          }}
        />

        {/* Revolutionary Smart Notifications */}
        <SmartNotifications clients={clients} />
      </div>

      <ClientModal
        open={showModal}
        onClose={resetForm}
        onSubmit={handleSubmit}
        form={form}
        setForm={setForm}
        editingId={editingClient?._id}
      />
    </div>
  )
}

export default CallToday
