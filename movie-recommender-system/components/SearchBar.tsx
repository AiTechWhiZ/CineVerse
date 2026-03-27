'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Loader2 } from 'lucide-react'
import { movieApi } from '@/lib/api'
import { Movie } from '@/lib/types'
import { cn, debounce } from '@/lib/utils'
import { trackUserActivity } from '@/lib/activity'
import { useTheme } from '@/contexts/ThemeContext'

interface SearchBarProps {
  onMovieSelect: (movie: Movie) => void
  placeholder?: string
  className?: string
}

const SearchBar = ({ 
  onMovieSelect, 
  placeholder = "Search for a movie...",
  className 
}: SearchBarProps) => {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { currentTheme } = useTheme()

  // Debounced search function
  const debouncedSearch = debounce(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([])
      setIsLoading(false)
      return
    }

    // Track the search query
    trackUserActivity.trackSearch(searchQuery.trim())

    try {
      setIsLoading(true)
      const response = await movieApi.searchMovies(searchQuery, 8)
      setSuggestions(response.results)
    } catch (error) {
      console.error('Search error:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, 300)

  // Handle search input changes
  useEffect(() => {
    if (query.trim()) {
      setIsLoading(true)
      debouncedSearch(query)
    } else {
      setSuggestions([])
      setIsLoading(false)
    }

    return () => {
      debouncedSearch.cancel?.()
    }
  }, [query])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMovieClick = (movie: Movie) => {
    setQuery(movie.title)
    setSuggestions([])
    setIsFocused(false)
    onMovieSelect(movie)
  }

  const handleClear = () => {
    setQuery('')
    setSuggestions([])
    setIsFocused(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsFocused(false)
      setSuggestions([])
    } else if (e.key === 'Enter' && suggestions.length > 0) {
      handleMovieClick(suggestions[0])
    }
  }

  return (
    <div ref={searchRef} className={cn("relative w-full max-w-2xl", className)}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-gray-400" />
          )}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gradient-to-r focus:${currentTheme.from} focus:${currentTheme.to} focus:border-transparent transition-all duration-200`}
        />
        
        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Search Suggestions Dropdown */}
      <AnimatePresence>
        {isFocused && (suggestions.length > 0 || isLoading) && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-md border border-gray-800 rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto"
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
              </div>
            ) : suggestions.length > 0 ? (
              <div className="py-2">
                {suggestions.map((movie, index) => (
                  <motion.button
                    key={`${movie.title}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleMovieClick(movie)}
                    className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-800/50 transition-colors duration-200 text-left"
                  >
                    <div className="flex-shrink-0 w-12 h-16 bg-gray-800 rounded-md overflow-hidden">
                      {movie.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                          alt={movie.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                          <Search className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate">{movie.title}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        {movie.release_date && (
                          <span>{new Date(movie.release_date).getFullYear()}</span>
                        )}
                        {movie.vote_average && (
                          <>
                            <span>•</span>
                            <span>⭐ {movie.vote_average.toFixed(1)}</span>
                          </>
                        )}
                        {movie.genres && (
                          <>
                            <span>•</span>
                            <span className="truncate">{movie.genres}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : query.length >= 2 ? (
              <div className="py-8 text-center text-gray-400">
                No movies found for "{query}"
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SearchBar
