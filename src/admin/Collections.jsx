import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { FiPlus, FiTrash2, FiEdit2, FiX } from 'react-icons/fi'

function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export default function Collections() {
  const [collections, setCollections] = useState([])
  const [categories, setCategories]   = useState([])
  const [modal, setModal]   = useState(false)
  const [form, setForm]     = useState({ name: '', slug: '', category_id: '', sort_order: 0 })
  const [editing, setEditing] = useState(null)
  const [saving, setSaving]   = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const [{ data: cols }, { data: cats }] = await Promise.all([
      supabase.from('collections').select('*, categories(name)').order('sort_order'),
      supabase.from('categories').select('id,name').order('name'),
    ])
    if (cols) setCollections(cols)
    if (cats) setCategories(cats)
  }

  function openNew() {
    setForm({ name: '', slug: '', category_id: '', sort_order: collections.length })
    setEditing(null)
    setModal(true)
  }

  function openEdit(c) {
    setForm({ name: c.name, slug: c.slug, category_id: c.category_id || '', sort_order: c.sort_order || 0 })
    setEditing(c.id)
    setModal(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.name) return toast.error('Name required')
    setSaving(true)
    const payload = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      category_id: form.category_id || null,
      sort_order: Number(form.sort_order) || 0,
    }
    if (editing) {
      await supabase.from('collections').update(payload).eq('id', editing)
      toast.success('Updated')
    } else {
      await supabase.from('collections').insert(payload)
      toast.success('Created')
    }
    setSaving(false)
    setModal(false)
    load()
  }

  async function del(id) {
    if (!confirm('Delete this collection?')) return
    await supabase.from('collections').delete().eq('id', id)
    toast.success('Deleted')
    load()
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Collections</h1>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-700">
          <FiPlus size={16} /> Add Collection
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>{['Name','Slug','Category','Actions'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {collections.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{c.slug}</td>
                <td className="px-4 py-3 text-gray-500">{c.categories?.name || '—'}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-gray-100 rounded text-blue-600"><FiEdit2 size={14} /></button>
                  <button onClick={() => del(c.id)} className="p-1.5 hover:bg-gray-100 rounded text-red-500"><FiTrash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {collections.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">No collections yet.</p>}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold">{editing ? 'Edit' : 'New'} Collection</h2>
              <button onClick={() => setModal(false)}><FiX size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-3">
              <div>
                <label className="text-sm font-medium">Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))} required className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black" />
              </div>
              <div>
                <label className="text-sm font-medium">Slug</label>
                <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black font-mono" />
              </div>
              <div>
                <label className="text-sm font-medium">Category (for nav dropdown)</label>
                <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black">
                  <option value="">— None —</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Sort Order</label>
                <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black" />
              </div>
              <button type="submit" disabled={saving} className="w-full py-2.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-700 disabled:opacity-50">
                {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}