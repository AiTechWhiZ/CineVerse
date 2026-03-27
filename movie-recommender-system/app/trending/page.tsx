'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Calendar, Star, Clock, Film } from 'lucide-react'
import RecommendationList from '@/components/RecommendationList'
import Loader from '@/components/Loader'
import { movieApi } from '@/lib/api'
import { Movie } from '@/lib/types'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'

export default function TrendingPage() {
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTimeWindow, setSelectedTimeWindow] = useState<'day' | 'week' | 'month'>('week')
  const router = useRouter()
  const { currentTheme } = useTheme()

  useEffect(() => {
    const loadTrendingMovies = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await movieApi.getTrendingMovies(selectedTimeWindow)
        
        if (response.trending && response.trending.length > 0) {
          // Transform trending movies to Movie format
          const movies: Movie[] = response.trending.map((movie: any) => ({
            title: movie.title,
            overview: movie.overview || '',
            vote_average: movie.vote_average || 0,
            release_date: movie.release_date || '',
            poster_path: movie.poster_path,
            backdrop_path: movie.backdrop_path,
            tmdb_id: movie.id || movie.tmdb_id,
            id: movie.id || movie.tmdb_id,
            genres: movie.genres || '',
            tagline: movie.tagline,
            runtime: movie.runtime,
            budget: movie.budget,
            revenue: movie.revenue,
            popularity: movie.popularity
          }))
          setTrendingMovies(movies)
        } else {
          setError('No trending movies available')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load trending movies')
      } finally {
        setIsLoading(false)
      }
    }

    loadTrendingMovies()
  }, [selectedTimeWindow])

  const handleMovieClick = (movie: Movie) => {
    router.push(`/movie/${encodeURIComponent(movie.title)}`)
  }

  const handleTimeWindowChange = (window: 'day' | 'week' | 'month') => {
    setSelectedTimeWindow(window)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen text-white">
        <div className="flex items-center justify-center pt-32">
          <Loader size="lg" text="Loading trending movies..." />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white">
      {/* Header Section */}
      <section className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center space-x-3 mb-6">
              <TrendingUp className={`w-12 h-12 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} bg-clip-text text-transparent`} />
              <h1 className={`text-4xl md:text-6xl font-bold bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} bg-clip-text text-transparent`}>
                Trending Movies
              </h1>
            </div>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Discover what's hot right now - the most popular and talked-about movies this week
            </p>
            
            {/* Time Window Selector */}
            <div className="flex justify-center space-x-2 mb-8">
              {(['day', 'week', 'month'] as const).map((window) => (
                <button
                  key={window}
                  onClick={() => handleTimeWindowChange(window)}
                  className={`px-6 py-2 rounded-full transition-all duration-200 ${
                    selectedTimeWindow === window
                      ? `bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white`
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {window === 'day' && 'Today'}
                  {window === 'week' && 'This Week'}
                  {window === 'month' && 'This Month'}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trending Movies Grid */}
      {trendingMovies.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold flex items-center space-x-3">
                  <TrendingUp className={`w-8 h-8 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} bg-clip-text text-transparent`} />
                  <span>Trending {selectedTimeWindow === 'day' ? 'Today' : selectedTimeWindow === 'week' ? 'This Week' : 'This Month'}</span>
                </h2>
                <div className="text-gray-400">
                  {trendingMovies.length} movies
                </div>
              </div>
              
              <RecommendationList
                movies={trendingMovies}
                title=""
                onMovieClick={handleMovieClick}
              />
            </motion.div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      {!error && trendingMovies.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid md:grid-cols-4 gap-6"
            >
              <div className="bg-gray-900 rounded-lg p-6 text-center">
                <Film className={`w-8 h-8 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} bg-clip-text text-transparent mx-auto mb-3`} />
                <div className="text-2xl font-bold mb-1">{trendingMovies.length}</div>
                <div className="text-gray-400 text-sm">Trending Movies</div>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-6 text-center">
                <Star className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
                <div className="text-2xl font-bold mb-1">
                  {trendingMovies.length > 0 
                    ? (trendingMovies.reduce((acc, movie) => acc + (movie.vote_average || 0), 0) / trendingMovies.length).toFixed(1)
                    : '0'
                  }
                </div>
                <div className="text-gray-400 text-sm">Average Rating</div>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-6 text-center">
                <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                <div className="text-2xl font-bold mb-1">
                  {trendingMovies.filter(movie => movie.release_date && movie.release_date.startsWith('202')).length}
                </div>
                <div className="text-gray-400 text-sm">Recent Releases</div>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-6 text-center">
                <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-3" />
                <div className="text-2xl font-bold mb-1">
                  {selectedTimeWindow === 'day' ? '24h' : selectedTimeWindow === 'week' ? '7d' : '30d'}
                </div>
                <div className="text-gray-400 text-sm">Time Period</div>
              </div>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  )
}
