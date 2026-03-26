import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { FiEye, FiX } from 'react-icons/fi'

const STATUSES = ['pending','confirmed','pending_payment','awaiting_payment','payment_uploaded','shipped','delivered','cancelled']

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

export default function Orders() {
  const [orders, setOrders]     = useState([])
  const [selected, setSelected] = useState(null)
  const [filter, setFilter]     = useState('all')

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setOrders(data)
  }

  async function updateStatus(id, status) {
    await supabase.from('orders').update({ status }).eq('id', id)
    toast.success('Status updated')
    load()
    if (selected?.id === id) setSelected(o => ({ ...o, status }))
  }

  const filtered = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap mb-4">
        {['all', ...STATUSES].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              filter === s ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Customer','Date','Total','Payment','Status','Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(o => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{o.customer?.name || '—'}</p>
                    <p className="text-gray-400 text-xs">{o.customer?.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 font-medium">LKR {Number(o.total).toLocaleString()}</td>
                  <td className="px-4 py-3 capitalize text-gray-600">{o.payment_method}</td>
                  <td className="px-4 py-3">
                    <select
                      value={o.status}
                      onChange={e => updateStatus(o.id, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none"
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelected(o)} className="p-1.5 hover:bg-gray-100 rounded text-blue-600">
                      <FiEye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center py-10 text-gray-400 text-sm">No orders.</p>}
        </div>
      </div>

      {/* Order detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto py-8 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold">Order Details</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-black"><FiX size={18} /></button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><p className="text-gray-400">Customer</p><p className="font-medium">{selected.customer?.name}</p></div>
                <div><p className="text-gray-400">Phone</p><p>{selected.customer?.phone}</p></div>
                <div><p className="text-gray-400">Email</p><p>{selected.customer?.email}</p></div>
                <div><p className="text-gray-400">City</p><p>{selected.customer?.city}</p></div>
                <div className="col-span-2"><p className="text-gray-400">Address</p><p>{selected.customer?.address}</p></div>
                {selected.customer?.note && <div className="col-span-2"><p className="text-gray-400">Note</p><p>{selected.customer.note}</p></div>}
              </div>

              <div className="border-t pt-3">
                <p className="font-semibold mb-2">Items</p>
                {(selected.items || []).map((item, i) => (
                  <div key={i} className="flex justify-between py-1">
                    <span>{item.name} × {item.qty} {item.size && `(${item.size}${item.color ? ', ' + item.color : ''})`}</span>
                    <span>LKR {(item.price * item.qty).toLocaleString()}</span>
                  </div>
                ))}
                <div className="border-t mt-2 pt-2 flex justify-between font-semibold">
                  <span>Total</span><span>LKR {Number(selected.total).toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t pt-3">
                <div><p className="text-gray-400">Payment</p><p className="capitalize">{selected.payment_method}</p></div>
                <div>
                  <p className="text-gray-400">Status</p>
                  <select
                    value={selected.status}
                    onChange={e => updateStatus(selected.id, e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 mt-0.5 outline-none"
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
              </div>

              {selected.payment_screenshot && (
                <div>
                  <p className="text-gray-400 mb-1">Payment Screenshot</p>
                  <img src={selected.payment_screenshot} alt="Payment" className="w-full rounded-lg border max-h-64 object-contain" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}