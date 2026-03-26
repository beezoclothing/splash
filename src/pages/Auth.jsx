import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function Auth() {
  const navigate  = useNavigate()
  const [mode, setMode]     = useState('login') // 'login' | 'signup'
  const [email, setEmail]   = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [user, setUser]         = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) toast.error(error.message)
      else toast.success('Account created! Check your email to confirm.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) toast.error(error.message)
      else { toast.success('Welcome back!'); navigate('/') }
    }
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
    toast.success('Logged out')
  }

  if (user) return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl mx-auto mb-4">👤</div>
      <h1 className="font-display text-3xl tracking-widest mb-1">Hello!</h1>
      <p className="text-gray-500 text-sm mb-6">{user.email}</p>
      <button
        onClick={handleLogout}
        className="px-8 py-3 rounded-xl font-semibold text-white hover:opacity-90 transition-opacity"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        Log Out
      </button>
    </div>
  )

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <h1 className="font-display text-4xl tracking-widest mb-2">
        {mode === 'login' ? 'Welcome Back' : 'Create Account'}
      </h1>
      <p className="text-gray-400 text-sm mb-8">
        {mode === 'login' ? 'Sign in to your account' : 'Sign up to track your orders'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Email</label>
          <input
            type="email" required value={email} onChange={e => setEmail(e.target.value)}
            className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black transition-colors"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Password</label>
          <input
            type="password" required value={password} onChange={e => setPassword(e.target.value)}
            className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black transition-colors"
          />
        </div>
        <button
          type="submit" disabled={loading}
          className="w-full py-3 rounded-xl font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
        </button>
      </form>

      <p className="text-sm text-center mt-6 text-gray-500">
        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
        <button
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          className="font-semibold underline text-black"
        >
          {mode === 'login' ? 'Sign Up' : 'Sign In'}
        </button>
      </p>
    </div>
  )
}