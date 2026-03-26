import React, { useEffect, useState, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

// ─── Banner Slider ─────────────────────────────────────────
function BannerSlider({ banners }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 4000 })])
  const prev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const next = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  if (!banners?.length) return null

  return (
    <div className="relative overflow-hidden" ref={emblaRef}>
      <div className="flex">
        {banners.map((url, i) => (
          <div key={i} className="min-w-0 flex-[0_0_100%]">
            <img src={url} alt={`Banner ${i + 1}`} className="w-full h-64 md:h-[480px] object-cover" />
          </div>
        ))}
      </div>
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
      >
        <FiChevronLeft size={18} />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
      >
        <FiChevronRight size={18} />
      </button>
    </div>
  )
}

// ─── Product Card ──────────────────────────────────────────
function ProductCard({ product }) {
  return (
    <Link
      to={`/product/${product.id}`}
      className="group block shrink-0 w-48 md:w-56"
    >
      <div className="aspect-[3/4] bg-gray-100 overflow-hidden rounded-lg">
        <img
          src={product.images?.[0] || 'https://placehold.co/300x400?text=No+Image'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="mt-2">
        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
        <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--color-accent)' }}>
          LKR {Number(product.price).toLocaleString()}
        </p>
      </div>
    </Link>
  )
}

// ─── Collection Row ────────────────────────────────────────
function CollectionRow({ row, products }) {
  const rowProducts = products.filter(p => p.collection_id === row.collection_id)
  if (!rowProducts.length) return null

  return (
    <section className="mt-12 px-4 max-w-7xl mx-auto">
      <h2 className="font-display text-2xl md:text-3xl tracking-widest mb-4">{row.title}</h2>
      <div className="scroll-row">
        {rowProducts.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  )
}

// ─── Main Home ─────────────────────────────────────────────
export default function Home() {
  const [searchParams] = useSearchParams()
  const [banners, setBanners]         = useState([])
  const [featured, setFeatured]       = useState({ title: 'Featured', product_ids: [] })
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [collectionRows, setCollectionRows] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [filtered, setFiltered]       = useState([])
  const [loading, setLoading]         = useState(true)

  const search   = searchParams.get('search')
  const category = searchParams.get('category')
  const collection = searchParams.get('collection')

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    const [
      { data: bannerData },
      { data: featuredData },
      { data: rowsData },
      { data: products },
    ] = await Promise.all([
      supabase.from('settings').select('value').eq('key', 'banners').single(),
      supabase.from('settings').select('value').eq('key', 'featured_section').single(),
      supabase.from('settings').select('value').eq('key', 'collection_rows').single(),
      supabase.from('products').select('*, collections(id,name,slug,categories(id,slug))').order('sort_order'),
    ])

    if (bannerData?.value) setBanners(bannerData.value)
    if (featuredData?.value) setFeatured(featuredData.value)
    if (rowsData?.value) setCollectionRows(rowsData.value)
    if (products) {
      setAllProducts(products)
      if (featuredData?.value?.product_ids?.length) {
        setFeaturedProducts(products.filter(p => featuredData.value.product_ids.includes(p.id)))
      }
    }
    setLoading(false)
  }

  // Filtering
  useEffect(() => {
    let result = [...allProducts]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
    }
    if (collection) {
      result = result.filter(p => p.collections?.slug === collection)
    }
    if (category) {
      result = result.filter(p => p.collections?.categories?.slug === category)
    }
    setFiltered(result)
  }, [search, category, collection, allProducts])

  const isFiltering = search || category || collection

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full" />
    </div>
  )

  // Show filtered results
  if (isFiltering) return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl tracking-widest mb-6">
        {search ? `Results for "${search}"` : category || collection}
      </h1>
      {filtered.length === 0 ? (
        <p className="text-gray-500">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map(p => (
            <Link key={p.id} to={`/product/${p.id}`} className="group">
              <div className="aspect-[3/4] bg-gray-100 overflow-hidden rounded-lg">
                <img
                  src={p.images?.[0] || 'https://placehold.co/300x400'}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <p className="mt-2 text-sm font-medium">{p.name}</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>
                LKR {Number(p.price).toLocaleString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div>
      {/* Banner */}
      <BannerSlider banners={banners} />

      {/* Featured Section */}
      {featuredProducts.length > 0 && (
        <section className="mt-12 px-4 max-w-7xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl tracking-widest mb-4">
            {featured.title || 'Featured'}
          </h2>
          <div className="scroll-row">
            {featuredProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Collection Rows */}
      {collectionRows.map((row, i) => (
        <CollectionRow key={i} row={row} products={allProducts} />
      ))}

      <div className="h-16" />
    </div>
  )
}
