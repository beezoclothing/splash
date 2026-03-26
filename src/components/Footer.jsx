import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  FaInstagram, FaFacebookF, FaTiktok, FaWhatsapp, FaYoutube, FaTwitter
} from 'react-icons/fa'

const SOCIAL_ICONS = {
  instagram: FaInstagram,
  facebook: FaFacebookF,
  tiktok: FaTiktok,
  whatsapp: FaWhatsapp,
  youtube: FaYoutube,
  twitter: FaTwitter,
}

export default function Footer() {
  const [settings, setSettings] = useState({})
  const [social, setSocial]     = useState({})
  const [contact, setContact]   = useState({})

  useEffect(() => {
    async function load() {
      const [{ data: theme }, { data: sc }] = await Promise.all([
        supabase.from('settings').select('value').eq('key', 'theme').single(),
        supabase.from('settings').select('value').eq('key', 'social_contact').single(),
      ])
      if (theme?.value) setSettings(theme.value)
      if (sc?.value) {
        setSocial(sc.value.social || {})
        setContact(sc.value.contact || {})
      }
    }
    load()
  }, [])

  const storeName = settings.storeName || 'Splash Men'

  return (
    <footer style={{ backgroundColor: 'var(--color-primary)' }} className="text-white/80 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand */}
        <div className="space-y-4">
          {settings.logoUrl
            ? <img src={settings.logoUrl} alt={storeName} className="h-10 object-contain" />
            : <span className="font-display text-3xl tracking-widest" style={{ color: 'var(--color-accent)' }}>
                {storeName}
              </span>
          }
          <p className="text-sm leading-relaxed text-white/50">
            {contact.about || 'Premium men\'s fashion — crafted for the bold.'}
          </p>
          {/* Social icons */}
          <div className="flex gap-3 pt-1">
            {Object.entries(social).map(([platform, url]) => {
              if (!url) return null
              const Icon = SOCIAL_ICONS[platform]
              if (!Icon) return null
              return (
                
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:border-white/60 transition-colors text-sm"
                >
                  <Icon />
                </a>
              )
            })}
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="font-display text-xl tracking-widest text-white mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link to="/auth" className="hover:text-white transition-colors">My Account</Link></li>
            <li><Link to="/cart" className="hover:text-white transition-colors">Cart</Link></li>
          </ul>
        </div>

        {/* Policies */}
        <div>
          <h4 className="font-display text-xl tracking-widest text-white mb-4">Policies</h4>
          <ul className="space-y-2 text-sm">
            {['privacy','terms','return','refund','delivery'].map(slug => (
              <li key={slug}>
                <Link to={`/policy/${slug}`} className="hover:text-white transition-colors capitalize">
                  {slug.charAt(0).toUpperCase() + slug.slice(1)} Policy
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-display text-xl tracking-widest text-white mb-4">Contact</h4>
          <ul className="space-y-2 text-sm">
            {contact.phone   && <li>📞 {contact.phone}</li>}
            {contact.email   && <li>✉️ {contact.email}</li>}
            {contact.address && <li>📍 {contact.address}</li>}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-white/30">
        © {new Date().getFullYear()} {storeName}. All rights reserved.
      </div>
    </footer>
  )
}
