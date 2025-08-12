import React, { useState, useEffect } from 'react';
import LocationInput from './LocationInput';
import { Plus, X, User } from 'lucide-react';

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
    if (phoneNumbers.length <= 1) return;
    
    const newPhoneNumbers = phoneNumbers.filter((_, i) => i !== index);
    setPhoneNumbers(newPhoneNumbers);
    
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
        
        if (contactName) {
          setForm(prev => ({ ...prev, managerName: contactName }));
        }
        
        if (contactNumbers.length > 0) {
          const newNumbers = contactNumbers.filter(
            num => !phoneNumbers.includes(num)
          );
          
          if (newNumbers.length > 0) {
            setPhoneNumbers([...phoneNumbers, ...newNumbers]);
            setPrimaryPhoneIndex(phoneNumbers.length);
          }
        }
      }
    } catch (ex) {
      console.error('Error selecting contact.', ex);
    }
  };

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {editingId ? 'Edit Client' : 'Add New Client'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          
          <form onSubmit={e => { e.preventDefault(); onSubmit(); }} className="space-y-4">
            {/* Business Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Name *
              </label>
              <input
                name="businessName"
                value={form.businessName}
                onChange={handleChange}
                required
                placeholder="Enter business name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Manager Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Manager Name *
              </label>
              <input
                name="managerName"
                value={form.managerName}
                onChange={handleChange}
                required
                placeholder="Enter manager name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Phone Numbers */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Numbers *
              </label>
              <div className="space-y-2">
                {phoneNumbers.map((phone, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <div className="relative flex-1">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => handlePhoneNumberChange(index, e.target.value)}
                        placeholder="Enter phone number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required={index === 0}
                      />
                      {phoneNumbers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setPrimaryPhoneIndex(index)}
                          className={`absolute left-2 top-1/2 transform -translate-y-1/2 text-lg ${index === primaryPhoneIndex ? 'text-yellow-500' : 'text-gray-400'}`}
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
                        className="p-2 text-red-500 hover:text-red-700"
                        title="Remove number"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={addPhoneNumber}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add number
                  </button>
                  {isContactsApiSupported && (
                    <button
                      type="button"
                      onClick={handlePickContact}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <User className="w-4 h-4 mr-1" />
                      Import contacts
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Place */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <LocationInput
                name="place"
                value={form.place}
                onChange={handleChange}
                required
                placeholder="Enter location"
              />
            </div>

            {/* First Visit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Visit *
              </label>
              <input
                name="firstVisit"
                value={form.firstVisit}
                onChange={handleChange}
                type="date"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Next Visit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Next Visit *
              </label>
              <input
                name="nextVisit"
                value={form.nextVisit}
                onChange={handleChange}
                type="date"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="started">🚀 Started</option>
                <option value="active">✅ Active</option>
                <option value="onaction">⚡ On Action</option>
                <option value="closed">🔒 Closed</option>
                <option value="dead">💀 Dead</option>
                <option value="test">🧪 Test</option>
              </select>
            </div>

            {/* Deal Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deal Value ($)
              </label>
              <input
                name="deal"
                value={form.deal}
                onChange={handleChange}
                placeholder="Enter deal amount"
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter additional details..."
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
          </form>
        </div>

        {/* Footer - Always visible */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex gap-3">
            <button
              type="submit"
              onClick={onSubmit}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              {editingId ? 'Update Client' : 'Add Client'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientModal; 