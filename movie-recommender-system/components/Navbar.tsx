'use client'

import React, { useRef, useEffect, useCallback, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Menu, X, Heart, Film, TrendingUp, BarChart3, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from 'framer-motion'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { SearchModal } from '@/components/SearchModal'
import { useTheme } from '@/contexts/ThemeContext'

const navLinks = [
  { name: 'Home', href: '/', icon: Film },
  { name: 'Trending', href: '/trending', icon: TrendingUp },
  { name: 'Watchlist', href: '/watchlist', icon: Heart },
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
]

const searchLinks = [
  { name: 'Home', href: '/' },
  { name: 'Trending', href: '/trending' },
  { name: 'Watchlist', href: '/watchlist' },
  { name: 'Dashboard', href: '/dashboard' },
]

export function Navbar() {
  const { currentTheme } = useTheme()
  const pathname = usePathname()
  const listRef = useRef<HTMLUListElement | null>(null)
  const itemRefs = useRef<Record<string, HTMLLIElement | null>>({})
  
  const [indicator, setIndicator] = useState<{
    cx: number
    w: number
    visible: boolean
  }>({
    cx: 0,
    w: 0,
    visible: false,
  })
  const [indicatorTargetHref, setIndicatorTargetHref] = useState<string | null>(null)

  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  
  const { scrollY, scrollYProgress } = useScroll()
  const lastY = useRef(0)
  const [hidden, setHidden] = useState(false)

  const isActive = useCallback((href: string) => {
    if (!pathname) return false
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(`${href}/`)
  }, [pathname])

  const updateIndicator = useCallback((explicitHref?: string | null) => {
    const listEl = listRef.current
    if (!listEl) return

    const targetHref = explicitHref ?? indicatorTargetHref
    const activeLink = navLinks.find((l) => l.href === targetHref) || navLinks.find((l) => isActive(l.href))
    const activeItem = activeLink ? itemRefs.current[activeLink.href] : null

    if (!activeItem) {
      setIndicator((prev) => (prev.visible ? { ...prev, visible: false } : prev))
      return
    }

    const listRect = listEl.getBoundingClientRect()
    const itemRect = activeItem.getBoundingClientRect()
    const cx = itemRect.left - listRect.left + itemRect.width / 2
    const w = itemRect.width

    setIndicator({ cx, w, visible: true })
  }, [indicatorTargetHref, isActive])

  useEffect(() => {
    updateIndicator()
  }, [updateIndicator, pathname])

  useEffect(() => {
    const listEl = listRef.current
    if (!listEl) return

    const ro = new ResizeObserver(() => updateIndicator())
    ro.observe(listEl)

    const onResize = () => updateIndicator()
    window.addEventListener('resize', onResize)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [updateIndicator])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const prev = lastY.current
    lastY.current = latest

    const delta = latest - prev
    const nearTop = latest < 64
    if (nearTop) {
      if (hidden) setHidden(false)
      return
    }
    if (delta > 6) {
      if (!hidden) setHidden(true)
    } else if (delta < -6) {
      if (hidden) setHidden(false)
    }
  })

  return (
    <>
      {/* Progress Bar */}
      <motion.div
        aria-hidden="true"
        className={`fixed left-0 right-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r ${currentTheme.from} ${currentTheme.to}`}
        style={{ scaleX: scrollYProgress }}
      />

      {/* Main Navbar */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50"
        initial={false}
        animate={hidden ? { y: -72, opacity: 0.98 } : { y: 0, opacity: 1 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        <div className="relative">
          <div className="px-3 sm:px-5 lg:px-6 pt-3">
            <div
              className={[
                "relative mx-auto max-w-7xl",
                "rounded-2xl",
                "border border-white/15 dark:border-white/10",
                "bg-white/65 dark:bg-zinc-950/45",
                "backdrop-blur-2xl",
                "shadow-[0_10px_30px_-12px_rgba(0,0,0,0.22)] dark:shadow-[0_18px_50px_-26px_rgba(0,0,0,0.75)]",
                "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl",
                `before:bg-gradient-to-r before:${currentTheme.from}/10 before:via-purple-500/5 before:${currentTheme.to}/10`,
                "before:opacity-100 before:[mask-image:linear-gradient(#000,transparent_70%)]",
              ].join(' ')}
            >
              <div className="flex h-16 items-center justify-between px-4 sm:px-5">
                {/* Logo */}
                <div className="flex items-center gap-3">
                  <Link
                    href="/"
                    className="group"
                    aria-label="Go to home"
                  >
                    <div className="relative flex items-center space-x-3">
                      {/* Logo Image Placeholder - Replace with img tag for actual image */}
                      <div className={`w-8 h-8 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} rounded-lg flex items-center justify-center`}>
                        <span className="text-[14px] font-bold text-white">CV</span>
                      </div>
                      {/* CineVerse Text */}
                      <span className="text-[15px] font-semibold tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 dark:from-white dark:via-zinc-100 dark:to-white bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                        CineVerse
                      </span>
                    </div>
                  </Link>
                </div>

                {/* Desktop Navigation */}
                <nav
                  aria-label="Primary"
                  className="hidden md:flex items-center gap-6"
                >
                  <ul
                    ref={listRef}
                    className="relative flex items-center gap-6"
                    onPointerLeave={() => {
                      setIndicatorTargetHref(null)
                      updateIndicator(null)
                    }}
                  >
                    {navLinks.map((link) => {
                      const active = isActive(link.href)
                      return (
                        <li
                          key={link.href}
                          ref={(el) => {
                            itemRefs.current[link.href] = el
                          }}
                        >
                          <Link
                            href={link.href}
                            aria-current={active ? 'page' : undefined}
                            className={[
                              "relative inline-flex items-center gap-2 px-0.5 py-1 text-sm font-medium",
                              "transition-[color,transform] duration-200 ease-out",
                              "hover:scale-[1.03]",
                              active
                                ? "text-zinc-950 dark:text-white"
                                : "text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white",
                            ].join(' ')}
                            onPointerEnter={() => {
                              setIndicatorTargetHref(link.href)
                              updateIndicator(link.href)
                            }}
                            onPointerLeave={() => {
                              setIndicatorTargetHref(null)
                              updateIndicator(null)
                            }}
                            onFocus={() => {
                              setIndicatorTargetHref(link.href)
                              updateIndicator(link.href)
                            }}
                            onBlur={() => {
                              setIndicatorTargetHref(null)
                              updateIndicator(null)
                            }}
                          >
                            <link.icon className="w-4 h-4" />
                            {link.name}
                          </Link>
                        </li>
                      )
                    })}

                    {/* Animated Indicator */}
                    <span
                      aria-hidden="true"
                      className={[
                        "pointer-events-none absolute -bottom-1 h-0.5 rounded-full",
                        "bg-gradient-to-r " + currentTheme.from + " " + currentTheme.to,
                        "transition-all duration-300 ease-out",
                      ].join(' ')}
                      style={{
                        width: indicator.w,
                        transform: `translateX(${indicator.cx}px) translateX(-50%)`,
                        opacity: indicator.visible ? 1 : 0,
                      }}
                    />
                  </ul>
                </nav>

                {/* Right Side Actions */}
                <div className="flex items-center gap-2">
                  {/* Search Button */}
                  <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="group hidden sm:flex items-center rounded-full border border-white/15 dark:border-white/10 bg-white/30 dark:bg-white/5 text-zinc-800 dark:text-zinc-200 shadow-sm transition-all duration-300 w-10 hover:w-[160px] overflow-hidden px-2 py-2"
                aria-label="Open search"
              >
                {/* Icon */}
                <Search className="w-5 h-5 flex-shrink-0" />

                {/* Animated Text */}
                <span className="ml-2 whitespace-nowrap overflow-hidden">
                  <span className="block max-w-0 group-hover:max-w-[100px] transition-all duration-500">
                    <span className="inline-block opacity-0 group-hover:opacity-100 animate-typing">
                      Search
                    </span>
                  </span>
                </span>
              </button>

                  {/* Theme Switcher */}
                  <ThemeSwitcher />
                  <ThemeToggle />

                  {/* Mobile Menu Button */}
                  <button
                    type="button"
                    className="md:hidden inline-flex items-center justify-center rounded-xl p-2 text-zinc-800 dark:text-zinc-200 hover:bg-white/25 dark:hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
                    onClick={() => setMobileOpen((v) => !v)}
                    aria-label="Toggle menu"
                    aria-expanded={mobileOpen}
                    aria-controls="mobile-nav"
                  >
                    <div className="w-6 h-6 relative">
                      <motion.span
                        animate={{
                          rotate: mobileOpen ? 45 : 0,
                          y: mobileOpen ? 6 : 0
                        }}
                        className="absolute top-0 left-0 w-6 h-0.5 bg-current origin-center"
                      />
                      <motion.span
                        animate={{
                          opacity: mobileOpen ? 0 : 1
                        }}
                        className="absolute top-2 left-0 w-6 h-0.5 bg-current"
                      />
                      <motion.span
                        animate={{
                          rotate: mobileOpen ? -45 : 0,
                          y: mobileOpen ? -6 : 0
                        }}
                        className="absolute top-4 left-0 w-6 h-0.5 bg-current origin-center"
                      />
                    </div>
                  </button>
                </div>
              </div>

              {/* Mobile Navigation */}
              <AnimatePresence>
                {mobileOpen ? (
                  <motion.div
                    id="mobile-nav"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="md:hidden overflow-hidden border-t border-white/10"
                  >
                    <div className="px-4 py-3">
                      <div className="grid gap-1.5">
                        {navLinks.map((link) => {
                          const active = isActive(link.href)
                          return (
                            <Link
                              key={link.href}
                              href={link.href}
                              aria-current={active ? 'page' : undefined}
                              className={[
                                "rounded-xl px-3 py-2 text-sm font-medium",
                                "transition-[transform,background-color,color] duration-200 ease-out",
                                "hover:scale-[1.01]",
                                active
                                  ? "bg-white/35 dark:bg-white/10 text-zinc-950 dark:text-white"
                                  : "text-zinc-700 dark:text-zinc-200 hover:bg-white/25 dark:hover:bg-white/10 hover:text-zinc-950 dark:hover:text-white",
                              ].join(' ')}
                            >
                              <div className="flex items-center gap-3">
                                <link.icon className="w-4 h-4" />
                                {link.name}
                              </div>
                            </Link>
                          )
                        })}
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSearchOpen(true)}
                          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium border border-white/15 dark:border-white/10 bg-white/30 dark:bg-white/5 text-zinc-800 dark:text-zinc-200 transition-all duration-300 hover:scale-[1.02] hover:px-8 active:scale-[0.98] min-w-[100px]"
                          aria-label="Open search"
                        >
                          <Search className="w-4 h-4 flex-shrink-0" />
                          <span className="whitespace-nowrap">Search</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Spacer to prevent content overlap */}
      <div className="h-16" />
    </>
  )
}

export default Navbar
