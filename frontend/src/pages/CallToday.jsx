import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClientsAPI } from '../api/client';

export default function CallToday() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [callModal, setCallModal] = useState({ open: false, phones: [], title: '' });
  const [sortBy, setSortBy] = useState('overdue');
  const navigate = useNavigate();

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

  function parseDate(d) {
    if (!d) return null;
    try {
      // backend returns ISO date string; normalize to local date-only
      const date = new Date(d);
      if (Number.isNaN(date.getTime())) return null;
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    } catch {
      return null;
    }
  }

  function daysDiffFromToday(target) {
    const dt = parseDate(target);
    if (!dt) return null;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const ms = dt.getTime() - today.getTime();
    return Math.round(ms / (1000 * 60 * 60 * 24));
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const alive = items.filter(c => (c.status || '').toLowerCase() !== 'dead');
    const due = alive.filter(c => {
      const d = daysDiffFromToday(c.nextVisit);
      return d != null && d <= 0; // today (0) or passed (<0)
    });
    const searched = !q ? due : due.filter((c) => {
      const fields = [
        c.businessName,
        c.managerName,
        c.place,
        c.status,
        c.description,
        c.phone,
        ...(Array.isArray(c.phoneNumbers) ? c.phoneNumbers : []),
      ].filter(Boolean).join(' ').toLowerCase();
      return fields.includes(q);
    });
    // sorting options
    const arr = [...searched];
    if (sortBy === 'overdue') {
      // most overdue first, then due today
      arr.sort((a, b) => {
        const da = daysDiffFromToday(a.nextVisit) ?? 9999;
        const db = daysDiffFromToday(b.nextVisit) ?? 9999;
        return da - db; // negative (more overdue) comes first
      });
    } else if (sortBy === 'dateAsc') {
      arr.sort((a, b) => {
        const da = parseDate(a.nextVisit)?.getTime() ?? Infinity;
        const db = parseDate(b.nextVisit)?.getTime() ?? Infinity;
        return da - db;
      });
    } else if (sortBy === 'name') {
      arr.sort((a,b)=> (a.businessName||'').localeCompare(b.businessName||''));
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
  }, [items, query, sortBy]);

  function buildMapsLink(value) {
    if (!value) return null;
    const coordMatch = value.match(/^\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*$/);
    if (coordMatch) {
      const [lat, lng] = value.split(',').map(s => s.trim());
      return `https://www.google.com/maps?q=${encodeURIComponent(lat)},${encodeURIComponent(lng)}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`;
  }

  function badgeClasses(daysUntil) {
    // daysUntil <= 0 here. Convert to overdue days count
    const overdue = Math.max(0, -daysUntil);
    if (overdue === 0) return 'from-sky-400 to-blue-600';
    if (overdue <= 3) return 'from-green-400 to-green-600';
    if (overdue <= 7) return 'from-yellow-400 to-yellow-600';
    if (overdue <= 14) return 'from-orange-400 to-orange-600';
    return 'from-rose-400 to-rose-600';
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border rounded">
        <div className="p-4 border-b flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold">Call Today</h2>
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
              title="Sort due clients"
            >
              <option value="overdue">Most Overdue</option>
              <option value="dateAsc">Next Visit (Soonest)</option>
              <option value="name">Name (A-Z)</option>
              <option value="regAsc">Registration (Oldest)</option>
              <option value="regDesc">Registration (Newest)</option>
            </select>
          </div>
        </div>
        <div className="divide-y">
          {loading && <div className="p-4">Loading...</div>}
          {error && <div className="p-4 text-red-600 text-sm">{error}</div>}
          {!loading && filtered.length === 0 && (
            <div className="p-4">No clients to call today.</div>
          )}
          {filtered.map((c) => {
            const d = daysDiffFromToday(c.nextVisit);
            const overdue = d != null ? Math.max(0, -d) : null;
            return (
              <div key={c._id} className="relative p-4 flex items-start justify-between gap-4">
                {/* Overdue badge */}
                {d != null && (
                  <div
                    className={`absolute right-3 top-3 h-7 w-7 rounded-full bg-gradient-to-br ${badgeClasses(d)} text-white text-[10px] font-bold flex items-center justify-center shadow-sm`}
                    title={overdue === 0 ? 'Due Today' : `${overdue} day(s) overdue`}
                  >
                    {overdue === 0 ? '0' : overdue}
                  </div>
                )}

                <div>
                  <div className="font-medium">{c.businessName}</div>
                  <div className="text-xs text-gray-500">Next visit: {parseDate(c.nextVisit)?.toLocaleDateString() || 'N/A'}</div>
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
                  <button
                    className="px-3 py-1.5 text-sm border rounded"
                    onClick={() => navigate('/clients', { state: { editId: c._id } })}
                  >
                    Edit
                  </button>
                  <button
                    className="px-3 py-1.5 text-sm bg-red-600 text-white rounded"
                    disabled={loading}
                    onClick={async () => {
                      if (!confirm('Delete this client?')) return;
                      try {
                        await ClientsAPI.remove(c._id);
                        await load();
                      } catch (e) {
                        alert(e.message || 'Delete failed');
                      }
                    }}
                  >
                    Delete
                  </button>
                  <button className="px-3 py-1.5 text-sm border rounded" onClick={() => {
                    const phonesArr = Array.isArray(c.phoneNumbers) ? c.phoneNumbers.filter(Boolean) : [];
                    const phones = phonesArr.length ? phonesArr : (c.phone ? [c.phone] : []);
                    if (phones.length === 0) return;
                    if (phones.length === 1) {
                      window.location.href = `tel:${phones[0].trim()}`;
                    } else {
                      setCallModal({ open: true, phones, title: c.businessName || 'Select number' });
                    }
                  }}>Call</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
