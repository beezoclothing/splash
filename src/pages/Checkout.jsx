import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, getCart, clearCart, getCurrentUser } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function Checkout() {
  const navigate = useNavigate()
  const [cart, setCart]             = useState([])
  const [delivery, setDelivery]     = useState(0)
  const [bankDetails, setBankDetails] = useState(null)
  const [payMethod, setPayMethod]   = useState('cod')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm]             = useState({
    name: '', email: '', phone: '', address: '', city: '', note: ''
  })

  useEffect(() => {
    setCart(getCart())
    async function loadSettings() {
      const [{ data: d }, { data: b }, user] = await Promise.all([
        supabase.from('settings').select('value').eq('key', 'delivery').single(),
        supabase.from('settings').select('value').eq('key', 'bank_details').single(),
        getCurrentUser(),
      ])
      if (d?.value?.charge) setDelivery(Number(d.value.charge))
      if (b?.value) setBankDetails(b.value)
      if (user) setForm(f => ({ ...f, email: user.email || '' }))
    }
    loadSettings()
  }, [])

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const total    = subtotal + delivery

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handlePayHere() {
    const orderId = `SPL-${Date.now()}`
    const user = await getCurrentUser()
    // Insert order first
    await supabase.from('orders').insert({
      user_id: user?.id || null,
      customer: form,
      items: cart,
      subtotal,
      delivery_charge: delivery,
      total,
      payment_method: 'payhere',
      status: 'pending_payment',
    })
    // PayHere integration — replace MERCHANT_ID and live URL as needed
    const params = {
      merchant_id: import.meta.env.VITE_PAYHERE_MERCHANT_ID || '1230072',
      return_url: `${window.location.origin}/`,
      cancel_url: `${window.location.origin}/checkout`,
      notify_url: `${import.meta.env.VITE_PAYHERE_NOTIFY_URL || window.location.origin}/api/payhere-notify`,
      order_id: orderId,
      items: cart.map(i => i.name).join(', '),
      currency: 'LKR',
      amount: total.toFixed(2),
      first_name: form.name.split(' ')[0] || form.name,
      last_name: form.name.split(' ').slice(1).join(' ') || '.',
      email: form.email,
      phone: form.phone,
      address: form.address,
      city: form.city,
      country: 'Sri Lanka',
    }
    // Build form and submit
    const f = document.createElement('form')
    f.method = 'POST'
    f.action = 'https://sandbox.payhere.lk/pay/checkout' // change to live URL in production
    Object.entries(params).forEach(([k, v]) => {
      const input = document.createElement('input')
      input.type = 'hidden'; input.name = k; input.value = v
      f.appendChild(input)
    })
    document.body.appendChild(f)
    f.submit()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.phone || !form.address) return toast.error('Please fill all required fields')
    if (cart.length === 0) return toast.error('Your cart is empty')

    if (payMethod === 'payhere') {
      handlePayHere()
      return
    }

    if (payMethod === 'bank') {
      // Save order first, then redirect to screenshot upload
      setSubmitting(true)
      const user = await getCurrentUser()
      const { data: order } = await supabase.from('orders').insert({
        user_id: user?.id || null,
        customer: form,
        items: cart,
        subtotal,
        delivery_charge: delivery,
        total,
        payment_method: 'bank',
        status: 'awaiting_payment',
      }).select().single()
      setSubmitting(false)
      if (order) {
        navigate('/payment-upload', { state: { orderId: order.id, bankDetails, total } })
      }
      return
    }

    // COD
    setSubmitting(true)
    const user = await getCurrentUser()
    await supabase.from('orders').insert({
      user_id: user?.id || null,
      customer: form,
      items: cart,
      subtotal,
      delivery_charge: delivery,
      total,
      payment_method: 'cod',
      status: 'confirmed',
    })
    clearCart()
    window.dispatchEvent(new Event('cart-updated'))
    setSubmitting(false)
    toast.success('Order placed! We will contact you shortly.')
    navigate('/')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-display text-4xl tracking-widest mb-8">Checkout</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-lg">Delivery Details</h2>
            {[
              { name: 'name', label: 'Full Name *', type: 'text' },
              { name: 'email', label: 'Email', type: 'email' },
              { name: 'phone', label: 'Phone *', type: 'tel' },
              { name: 'address', label: 'Address *', type: 'text' },
              { name: 'city', label: 'City', type: 'text' },
            ].map(f => (
              <div key={f.name}>
                <label className="text-sm font-medium text-gray-700">{f.label}</label>
                <input
                  name={f.name}
                  type={f.type}
                  value={form[f.name]}
                  onChange={handleChange}
                  className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black transition-colors"
                />
              </div>
            ))}
            <div>
              <label className="text-sm font-medium text-gray-700">Order Note</label>
              <textarea
                name="note"
                value={form.note}
                onChange={handleChange}
                rows={2}
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black transition-colors resize-none"
              />
            </div>
          </div>

          {/* Payment method */}
          <div className="bg-white rounded-xl p-6 shadow-sm space-y-3">
            <h2 className="font-semibold text-lg">Payment Method</h2>
            {[
              { value: 'cod', label: '💵 Cash on Delivery' },
              { value: 'bank', label: '🏦 Bank Transfer' },
              { value: 'payhere', label: '💳 Pay Online (PayHere)' },
            ].map(opt => (
              <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value={opt.value}
                  checked={payMethod === opt.value}
                  onChange={() => setPayMethod(opt.value)}
                  className="accent-black"
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}

            {payMethod === 'bank' && bankDetails && (
              <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm space-y-1">
                <p className="font-semibold">Bank Transfer Details</p>
                {bankDetails.bank_name   && <p>Bank: {bankDetails.bank_name}</p>}
                {bankDetails.account_name && <p>Account Name: {bankDetails.account_name}</p>}
                {bankDetails.account_no  && <p>Account No: {bankDetails.account_no}</p>}
                {bankDetails.branch      && <p>Branch: {bankDetails.branch}</p>}
                <p className="text-gray-500 pt-1">After placing order, you will be asked to upload your payment screenshot.</p>
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm h-fit space-y-3">
          <h2 className="font-display text-2xl tracking-widest">Order Summary</h2>
          {cart.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="truncate mr-2">{item.name} × {item.qty}</span>
              <span className="shrink-0">LKR {(item.price * item.qty).toLocaleString()}</span>
            </div>
          ))}
          <div className="border-t pt-2 flex justify-between text-sm"><span>Delivery</span><span>{delivery === 0 ? 'Free' : `LKR ${delivery.toLocaleString()}`}</span></div>
          <div className="flex justify-between font-semibold"><span>Total</span><span>LKR {total.toLocaleString()}</span></div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {submitting ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </form>
    </div>
  )
}