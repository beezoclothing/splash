import React, { useEffect, useState } from 'react'
import { supabase, setSetting } from '../lib/supabase'
import toast from 'react-hot-toast'

const POLICIES = [
  { key: 'policy_privacy',  label: 'Privacy Policy' },
  { key: 'policy_terms',    label: 'Terms & Conditions' },
  { key: 'policy_return',   label: 'Return Policy' },
  { key: 'policy_refund',   label: 'Refund Policy' },
  { key: 'policy_delivery', label: 'Delivery Policy' },
]

export default function Policies() {
  const [active, setActive]   = useState('policy_privacy')
  const [content, setContent] = useState('')
  const [saving, setSaving]   = useState(false)

  useEffect(() => { loadPolicy(active) }, [active])

  async function loadPolicy(key) {
    const { data } = await supabase.from('settings').select('value').eq('key', key).single()
    setContent(data?.value?.content || '')
  }

  async function save() {
    setSaving(true)
    await setSetting(active, { content })
    setSaving(false)
    toast.success('Policy saved!')
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Policy Pages</h1>

      <div className="flex gap-2 flex-wrap mb-6">
        {POLICIES.map(p => (
          <button
            key={p.key}
            onClick={() => setActive(p.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              active === p.key ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold">{POLICIES.find(p => p.key === active)?.label}</h2>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={18}
          placeholder="Write your policy content here..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black resize-none font-mono"
        />
        <button onClick={save} disabled={saving} className="px-8 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-700 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Policy'}
        </button>
      </div>
    </div>
  )
}