'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Trash2, Play } from 'lucide-react'
import MovieCard from '@/components/MovieCard'
import Loader from '@/components/Loader'
import { Movie, WatchlistItem } from '@/lib/types'
import { useRouter } from 'next/navigation'
import { getImageUrl } from '@/lib/utils'
import { useTheme } from '@/contexts/ThemeContext'

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { currentTheme } = useTheme()

  useEffect(() => {
    const loadWatchlist = () => {
      try {
        const storedWatchlist = JSON.parse(localStorage.getItem('watchlist') || '[]')
        setWatchlist(storedWatchlist)
      } catch (error) {
        console.error('Error loading watchlist:', error)
        setWatchlist([])
      } finally {
        setIsLoading(false)
      }
    }

    loadWatchlist()
  }, [])

  const removeFromWatchlist = (movieTitle: string) => {
    const updatedWatchlist = watchlist.filter(item => item.title !== movieTitle)
    setWatchlist(updatedWatchlist)
    localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist))
  }

  const handleMovieClick = (movie: Movie) => {
    router.push(`/movie/${encodeURIComponent(movie.title)}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen text-white">
        <div className="flex items-center justify-center pt-32">
          <Loader size="lg" text="Loading your watchlist..." />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white">
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Heart className={`w-8 h-8 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} bg-clip-text text-transparent fill-current`} />
              <h1 className="text-3xl md:text-4xl font-bold">My Watchlist</h1>
            </div>
            <p className="text-gray-400">
              {watchlist.length === 0 
                ? "You haven't added any movies to your watchlist yet." 
                : `You have ${watchlist.length} movie${watchlist.length === 1 ? '' : 's'} in your watchlist.`
              }
            </p>
          </motion.div>

          {watchlist.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-12 h-12 text-gray-600" />
              </div>
              <h2 className="text-2xl font-semibold mb-4">Your watchlist is empty</h2>
              <p className="text-gray-400 mb-8">
                Start adding movies to your watchlist to keep track of what you want to watch.
              </p>
              <button
                onClick={() => router.push('/')}
                className={`inline-flex items-center space-x-2 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} hover:opacity-90 px-6 py-3 rounded-full transition-opacity duration-200`}
              >
                <Play className="w-5 h-5" />
                <span>Discover Movies</span>
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
              {watchlist.map((item, index) => (
                <motion.div
                  key={`${item.title}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="relative group"
                >
                  <MovieCard 
                    movie={item} 
                    onClick={() => handleMovieClick(item)}
                    showAddToWatchlist={false}
                  />
                  
                  {/* Remove button */}
                  <button
                    onClick={() => removeFromWatchlist(item.title)}
                    className={`absolute top-2 right-2 p-2 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} bg-opacity-80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:opacity-100`}
                    title="Remove from watchlist"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                  
                  {/* Added date */}
                  <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-xs text-gray-300">
                    Added {new Date(item.addedAt).toLocaleDateString()}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
