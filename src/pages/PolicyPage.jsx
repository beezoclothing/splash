import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const POLICY_TITLES = {
  privacy: 'Privacy Policy',
  terms: 'Terms & Conditions',
  return: 'Return Policy',
  refund: 'Refund Policy',
  delivery: 'Delivery Policy',
}

export default function PolicyPage() {
  const { slug } = useParams()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', `policy_${slug}`)
        .single()
      setContent(data?.value?.content || 'No content yet.')
      setLoading(false)
    }
    load()
  }, [slug])

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-display text-4xl tracking-widest mb-8">
        {POLICY_TITLES[slug] || 'Policy'}
      </h1>
      {loading
        ? <div className="animate-pulse h-4 bg-gray-200 rounded w-2/3" />
        : <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
            {content}
          </div>
      }
    </div>
  )
}