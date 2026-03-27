'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Clock, Heart, Film, Star, Calendar, Activity, Users, Eye } from 'lucide-react'
import Loader from '@/components/Loader'
import { Movie, WatchlistItem } from '@/lib/types'
import { useRouter } from 'next/navigation'
import { getImageUrl, formatDate } from '@/lib/utils'
import { useTheme } from '@/contexts/ThemeContext'

interface UserActivity {
  searchedMovies: string[]
  recommendedMovies: Movie[]
  viewedMovies: Movie[]
  lastActivity: string
}

interface DashboardStats {
  totalWatchlisted: number
  totalViewed: number
  totalSearched: number
  favoriteGenres: { genre: string; count: number }[]
  recentlyViewed: Movie[]
  topRatedWatchlist: Movie[]
  activityThisWeek: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { currentTheme } = useTheme()

  useEffect(() => {
    const loadDashboardData = () => {
      try {
        // Get watchlist
        const watchlist: WatchlistItem[] = JSON.parse(localStorage.getItem('watchlist') || '[]')
        
        // Get user activity
        const activity: UserActivity = JSON.parse(localStorage.getItem('userActivity') || '{}')
        
        // Get recently viewed movies
        const recentlyViewed = activity.viewedMovies?.slice(-5).reverse() || []
        
        // Calculate stats
        const favoriteGenres = calculateFavoriteGenres(watchlist)
        const topRatedWatchlist = watchlist
          .filter(item => item.vote_average && item.vote_average > 7)
          .sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0))
          .slice(0, 5)
        
        // Activity this week (mock data for now)
        const activityThisWeek = Math.floor(Math.random() * 20) + 5
        
        setStats({
          totalWatchlisted: watchlist.length,
          totalViewed: activity.viewedMovies?.length || 0,
          totalSearched: activity.searchedMovies?.length || 0,
          favoriteGenres,
          recentlyViewed,
          topRatedWatchlist,
          activityThisWeek
        })
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const calculateFavoriteGenres = (watchlist: WatchlistItem[]) => {
    const genreCount: { [key: string]: number } = {}
    
    watchlist.forEach(item => {
      if (item.genres) {
        const genres = item.genres.split(',').map(g => g.trim())
        genres.forEach(genre => {
          genreCount[genre] = (genreCount[genre] || 0) + 1
        })
      }
    })
    
    return Object.entries(genreCount)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }

  const handleMovieClick = (movie: Movie) => {
    // Update viewed movies
    const activity: UserActivity = JSON.parse(localStorage.getItem('userActivity') || '{}')
    const viewedMovies = activity.viewedMovies || []
    
    // Remove if already exists, then add to beginning
    const filteredViewed = viewedMovies.filter(m => m.title !== movie.title)
    filteredViewed.unshift(movie)
    
    // Keep only last 20 viewed movies
    const updatedViewed = filteredViewed.slice(0, 20)
    
    const updatedActivity = {
      ...activity,
      viewedMovies: updatedViewed,
      lastActivity: new Date().toISOString()
    }
    
    localStorage.setItem('userActivity', JSON.stringify(updatedActivity))
    router.push(`/movie/${encodeURIComponent(movie.title)}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen text-white">
        <div className="flex items-center justify-center pt-32">
          <Loader size="lg" text="Loading dashboard..." />
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen text-white">
        <div className="flex items-center justify-center pt-32">
          <div className="text-center">
            <h2 className={`text-2xl font-bold bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} bg-clip-text text-transparent mb-4`}>Error</h2>
            <p className="text-gray-400 mb-8">Failed to load dashboard data</p>
            <button
              onClick={() => router.push('/')}
              className={`bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} hover:opacity-90 px-6 py-3 rounded-full transition-opacity duration-200`}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white">
      <section className="px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center space-x-3 mb-4">
              <BarChart3 className={`w-8 h-8 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} bg-clip-text text-transparent`} />
              <h1 className="text-3xl md:text-4xl font-bold">Your Dashboard</h1>
            </div>
            <p className="text-gray-400">
              Track your movie journey and discover insights about your viewing habits
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-900 border border-gray-800 rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <Heart className={`w-8 h-8 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} bg-clip-text text-transparent`} />
                <span className="text-2xl font-bold">{stats.totalWatchlisted}</span>
              </div>
              <h3 className="text-gray-400 text-sm">Watchlist</h3>
              <p className="text-white text-lg font-semibold">Movies Saved</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900 border border-gray-800 rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <Eye className="w-8 h-8 text-blue-600" />
                <span className="text-2xl font-bold">{stats.totalViewed}</span>
              </div>
              <h3 className="text-gray-400 text-sm">Viewed</h3>
              <p className="text-white text-lg font-semibold">Movies Watched</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-900 border border-gray-800 rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <Activity className="w-8 h-8 text-green-600" />
                <span className="text-2xl font-bold">{stats.activityThisWeek}</span>
              </div>
              <h3 className="text-gray-400 text-sm">This Week</h3>
              <p className="text-white text-lg font-semibold">Activity Count</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-900 border border-gray-800 rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-purple-600" />
                <span className="text-2xl font-bold">{stats.totalSearched}</span>
              </div>
              <h3 className="text-gray-400 text-sm">Searches</h3>
              <p className="text-white text-lg font-semibold">Total Queries</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Favorite Genres */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-900 border border-gray-800 rounded-lg p-6"
            >
              <h2 className="text-xl font-bold mb-6 flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                Favorite Genres
              </h2>
              {stats.favoriteGenres.length > 0 ? (
                <div className="space-y-4">
                  {stats.favoriteGenres.map((genre, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-300">{genre.genre}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-800 rounded-full h-2">
                          <div
                            className={`bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} h-2 rounded-full`}
                            style={{
                              width: `${Math.max(20, (genre.count / stats.totalWatchlisted) * 100)}%`
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-400 w-8 text-right">
                          {genre.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">
                  No genre data available. Add movies to your watchlist to see your favorite genres!
                </p>
              )}
            </motion.div>

            {/* Recently Viewed */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gray-900 border border-gray-800 rounded-lg p-6"
            >
              <h2 className="text-xl font-bold mb-6 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-500" />
                Recently Viewed
              </h2>
              {stats.recentlyViewed.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentlyViewed.map((movie, index) => (
                    <div
                      key={index}
                      onClick={() => handleMovieClick(movie)}
                      className="flex items-center space-x-4 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                    >
                      <div className="relative w-12 h-16 flex-shrink-0">
                        <img
                          src={getImageUrl(movie.poster_path || '', 'w92')}
                          alt={movie.title}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium truncate">{movie.title}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          {movie.vote_average && (
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              <span>{movie.vote_average.toFixed(1)}</span>
                            </div>
                          )}
                          {movie.release_date && (
                            <span>{new Date(movie.release_date).getFullYear()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">
                  No recently viewed movies. Start exploring to see your activity here!
                </p>
              )}
            </motion.div>
          </div>

          {/* Top Rated Watchlist */}
          {stats.topRatedWatchlist.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-8 bg-gray-900 border border-gray-800 rounded-lg p-6"
            >
              <h2 className="text-xl font-bold mb-6 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                Top Rated in Your Watchlist
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {stats.topRatedWatchlist.map((movie, index) => (
                  <div
                    key={index}
                    onClick={() => handleMovieClick(movie)}
                    className="cursor-pointer group"
                  >
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2">
                      <img
                        src={getImageUrl(movie.poster_path || '', 'w342')}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded">
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-white text-xs font-semibold">
                            {movie.vote_average?.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <h4 className="text-white text-sm font-medium line-clamp-2 group-hover:text-red-500 transition-colors">
                      {movie.title}
                    </h4>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  )
}
