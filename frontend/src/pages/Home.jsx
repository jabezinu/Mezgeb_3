 import React from 'react'
 import { NavLink } from 'react-router-dom'
 import { Users, Phone, UserPlus } from 'lucide-react'

 const Home = () => {
   return (
     <div className="container-page py-6">
       <div className="mb-6">
         <h1 className="text-2xl font-semibold text-gray-900">Welcome back 👋</h1>
         <p className="text-sm text-gray-600 mt-1">Quick overview and shortcuts to your daily actions.</p>
       </div>

       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
         <NavLink to="/clients" className="card p-4 hover:shadow-md transition-shadow">
           <div className="flex items-center justify-between">
             <div>
               <h3 className="text-sm font-medium text-gray-600">Clients</h3>
               <p className="mt-1 text-base font-semibold text-gray-900">Manage clients</p>
             </div>
             <Users className="text-indigo-600" size={24} />
           </div>
         </NavLink>

         <NavLink to="/call-today" className="card p-4 hover:shadow-md transition-shadow">
           <div className="flex items-center justify-between">
             <div>
               <h3 className="text-sm font-medium text-gray-600">Call Today</h3>
               <p className="mt-1 text-base font-semibold text-gray-900">Today's follow-ups</p>
             </div>
             <Phone className="text-indigo-600" size={24} />
           </div>
         </NavLink>

         <NavLink to="/leads" className="card p-4 hover:shadow-md transition-shadow">
           <div className="flex items-center justify-between">
             <div>
               <h3 className="text-sm font-medium text-gray-600">Leads</h3>
               <p className="mt-1 text-base font-semibold text-gray-900">Capture and track</p>
             </div>
             <UserPlus className="text-indigo-600" size={24} />
           </div>
         </NavLink>
       </div>
     </div>
   )
 }

 export default Home
