'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

const searchLinks = [
  { name: 'Home', href: '/' },
  { name: 'Trending', href: '/trending' },
  { name: 'Watchlist', href: '/watchlist' },
  { name: 'Dashboard', href: '/dashboard' },
]

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchCloseBtnRef = useRef<HTMLButtonElement>(null)
  const router = useRouter()

  const filteredLinks = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return searchLinks
    return searchLinks.filter((link) => link.name.toLowerCase().includes(query))
  }, [searchQuery])

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  const handleLinkClick = (href: string) => {
    onClose()
    router.push(href)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-start justify-center pt-[20vh] p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Close search modal"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="search-title"
            className="relative w-full max-w-2xl rounded-2xl border border-white/15 dark:border-white/10 bg-white/75 dark:bg-zinc-950/55 backdrop-blur-2xl shadow-2xl"
            initial={{ y: 10, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 10, scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <Search className="w-5 h-5 text-zinc-500" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search pages, movies, trending content..."
                  className="flex-1 bg-transparent text-zinc-950 dark:text-white placeholder-zinc-500 outline-none text-base"
                  id="search-input"
                />
                <button
                  ref={searchCloseBtnRef}
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-zinc-800 dark:text-zinc-200 hover:bg-white/30 dark:hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
                  aria-label="Close search"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="border-t border-white/10 dark:border-white/5 pt-4">
                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-3">
                  Quick navigation
                </div>
                <div className="grid gap-1">
                  {filteredLinks.map((link) => (
                    <button
                      key={link.href}
                      onClick={() => handleLinkClick(link.href)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-left transition-all duration-200 hover:scale-[1.01] text-zinc-700 dark:text-zinc-200 hover:bg-white/25 dark:hover:bg-white/10 hover:text-zinc-950 dark:hover:text-white"
                    >
                      <span className="text-zinc-400">{link.name}</span>
                    </button>
                  ))}
                  {filteredLinks.length === 0 && (
                    <div className="rounded-xl px-3 py-2 text-sm text-zinc-600 dark:text-zinc-300">
                      No results found for &quot;{searchQuery}&quot;.
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
                Press{' '}
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono">
                  Esc
                </kbd>{' '}
                to close •{' '}
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono">
                  ⌘K
                </kbd>{' '}
                to open
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
