import React, { useEffect, useState } from 'react'
import { supabase, setSetting } from '../lib/supabase'
import { applyTheme, defaultTheme } from '../lib/theme'
import toast from 'react-hot-toast'

export default function ThemeSettings() {
  const [form, setForm] = useState(defaultTheme)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('settings').select('value').eq('key', 'theme').single()
      .then(({ data }) => { if (data?.value) setForm(data.value) })
  }, [])

  function setField(k, v) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function save() {
    setSaving(true)
    await setSetting('theme', form)
    applyTheme(form)
    setSaving(false)
    toast.success('Theme saved!')
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Theme Settings</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
        <div>
          <label className="text-sm font-medium">Store Name</label>
          <input value={form.storeName} onChange={e => setField('storeName', e.target.value)} className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black" />
        </div>
        <div>
          <label className="text-sm font-medium">Logo URL</label>
          <input value={form.logoUrl} onChange={e => setField('logoUrl', e.target.value)} placeholder="https://..." className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black" />
          {form.logoUrl && (
            <img src={form.logoUrl} alt="Logo preview" className="mt-2 h-12 object-contain border rounded" onError={e => e.target.style.display = 'none'} />
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { key: 'primary', label: 'Primary Color' },
            { key: 'accent',  label: 'Accent Color' },
            { key: 'surface', label: 'Surface Color' },
          ].map(c => (
            <div key={c.key}>
              <label className="text-sm font-medium">{c.label}</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={form[c.key] || '#000000'}
                  onChange={e => setField(c.key, e.target.value)}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                />
                <input
                  value={form[c.key] || ''}
                  onChange={e => setField(c.key, e.target.value)}
                  className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-black font-mono"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Preview */}
        <div className="rounded-xl overflow-hidden border">
          <div className="h-10 flex items-center px-4" style={{ backgroundColor: form.primary || '#111' }}>
            <span className="text-sm font-semibold" style={{ color: form.accent || '#C8A96E' }}>{form.storeName}</span>
          </div>
          <div className="h-16 flex items-center justify-center" style={{ backgroundColor: form.surface || '#F5F3EF' }}>
            <span className="text-sm text-gray-700">Page Content Area</span>
          </div>
        </div>

        <button onClick={save} disabled={saving} className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-700 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Theme'}
        </button>
      </div>
    </div>
  )
}