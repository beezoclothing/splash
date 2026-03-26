import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { FiShoppingBag, FiPackage, FiDollarSign, FiClock } from 'react-icons/fi'

const STATUS_COLORS = {
  pending:           'bg-yellow-100 text-yellow-800',
  confirmed:         'bg-green-100 text-green-800',
  pending_payment:   'bg-blue-100 text-blue-800',
  payment_uploaded:  'bg-purple-100 text-purple-800',
  awaiting_payment:  'bg-orange-100 text-orange-800',
  shipped:           'bg-indigo-100 text-indigo-800',
  delivered:         'bg-green-200 text-green-900',
  cancelled:         'bg-red-100 text-red-800',
}

export default function Dashboard() {
  const [stats, setStats]   = useState({ orders: 0, products: 0, revenue: 0, pending: 0 })
  const [recent, setRecent] = useState([])

  useEffect(() => {
    async function load() {
      const [{ data: orders }, { count: products }] = await Promise.all([
        supabase.from('orders').select('id,total,status,created_at,customer').order('created_at', { ascending: false }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
      ])
      if (orders) {
        const revenue = orders.reduce((s, o) => s + Number(o.total || 0), 0)
        const pending = orders.filter(o => ['pending','awaiting_payment','payment_uploaded'].includes(o.status)).length
        setStats({ orders: orders.length, products: products || 0, revenue, pending })
        setRecent(orders.slice(0, 10))
      }
    }
    load()
  }, [])

  const cards = [
    { label: 'Total Orders',   value: stats.orders,                        icon: FiShoppingBag, color: 'bg-blue-50' },
    { label: 'Total Products', value: stats.products,                      icon: FiPackage,     color: 'bg-green-50' },
    { label: 'Revenue (LKR)',  value: `${stats.revenue.toLocaleString()}`, icon: FiDollarSign,  color: 'bg-amber-50' },
    { label: 'Pending Orders', value: stats.pending,                       icon: FiClock,       color: 'bg-red-50' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className={`${c.color} rounded-xl p-5`}>
            <c.icon size={20} className="text-gray-500 mb-2" />
            <p className="text-2xl font-bold">{c.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Customer','Date','Total','Method','Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recent.map(o => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{o.customer?.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 font-medium">LKR {Number(o.total).toLocaleString()}</td>
                  <td className="px-4 py-3 capitalize">{o.payment_method}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-700'}`}>
                      {o.status?.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}