'use client'

import React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

export function ThemeToggle() {
  const { isDark, toggleDark } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleDark}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 dark:border-white/10 bg-white/30 dark:bg-white/5 text-zinc-800 dark:text-zinc-200 shadow-sm hover:scale-105 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className="relative h-5 w-5">
        <Sun
          className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
            isDark ? 'opacity-0 rotate-180' : 'opacity-100 rotate-0'
          }`}
        />
        <Moon
          className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
            isDark ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-180'
          }`}
        />
      </div>
    </button>
  )
}
