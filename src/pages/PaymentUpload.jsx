import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase, clearCart } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function PaymentUpload() {
  const { state } = useLocation()
  const navigate  = useNavigate()
  const [screenshotUrl, setScreenshotUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { orderId, bankDetails, total } = state || {}

  async function handleSubmit(e) {
    e.preventDefault()
    if (!screenshotUrl.trim()) return toast.error('Please paste your screenshot URL')
    if (!screenshotUrl.startsWith('http')) return toast.error('Please enter a valid image URL')
    setSubmitting(true)
    await supabase
      .from('orders')
      .update({ payment_screenshot: screenshotUrl, status: 'payment_uploaded' })
      .eq('id', orderId)
    clearCart()
    window.dispatchEvent(new Event('cart-updated'))
    setSubmitting(false)
    toast.success('Payment screenshot submitted! We will verify and confirm your order.')
    navigate('/')
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <h1 className="font-display text-4xl tracking-widest mb-2">Upload Payment</h1>
      <p className="text-gray-500 text-sm mb-8">
        Transfer <strong>LKR {total?.toLocaleString()}</strong> to the bank account below, then paste your payment screenshot URL.
      </p>

      {bankDetails && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm space-y-1 mb-6">
          <p className="font-semibold text-base mb-2">Bank Details</p>
          {bankDetails.bank_name    && <p>Bank: {bankDetails.bank_name}</p>}
          {bankDetails.account_name && <p>Account Name: {bankDetails.account_name}</p>}
          {bankDetails.account_no   && <p>Account No: {bankDetails.account_no}</p>}
          {bankDetails.branch       && <p>Branch: {bankDetails.branch}</p>}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Payment Screenshot URL</label>
          <p className="text-xs text-gray-400 mb-1">Upload your screenshot to PostImages.org or Imgur and paste the direct image link here</p>
          <input
            type="url"
            value={screenshotUrl}
            onChange={e => setScreenshotUrl(e.target.value)}
            placeholder="https://i.postimg.cc/..."
            className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black transition-colors"
          />
        </div>
        {screenshotUrl && screenshotUrl.startsWith('http') && (
          <img src={screenshotUrl} alt="Preview" className="w-full max-h-64 object-contain rounded-lg border" />
        )}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-xl font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          {submitting ? 'Submitting...' : 'Submit Payment Proof'}
        </button>
      </form>
    </div>
  )
}