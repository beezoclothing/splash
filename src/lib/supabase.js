import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── Cart helpers (localStorage) ──────────────────────────
export function getCart() {
  try { return JSON.parse(localStorage.getItem('splash_cart') || '[]') }
  catch { return [] }
}

export function saveCart(cart) {
  localStorage.setItem('splash_cart', JSON.stringify(cart))
}

export function addToCart(item) {
  const cart = getCart()
  const idx = cart.findIndex(
    c => c.product_id === item.product_id &&
         c.size === item.size &&
         c.color === item.color
  )
  if (idx > -1) {
    cart[idx].qty += item.qty
  } else {
    cart.push(item)
  }
  saveCart(cart)
  return cart
}

export function removeFromCart(index) {
  const cart = getCart()
  cart.splice(index, 1)
  saveCart(cart)
  return cart
}

export function clearCart() {
  localStorage.removeItem('splash_cart')
}

// ─── Auth helpers ──────────────────────────────────────────
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// ─── Settings helper ───────────────────────────────────────
export async function getSetting(key) {
  const { data } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .single()
  return data?.value ?? null
}

export async function setSetting(key, value) {
  const { error } = await supabase
    .from('settings')
    .upsert({ key, value }, { onConflict: 'key' })
  return error
}
