import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  FiGrid, FiPackage, FiShoppingBag, FiImage, FiSettings,
  FiTag, FiLayers, FiHome, FiTruck, FiDollarSign,
  FiFileText, FiShare2, FiLogOut, FiMenu, FiX
} from 'react-icons/fi'

const NAV = [
  { path: '/admin',             label: 'Dashboard',   icon: FiGrid },
  { path: '/admin/products',    label: 'Products',    icon: FiPackage },
  { path: '/admin/orders',      label: 'Orders',      icon: FiShoppingBag },
  { path: '/admin/banners',     label: 'Banners',     icon: FiImage },
  { path: '/admin/categories',  label: 'Categories',  icon: FiTag },
  { path: '/admin/collections', label: 'Collections', icon: FiLayers },
  { path: '/admin/homepage',    label: 'Homepage',    icon: FiHome },
  { path: '/admin/delivery',    label: 'Delivery',    icon: FiTruck },
  { path: '/admin/bank',        label: 'Bank Details',icon: FiDollarSign },
  { path: '/admin/policies',    label: 'Policies',    icon: FiFileText },
  { path: '/admin/social',      label: 'Social',      icon: FiShare2 },
  { path: '/admin/theme',       label: 'Theme',       icon: FiSettings },
]

export default function AdminLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Basic admin guard — replace with your email/role check
    supabase.auth.getUser().then(({ data: { user } }) => {
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL
      if (!user || (adminEmail && user.email !== adminEmail)) {
        // For development: comment out the redirect below
        // navigate('/')
      }
      setChecking(false)
    })
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (checking) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full" />
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-60 bg-gray-900 text-white flex flex-col transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/10">
          <span className="font-display text-xl tracking-widest" style={{ color: 'var(--color-accent)' }}>
            Admin Panel
          </span>
          <button className="lg:hidden text-white/60" onClick={() => setSidebarOpen(false)}>
            <FiX size={18} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-3">
          {NAV.map(({ path, label, icon: Icon }) => {
            const active = path === '/admin'
              ? location.pathname === '/admin'
              : location.pathname.startsWith(path)
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                  active ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            )
          })}
        </nav>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-5 py-4 text-sm text-white/40 hover:text-white border-t border-white/10 transition-colors"
        >
          <FiLogOut size={16} /> Log Out
        </button>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 gap-3">
          <button className="lg:hidden text-gray-600" onClick={() => setSidebarOpen(true)}>
            <FiMenu size={20} />
          </button>
          <Link to="/" className="text-sm text-gray-400 hover:text-black transition-colors">
            ← View Store
          </Link>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
