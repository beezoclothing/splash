import React, { useEffect, useState } from 'react'
import { supabase, setSetting } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function DeliverySettings() {
  const [charge, setCharge] = useState('0')
  const [note, setNote]     = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('settings').select('value').eq('key', 'delivery').single()
      .then(({ data }) => {
        if (data?.value) {
          setCharge(String(data.value.charge ?? 0))
          setNote(data.value.note || '')
        }
      })
  }, [])

  async function save() {
    setSaving(true)
    await setSetting('delivery', { charge: Number(charge), note })
    setSaving(false)
    toast.success('Delivery settings saved!')
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold mb-6">Delivery Settings</h1>
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div>
          <label className="text-sm font-medium">Delivery Charge (LKR)</label>
          <p className="text-xs text-gray-400 mb-1">Set to 0 for free delivery</p>
          <input
            type="number"
            value={charge}
            onChange={e => setCharge(e.target.value)}
            className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Delivery Note</label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={3}
            placeholder="e.g. Delivery within 3-5 working days across Sri Lanka"
            className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black resize-none"
          />
        </div>
        <button onClick={save} disabled={saving} className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-700 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}