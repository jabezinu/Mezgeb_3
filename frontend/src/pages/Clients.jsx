import { useEffect, useMemo, useState } from 'react';
import { ClientsAPI } from '../api/client';

const initialForm = {
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

export default function Clients() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [locating, setLocating] = useState(false);
  const [query, setQuery] = useState('');
  const [callModal, setCallModal] = useState({ open: false, phones: [], title: '' });
  const [showDead, setShowDead] = useState(false);

  const statuses = useMemo(() => ['started','active','onaction','closed','dead'], []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await ClientsAPI.list();
      setItems(data);
    } catch (e) {
      setError(e.message || 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

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
        alert('Contact Picker is not supported in this browser. Try Chrome/Edge on Android over HTTPS.');
        return;
      }
      const props = ['name', 'tel'];
      const opts = { multiple: false }; // single selection
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
      // User might have cancelled or permission denied
      console.error('Contact pick failed', err);
    }
  }

  function startEdit(item) {
    setEditingId(item._id);
    setForm({
      businessName: item.businessName || '',
      managerName: item.managerName || '',
      phoneNumbers: (item.phoneNumbers && item.phoneNumbers.length
        ? item.phoneNumbers
        : (item.phone ? [item.phone] : [''])),
      primaryPhoneIndex: item.primaryPhoneIndex ?? 0,
      firstVisit: item.firstVisit ? item.firstVisit.substring(0,10) : '',
      nextVisit: item.nextVisit ? item.nextVisit.substring(0,10) : '',
      place: item.place || '',
      status: item.status || 'started',
      deal: item.deal ?? '',
      description: item.description ?? ''
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(initialForm);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');

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

    try {
      if (editingId) {
        await ClientsAPI.update(editingId, payload);
      } else {
        await ClientsAPI.create(payload);
      }
      await load();
      resetForm();
    } catch (e) {
      setError(e.message || 'Save failed');
    }
  }

  async function onDelete(id) {
    if (!confirm('Delete this client?')) return;
    try {
      await ClientsAPI.remove(id);
      await load();
    } catch (e) {
      alert(e.message || 'Delete failed');
    }
  }

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((c) => {
      const fields = [
        c.businessName,
        c.managerName,
        c.place,
        c.status,
        c.description,
        c.phone,
        ...(Array.isArray(c.phoneNumbers) ? c.phoneNumbers : []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return fields.includes(q);
    });
  }, [items, query]);

  const partitioned = useMemo(() => {
    const alive = [];
    const dead = [];
    for (const c of filteredItems) {
      if ((c.status || '').toLowerCase() === 'dead') dead.push(c);
      else alive.push(c);
    }
    return { alive, dead };
  }, [filteredItems]);

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

  return (
    <div className="space-y-6">
      <div className="bg-white border rounded p-4">
        <h2 className="text-lg font-semibold mb-3">{editingId ? 'Edit Client' : 'New Client'}</h2>
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                    className="w-full border rounded px-3 py-2"
                    value={num}
                    onChange={e=>setForm(f=>{
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
            <button className="px-4 py-2 bg-gray-900 text-white rounded">{editingId ? 'Update' : 'Create'}</button>
            {editingId && <button type="button" onClick={resetForm} className="px-4 py-2 border rounded">Cancel</button>}
          </div>
        </form>
      </div>

      <div className="bg-white border rounded">
        <div className="p-4 border-b flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold">Clients</h2>
          <input
            type="text"
            value={query}
            onChange={e=>setQuery(e.target.value)}
            placeholder="Search by name, phone, place, status..."
            className="w-full md:w-80 border rounded px-3 py-2 text-sm"
          />
        </div>
        <div className="divide-y">
          {loading && <div className="p-4">Loading...</div>}
          {!loading && partitioned.alive.length === 0 && partitioned.dead.length === 0 && (
            <div className="p-4">{items.length === 0 ? 'No clients yet.' : 'No matching clients.'}</div>
          )}
          {partitioned.alive.map((c) => (
            <div key={c._id} className="p-4 flex items-start justify-between gap-4">
              <div>
                <div className="font-medium">{c.businessName}</div>
                <div className="text-sm text-gray-600">
                  Manager: {c.managerName} • Place: {c.place ? (
                    <a href={buildMapsLink(c.place)} target="_blank" rel="noreferrer" className="text-blue-600 underline">map</a>
                  ) : 'N/A'} • Status: {c.status}
                </div>
                <div className="text-sm text-gray-600">Phones: {(() => {
                  const arr = Array.isArray(c.phoneNumbers) ? c.phoneNumbers : [];
                  if (arr.length > 0) return arr.join(', ');
                  if (c.phone) return c.phone;
                  return 'N/A';
                })()}{typeof c.primaryPhoneIndex === 'number' && Array.isArray(c.phoneNumbers) && c.phoneNumbers.length > 0 ? ` (primary: ${c.primaryPhoneIndex})` : ''}</div>
                {c.deal != null && <div className="text-sm text-gray-600">Deal: {c.deal}</div>}
                {c.description && <div className="text-sm text-gray-600">{c.description}</div>}
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 text-sm border rounded" onClick={()=>startEdit(c)}>Edit</button>
                <button
                  className="px-3 py-1.5 text-sm border rounded"
                  onClick={() => {
                    const phonesArr = Array.isArray(c.phoneNumbers) ? c.phoneNumbers.filter(Boolean) : [];
                    const phones = phonesArr.length ? phonesArr : (c.phone ? [c.phone] : []);
                    if (phones.length === 0) return;
                    if (phones.length === 1) {
                      window.location.href = `tel:${phones[0].trim()}`;
                    } else {
                      setCallModal({ open: true, phones, title: c.businessName || 'Select number' });
                    }
                  }}
                >
                  Call
                </button>
                <button className="px-3 py-1.5 text-sm bg-red-600 text-white rounded" onClick={()=>onDelete(c._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dead clients collapsible section */}
      {partitioned.dead.length > 0 && (
        <div className="bg-white border rounded">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold">Dead Clients</h2>
            <button
              type="button"
              className="px-3 py-1.5 text-sm border rounded"
              onClick={() => setShowDead(s => !s)}
            >
              {showDead ? 'Hide' : `Show (${partitioned.dead.length})`}
            </button>
          </div>
          {showDead && (
            <div className="divide-y">
              {partitioned.dead.map((c) => (
                <div key={c._id} className="p-4 flex items-start justify-between gap-4 opacity-70">
                  <div>
                    <div className="font-medium line-through">{c.businessName}</div>
                    <div className="text-sm text-gray-600">
                      Manager: {c.managerName} • Place: {c.place ? (
                        <a href={buildMapsLink(c.place)} target="_blank" rel="noreferrer" className="text-blue-600 underline">map</a>
                      ) : 'N/A'} • Status: {c.status}
                    </div>
                    <div className="text-sm text-gray-600">Phones: {(() => {
                      const arr = Array.isArray(c.phoneNumbers) ? c.phoneNumbers : [];
                      if (arr.length > 0) return arr.join(', ');
                      if (c.phone) return c.phone;
                      return 'N/A';
                    })()}{typeof c.primaryPhoneIndex === 'number' && Array.isArray(c.phoneNumbers) && c.phoneNumbers.length > 0 ? ` (primary: ${c.primaryPhoneIndex})` : ''}</div>
                    {c.deal != null && <div className="text-sm text-gray-600">Deal: {c.deal}</div>}
                    {c.description && <div className="text-sm text-gray-600">{c.description}</div>}
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-sm border rounded" onClick={()=>startEdit(c)}>Edit</button>
                    <button
                      className="px-3 py-1.5 text-sm border rounded"
                      onClick={() => {
                        const phonesArr = Array.isArray(c.phoneNumbers) ? c.phoneNumbers.filter(Boolean) : [];
                        const phones = phonesArr.length ? phonesArr : (c.phone ? [c.phone] : []);
                        if (phones.length === 0) return;
                        if (phones.length === 1) {
                          window.location.href = `tel:${phones[0].trim()}`;
                        } else {
                          setCallModal({ open: true, phones, title: c.businessName || 'Select number' });
                        }
                      }}
                    >
                      Call
                    </button>
                    <button className="px-3 py-1.5 text-sm bg-red-600 text-white rounded" onClick={()=>onDelete(c._id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {callModal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg w-full max-w-sm p-4">
            <div className="font-semibold mb-2">Call {callModal.title}</div>
            <div className="space-y-2 mb-3">
              {callModal.phones.map((p, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCallModal({ open: false, phones: [], title: '' });
                    window.location.href = `tel:${p.trim()}`;
                  }}
                  className="w-full text-left px-3 py-2 border rounded hover:bg-gray-50"
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="text-right">
              <button className="px-3 py-2 border rounded" onClick={() => setCallModal({ open: false, phones: [], title: '' })}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
