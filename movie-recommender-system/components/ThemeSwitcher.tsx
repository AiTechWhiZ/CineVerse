'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

const themes = [
  { name: 'red', from: 'from-red-500', via: 'via-pink-500', to: 'to-yellow-400' },
  { name: 'blue', from: 'from-blue-500', via: 'via-indigo-500', to: 'to-purple-400' },
  { name: 'green', from: 'from-green-500', via: 'via-emerald-500', to: 'to-teal-400' },
  { name: 'purple', from: 'from-purple-500', via: 'via-violet-500', to: 'to-fuchsia-400' },
  { name: 'amber', from: 'from-yellow-400', via: 'via-amber-500', to: 'to-orange-500' },
  { name: 'rose', from: 'from-rose-500', via: 'via-fuchsia-500', to: 'to-pink-500' },
  { name: 'cyan', from: 'from-cyan-500', via: 'via-sky-500', to: 'to-blue-400' },
  { name: 'indigo', from: 'from-indigo-500', via: 'via-blue-500', to: 'to-violet-400' },
]

export function ThemeSwitcher() {
  const { themeName, setTheme, currentTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // ✅ Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      
      {/* 🔵 NAVBAR BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className="h-10 w-10 rounded-xl flex items-center justify-center
                   border border-white/15 dark:border-white/10
                   bg-white/30 dark:bg-white/5
                   shadow-sm hover:scale-105 transition-all duration-300"
      >
        <div
          className={`h-6 w-6 rounded-full bg-gradient-to-br ${currentTheme.from} ${currentTheme.to}`}
        />
      </button>

      {/* 🎨 POPUP */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute top-12 right-0 mt-3 
                       w-[320px] p-5 rounded-2xl
                       bg-[#1f2937]/90 backdrop-blur-xl
                       border border-white/10 shadow-2xl"
          >
            {/* 🎯 GRID */}
            <div className="grid grid-cols-4 place-items-center gap-3">
              {themes.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => {
                    setTheme(theme.name as any)
                    setOpen(false)
                  }}
                  className={`
                    relative w-11 h-11 shrink-0 rounded-full
                    bg-gradient-to-br ${theme.from} ${theme.to}
                    transition duration-300
                    hover:scale-110

                    /* ✨ GLOW EFFECT */
                    hover:shadow-[0_0_15px_rgba(255,255,255,0.6)]
                    hover:ring-2 hover:ring-white/70

                    ${
                      themeName === theme.name
                        ? 'ring-2 ring-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.8)]'
                        : ''
                    }
                  `}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}