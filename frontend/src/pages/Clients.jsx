// import React, { useEffect, useState } from 'react';
// import api from '../api';

// const statusColors = {
//   started: 'bg-yellow-100 text-yellow-800',
//   active: 'bg-green-100 text-green-800',
//   onaction: 'bg-blue-100 text-blue-800',
//   closed: 'bg-gray-200 text-gray-600',
// };

// const Clients = () => {
//   const [clients, setClients] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [form, setForm] = useState({
//     businessName: '',
//     managerName: '',
//     phone: '',
//     firstVisit: '',
//     nextVisit: '',
//     place: '',
//     status: 'started',
//     deal: '',
//     description: '',
//   });
//   const [editingId, setEditingId] = useState(null);

//   const fetchClients = () => {
//     setLoading(true);
//     api.get('/clients')
//       .then(res => {
//         setClients(res.data);
//         setLoading(false);
//       })
//       .catch(() => {
//         setError('Failed to fetch clients');
//         setLoading(false);
//       });
//   };

//   useEffect(() => {
//     fetchClients();
//   }, []);

//   const handleChange = e => {
//     const { name, value } = e.target;
//     setForm(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = e => {
//     e.preventDefault();
//     setError(null);
//     if (editingId) {
//       // Update
//       api.put(`/clients/${editingId}`, form)
//         .then(() => {
//           fetchClients();
//           setForm({
//             businessName: '', managerName: '', phone: '', firstVisit: '', nextVisit: '', place: '', status: 'started', deal: '', description: ''
//           });
//           setEditingId(null);
//         })
//         .catch(() => setError('Failed to update client'));
//     } else {
//       // Create
//       api.post('/clients', form)
//         .then(() => {
//           fetchClients();
//           setForm({
//             businessName: '', managerName: '', phone: '', firstVisit: '', nextVisit: '', place: '', status: 'started', deal: '', description: ''
//           });
//         })
//         .catch(() => setError('Failed to add client'));
//     }
//   };

//   const handleEdit = client => {
//     setForm({
//       businessName: client.businessName || '',
//       managerName: client.managerName || '',
//       phone: client.phone || '',
//       firstVisit: client.firstVisit ? client.firstVisit.slice(0, 10) : '',
//       nextVisit: client.nextVisit ? client.nextVisit.slice(0, 10) : '',
//       place: client.place || '',
//       status: client.status || 'started',
//       deal: client.deal || '',
//       description: client.description || '',
//     });
//     setEditingId(client._id);
//   };

//   const handleDelete = id => {
//     if (window.confirm('Are you sure you want to delete this client?')) {
//       api.delete(`/clients/${id}`)
//         .then(() => fetchClients())
//         .catch(() => setError('Failed to delete client'));
//     }
//   };

//   if (loading) return <div className="text-center py-10">Loading clients...</div>;
//   if (error) return <div className="text-center text-red-500 py-10">{error}</div>;

//   return (
//     <div className="max-w-5xl mx-auto p-6">
//       <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">Clients</h1>
//       {/* Add/Edit Form */}
//       <form onSubmit={handleSubmit} className="mb-8 bg-blue-50 p-4 rounded shadow flex flex-wrap gap-4 items-end">
//         <input name="businessName" value={form.businessName} onChange={handleChange} required placeholder="Business Name" className="border p-2 rounded flex-1" />
//         <input name="managerName" value={form.managerName} onChange={handleChange} required placeholder="Manager" className="border p-2 rounded flex-1" />
//         <input name="phone" value={form.phone} onChange={handleChange} required placeholder="Phone" className="border p-2 rounded flex-1" />
//         <input name="firstVisit" value={form.firstVisit} onChange={handleChange} type="date" required className="border p-2 rounded" />
//         <input name="nextVisit" value={form.nextVisit} onChange={handleChange} type="date" required className="border p-2 rounded" />
//         <input name="place" value={form.place} onChange={handleChange} required placeholder="Place" className="border p-2 rounded flex-1" />
//         <select name="status" value={form.status} onChange={handleChange} className="border p-2 rounded">
//           <option value="started">Started</option>
//           <option value="active">Active</option>
//           <option value="onaction">On Action</option>
//           <option value="closed">Closed</option>
//         </select>
//         <input name="deal" value={form.deal} onChange={handleChange} placeholder="Deal ($)" className="border p-2 rounded w-24" />
//         <input name="description" value={form.description} onChange={handleChange} placeholder="Description" className="border p-2 rounded flex-1" />
//         <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">{editingId ? 'Update' : 'Add'}</button>
//         {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ businessName: '', managerName: '', phone: '', firstVisit: '', nextVisit: '', place: '', status: 'started', deal: '', description: '' }); }} className="ml-2 px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancel</button>}
//       </form>
//       <div className="overflow-x-auto rounded-lg shadow">
//         <table className="min-w-full bg-white">
//           <thead className="bg-blue-100">
//             <tr>
//               <th className="py-3 px-4 text-left">Business Name</th>
//               <th className="py-3 px-4 text-left">Manager</th>
//               <th className="py-3 px-4 text-left">Phone</th>
//               <th className="py-3 px-4 text-left">First Visit</th>
//               <th className="py-3 px-4 text-left">Next Visit</th>
//               <th className="py-3 px-4 text-left">Place</th>
//               <th className="py-3 px-4 text-left">Status</th>
//               <th className="py-3 px-4 text-left">Deal</th>
//               <th className="py-3 px-4 text-left">Description</th>
//               <th className="py-3 px-4 text-left">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {clients.map(client => (
//               <tr key={client._id} className="border-b hover:bg-blue-50 transition">
//                 <td className="py-2 px-4 font-semibold">{client.businessName}</td>
//                 <td className="py-2 px-4">{client.managerName}</td>
//                 <td className="py-2 px-4">{client.phone}</td>
//                 <td className="py-2 px-4">{new Date(client.firstVisit).toLocaleDateString()}</td>
//                 <td className="py-2 px-4">{new Date(client.nextVisit).toLocaleDateString()}</td>
//                 <td className="py-2 px-4">{client.place}</td>
//                 <td className="py-2 px-4">
//                   <span className={`px-2 py-1 rounded text-xs font-bold ${statusColors[client.status] || 'bg-gray-100 text-gray-700'}`}>{client.status}</span>
//                 </td>
//                 <td className="py-2 px-4">{client.deal !== undefined ? `$${client.deal}` : '-'}</td>
//                 <td className="py-2 px-4">{client.description || '-'}</td>
//                 <td className="py-2 px-4 flex gap-2">
//                   <button onClick={() => handleEdit(client)} className="px-2 py-1 bg-yellow-300 rounded hover:bg-yellow-400">Edit</button>
//                   <button onClick={() => handleDelete(client._id)} className="px-2 py-1 bg-red-400 text-white rounded hover:bg-red-500">Delete</button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default Clients;







































// import React, { useEffect, useState } from 'react';
// import api from '../api';

// const statusColors = {
//   started: 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white',
//   active: 'bg-gradient-to-r from-green-400 to-emerald-500 text-white',
//   onaction: 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white',
//   closed: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white',
// };

// const statusIcons = {
//   started: '🚀',
//   active: '✅',
//   onaction: '⚡',
//   closed: '🔒',
// };

// const Clients = () => {
//   const [clients, setClients] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [form, setForm] = useState({
//     businessName: '',
//     managerName: '',
//     phone: '',
//     firstVisit: '',
//     nextVisit: '',
//     place: '',
//     status: 'started',
//     deal: '',
//     description: '',
//   });
//   const [editingId, setEditingId] = useState(null);

//   const fetchClients = () => {
//     setLoading(true);
//     api.get('/clients')
//       .then(res => {
//         setClients(res.data);
//         setLoading(false);
//       })
//       .catch(() => {
//         setError('Failed to fetch clients');
//         setLoading(false);
//       });
//   };

//   useEffect(() => {
//     fetchClients();
//   }, []);

//   const handleChange = e => {
//     const { name, value } = e.target;
//     setForm(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = e => {
//     e.preventDefault();
//     setError(null);
//     if (editingId) {
//       // Update
//       api.put(`/clients/${editingId}`, form)
//         .then(() => {
//           fetchClients();
//           resetForm();
//         })
//         .catch(() => setError('Failed to update client'));
//     } else {
//       // Create
//       api.post('/clients', form)
//         .then(() => {
//           fetchClients();
//           resetForm();
//         })
//         .catch(() => setError('Failed to add client'));
//     }
//   };

//   const resetForm = () => {
//     setForm({
//       businessName: '', managerName: '', phone: '', firstVisit: '', nextVisit: '', place: '', status: 'started', deal: '', description: ''
//     });
//     setEditingId(null);
//     setShowModal(false);
//   };

//   const handleEdit = client => {
//     setForm({
//       businessName: client.businessName || '',
//       managerName: client.managerName || '',
//       phone: client.phone || '',
//       firstVisit: client.firstVisit ? client.firstVisit.slice(0, 10) : '',
//       nextVisit: client.nextVisit ? client.nextVisit.slice(0, 10) : '',
//       place: client.place || '',
//       status: client.status || 'started',
//       deal: client.deal || '',
//       description: client.description || '',
//     });
//     setEditingId(client._id);
//     setShowModal(true);
//   };

//   const handleDelete = id => {
//     if (window.confirm('Are you sure you want to delete this client?')) {
//       api.delete(`/clients/${id}`)
//         .then(() => fetchClients())
//         .catch(() => setError('Failed to delete client'));
//     }
//   };

//   const openAddModal = () => {
//     resetForm();
//     setShowModal(true);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
//         <div className="text-center">
//           <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
//           <p className="text-xl text-gray-600 font-medium">Loading your clients...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
//         <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
//           <div className="text-6xl mb-4">😔</div>
//           <p className="text-xl text-red-600 font-medium">{error}</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
//       <div className="container mx-auto px-4 py-8">
//         {/* Header Section */}
//         <div className="text-center mb-12">
//           <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
//             Client Management
//           </h1>
//           <p className="text-gray-600 text-lg mb-8">Manage your business relationships with style</p>
          
//           {/* Add Button */}
//           <button
//             onClick={openAddModal}
//             className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl hover:from-indigo-600 hover:to-purple-700 hover:scale-105 hover:shadow-2xl transform"
//           >
//             <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl blur-sm opacity-0 group-hover:opacity-50 transition-opacity"></span>
//             <span className="relative flex items-center">
//               <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//               </svg>
//               Add New Client
//             </span>
//           </button>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
//           {Object.entries(statusColors).map(([status, colorClass]) => {
//             const count = clients.filter(client => client.status === status).length;
//             return (
//               <div key={status} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm font-medium text-gray-600 capitalize">{status}</p>
//                     <p className="text-3xl font-bold text-gray-900">{count}</p>
//                   </div>
//                   <div className="text-3xl">{statusIcons[status]}</div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {/* Client Cards Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//           {clients.map(client => (
//             <div key={client._id} className="group bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20 hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:bg-white/90">
//               {/* Card Header */}
//               <div className="flex items-start justify-between mb-4">
//                 <div className="flex-1">
//                   <h3 className="text-xl font-bold text-gray-900 mb-1">{client.businessName}</h3>
//                   <p className="text-gray-600 flex items-center">
//                     <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                     </svg>
//                     {client.managerName}
//                   </p>
//                 </div>
//                 <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[client.status] || 'bg-gray-100 text-gray-700'} shadow-lg`}>
//                   {statusIcons[client.status]} {client.status}
//                 </span>
//               </div>

//               {/* Card Content */}
//               <div className="space-y-3 mb-6">
//                 <div className="flex items-center text-gray-600">
//                   <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
//                   </svg>
//                   {client.phone}
//                 </div>
                
//                 <div className="flex items-center text-gray-600">
//                   <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
//                   </svg>
//                   {client.place}
//                 </div>

//                 <div className="grid grid-cols-2 gap-4 text-sm">
//                   <div className="bg-blue-50 rounded-lg p-3">
//                     <p className="text-blue-600 font-medium">First Visit</p>
//                     <p className="text-gray-700">{new Date(client.firstVisit).toLocaleDateString()}</p>
//                   </div>
//                   <div className="bg-green-50 rounded-lg p-3">
//                     <p className="text-green-600 font-medium">Next Visit</p>
//                     <p className="text-gray-700">{new Date(client.nextVisit).toLocaleDateString()}</p>
//                   </div>
//                 </div>

//                 {client.deal && (
//                   <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-3">
//                     <p className="text-emerald-600 font-medium">Deal Value</p>
//                     <p className="text-2xl font-bold text-emerald-700">${client.deal}</p>
//                   </div>
//                 )}

//                 {client.description && (
//                   <div className="bg-gray-50 rounded-lg p-3">
//                     <p className="text-gray-600 font-medium mb-1">Description</p>
//                     <p className="text-gray-700 text-sm">{client.description}</p>
//                   </div>
//                 )}
//               </div>

//               {/* Card Actions */}
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => handleEdit(client)}
//                   className="flex-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white py-2 px-4 rounded-xl font-medium hover:from-amber-500 hover:to-orange-600 transition-all duration-200 hover:shadow-lg transform hover:scale-105"
//                 >
//                   Edit
//                 </button>
//                 <button
//                   onClick={() => handleDelete(client._id)}
//                   className="flex-1 bg-gradient-to-r from-red-400 to-pink-500 text-white py-2 px-4 rounded-xl font-medium hover:from-red-500 hover:to-pink-600 transition-all duration-200 hover:shadow-lg transform hover:scale-105"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>

//         {clients.length === 0 && (
//           <div className="text-center py-20">
//             <div className="text-8xl mb-6">📋</div>
//             <h3 className="text-2xl font-bold text-gray-700 mb-2">No clients yet</h3>
//             <p className="text-gray-500 mb-8">Get started by adding your first client</p>
//             <button
//               onClick={openAddModal}
//               className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-2xl font-bold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 hover:shadow-lg transform hover:scale-105"
//             >
//               Add Your First Client
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
//                 {editingId ? 'Edit Client' : 'Add New Client'}
//               </h2>
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="text-gray-400 hover:text-gray-600 transition-colors"
//               >
//                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             </div>

//             {error && (
//               <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
//                 <p className="text-red-600 font-medium">{error}</p>
//               </div>
//             )}

//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
//                   <input
//                     name="businessName"
//                     value={form.businessName}
//                     onChange={handleChange}
//                     required
//                     placeholder="Enter business name"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Manager Name</label>
//                   <input
//                     name="managerName"
//                     value={form.managerName}
//                     onChange={handleChange}
//                     required
//                     placeholder="Enter manager name"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
//                   <input
//                     name="phone"
//                     value={form.phone}
//                     onChange={handleChange}
//                     required
//                     placeholder="Enter phone number"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Place</label>
//                   <input
//                     name="place"
//                     value={form.place}
//                     onChange={handleChange}
//                     required
//                     placeholder="Enter location"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">First Visit</label>
//                   <input
//                     name="firstVisit"
//                     value={form.firstVisit}
//                     onChange={handleChange}
//                     type="date"
//                     required
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Next Visit</label>
//                   <input
//                     name="nextVisit"
//                     value={form.nextVisit}
//                     onChange={handleChange}
//                     type="date"
//                     required
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
//                   <select
//                     name="status"
//                     value={form.status}
//                     onChange={handleChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
//                   >
//                     <option value="started">🚀 Started</option>
//                     <option value="active">✅ Active</option>
//                     <option value="onaction">⚡ On Action</option>
//                     <option value="closed">🔒 Closed</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Deal Value ($)</label>
//                   <input
//                     name="deal"
//                     value={form.deal}
//                     onChange={handleChange}
//                     placeholder="Enter deal amount"
//                     type="number"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
//                   />
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
//                 <textarea
//                   name="description"
//                   value={form.description}
//                   onChange={handleChange}
//                   placeholder="Enter additional details..."
//                   rows="3"
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
//                 />
//               </div>

//               <div className="flex gap-4 pt-4">
//                 <button
//                   type="submit"
//                   className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-6 rounded-xl font-bold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 hover:shadow-lg transform hover:scale-105"
//                 >
//                   {editingId ? 'Update Client' : 'Add Client'}
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => setShowModal(false)}
//                   className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-bold hover:bg-gray-300 transition-all duration-200"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Clients;















import React, { useEffect, useState } from 'react';
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

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
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

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

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

  // Filter clients based on search and status
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.managerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.place.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalValue = clients.reduce((sum, client) => sum + (parseFloat(client.deal) || 0), 0);

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
            }}
          ></div>
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
      </>
    );
  }

  if (error) {
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
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-pink-400/20 to-red-600/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-green-400/20 to-teal-600/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-6000"></div>
      </div>

      {/* Floating particles */}
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
        {/* Spectacular Header */}
        <div className="text-center mb-16">
          <div className="relative inline-block">
            <h1 className="text-7xl md:text-8xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6 animate-pulse">
              CLIENT NEXUS
            </h1>
            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400/20 via-purple-400/20 to-pink-400/20 blur-2xl rounded-full animate-pulse"></div>
          </div>
          <p className="text-2xl text-gray-300 mb-8 font-light">Where Business Relationships Transform Into Success</p>
          
          {/* Hero Actions */}
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

          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto mb-12">
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search clients by name, business, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
            >
              <option value="all">All Status</option>
              <option value="started">🚀 Started</option>
              <option value="active">⚡ Active</option>
              <option value="onaction">🎯 On Action</option>
              <option value="closed">🔒 Closed</option>
            </select>
          </div>
        </div>

        {/* Magnificent Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
          {/* Total Clients */}
          <div className="lg:col-span-1 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/20 hover:shadow-2xl hover:shadow-cyan-500/25 transition-all duration-500 hover:scale-105 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Clients</p>
                <p className="text-4xl font-black text-white group-hover:text-cyan-400 transition-colors duration-300">{clients.length}</p>
              </div>
              <div className="text-4xl group-hover:scale-110 transition-transform duration-300">👥</div>
            </div>
            <div className="mt-4 h-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full group-hover:from-cyan-400 group-hover:to-blue-500 transition-all duration-300"></div>
          </div>

          {/* Status Cards */}
          {Object.entries(statusColors).map(([status, gradient]) => {
            const count = clients.filter(client => client.status === status).length;
            const percentage = clients.length > 0 ? (count / clients.length) * 100 : 0;
            return (
              <div key={status} className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/20 hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 hover:scale-105 group">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{status}</p>
                    <p className="text-3xl font-black text-white group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">{count}</p>
                  </div>
                  <div className="text-3xl group-hover:scale-110 transition-transform duration-300">{statusIcons[status]}</div>
                </div>
                <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${gradient} transition-all duration-1000 ease-out rounded-full`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">{percentage.toFixed(1)}% of total</p>
              </div>
            );
          })}
        </div>

        {/* Total Value Card */}
        <div className="mb-16">
          <div className="bg-gradient-to-br from-emerald-500/20 to-teal-600/20 backdrop-blur-xl rounded-3xl p-8 border border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/25 transition-all duration-500 hover:scale-[1.02] group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-400 text-lg font-medium uppercase tracking-wider">Total Portfolio Value</p>
                <p className="text-6xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent group-hover:from-emerald-300 group-hover:to-teal-300 transition-all duration-300">
                  {totalValue.toLocaleString()} Birr.
                </p>
              </div>
              <div className="text-6xl group-hover:scale-110 transition-transform duration-300">💎</div>
            </div>
          </div>
        </div>

        {/* Spectacular Client Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredClients.map((client, index) => (
            <div 
              key={client._id} 
              className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-700 hover:scale-105 overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Animated Border */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/50 via-purple-500/50 to-pink-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl blur-sm"></div>
              
              {/* Content */}
              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-black text-white mb-2 group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-purple-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                      {client.businessName}
                    </h3>
                    <div className="flex items-center text-gray-300 mb-4">
                      <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {client.managerName}
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-2xl bg-gradient-to-r ${statusColors[client.status]} text-white font-bold text-sm shadow-lg ${statusGlow[client.status]} group-hover:shadow-xl transition-all duration-300`}>
                    {statusIcons[client.status]} {client.status.toUpperCase()}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center text-gray-300 bg-white/5 rounded-2xl p-4 group-hover:bg-white/10 transition-all duration-300">
                    <svg className="w-5 h-5 mr-3 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {client.phone}
                  </div>
                  
                  <div className="flex items-center text-gray-300 bg-white/5 rounded-2xl p-4 group-hover:bg-white/10 transition-all duration-300">
                    <svg className="w-5 h-5 mr-3 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {client.place}
                  </div>
                </div>

                {/* Visit Dates */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-2xl p-4 border border-blue-500/30">
                    <p className="text-blue-400 font-bold text-sm mb-1">First Visit</p>
                    <p className="text-white text-sm">{new Date(client.firstVisit).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-2xl p-4 border border-green-500/30">
                    <p className="text-green-400 font-bold text-sm mb-1">Next Visit</p>
                    <p className="text-white text-sm">{new Date(client.nextVisit).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Deal Value */}
                {client.deal && (
                  <div className="bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-2xl p-4 border border-emerald-500/30 mb-6">
                    <p className="text-emerald-400 font-bold text-sm mb-1">Deal Value</p>
                    <p className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                      {parseFloat(client.deal).toLocaleString()} Birr.
                    </p>
                  </div>
                )}

                {/* Description */}
                {client.description && (
                  <div className="bg-white/5 rounded-2xl p-4 mb-6 group-hover:bg-white/10 transition-all duration-300">
                    <p className="text-gray-400 font-bold text-sm mb-2">Notes</p>
                    <p className="text-gray-300 text-sm leading-relaxed">{client.description}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(client)}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 px-4 rounded-2xl font-bold hover:from-amber-400 hover:to-orange-500 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25 transform hover:scale-105"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(client._id)}
                    className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 px-4 rounded-2xl font-bold hover:from-red-400 hover:to-pink-500 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25 transform hover:scale-105"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredClients.length === 0 && clients.length > 0 && (
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
      </div>

      {/* MAGNIFICENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-gradient-to-br from-slate-800/90 to-purple-900/90 backdrop-blur-xl rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20 relative">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-3xl animate-pulse"></div>
            
            <div className="relative z-10">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-4xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {editingId ? '✨ Transform Client' : '🚀 Create New Client'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white transition-colors duration-300 hover:rotate-90 transform"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 mb-6 backdrop-blur-sm">
                  <p className="text-red-400 font-medium flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </p>
                </div>
              )}

              {/* Form */}
              <form
                onSubmit={e => { e.preventDefault(); handleSubmit(); }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">Business Name</label>
                    <input
                      name="businessName"
                      value={form.businessName}
                      onChange={handleChange}
                      required
                      placeholder="Enter business name"
                      className="w-full px-4 py-3 border border-gray-600 bg-slate-900/40 text-white rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">Manager Name</label>
                    <input
                      name="managerName"
                      value={form.managerName}
                      onChange={handleChange}
                      required
                      placeholder="Enter manager name"
                      className="w-full px-4 py-3 border border-gray-600 bg-slate-900/40 text-white rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">Phone</label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      placeholder="Enter phone number"
                      className="w-full px-4 py-3 border border-gray-600 bg-slate-900/40 text-white rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">Place</label>
                    <input
                      name="place"
                      value={form.place}
                      onChange={handleChange}
                      required
                      placeholder="Enter location"
                      className="w-full px-4 py-3 border border-gray-600 bg-slate-900/40 text-white rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">First Visit</label>
                    <input
                      name="firstVisit"
                      value={form.firstVisit}
                      onChange={handleChange}
                      type="date"
                      required
                      className="w-full px-4 py-3 border border-gray-600 bg-slate-900/40 text-white rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">Next Visit</label>
                    <input
                      name="nextVisit"
                      value={form.nextVisit}
                      onChange={handleChange}
                      type="date"
                      required
                      className="w-full px-4 py-3 border border-gray-600 bg-slate-900/40 text-white rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">Status</label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-600 bg-slate-900/40 text-white rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors"
                    >
                      <option value="started">🚀 Started</option>
                      <option value="active">✅ Active</option>
                      <option value="onaction">⚡ On Action</option>
                      <option value="closed">🔒 Closed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">Deal Value ($)</label>
                    <input
                      name="deal"
                      value={form.deal}
                      onChange={handleChange}
                      placeholder="Enter deal amount"
                      type="number"
                      className="w-full px-4 py-3 border border-gray-600 bg-slate-900/40 text-white rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Enter additional details..."
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-600 bg-slate-900/40 text-white rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-bold hover:from-cyan-400 hover:to-pink-500 transition-all duration-300 hover:shadow-lg hover:scale-105"
                  >
                    {editingId ? 'Update Client' : 'Add Client'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-200/20 text-gray-200 py-3 px-6 rounded-xl font-bold hover:bg-gray-300/30 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;