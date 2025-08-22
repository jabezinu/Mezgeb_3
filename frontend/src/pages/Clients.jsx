import { useEffect, useMemo, useState } from 'react';
import { ClientsAPI } from '../api/client';

const initialForm = {
  businessName: '',
  managerName: '',
  phoneNumbers: '', // comma separated in UI
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

  function toArrayPhones(value) {
    return value
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
  }

  function fromArrayPhones(arr) {
    return Array.isArray(arr) ? arr.join(', ') : '';
  }

  function startEdit(item) {
    setEditingId(item._id);
    setForm({
      businessName: item.businessName || '',
      managerName: item.managerName || '',
      phoneNumbers: fromArrayPhones(item.phoneNumbers || []),
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
      phoneNumbers: toArrayPhones(form.phoneNumbers),
      primaryPhoneIndex: Number(form.primaryPhoneIndex) || 0,
      firstVisit: form.firstVisit,
      nextVisit: form.nextVisit,
      place: form.place,
      status: form.status,
      deal: form.deal === '' ? undefined : Number(form.deal),
      description: form.description || undefined,
    };

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
        ...(Array.isArray(c.phoneNumbers) ? c.phoneNumbers : []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return fields.includes(q);
    });
  }, [items, query]);

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
            <label className="block text-sm mb-1">Phone Numbers (comma separated)</label>
            <input className="w-full border rounded px-3 py-2" value={form.phoneNumbers} onChange={e=>setForm(f=>({...f, phoneNumbers: e.target.value}))} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Primary Phone Index</label>
            <input type="number" min={0} className="w-full border rounded px-3 py-2" value={form.primaryPhoneIndex} onChange={e=>setForm(f=>({...f, primaryPhoneIndex: e.target.value}))} />
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
          {!loading && filteredItems.length === 0 && (
            <div className="p-4">{items.length === 0 ? 'No clients yet.' : 'No matching clients.'}</div>
          )}
          {filteredItems.map((c) => (
            <div key={c._id} className="p-4 flex items-start justify-between gap-4">
              <div>
                <div className="font-medium">{c.businessName}</div>
                <div className="text-sm text-gray-600">
                  Manager: {c.managerName} • Place: {c.place ? (
                    <a href={buildMapsLink(c.place)} target="_blank" rel="noreferrer" className="text-blue-600 underline">map</a>
                  ) : 'N/A'} • Status: {c.status}
                </div>
                <div className="text-sm text-gray-600">Phones: {(c.phoneNumbers||[]).join(', ')} (primary: {c.primaryPhoneIndex})</div>
                {c.deal != null && <div className="text-sm text-gray-600">Deal: {c.deal}</div>}
                {c.description && <div className="text-sm text-gray-600">{c.description}</div>}
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 text-sm border rounded" onClick={()=>startEdit(c)}>Edit</button>
                <button className="px-3 py-1.5 text-sm bg-red-600 text-white rounded" onClick={()=>onDelete(c._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
