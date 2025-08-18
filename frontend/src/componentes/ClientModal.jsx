import React, { useState, useEffect } from 'react';
import LocationInput from './LocationInput';

const ClientModal = ({ open, onClose, onSubmit, form, setForm, editingId, error }) => {
  const [isContactsApiSupported, setIsContactsApiSupported] = useState(false);

  // Initialize phone numbers from form data or empty array
  const [phoneNumbers, setPhoneNumbers] = useState(
    form.phoneNumbers || (form.phone ? [form.phone] : [''])
  );
  const [primaryPhoneIndex, setPrimaryPhoneIndex] = useState(form.primaryPhoneIndex || 0);

  useEffect(() => {
    if ('contacts' in navigator && 'select' in navigator.contacts) {
      setIsContactsApiSupported(true);
    }
  }, []);

  // Update form data when phone numbers change
  useEffect(() => {
    setForm(prev => ({
      ...prev,
      phoneNumbers,
      primaryPhoneIndex,
      phone: phoneNumbers[primaryPhoneIndex] || ''
    }));
  }, [phoneNumbers, primaryPhoneIndex, setForm]);

  if (!open) return null;

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

  const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    zIndex: 1000
  };

  const contentStyle = {
    backgroundColor: 'white',
    padding: '20px',
    maxWidth: '500px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    border: '1px solid #ddd'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '10px',
    borderBottom: '1px solid #eee'
  };

  const formGroupStyle = {
    marginBottom: '15px'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
    fontSize: '14px'
  };

  const inputStyle = {
    width: '100%',
    padding: '8px',
    border: '1px solid #ccc',
    fontSize: '14px'
  };

  const buttonStyle = {
    padding: '10px 15px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#2196f3',
    color: 'white'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#f5f5f5',
    color: '#333'
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyle}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>
            {editingId ? 'Edit Client' : 'Add New Client'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        {error && (
          <div style={{ 
            backgroundColor: '#ffebee', 
            border: '1px solid #f44336', 
            padding: '10px', 
            marginBottom: '15px',
            color: '#d32f2f'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={e => { e.preventDefault(); onSubmit(); }}>
          {/* Business Name */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>Business Name *</label>
            <input
              name="businessName"
              value={form.businessName}
              onChange={handleChange}
              required
              placeholder="Enter business name"
              style={inputStyle}
            />
          </div>

          {/* Manager Name */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>Manager Name *</label>
            <input
              name="managerName"
              value={form.managerName}
              onChange={handleChange}
              required
              placeholder="Enter manager name"
              style={inputStyle}
            />
          </div>

          {/* Phone Numbers */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>Phone Numbers *</label>
            {phoneNumbers.map((phone, index) => (
              <div key={index} style={{ display: 'flex', gap: '5px', marginBottom: '5px', alignItems: 'center' }}>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => handlePhoneNumberChange(index, e.target.value)}
                  placeholder="Enter phone number"
                  style={{ ...inputStyle, flex: 1 }}
                  required={index === 0}
                />
                {phoneNumbers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setPrimaryPhoneIndex(index)}
                    style={{ 
                      padding: '8px', 
                      border: '1px solid #ccc',
                      backgroundColor: index === primaryPhoneIndex ? '#ffeb3b' : '#f5f5f5',
                      cursor: 'pointer'
                    }}
                    title={index === primaryPhoneIndex ? 'Primary number' : 'Set as primary'}
                  >
                    {index === primaryPhoneIndex ? '★' : '☆'}
                  </button>
                )}
                {phoneNumbers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePhoneNumber(index)}
                    style={{ padding: '8px', border: '1px solid #f44336', backgroundColor: '#ffebee', color: '#f44336', cursor: 'pointer' }}
                    title="Remove number"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              <button
                type="button"
                onClick={addPhoneNumber}
                style={{ ...secondaryButtonStyle, fontSize: '12px' }}
              >
                + Add number
              </button>
              {isContactsApiSupported && (
                <button
                  type="button"
                  onClick={handlePickContact}
                  style={{ ...secondaryButtonStyle, fontSize: '12px' }}
                >
                  Import contacts
                </button>
              )}
            </div>
          </div>

          {/* Place */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>Location *</label>
            <LocationInput
              name="place"
              value={form.place}
              onChange={handleChange}
              required
              placeholder="Enter location"
            />
          </div>

          {/* First Visit */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>First Visit *</label>
            <input
              name="firstVisit"
              value={form.firstVisit}
              onChange={handleChange}
              type="date"
              required
              style={inputStyle}
            />
          </div>

          {/* Next Visit */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>Next Visit *</label>
            <input
              name="nextVisit"
              value={form.nextVisit}
              onChange={handleChange}
              type="date"
              required
              style={inputStyle}
            />
          </div>

          {/* Status */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>Status *</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="started">Started</option>
              <option value="active">Active</option>
              <option value="onaction">On Action</option>
              <option value="closed">Closed</option>
              <option value="dead">Dead</option>
              <option value="test">Test</option>
            </select>
          </div>

          {/* Deal Value */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>Deal Value ($)</label>
            <input
              name="deal"
              value={form.deal}
              onChange={handleChange}
              placeholder="Enter deal amount"
              type="number"
              style={inputStyle}
            />
          </div>

          {/* Description */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter additional details..."
              rows="3"
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Footer Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
            <button
              type="submit"
              onClick={onSubmit}
              style={{ ...primaryButtonStyle, flex: 1 }}
            >
              {editingId ? 'Update Client' : 'Add Client'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{ ...secondaryButtonStyle, flex: 1 }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientModal;