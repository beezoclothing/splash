import React, { useEffect, useState } from 'react'
import { supabase, setSetting } from '../lib/supabase'
import toast from 'react-hot-toast'
import { FiTrash2, FiPlus } from 'react-icons/fi'

export default function Banners() {
  const [banners, setBanners] = useState(['', '', '', '', ''])
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    supabase.from('settings').select('value').eq('key', 'banners').single()
      .then(({ data }) => {
        if (data?.value) {
          const arr = [...data.value, '', '', '', '', ''].slice(0, 5)
          setBanners(arr)
        }
      })
  }, [])

  async function save() {
    setSaving(true)
    await setSetting('banners', banners.filter(Boolean))
    setSaving(false)
    toast.success('Banners saved!')
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Banner Management</h1>
      <p className="text-sm text-gray-500 mb-6">Add up to 5 banner image URLs. These appear in the homepage slider.</p>

      <div className="space-y-3 mb-6">
        {banners.map((url, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1 block">Banner {i + 1} {i === 0 && '(required)'}</label>
              <input
                value={url}
                onChange={e => {
                  const arr = [...banners]
                  arr[i] = e.target.value
                  setBanners(arr)
                }}
                placeholder="https://i.postimg.cc/..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black"
              />
              {url && (
                <img src={url} alt="" className="mt-2 h-24 w-full object-cover rounded-lg border" onError={e => e.target.style.display = 'none'} />
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Banners'}
      </button>
    </div>
  )
}