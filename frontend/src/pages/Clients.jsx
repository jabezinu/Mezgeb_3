import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ClientsAPI } from '../api/client';
import ClientForm from '../components/ClientForm';

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
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formInitial, setFormInitial] = useState(initialForm);
  const [query, setQuery] = useState('');
  const [callModal, setCallModal] = useState({ open: false, phones: [], title: '' });
  const [showDead, setShowDead] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const location = useLocation();
  const navigate = useNavigate();

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

  // If navigated with state { editId }, auto-open edit form
  useEffect(() => {
    const id = location.state && location.state.editId;
    if (id && items.length) {
      const item = items.find(it => it._id === id);
      if (item) startEdit(item);
      // clear state so it won't trigger again
      navigate('.', { replace: true, state: {} });
    }
  }, [location.state, items, navigate]);

  function startEdit(item) {
    setEditingId(item._id);
    setFormInitial({
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
    setShowForm(true);
  }

  function startCreate() {
    setEditingId(null);
    setFormInitial(initialForm);
    setShowForm(true);
  }

  async function handleSubmit(payload) {
    try {
      if (editingId) {
        await ClientsAPI.update(editingId, payload);
      } else {
        await ClientsAPI.create(payload);
      }
      await load();
      setShowForm(false);
      setEditingId(null);
    } catch (e) {
      // bubble up error by throwing so form can show it if desired
      throw e;
    }
  }

  function handleCancel() {
    setShowForm(false);
    setEditingId(null);
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

  function parseDate(d) {
    if (!d) return null;
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return null;
    return dt;
  }

  const sortedAlive = useMemo(() => {
    const arr = [...partitioned.alive];
    if (sortBy === 'name') {
      arr.sort((a,b)=> (a.businessName||'').localeCompare(b.businessName||''));
    } else if (sortBy === 'nextAsc') {
      arr.sort((a,b)=> {
        const da = parseDate(a.nextVisit)?.getTime() ?? Infinity;
        const db = parseDate(b.nextVisit)?.getTime() ?? Infinity;
        return da - db;
      });
    } else if (sortBy === 'nextDesc') {
      arr.sort((a,b)=> {
        const da = parseDate(a.nextVisit)?.getTime() ?? -Infinity;
        const db = parseDate(b.nextVisit)?.getTime() ?? -Infinity;
        return db - da;
      });
    } else if (sortBy === 'status') {
      arr.sort((a,b)=> (a.status||'').localeCompare(b.status||''));
    } else if (sortBy === 'regAsc') {
      arr.sort((a,b)=> {
        const da = (a.createdAt ? new Date(a.createdAt).getTime() : Infinity);
        const db = (b.createdAt ? new Date(b.createdAt).getTime() : Infinity);
        return da - db; // oldest first
      });
    } else if (sortBy === 'regDesc') {
      arr.sort((a,b)=> {
        const da = (a.createdAt ? new Date(a.createdAt).getTime() : -Infinity);
        const db = (b.createdAt ? new Date(b.createdAt).getTime() : -Infinity);
        return db - da; // newest first
      });
    }
    return arr;
  }, [partitioned.alive, sortBy]);

  function buildMapsLink(value) {
    if (!value) return null;
    const coordMatch = value.match(/^\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*$/);
    if (coordMatch) {
      const [lat, lng] = value.split(',').map(s => s.trim());
      return `https://www.google.com/maps?q=${encodeURIComponent(lat)},${encodeURIComponent(lng)}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`;
  }

  
  return (
    <div className="space-y-6">
      {showForm && (
        <div className="bg-white border rounded p-4">
          <h2 className="text-lg font-semibold mb-3">{editingId ? 'Edit Client' : 'New Client'}</h2>
          <ClientForm
            initialValues={formInitial}
            statuses={statuses}
            editing={Boolean(editingId)}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      )}

      <div className="bg-white border rounded">
        <div className="p-4 border-b flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold">Clients</h2>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
            <input
              type="text"
              value={query}
              onChange={e=>setQuery(e.target.value)}
              placeholder="Search by name, phone, place, status..."
              className="w-full md:w-80 border rounded px-3 py-2 text-sm"
            />
            <select
              value={sortBy}
              onChange={e=>setSortBy(e.target.value)}
              className="border rounded px-3 py-2 text-sm"
              title="Sort clients"
            >
              <option value="name">Name (A-Z)</option>
              <option value="nextAsc">Next Visit (Soonest)</option>
              <option value="nextDesc">Next Visit (Latest)</option>
              <option value="status">Status (A-Z)</option>
              <option value="regAsc">Registration (Oldest)</option>
              <option value="regDesc">Registration (Newest)</option>
            </select>
            <button
              type="button"
              className="border rounded px-3 py-2 text-sm"
              onClick={startCreate}
            >
              New Client
            </button>
          </div>
        </div>
        <div className="divide-y">
          {loading && <div className="p-4">Loading...</div>}
          {!loading && partitioned.alive.length === 0 && partitioned.dead.length === 0 && (
            <div className="p-4">{items.length === 0 ? 'No clients yet.' : 'No matching clients.'}</div>
          )}
          {sortedAlive.map((c) => (
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
