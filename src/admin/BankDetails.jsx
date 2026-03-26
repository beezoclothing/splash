import React, { useEffect, useState } from 'react'
import { supabase, setSetting } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function BankDetails() {
  const [form, setForm] = useState({
    bank_name: '', account_name: '', account_no: '', branch: '', additional: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('settings').select('value').eq('key', 'bank_details').single()
      .then(({ data }) => { if (data?.value) setForm(data.value) })
  }, [])

  async function save() {
    setSaving(true)
    await setSetting('bank_details', form)
    setSaving(false)
    toast.success('Bank details saved!')
  }

  const fields = [
    { key: 'bank_name',     label: 'Bank Name' },
    { key: 'account_name',  label: 'Account Name' },
    { key: 'account_no',    label: 'Account Number' },
    { key: 'branch',        label: 'Branch' },
    { key: 'additional',    label: 'Additional Info' },
  ]

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold mb-6">Bank Details</h1>
      <p className="text-sm text-gray-500 mb-6">These details are shown to customers when they choose Bank Transfer payment.</p>
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        {fields.map(f => (
          <div key={f.key}>
            <label className="text-sm font-medium">{f.label}</label>
            <input
              value={form[f.key]}
              onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
              className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black"
            />
          </div>
        ))}
        <button onClick={save} disabled={saving} className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-700 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Bank Details'}
        </button>
      </div>
    </div>
  )
}