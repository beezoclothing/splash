import React, { useEffect, useState } from 'react'
import { supabase, setSetting } from '../lib/supabase'
import toast from 'react-hot-toast'
import { FiPlus, FiTrash2 } from 'react-icons/fi'

export default function HomepageCustomize() {
  const [products, setProducts]     = useState([])
  const [collections, setCollections] = useState([])
  const [featTitle, setFeatTitle]   = useState('Featured')
  const [featIds, setFeatIds]       = useState([])
  const [rows, setRows]             = useState([])
  const [saving, setSaving]         = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const [{ data: p }, { data: c }, { data: fs }, { data: rs }] = await Promise.all([
      supabase.from('products').select('id,name').order('name'),
      supabase.from('collections').select('id,name').order('name'),
      supabase.from('settings').select('value').eq('key', 'featured_section').single(),
      supabase.from('settings').select('value').eq('key', 'collection_rows').single(),
    ])
    if (p) setProducts(p)
    if (c) setCollections(c)
    if (fs?.value) {
      setFeatTitle(fs.value.title || 'Featured')
      setFeatIds(fs.value.product_ids || [])
    }
    if (rs?.value) setRows(rs.value)
  }

  function toggleFeatProduct(id) {
    setFeatIds(ids =>
      ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]
    )
  }

  function addRow() {
    if (rows.length >= 6) return toast.error('Maximum 6 collection rows')
    setRows(r => [...r, { title: '', collection_id: '' }])
  }

  function updateRow(i, field, val) {
    setRows(r => {
      const updated = [...r]
      updated[i] = { ...updated[i], [field]: val }
      return updated
    })
  }

  async function save() {
    setSaving(true)
    await Promise.all([
      setSetting('featured_section', { title: featTitle, product_ids: featIds }),
      setSetting('collection_rows', rows.filter(r => r.title && r.collection_id)),
    ])
    setSaving(false)
    toast.success('Homepage customized!')
  }

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold">Homepage Customize</h1>

      {/* Featured section */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold">Featured Section</h2>
        <div>
          <label className="text-sm font-medium">Section Title</label>
          <input value={featTitle} onChange={e => setFeatTitle(e.target.value)} className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-2">Select Products (checked = featured)</label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-100 rounded-lg p-3">
            {products.map(p => (
              <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={featIds.includes(p.id)}
                  onChange={() => toggleFeatProduct(p.id)}
                  className="w-3.5 h-3.5 accent-black"
                />
                <span className="truncate">{p.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Collection rows */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Collection Rows (up to 6)</h2>
          <button onClick={addRow} className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
            <FiPlus size={14} /> Add Row
          </button>
        </div>
        {rows.length === 0 && <p className="text-sm text-gray-400">No rows yet. Add a row to display a collection horizontally.</p>}
        {rows.map((row, i) => (
          <div key={i} className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-xs text-gray-500">Row Title</label>
              <input value={row.title} onChange={e => updateRow(i, 'title', e.target.value)} placeholder="e.g. New Arrivals" className="w-full mt-0.5 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black" />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500">Collection</label>
              <select value={row.collection_id} onChange={e => updateRow(i, 'collection_id', e.target.value)} className="w-full mt-0.5 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black">
                <option value="">— Select —</option>
                {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <button onClick={() => setRows(r => r.filter((_, idx) => idx !== i))} className="mb-0.5 p-2 text-red-400 hover:text-red-600">
              <FiTrash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <button onClick={save} disabled={saving} className="px-8 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-700 disabled:opacity-50">
        {saving ? 'Saving...' : 'Save Homepage'}
      </button>
    </div>
  )
}