import React, { useEffect, useState } from 'react'
import { supabase, setSetting } from '../lib/supabase'
import toast from 'react-hot-toast'

const SOCIAL_PLATFORMS = ['instagram', 'facebook', 'tiktok', 'whatsapp', 'youtube', 'twitter']

export default function SocialContact() {
  const [social, setSocial]   = useState({})
  const [contact, setContact] = useState({})
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    supabase.from('settings').select('value').eq('key', 'social_contact').single()
      .then(({ data }) => {
        if (data?.value) {
          setSocial(data.value.social || {})
          setContact(data.value.contact || {})
        }
      })
  }, [])

  async function save() {
    setSaving(true)
    await setSetting('social_contact', { social, contact })
    setSaving(false)
    toast.success('Saved!')
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Social Media & Contact</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold">Social Media Links</h2>
        {SOCIAL_PLATFORMS.map(p => (
          <div key={p}>
            <label className="text-sm font-medium capitalize">{p}</label>
            <input
              value={social[p] || ''}
              onChange={e => setSocial(s => ({ ...s, [p]: e.target.value }))}
              placeholder={`https://${p}.com/yourpage`}
              className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black"
            />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold">Contact Details</h2>
        {[
          { key: 'phone',   label: 'Phone Number', placeholder: '+94 77 000 0000' },
          { key: 'email',   label: 'Email', placeholder: 'hello@splashmen.lk' },
          { key: 'address', label: 'Address', placeholder: 'Colombo, Sri Lanka' },
          { key: 'about',   label: 'About (Footer tagline)', placeholder: 'Premium men\'s fashion...' },
        ].map(f => (
          <div key={f.key}>
            <label className="text-sm font-medium">{f.label}</label>
            <input
              value={contact[f.key] || ''}
              onChange={e => setContact(c => ({ ...c, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black"
            />
          </div>
        ))}
      </div>

      <button onClick={save} disabled={saving} className="px-8 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-700 disabled:opacity-50">
        {saving ? 'Saving...' : 'Save All'}
      </button>
    </div>
  )
}