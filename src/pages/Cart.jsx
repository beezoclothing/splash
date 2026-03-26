import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCart, saveCart } from '../lib/supabase'
import { FiTrash2, FiArrowRight } from 'react-icons/fi'

export default function Cart() {
  const [cart, setCart]     = useState([])
  const [delivery, setDelivery] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    setCart(getCart())
    // Load delivery charge
    import('../lib/supabase').then(({ supabase }) => {
      supabase.from('settings').select('value').eq('key', 'delivery').single()
        .then(({ data }) => { if (data?.value?.charge) setDelivery(Number(data.value.charge)) })
    })
  }, [])

  function updateQty(i, qty) {
    const updated = [...cart]
    if (qty < 1) return
    updated[i].qty = qty
    saveCart(updated)
    setCart(updated)
    window.dispatchEvent(new Event('cart-updated'))
  }

  function remove(i) {
    const updated = cart.filter((_, idx) => idx !== i)
    saveCart(updated)
    setCart(updated)
    window.dispatchEvent(new Event('cart-updated'))
  }

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const total    = subtotal + delivery

  if (cart.length === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="font-display text-4xl tracking-widest mb-4">Your Cart is Empty</p>
      <Link to="/" className="inline-block mt-4 px-8 py-3 rounded-xl text-white font-semibold"
        style={{ backgroundColor: 'var(--color-primary)' }}>
        Continue Shopping
      </Link>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-display text-4xl tracking-widest mb-8">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item, i) => (
            <div key={i} className="flex gap-4 bg-white rounded-xl p-4 shadow-sm">
              <img
                src={item.image || 'https://placehold.co/100x120'}
                alt={item.name}
                className="w-24 h-28 object-cover rounded-lg shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{item.name}</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {[item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`].filter(Boolean).join(' · ')}
                </p>
                <p className="font-semibold mt-1" style={{ color: 'var(--color-accent)' }}>
                  LKR {Number(item.price).toLocaleString()}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <button onClick={() => updateQty(i, item.qty - 1)} className="w-7 h-7 border border-gray-300 rounded flex items-center justify-center text-sm hover:border-black">−</button>
                  <span className="text-sm font-semibold">{item.qty}</span>
                  <button onClick={() => updateQty(i, item.qty + 1)} className="w-7 h-7 border border-gray-300 rounded flex items-center justify-center text-sm hover:border-black">+</button>
                </div>
              </div>
              <button onClick={() => remove(i)} className="text-gray-400 hover:text-red-500 transition-colors self-start">
                <FiTrash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm h-fit space-y-3">
          <h2 className="font-display text-2xl tracking-widest">Summary</h2>
          <div className="flex justify-between text-sm"><span>Subtotal</span><span>LKR {subtotal.toLocaleString()}</span></div>
          <div className="flex justify-between text-sm"><span>Delivery</span><span>{delivery === 0 ? 'Free' : `LKR ${delivery.toLocaleString()}`}</span></div>
          <div className="border-t pt-3 flex justify-between font-semibold">
            <span>Total</span>
            <span>LKR {total.toLocaleString()}</span>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white mt-2 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Checkout <FiArrowRight />
          </button>
        </div>
      </div>
    </div>
  )
}