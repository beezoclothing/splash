import React, { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase, getCart } from '../lib/supabase'
import { FiSearch, FiShoppingBag, FiUser, FiMenu, FiX, FiChevronDown } from 'react-icons/fi'

export default function Header() {
  const [settings, setSettings]     = useState({})
  const [categories, setCategories] = useState([])
  const [collections, setCollections] = useState([])
  const [cartCount, setCartCount]   = useState(0)
  const [user, setUser]             = useState(null)
  const [menuOpen, setMenuOpen]     = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeDropdown, setActiveDropdown] = useState(null)
  const navigate = useNavigate()
  const searchRef = useRef(null)

  useEffect(() => {
    loadData()
    updateCartCount()
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))

    // Listen for cart changes
    window.addEventListener('cart-updated', updateCartCount)
    return () => window.removeEventListener('cart-updated', updateCartCount)
  }, [])

  async function loadData() {
    const [{ data: s }, { data: cats }, { data: cols }] = await Promise.all([
      supabase.from('settings').select('value').eq('key', 'theme').single(),
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('collections').select('*').order('sort_order'),
    ])
    if (s?.value) setSettings(s.value)
    if (cats) setCategories(cats)
    if (cols) setCollections(cols)
  }

  function updateCartCount() {
    setCartCount(getCart().length)
  }

  function handleSearch(e) {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const storeName = settings.storeName || 'Splash Men'
  const logoUrl   = settings.logoUrl   || ''

  return (
    <header style={{ backgroundColor: 'var(--color-primary)' }} className="sticky top-0 z-50">
      {/* Top bar */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Mobile hamburger */}
        <button
          className="lg:hidden text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          {logoUrl
            ? <img src={logoUrl} alt={storeName} className="h-9 object-contain" />
            : <span className="font-display text-2xl tracking-widest" style={{ color: 'var(--color-accent)' }}>
                {storeName}
              </span>
          }
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
          {categories.map(cat => {
            const catCols = collections.filter(c => c.category_id === cat.id)
            return (
              <div
                key={cat.id}
                className="relative"
                onMouseEnter={() => setActiveDropdown(cat.id)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  to={`/?category=${cat.slug}`}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
                >
                  {cat.name}
                  {catCols.length > 0 && <FiChevronDown size={13} />}
                </Link>
                {catCols.length > 0 && activeDropdown === cat.id && (
                  <div className="absolute top-full left-0 bg-white shadow-xl rounded-b-lg min-w-[180px] py-2 z-50">
                    {catCols.map(col => (
                      <Link
                        key={col.id}
                        to={`/?collection=${col.slug}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black"
                        onClick={() => setActiveDropdown(null)}
                      >
                        {col.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <button
              onClick={() => { setSearchOpen(!searchOpen); setTimeout(() => searchRef.current?.focus(), 50) }}
              className="text-white/80 hover:text-white transition-colors"
            >
              <FiSearch size={20} />
            </button>
            {searchOpen && (
              <form
                onSubmit={handleSearch}
                className="absolute right-0 top-8 bg-white rounded-lg shadow-xl overflow-hidden flex"
                style={{ width: '280px' }}
              >
                <input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 px-4 py-2 text-sm text-gray-800 outline-none"
                />
                <button type="submit" className="px-3 text-gray-500 hover:text-black">
                  <FiSearch size={16} />
                </button>
              </form>
            )}
          </div>

          {/* Auth */}
          <Link to="/auth" className="text-white/80 hover:text-white transition-colors">
            <FiUser size={20} />
          </Link>

          {/* Cart */}
          <Link to="/cart" className="relative text-white/80 hover:text-white transition-colors">
            <FiShoppingBag size={20} />
            {cartCount > 0 && (
              <span
                className="absolute -top-2 -right-2 text-xs font-bold text-white w-4 h-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-accent)' }}
              >
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-black/95 border-t border-white/10 px-4 pb-4">
          {categories.map(cat => {
            const catCols = collections.filter(c => c.category_id === cat.id)
            return (
              <div key={cat.id}>
                <Link
                  to={`/?category=${cat.slug}`}
                  className="block py-3 text-white font-medium border-b border-white/10"
                  onClick={() => setMenuOpen(false)}
                >
                  {cat.name}
                </Link>
                {catCols.map(col => (
                  <Link
                    key={col.id}
                    to={`/?collection=${col.slug}`}
                    className="block py-2 pl-4 text-white/60 text-sm"
                    onClick={() => setMenuOpen(false)}
                  >
                    {col.name}
                  </Link>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </header>
  )
}
