import React, { useState, useEffect } from 'react';
import LocationInput from './LocationInput';
import { Plus, X, Phone as PhoneIcon, User } from 'lucide-react';

const ClientModal = ({ open, onClose, onSubmit, form, setForm, editingId, error }) => {
  if (!open) return null;

  const [isContactsApiSupported, setIsContactsApiSupported] = React.useState(false);

  React.useEffect(() => {
    if ('contacts' in navigator && 'select' in navigator.contacts) {
      setIsContactsApiSupported(true);
    }
  }, []);

  // Initialize phone numbers from form data or empty array
  const [phoneNumbers, setPhoneNumbers] = useState(
    form.phoneNumbers || (form.phone ? [form.phone] : [''])
  );
  const [primaryPhoneIndex, setPrimaryPhoneIndex] = useState(form.primaryPhoneIndex || 0);

  // Update form data when phone numbers change
  useEffect(() => {
    setForm(prev => ({
      ...prev,
      phoneNumbers,
      primaryPhoneIndex,
      // Keep backward compatibility with single phone field
      phone: phoneNumbers[primaryPhoneIndex] || ''
    }));
  }, [phoneNumbers, primaryPhoneIndex]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneNumberChange = (index, value) => {
    const newPhoneNumbers = [...phoneNumbers];
    newPhoneNumbers[index] = value;
    setPhoneNumbers(newPhoneNumbers);
  };

  const addPhoneNumber = () => {
    setPhoneNumbers([...phoneNumbers, '']);
  };

  const removePhoneNumber = (index) => {
    if (phoneNumbers.length <= 1) return; // Keep at least one phone number
    
    const newPhoneNumbers = phoneNumbers.filter((_, i) => i !== index);
    setPhoneNumbers(newPhoneNumbers);
    
    // Adjust primary index if needed
    if (primaryPhoneIndex === index) {
      setPrimaryPhoneIndex(0);
    } else if (primaryPhoneIndex > index) {
      setPrimaryPhoneIndex(primaryPhoneIndex - 1);
    }
  };

  const handlePickContact = async () => {
    try {
      const contacts = await navigator.contacts.select(['name', 'tel'], { multiple: false });
      if (contacts.length > 0) {
        const contact = contacts[0];
        const contactName = contact.name?.[0] || form.managerName;
        const contactNumbers = contact.tel || [];
        
        // Update manager name if we have a contact name
        if (contactName) {
          setForm(prev => ({ ...prev, managerName: contactName }));
        }
        
        // Add all contact numbers
        if (contactNumbers.length > 0) {
          // Filter out any numbers that already exist
          const newNumbers = contactNumbers.filter(
            num => !phoneNumbers.includes(num)
          );
          
          if (newNumbers.length > 0) {
            setPhoneNumbers([...phoneNumbers, ...newNumbers]);
            // Set the first new number as primary
            setPrimaryPhoneIndex(phoneNumbers.length);
          }
        }
      }
    } catch (ex) {
      console.error('Error selecting contact.', ex);
    }
  };

  // Prevent body scroll when modal is open and handle focus
  React.useEffect(() => {
    if (open) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Focus the first input when modal opens
      setTimeout(() => {
        const firstInput = document.querySelector('input[name="businessName"]');
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  // Handle escape key to close modal
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-lg z-50 animate-fadeIn overflow-y-auto">
      <div className="min-h-screen flex items-start justify-center p-2 sm:p-4">
        <div className="bg-gradient-to-br from-slate-800/90 to-purple-900/90 backdrop-blur-xl rounded-3xl p-4 sm:p-6 max-w-2xl w-full my-4 sm:my-8 shadow-2xl border border-white/20 relative max-h-[90vh] flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-3xl animate-pulse"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
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
            className="space-y-4 overflow-y-auto pr-2 flex-1"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Business Name</label>
                <input
                  name="businessName"
                  value={form.businessName}
                  onChange={handleChange}
                  required
                  placeholder="Enter business name"
                  className="w-full px-3 py-2 border border-gray-600 bg-slate-900/40 text-white rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors text-sm"
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
                  className="w-full px-3 py-2 border border-gray-600 bg-slate-900/40 text-white rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors text-sm"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-200">Phone Numbers</label>
                  <span className="text-xs text-gray-400">Mark primary with ★</span>
                </div>
                <div className="space-y-2">
                  {phoneNumbers.map((phone, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <div className="relative flex-1">
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => handlePhoneNumberChange(index, e.target.value)}
                          placeholder="Enter phone number"
                          className="w-full px-3 py-2 border border-gray-600 bg-slate-900/40 text-white rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors text-sm"
                          required={index === 0}
                        />
                        {phoneNumbers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setPrimaryPhoneIndex(index)}
                            className={`absolute left-2 top-1/2 transform -translate-y-1/2 text-lg ${index === primaryPhoneIndex ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-300'}`}
                            title={index === primaryPhoneIndex ? 'Primary number' : 'Set as primary'}
                          >
                            {index === primaryPhoneIndex ? '★' : '☆'}
                          </button>
                        )}
                      </div>
                      {phoneNumbers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePhoneNumber(index)}
                          className="p-2 text-red-400 hover:text-red-300 rounded-full hover:bg-red-500/20 transition-colors"
                          title="Remove number"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <div className="flex justify-between mt-2">
                    <button
                      type="button"
                      onClick={addPhoneNumber}
                      className="flex items-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add another number
                    </button>
                    {isContactsApiSupported && (
                      <button
                        type="button"
                        onClick={handlePickContact}
                        className="flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <User className="w-4 h-4 mr-1" />
                        Import from contacts
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Place</label>
                <LocationInput
                  name="place"
                  value={form.place}
                  onChange={handleChange}
                  required
                  placeholder="Enter location or use current location"
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
                  className="w-full px-3 py-2 border border-gray-600 bg-slate-900/40 text-white rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors text-sm"
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
                  className="w-full px-3 py-2 border border-gray-600 bg-slate-900/40 text-white rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-600 bg-slate-900/40 text-white rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors text-sm"
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
                  className="w-full px-3 py-2 border border-gray-600 bg-slate-900/40 text-white rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors text-sm"
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
                rows="2"
                className="w-full px-3 py-2 border border-gray-600 bg-slate-900/40 text-white rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors text-sm"
              />
            </div>
            <div className="flex gap-3 pt-3 pb-2">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-cyan-400 hover:to-pink-500 transition-all duration-300 hover:shadow-lg text-sm"
              >
                {editingId ? 'Update Client' : 'Add Client'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-600/50 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-500/50 transition-all duration-200 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ClientModal; 