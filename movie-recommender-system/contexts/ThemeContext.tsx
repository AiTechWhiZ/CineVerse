'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export interface Theme {
  name: string
  from: string
  to: string
}

const themes: Record<string, Theme> = {
  red: {
    name: 'Red',
    from: 'from-red-500',
    to: 'to-yellow-400'
  },
  blue: {
    name: 'Blue',
    from: 'from-blue-500',
    to: 'to-purple-400'
  },
  green: {
    name: 'Green',
    from: 'from-green-500',
    to: 'to-teal-400'
  },
  purple: {
    name: 'Purple',
    from: 'from-purple-500',
    to: 'to-fuchsia-400'
  },
  amber: {
    name: 'Amber',
    from: 'from-amber-500',
    to: 'to-orange-400'
  },
  cyan: {
    name: 'Cyan',
    from: 'from-cyan-500',
    to: 'to-blue-400'
  },
  rose: {
    name: 'Rose',
    from: 'from-rose-500',
    to: 'to-red-400'
  },
  indigo: {
    name: 'Indigo',
    from: 'from-indigo-500',
    to: 'to-violet-400'
  }
}

type ThemeName = keyof typeof themes

interface ThemeContextType {
  currentTheme: Theme
  themeName: ThemeName
  setTheme: (theme: ThemeName) => void
  isDark: boolean
  toggleDark: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>('red')
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    // Load saved preferences
    const savedTheme = localStorage.getItem('theme') as ThemeName
    const savedDark = localStorage.getItem('darkMode')
    
    if (savedTheme && themes[savedTheme]) {
      setThemeName(savedTheme)
    }
    
    if (savedDark !== null) {
      setIsDark(savedDark === 'true')
    }

    // Apply dark mode class
    if (savedDark === 'true' || savedDark === null) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const setTheme = (theme: ThemeName) => {
    setThemeName(theme)
    localStorage.setItem('theme', theme)
  }

  const toggleDark = () => {
    const newDark = !isDark
    setIsDark(newDark)
    localStorage.setItem('darkMode', newDark.toString())
    
    if (newDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const value: ThemeContextType = {
    currentTheme: themes[themeName],
    themeName,
    setTheme,
    isDark,
    toggleDark
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
