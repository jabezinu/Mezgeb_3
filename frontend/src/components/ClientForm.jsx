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

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (isSubmitting) return; // Prevent multiple submissions
    
    setError('');
    setIsSubmitting(true);

    try {
      const payload = {
        businessName: form.businessName,
        managerName: form.managerName,
        phoneNumbers: sanitizePhones(form.phoneNumbers),
        primaryPhoneIndex: Math.min(
          Math.max(0, Number(form.primaryPhoneIndex) || 0),
          Math.max(0, sanitizePhones(form.phoneNumbers).length - 1)
        ),
        firstVisit: form.firstVisit,
        nextVisit: form.nextVisit,
        place: form.place,
        status: form.status,
        deal: form.deal === '' ? undefined : Number(form.deal),
        description: form.description || undefined,
      };

      if (!payload.phoneNumbers.length) {
        setError('Please provide at least one phone number.');
        return;
      }

      await onSubmit?.(payload);
    } catch (e) {
      setError(e.message || 'Save failed');
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
        <input type="date" className="w-full border rounded px-3 py-2" value={form.firstVisit} onChange={e=>setForm(f=>({...f, firstVisit: e.target.value}))} required />
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
      <div className="md:col-span-2 flex gap-2">
        <button 
          type="submit" 
          className="px-4 py-2 bg-gray-900 text-white rounded flex items-center justify-center min-w-[100px]"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {editing ? 'Updating...' : 'Creating...'}
            </>
          ) : editing ? 'Update' : 'Create'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 border rounded">Cancel</button>
      </div>
    </form>
  );
}
