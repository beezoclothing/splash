import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi'

const EMPTY = {
  name: '', description: '', price: '', collection_id: '',
  images: ['', '', '', '', ''],
  variants: [],
  is_featured: false, sort_order: 0,
}

function VariantEditor({ variants, onChange }) {
  function add() {
    onChange([...variants, { size: '', color: '', stock: 0 }])
  }
  function update(i, field, val) {
    const v = [...variants]
    v[i] = { ...v[i], [field]: val }
    onChange(v)
  }
  function remove(i) {
    onChange(variants.filter((_, idx) => idx !== i))
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium">Variants (Size / Color / Stock)</label>
        <button type="button" onClick={add} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
          <FiPlus size={12} /> Add Variant
        </button>
      </div>
      {variants.map((v, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <input value={v.size} onChange={e => update(i, 'size', e.target.value)} placeholder="Size" className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm" />
          <input value={v.color} onChange={e => update(i, 'color', e.target.value)} placeholder="Color" className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm" />
          <input type="number" value={v.stock} onChange={e => update(i, 'stock', Number(e.target.value))} placeholder="Stock" className="w-20 border border-gray-200 rounded px-2 py-1 text-sm" />
          <button type="button" onClick={() => remove(i)} className="text-red-400 hover:text-red-600"><FiX size={14} /></button>
        </div>
      ))}
    </div>
  )
}

export default function Products() {
  const [products, setProducts]     = useState([])
  const [collections, setCollections] = useState([])
  const [modal, setModal]           = useState(false)
  const [form, setForm]             = useState(EMPTY)
  const [editing, setEditing]       = useState(null)
  const [saving, setSaving]         = useState(false)
  const [search, setSearch]         = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from('products').select('*, collections(name)').order('created_at', { ascending: false }),
      supabase.from('collections').select('id,name').order('name'),
    ])
    if (p) setProducts(p)
    if (c) setCollections(c)
  }

  function openNew() {
    setForm(EMPTY)
    setEditing(null)
    setModal(true)
  }

  function openEdit(p) {
    setForm({
      ...p,
      images: [...(p.images || []), '', '', '', '', ''].slice(0, 5),
      variants: p.variants || [],
    })
    setEditing(p.id)
    setModal(true)
  }

  function setField(k, v) {
    setForm(f => ({ ...f, [k]: v }))
  }

  function setImage(i, val) {
    const imgs = [...form.images]
    imgs[i] = val
    setForm(f => ({ ...f, images: imgs }))
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.name || !form.price) return toast.error('Name and price required')
    setSaving(true)
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      collection_id: form.collection_id || null,
      images: form.images.filter(Boolean),
      variants: form.variants,
      is_featured: form.is_featured,
      sort_order: Number(form.sort_order) || 0,
    }
    if (editing) {
      await supabase.from('products').update(payload).eq('id', editing)
      toast.success('Product updated')
    } else {
      await supabase.from('products').insert(payload)
      toast.success('Product created')
    }
    setSaving(false)
    setModal(false)
    load()
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return
    await supabase.from('products').delete().eq('id', id)
    toast.success('Deleted')
    load()
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-700">
          <FiPlus size={16} /> Add Product
        </button>
      </div>

      <input
        value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Search products..."
        className="w-full md:w-72 mb-4 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
      />

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Image','Name','Price','Collection','Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <img src={p.images?.[0] || 'https://placehold.co/60x80'} alt="" className="w-10 h-12 object-cover rounded" />
                </td>
                <td className="px-4 py-3 font-medium max-w-[200px] truncate">{p.name}</td>
                <td className="px-4 py-3">LKR {Number(p.price).toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-500">{p.collections?.name || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-gray-100 rounded text-blue-600"><FiEdit2 size={14} /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-gray-100 rounded text-red-500"><FiTrash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center py-10 text-gray-400 text-sm">No products yet.</p>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto py-8 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold">{editing ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-black"><FiX size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-sm font-medium">Product Name *</label>
                  <input value={form.name} onChange={e => setField('name', e.target.value)} required className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black" />
                </div>
                <div>
                  <label className="text-sm font-medium">Price (LKR) *</label>
                  <input type="number" value={form.price} onChange={e => setField('price', e.target.value)} required className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black" />
                </div>
                <div>
                  <label className="text-sm font-medium">Collection</label>
                  <select value={form.collection_id} onChange={e => setField('collection_id', e.target.value)} className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black">
                    <option value="">— None —</option>
                    {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea value={form.description} onChange={e => setField('description', e.target.value)} rows={3} className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black resize-none" />
              </div>
              <div>
                <label className="text-sm font-medium">Images (up to 5 URLs)</label>
                {form.images.map((img, i) => (
                  <input
                    key={i}
                    value={img}
                    onChange={e => setImage(i, e.target.value)}
                    placeholder={i === 0 ? 'Image 1 URL (required)' : `Image ${i + 1} URL (optional)`}
                    className="w-full mt-1 mb-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-black"
                  />
                ))}
              </div>
              <VariantEditor variants={form.variants} onChange={v => setField('variants', v)} />
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-sm font-medium">Sort Order</label>
                  <input type="number" value={form.sort_order} onChange={e => setField('sort_order', e.target.value)} className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black" />
                </div>
                <div className="flex items-center gap-2 mt-5">
                  <input id="featured" type="checkbox" checked={form.is_featured} onChange={e => setField('is_featured', e.target.checked)} className="w-4 h-4 accent-black" />
                  <label htmlFor="featured" className="text-sm font-medium">Featured</label>
                </div>
              </div>
              <button type="submit" disabled={saving} className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-700 disabled:opacity-50">
                {saving ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}