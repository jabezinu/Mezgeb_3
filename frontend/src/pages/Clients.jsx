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
  const [detailModal, setDetailModal] = useState({ open: false, client: null });
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

  async function handleSubmit(payload, shouldCall = false) {
    try {
      let client;
      if (editingId) {
        client = await ClientsAPI.update(editingId, payload);
      } else {
        client = await ClientsAPI.create(payload);
        
        // If this is a new client and we should call, initiate the call
        if (shouldCall && client && client.phoneNumbers && client.phoneNumbers.length > 0) {
          const primaryPhone = client.phoneNumbers[client.primaryPhoneIndex || 0];
          if (primaryPhone) {
            // Remove any non-numeric characters except + for international numbers
            const phoneNumber = primaryPhone.replace(/[^0-9+]/g, '');
            window.location.href = `tel:${phoneNumber}`;
          }
        }
      }
      
      await load();
      setShowForm(false);
      setEditingId(null);
      
      return client;
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
    <div className="space-y-4 sm:space-y-6">
      {showForm && (
        <div className="bg-white border rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingId ? 'Edit Client' : 'New Client'}
            </h2>
            <button
              onClick={handleCancel}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              aria-label="Close form"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <ClientForm
            initialValues={formInitial}
            statuses={statuses}
            editing={Boolean(editingId)}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            onCreateAndCall={async (payload) => {
              try {
                await handleSubmit(payload, true);
              } catch (e) {
                // Error is already handled in the form
                throw e;
              }
            }}
          />
        </div>
      )}

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="p-3 sm:p-4 border-b">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Clients</h2>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="relative flex-1 min-w-0">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search clients..."
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                {query && (
                  <button 
                    onClick={() => setQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    aria-label="Clear search"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2.5 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  title="Sort clients"
                  aria-label="Sort clients"
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
                  onClick={startCreate}
                  className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  New Client
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="divide-y">
          {loading ? (
            <div className="p-6 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
              <div>Loading clients...</div>
            </div>
          ) : partitioned.alive.length === 0 && partitioned.dead.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {items.length === 0 ? (
                <div>
                  <div className="text-4xl mb-2">👋</div>
                  <div className="font-medium mb-1">No clients yet</div>
                  <p className="text-sm text-gray-500 mb-4">Get started by adding your first client</p>
                  <button
                    onClick={startCreate}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium"
                  >
                    + Add Client
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-4xl mb-2">🔍</div>
                  <div className="font-medium">No matching clients found</div>
                  <p className="text-sm text-gray-500">Try adjusting your search query</p>
                </div>
              )}
            </div>
          ) : (
            <ul className="divide-y">
              {sortedAlive.map((c) => (
                <li key={c._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900 truncate">{c.businessName || 'Unnamed Client'}</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {c.status || 'No status'}
                        </span>
                      </div>
                      
                      <div className="mt-1.5 space-y-1 text-sm text-gray-600">
                        {c.managerName && (
                          <div className="flex items-start">
                            <span className="w-20 text-gray-500">Manager:</span>
                            <span className="flex-1">{c.managerName}</span>
                          </div>
                        )}
                        
                        <div className="flex items-start">
                          <span className="w-20 text-gray-500">Place:</span>
                          <span className="flex-1">
                            {c.place ? (
                              <a 
                                href={buildMapsLink(c.place)} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-blue-600 hover:underline flex items-center gap-1"
                              >
                                {c.place}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                                </svg>
                              </a>
                            ) : 'N/A'}
                          </span>
                        </div>
                        
                        <div className="flex items-start">
                          <span className="w-20 text-gray-500">Phone:</span>
                          <span className="flex-1">
                            {(() => {
                              const arr = Array.isArray(c.phoneNumbers) ? c.phoneNumbers : [];
                              const phoneNumbers = arr.length ? arr : (c.phone ? [c.phone] : []);
                              
                              if (phoneNumbers.length === 0) return 'N/A';
                              
                              return phoneNumbers.map((phone, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <a 
                                    href={`tel:${phone.trim()}`} 
                                    className="text-blue-600 hover:underline flex items-center gap-1"
                                  >
                                    {phone}
                                    {typeof c.primaryPhoneIndex === 'number' && idx === c.primaryPhoneIndex && (
                                      <span className="text-xs text-gray-500">(primary)</span>
                                    )}
                                  </a>
                                </div>
                              ));
                            })()}
                          </span>
                        </div>
                        
                        {c.deal != null && c.deal !== '' && (
                          <div className="flex items-start">
                            <span className="w-20 text-gray-500">Deal:</span>
                            <span className="flex-1">{c.deal}</span>
                          </div>
                        )}
                        
                        {c.description && (
                          <div className="flex items-start">
                            <span className="w-20 text-gray-500">Notes:</span>
                            <p className="flex-1 text-gray-700 whitespace-pre-line">{c.description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:flex-col sm:w-32">
                      <button
                        onClick={() => setDetailModal({ open: true, client: c })}
                        className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 flex-1 min-w-[80px] sm:w-full flex items-center justify-center gap-1.5"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>Details</span>
                      </button>
                      
                      <button 
                        onClick={() => startEdit(c)}
                        className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 flex-1 min-w-[80px] sm:w-full flex items-center justify-center gap-1.5"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Edit</span>
                      </button>
                      
                      <button
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
                        className="px-3 py-2 text-sm border rounded-lg hover:bg-green-50 text-green-700 border-green-200 flex-1 min-w-[80px] sm:w-full flex items-center justify-center gap-1.5"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>Call</span>
                      </button>
                      
                      <button 
                        onClick={() => onDelete(c._id)}
                        className="px-3 py-2 text-sm border rounded-lg hover:bg-red-50 text-red-700 border-red-200 flex-1 min-w-[80px] sm:w-full flex items-center justify-center gap-1.5"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
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
                    <button
                      className="px-3 py-1.5 text-sm border rounded"
                      onClick={() => setDetailModal({ open: true, client: c })}
                    >
                      Details
                    </button>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-5 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Call {callModal.title}</h3>
            </div>
            <div className="p-4 space-y-3">
              {callModal.phones.map((p, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCallModal({ open: false, phones: [], title: '' });
                    window.location.href = `tel:${p.trim()}`;
                  }}
                  className="w-full px-4 py-3 text-left border rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span className="text-gray-900">{p}</span>
                </button>
              ))}
            </div>
            <div className="px-4 py-3 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setCallModal({ open: false, phones: [], title: '' })}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {detailModal.open && detailModal.client && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="p-5 border-b flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{detailModal.client.businessName || 'Client Details'}</h3>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    detailModal.client.status === 'dead' 
                      ? 'bg-red-100 text-red-800' 
                      : detailModal.client.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {detailModal.client.status || 'No status'}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setDetailModal({ open: false, client: null })}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm">
              <div><span className="font-medium">Manager:</span> {detailModal.client.managerName || 'N/A'}</div>
              <div>
                <span className="font-medium">Phones:</span> {(() => {
                  const arr = Array.isArray(detailModal.client.phoneNumbers) ? detailModal.client.phoneNumbers.filter(Boolean) : [];
                  const list = arr.length ? arr : (detailModal.client.phone ? [detailModal.client.phone] : []);
                  return list.length ? list.join(', ') : 'N/A';
                })()} {typeof detailModal.client.primaryPhoneIndex === 'number' && Array.isArray(detailModal.client.phoneNumbers) && detailModal.client.phoneNumbers.length > 0 ? ` (primary: ${detailModal.client.primaryPhoneIndex})` : ''}
              </div>
              <div>
                <span className="font-medium">Place:</span> {detailModal.client.place ? (
                  <a href={buildMapsLink(detailModal.client.place)} target="_blank" rel="noreferrer" className="text-blue-600 underline">{detailModal.client.place}</a>
                ) : 'N/A'}
              </div>
              <div><span className="font-medium">First Visit:</span> {detailModal.client.firstVisit ? new Date(detailModal.client.firstVisit).toLocaleDateString() : 'N/A'}</div>
              <div><span className="font-medium">Next Visit:</span> {detailModal.client.nextVisit ? new Date(detailModal.client.nextVisit).toLocaleDateString() : 'N/A'}</div>
              {detailModal.client.deal != null && <div><span className="font-medium">Deal (ETB):</span> {detailModal.client.deal}</div>}
              {detailModal.client.description && <div><span className="font-medium">Description:</span> {detailModal.client.description}</div>}
              {detailModal.client.createdAt && <div className="text-xs text-gray-500">Created: {new Date(detailModal.client.createdAt).toLocaleString()}</div>}
            </div>
            <div className="mt-4 flex gap-2 justify-end">
              <button
                className="px-3 py-2 border rounded"
                onClick={() => {
                  const arr = Array.isArray(detailModal.client.phoneNumbers) ? detailModal.client.phoneNumbers.filter(Boolean) : [];
                  const list = arr.length ? arr : (detailModal.client.phone ? [detailModal.client.phone] : []);
                  if (!list.length) return;
                  const primaryIndex = typeof detailModal.client.primaryPhoneIndex === 'number' ? Math.min(Math.max(0, detailModal.client.primaryPhoneIndex), Math.max(0, list.length - 1)) : 0;
                  window.location.href = `tel:${list[primaryIndex].trim()}`;
                }}
              >
                Call Primary
              </button>
              <button
                className="px-3 py-2 border rounded"
                onClick={() => {
                  const c = detailModal.client;
                  setDetailModal({ open: false, client: null });
                  startEdit(c);
                }}
              >
                Edit
              </button>
              <button className="px-3 py-2 bg-gray-900 text-white rounded" onClick={() => setDetailModal({ open: false, client: null })}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
