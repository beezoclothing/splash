import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { applyTheme } from './lib/theme'
import { supabase } from './lib/supabase'

import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import PaymentUpload from './pages/PaymentUpload'
import Auth from './pages/Auth'
import PolicyPage from './pages/PolicyPage'

import AdminLayout from './admin/AdminLayout'
import Dashboard from './admin/Dashboard'
import Products from './admin/Products'
import Orders from './admin/Orders'
import Banners from './admin/Banners'
import ThemeSettings from './admin/ThemeSettings'
import Categories from './admin/Categories'
import Collections from './admin/Collections'
import HomepageCustomize from './admin/HomepageCustomize'
import DeliverySettings from './admin/DeliverySettings'
import BankDetails from './admin/BankDetails'
import Policies from './admin/Policies'
import SocialContact from './admin/SocialContact'

function StoreFront() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment-upload" element={<PaymentUpload />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/policy/:slug" element={<PolicyPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  useEffect(() => {
    // Load theme from Supabase on mount
    async function loadTheme() {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'theme')
        .single()
      if (data?.value) applyTheme(data.value)
    }
    loadTheme()
  }, [])

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/admin/*" element={
          <AdminLayout>
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="orders" element={<Orders />} />
              <Route path="banners" element={<Banners />} />
              <Route path="theme" element={<ThemeSettings />} />
              <Route path="categories" element={<Categories />} />
              <Route path="collections" element={<Collections />} />
              <Route path="homepage" element={<HomepageCustomize />} />
              <Route path="delivery" element={<DeliverySettings />} />
              <Route path="bank" element={<BankDetails />} />
              <Route path="policies" element={<Policies />} />
              <Route path="social" element={<SocialContact />} />
            </Routes>
          </AdminLayout>
        } />
        <Route path="/*" element={<StoreFront />} />
      </Routes>
    </BrowserRouter>
  )
}