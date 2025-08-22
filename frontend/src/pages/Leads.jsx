import { useEffect, useState } from 'react';
import { LeadsAPI } from '../api/client';

const initialForm = { place: '', name: '' };

export default function Leads() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await LeadsAPI.list();
      setItems(data);
    } catch (e) {
      setError(e.message || 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function startEdit(lead) {
    setEditingId(lead._id);
    setForm({ place: lead.place || '', name: lead.name || '' });
  }

  function resetForm() {
    setEditingId(null);
    setForm(initialForm);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await LeadsAPI.update(editingId, form);
      } else {
        await LeadsAPI.create(form);
      }
      await load();
      resetForm();
    } catch (e) {
      setError(e.message || 'Save failed');
    }
  }

  async function onDelete(id) {
    if (!confirm('Delete this lead?')) return;
    try {
      await LeadsAPI.remove(id);
      await load();
    } catch (e) {
      alert(e.message || 'Delete failed');
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border rounded p-4">
        <h2 className="text-lg font-semibold mb-3">{editingId ? 'Edit Lead' : 'New Lead'}</h2>
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Place</label>
            <input className="w-full border rounded px-3 py-2" value={form.place} onChange={e=>setForm(f=>({...f, place: e.target.value}))} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input className="w-full border rounded px-3 py-2" value={form.name} onChange={e=>setForm(f=>({...f, name: e.target.value}))} required />
          </div>
          <div className="md:col-span-2 flex gap-2">
            <button className="px-4 py-2 bg-gray-900 text-white rounded">{editingId ? 'Update' : 'Create'}</button>
            {editingId && <button type="button" onClick={resetForm} className="px-4 py-2 border rounded">Cancel</button>}
          </div>
        </form>
      </div>

      <div className="bg-white border rounded">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Leads</h2>
        </div>
        <div className="divide-y">
          {loading && <div className="p-4">Loading...</div>}
          {!loading && items.length === 0 && <div className="p-4">No leads yet.</div>}
          {items.map((l) => (
            <div key={l._id} className="p-4 flex items-start justify-between gap-4">
              <div>
                <div className="font-medium">{l.name}</div>
                <div className="text-sm text-gray-600">Place: {l.place}</div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 text-sm border rounded" onClick={()=>startEdit(l)}>Edit</button>
                <button className="px-3 py-1.5 text-sm bg-red-600 text-white rounded" onClick={()=>onDelete(l._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
