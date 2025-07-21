import React from 'react';

const ClientModal = ({ open, onClose, onSubmit, form, setForm, editingId, error }) => {
  if (!open) return null;

  const [isContactsApiSupported, setIsContactsApiSupported] = React.useState(false);

  React.useEffect(() => {
    if ('contacts' in navigator && 'select' in navigator.contacts) {
      setIsContactsApiSupported(true);
    }
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePickContact = async () => {
    try {
      const contacts = await navigator.contacts.select(['name', 'tel'], { multiple: false });
      if (contacts.length > 0) {
        const contact = contacts[0];
        setForm(prev => ({
          ...prev,
          managerName: contact.name[0] || prev.managerName,
          phone: contact.tel[0] || prev.phone,
        }));
      }
    } catch (ex) {
      console.error('Error selecting contact.', ex);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-gradient-to-br from-slate-800/90 to-purple-900/90 backdrop-blur-xl rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-3xl animate-pulse"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-4xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {editingId ? '✨ Transform Client' : '🚀 Create New Client'}
            </h2>
            <button
              onClick={onClose}
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
          <form
            onSubmit={e => { e.preventDefault(); onSubmit(); }}
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
                <div className="flex gap-2">
                  <input
                    name="managerName"
                    value={form.managerName}
                    onChange={handleChange}
                    required
                    placeholder="Enter manager name"
                    className="w-full px-4 py-3 border border-gray-600 bg-slate-900/40 text-white rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors"
                  />
                  {isContactsApiSupported && (
                    <button type="button" onClick={handlePickContact} className="px-4 py-3 bg-cyan-500 text-white rounded-xl">
                      👥
                    </button>
                  )}
                </div>
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
                  <option value="dead">💀 Dead</option>
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
                onClick={onClose}
                className="flex-1 bg-gray-200/20 text-gray-200 py-3 px-6 rounded-xl font-bold hover:bg-gray-300/30 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClientModal; 