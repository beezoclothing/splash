import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase, addToCart } from '../lib/supabase'
import toast from 'react-hot-toast'
import { FiShoppingBag, FiChevronLeft, FiChevronRight } from 'react-icons/fi'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct]     = useState(null)
  const [related, setRelated]     = useState([])
  const [imgIdx, setImgIdx]       = useState(0)
  const [selSize, setSelSize]     = useState('')
  const [selColor, setSelColor]   = useState('')
  const [qty, setQty]             = useState(1)
  const [loading, setLoading]     = useState(true)

  useEffect(() => { load() }, [id])

  async function load() {
    setLoading(true)
    const { data: p } = await supabase
      .from('products')
      .select('*, collections(id,name)')
      .eq('id', id)
      .single()
    if (p) {
      setProduct(p)
      setImgIdx(0)
      setSelSize('')
      setSelColor('')
      // Related products (same collection)
      if (p.collection_id) {
        const { data: rel } = await supabase
          .from('products')
          .select('id,name,price,images')
          .eq('collection_id', p.collection_id)
          .neq('id', id)
          .limit(6)
        if (rel) setRelated(rel)
      }
    }
    setLoading(false)
  }

  function handleAddToCart() {
    if (!product) return
    const variants = product.variants || []
    if (variants.length > 0) {
      const sizeOpts  = [...new Set(variants.map(v => v.size).filter(Boolean))]
      const colorOpts = [...new Set(variants.map(v => v.color).filter(Boolean))]
      if (sizeOpts.length  > 0 && !selSize)  return toast.error('Please select a size')
      if (colorOpts.length > 0 && !selColor) return toast.error('Please select a color')
      // Check stock
      const match = variants.find(v => v.size === selSize && v.color === selColor)
      if (match && match.stock < qty) return toast.error('Not enough stock')
    }
    addToCart({
      product_id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '',
      size: selSize,
      color: selColor,
      qty,
    })
    window.dispatchEvent(new Event('cart-updated'))
    toast.success('Added to cart!')
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full" />
    </div>
  )
  if (!product) return <div className="p-8 text-center">Product not found.</div>

  const images   = product.images?.filter(Boolean) || []
  const variants = product.variants || []
  const sizeOpts  = [...new Set(variants.map(v => v.size).filter(Boolean))]
  const colorOpts = [...new Set(variants.map(v => v.color).filter(Boolean))]

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* Images */}
        <div>
          <div className="relative aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden">
            <img
              src={images[imgIdx] || 'https://placehold.co/600x800'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/70 text-white rounded-full flex items-center justify-center"
                >
                  <FiChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setImgIdx(i => (i + 1) % images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/70 text-white rounded-full flex items-center justify-center"
                >
                  <FiChevronRight size={16} />
                </button>
              </>
            )}
          </div>
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 mt-3">
              {images.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`w-16 h-20 rounded-lg overflow-hidden border-2 transition-all ${imgIdx === i ? 'border-black' : 'border-transparent'}`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            {product.collections?.name && (
              <p className="text-xs tracking-widest uppercase text-gray-400 mb-1">
                {product.collections.name}
              </p>
            )}
            <h1 className="font-display text-4xl tracking-wide">{product.name}</h1>
            <p className="text-2xl font-semibold mt-2" style={{ color: 'var(--color-accent)' }}>
              LKR {Number(product.price).toLocaleString()}
            </p>
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          )}

          {/* Size picker */}
          {sizeOpts.length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-2">Size</p>
              <div className="flex flex-wrap gap-2">
                {sizeOpts.map(s => (
                  <button
                    key={s}
                    onClick={() => setSelSize(s)}
                    className={`px-4 py-2 text-sm border rounded-lg transition-all ${
                      selSize === s
                        ? 'bg-black text-white border-black'
                        : 'border-gray-300 hover:border-black'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color picker */}
          {colorOpts.length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-2">Color</p>
              <div className="flex flex-wrap gap-2">
                {colorOpts.map(c => (
                  <button
                    key={c}
                    onClick={() => setSelColor(c)}
                    className={`px-4 py-2 text-sm border rounded-lg transition-all ${
                      selColor === c
                        ? 'bg-black text-white border-black'
                        : 'border-gray-300 hover:border-black'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <p className="text-sm font-semibold mb-2">Quantity</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-9 h-9 border border-gray-300 rounded-lg hover:border-black flex items-center justify-center font-bold"
              >
                −
              </button>
              <span className="w-8 text-center font-semibold">{qty}</span>
              <button
                onClick={() => setQty(q => q + 1)}
                className="w-9 h-9 border border-gray-300 rounded-lg hover:border-black flex items-center justify-center font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-white tracking-wide transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <FiShoppingBag size={18} />
            Add to Cart
          </button>
        </div>
      </div>

      {/* Recommended */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl tracking-widest mb-5">You May Also Like</h2>
          <div className="scroll-row">
            {related.map(p => (
              <Link key={p.id} to={`/product/${p.id}`} className="group block shrink-0 w-48">
                <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={p.images?.[0] || 'https://placehold.co/300x400'}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <p className="mt-2 text-sm font-medium truncate">{p.name}</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>
                  LKR {Number(p.price).toLocaleString()}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}