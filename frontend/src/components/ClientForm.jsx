import { useMemo, useState } from 'react';

const defaultInitial = {
  businessName: '',
  managerName: '',
  phoneNumbers: [''],
  primaryPhoneIndex: 0,
  firstVisit: '',
  nextVisit: '',
  place: '',
  status: 'started',
  deal: '',
  description: ''
};

export default function ClientForm({
  initialValues = defaultInitial,
  statuses: statusesProp,
  editing = false,
  onSubmit,
  onCancel,
  onCreateAndCall,
}) {
  const [form, setForm] = useState({ ...defaultInitial, ...initialValues });
  const [error, setError] = useState('');
  const [locating, setLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statuses = useMemo(() => statusesProp || ['started','active','onaction','closed','dead'], [statusesProp]);

  function sanitizePhones(arr) {
    return (Array.isArray(arr) ? arr : [])
      .map(s => (s || '').trim())
      .filter(Boolean);
  }

  function hasContactPicker() {
    return typeof navigator !== 'undefined' && 'contacts' in navigator && typeof navigator.contacts.select === 'function';
  }

  async function importFromContacts() {
    try {
      if (!hasContactPicker()) {
        alert('Contact Picker is not supported in this browser.');
        return;
      }
      const props = ['name', 'tel'];
      const opts = { multiple: false };
      const contacts = await navigator.contacts.select(props, opts);
      if (!contacts || contacts.length === 0) return;
      const c = contacts[0];
      const pickedName = Array.isArray(c.name) ? c.name.find(Boolean) || c.name.join(' ') : (c.name || '');
      const pickedTels = Array.isArray(c.tel) ? c.tel : (c.phoneNumbers ? c.phoneNumbers : []);
      const newPhones = sanitizePhones(pickedTels);
      if (pickedName || newPhones.length) {
        setForm(f => {
          const merged = Array.from(new Set([...(f.phoneNumbers||[]), ...newPhones])).filter(Boolean);
          return {
            ...f,
            managerName: pickedName || f.managerName,
            phoneNumbers: merged.length ? merged : (f.phoneNumbers && f.phoneNumbers.length ? f.phoneNumbers : ['']),
            primaryPhoneIndex: 0,
          };
        });
      }
    } catch (err) {
      console.error('Contact pick failed', err);
    }
  }

  function buildMapsLink(value) {
    if (!value) return null;
    const coordMatch = value.match(/^\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*$/);
    if (coordMatch) {
      const [lat, lng] = value.split(',').map(s => s.trim());
      return `https://www.google.com/maps?q=${encodeURIComponent(lat)},${encodeURIComponent(lng)}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`;
  }

  function useCurrentLocation() {
    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported by this browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setForm(f => ({ ...f, place: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` }));
        setLocating(false);
      },
      (err) => {
        alert(err?.message || 'Unable to get current location');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  async function prepareFormData() {
    const payload = {
      businessName: form.businessName.trim(),
      managerName: form.managerName.trim(),
      phoneNumbers: sanitizePhones(form.phoneNumbers),
      primaryPhoneIndex: Math.min(
        Math.max(0, Number(form.primaryPhoneIndex) || 0),
        Math.max(0, sanitizePhones(form.phoneNumbers).length - 1)
      ),
      firstVisit: form.firstVisit || undefined,
      nextVisit: form.nextVisit || undefined,
      place: form.place.trim() || undefined,
      status: form.status,
      deal: form.deal === '' ? undefined : Number(form.deal),
      description: form.description?.trim() || undefined,
    };

    if (!payload.phoneNumbers.length) {
      throw new Error('Please provide at least one phone number.');
    }

    return payload;
  }

  async function saveContactToDevice(contact) {
    if (!contact.phoneNumbers || !contact.phoneNumbers.length) {
      console.warn('No phone numbers provided to save to contacts');
      return false;
    }
    
    const contactName = contact.managerName || contact.businessName || 'New Contact';
    const phoneNumber = contact.phoneNumbers[contact.primaryPhoneIndex] || contact.phoneNumbers[0];
    
    try {
      // For Web Share API (most widely supported)
      if (navigator.share) {
        const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${contactName}
${contact.businessName ? `ORG:${contact.businessName}\n` : ''}TEL;type=CELL;type=VOICE;waid=${phoneNumber.replace(/[^0-9]/g, '')}:${phoneNumber}
${contact.description ? `NOTE:${contact.description.replace(/\n/g, '\\n')}\n` : ''}END:VCARD`;
        
        await navigator.share({
          title: 'Save Contact',
          text: `Add ${contactName} to your contacts`,
          files: [new File([vcard], 'contact.vcf', { type: 'text/vcard' })]
        });
        return true;
      }
      // For Web Contact Picker API (Chrome/Edge on Android)
      else if (navigator.contacts && navigator.contacts.create) {
        const newContact = await navigator.contacts.create({
          name: [contactName],
          tel: contact.phoneNumbers,
          organization: [contact.businessName],
          note: contact.description
        });
        await newContact.save();
        return true;
      }
      // For devices that support tel: links
      else if (navigator.clipboard) {
        await navigator.clipboard.writeText(phoneNumber);
        alert(`Phone number ${phoneNumber} has been copied to your clipboard. Please save it to your contacts manually.`);
        return true;
      }
      
      alert('Your device does not support saving contacts directly. Please save the phone number manually.');
      return false;
    } catch (e) {
      console.warn('Failed to save contact to device:', e);
      if (navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(phoneNumber);
          alert(`Could not save contact automatically. Phone number ${phoneNumber} has been copied to your clipboard.`);
          return true;
        } catch (clipboardError) {
          console.error('Failed to copy to clipboard:', clipboardError);
        }
      }
      alert(`Could not save contact. Please save this number: ${phoneNumber}`);
      return false;
    }
  }

  function initiateCall(phoneNumber) {
    if (!phoneNumber) return false;
    
    const telNumber = phoneNumber.replace(/\D/g, '');
    
    try {
      // Try using the Web Share API first
      if (navigator.share) {
        navigator.share({
          title: 'Call',
          text: `Call ${form.managerName || form.businessName || 'contact'}`,
          url: `tel:${telNumber}`,
        }).catch(() => {
          // Fallback to window.location if share fails
          window.location.href = `tel:${telNumber}`;
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        window.location.href = `tel:${telNumber}`;
      }
      return true;
    } catch (e) {
      console.error('Error initiating call:', e);
      return false;
    }
  }

  async function handleSubmit(e, shouldCall = false) {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setError('');
    setIsSubmitting(true);

    try {
      const payload = await prepareFormData();
      
      // Save the client data
      const result = await onSubmit?.(payload);
      
      // For new clients, save to device contacts
      if (!editing) {
        try {
          const contactSaved = await saveContactToDevice(payload);
          if (!contactSaved) {
            console.warn('Contact could not be saved to device');
          }
        } catch (contactError) {
          console.warn('Failed to save contact:', contactError);
          // Don't fail the entire operation if contact save fails
        }
      }
      
      // If this is a "Create and Call" action, initiate the call
      if (shouldCall && payload.phoneNumbers.length > 0) {
        const phoneNumber = payload.phoneNumbers[payload.primaryPhoneIndex] || payload.phoneNumbers[0];
        setTimeout(() => {
          const callInitiated = initiateCall(phoneNumber);
          if (!callInitiated) {
            alert(`Could not initiate call. Please call ${phoneNumber} manually.`);
          }
        }, 500);
      }
      
      return result;
    } catch (e) {
      setError(e.message || 'Save failed');
      throw e;
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {error && <div className="md:col-span-2 text-red-600 text-sm">{error}</div>}
      <div>
        <label className="block text-sm mb-1">Business Name</label>
        <input className="w-full border rounded px-3 py-2" value={form.businessName} onChange={e=>setForm(f=>({...f, businessName: e.target.value}))} required />
      </div>
      <div>
        <label className="block text-sm mb-1">Manager Name</label>
        <input className="w-full border rounded px-3 py-2" value={form.managerName} onChange={e=>setForm(f=>({...f, managerName: e.target.value}))} required />
      </div>
      <div className="md:col-span-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm mb-1">Phone Numbers</label>
          <button
            type="button"
            onClick={importFromContacts}
            className="px-3 py-1.5 border rounded text-sm disabled:opacity-50"
            disabled={!hasContactPicker()}
            title={hasContactPicker() ? 'Pick a contact to fill manager name and phone numbers' : 'Contact Picker not supported here. Try Chrome/Edge on Android over HTTPS or localhost.'}
          >
            Import from Contacts
          </button>
        </div>
        {!hasContactPicker() && (
          <div className="text-xs text-gray-500 mb-1">Contact Picker not supported in this browser. You can still enter the fields manually.</div>
        )}
        <div className="space-y-2">
          {form.phoneNumbers.map((num, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-full border rounded px-3 py-2"
                value={num}
                onChange={e => setForm(f => {
                  const arr = [...f.phoneNumbers];
                  arr[idx] = e.target.value;
                  return { ...f, phoneNumbers: arr };
                })}
                placeholder={`Phone #${idx+1}`}
                required={idx === 0}
              />
              {form.phoneNumbers.length > 1 && (
                <button
                  type="button"
                  className="shrink-0 px-3 py-2 border rounded text-sm"
                  onClick={() => setForm(f => {
                    const arr = f.phoneNumbers.filter((_, i) => i !== idx);
                    let primary = f.primaryPhoneIndex;
                    if (idx === f.primaryPhoneIndex) primary = 0;
                    else if (idx < f.primaryPhoneIndex) primary = Math.max(0, f.primaryPhoneIndex - 1);
                    return { ...f, phoneNumbers: arr.length ? arr : [''], primaryPhoneIndex: primary };
                  })}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="px-3 py-2 border rounded text-sm"
            onClick={() => setForm(f => ({ ...f, phoneNumbers: [...(f.phoneNumbers||[]), ''] }))}
          >
            + Add Phone
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm mb-1">Primary Phone</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={form.primaryPhoneIndex}
          onChange={e=>setForm(f=>({ ...f, primaryPhoneIndex: Number(e.target.value) }))}
        >
          {sanitizePhones(form.phoneNumbers).map((p, i) => (
            <option key={i} value={i}>{p || `Phone #${i+1}`}</option>
          ))}
          {sanitizePhones(form.phoneNumbers).length === 0 && (
            <option value={0}>Phone #1</option>
          )}
        </select>
      </div>
      <div>
        <label className="block text-sm mb-1">Place</label>
        <div className="flex gap-2">
          <input className="w-full border rounded px-3 py-2" value={form.place} onChange={e=>setForm(f=>({...f, place: e.target.value}))} required />
          <button type="button" onClick={useCurrentLocation} disabled={locating} className="shrink-0 px-3 py-2 border rounded text-sm">
            {locating ? 'Locating…' : 'Use Current'}
          </button>
        </div>
        {form.place && (
          <div className="mt-1 text-sm">
            <a href={buildMapsLink(form.place)} target="_blank" rel="noreferrer" className="text-blue-600 underline">Open in Maps</a>
          </div>
        )}
      </div>
      <div>
        <label className="block text-sm mb-1">First Visit</label>
        <div className="flex gap-2">
          <input type="date" className="w-full border rounded px-3 py-2" value={form.firstVisit} onChange={e=>setForm(f=>({...f, firstVisit: e.target.value}))} required />
          <button 
            type="button" 
            onClick={() => setForm(f => ({...f, firstVisit: new Date().toISOString().split('T')[0]}))}
            className="shrink-0 px-3 py-2 border rounded text-sm whitespace-nowrap"
          >
            Today
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm mb-1">Next Visit</label>
        <input type="date" className="w-full border rounded px-3 py-2" value={form.nextVisit} onChange={e=>setForm(f=>({...f, nextVisit: e.target.value}))} required />
      </div>
      <div>
        <label className="block text-sm mb-1">Status</label>
        <select className="w-full border rounded px-3 py-2" value={form.status} onChange={e=>setForm(f=>({...f, status: e.target.value}))}>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm mb-1">Deal (ETB)</label>
        <input type="number" className="w-full border rounded px-3 py-2" value={form.deal} onChange={e=>setForm(f=>({...f, deal: e.target.value}))} />
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm mb-1">Description</label>
        <textarea className="w-full border rounded px-3 py-2" rows={3} value={form.description} onChange={e=>setForm(f=>({...f, description: e.target.value}))} />
      </div>
      <div className="md:col-span-2 space-y-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <button 
            type="button" 
            onClick={(e) => handleSubmit(e, false)}
            className="px-4 py-2 bg-gray-900 text-white rounded flex-1 flex items-center justify-center min-w-[120px]"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {editing ? 'Updating...' : 'Create'}
              </>
            ) : editing ? 'Update' : 'Create'}
          </button>
          {!editing && (
            <button 
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              className="px-4 py-2 bg-green-600 text-white rounded flex-1 flex items-center justify-center min-w-[160px]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  Create & Call
                </>
              )}
            </button>
          )}
        </div>
        <div className="flex justify-end">
          <button 
            type="button" 
            onClick={onCancel} 
            className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
