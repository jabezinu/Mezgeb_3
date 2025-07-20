import React, { useEffect, useState } from 'react'
import api from '../api'

const Leads = () => {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/leads')
      .then(res => {
        setLeads(res.data)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to fetch leads')
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="text-center py-10">Loading leads...</div>
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">Leads</h1>
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white">
          <thead className="bg-blue-100">
            <tr>
              <th className="py-3 px-4 text-left">Place</th>
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {leads.map(lead => (
              <tr key={lead._id} className="border-b hover:bg-blue-50 transition">
                <td className="py-2 px-4 font-semibold">{lead.place}</td>
                <td className="py-2 px-4">{lead.name}</td>
                <td className="py-2 px-4">{new Date(lead.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Leads
