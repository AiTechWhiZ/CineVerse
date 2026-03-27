'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Sparkles, TrendingUp, Play } from 'lucide-react'
import SearchBar from '@/components/SearchBar'
import RecommendationList from '@/components/RecommendationList'
import Loader from '@/components/Loader'
import AIChat from '@/components/AIChat'
import { movieApi } from '@/lib/api'
import { Movie } from '@/lib/types'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { trackUserActivity } from '@/lib/activity'
import { useTheme } from '@/contexts/ThemeContext'

export default function Home() {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [recommendations, setRecommendations] = useState<Movie[]>([])
  const [trendingMovies, setTrendingMovies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingTrending, setIsLoadingTrending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { currentTheme } = useTheme()

  // Load trending movies on component mount
  useEffect(() => {
    const loadTrendingMovies = async () => {
      try {
        setIsLoadingTrending(true)
        const response = await movieApi.getTrendingMovies()
        setTrendingMovies(response.trending)
      } catch (err) {
        console.error('Failed to load trending movies:', err)
      } finally {
        setIsLoadingTrending(false)
      }
    }

    loadTrendingMovies()
  }, [])

  const handleMovieSelect = async (movie: Movie) => {
    try {
      setIsLoading(true)
      setError(null)
      setSelectedMovie(movie)
      
      // Get recommendations for the selected movie
      const response = await movieApi.getRecommendations(movie.title, 10)
      
      if (response.suggestions && response.suggestions.length > 0) {
        // Movie not found exactly, show suggestions
        setError(`Movie "${movie.title}" not found. Did you mean: ${response.suggestions.map(s => s.title).join(', ')}?`)
        setRecommendations([])
      } else {
        setRecommendations(response.recommendations)
        // Track the recommendations
        trackUserActivity.trackRecommendations(response.recommendations)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to get recommendations')
      setRecommendations([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleMovieClick = (movie: Movie) => {
    // Navigate to movie details page
    router.push(`/movie/${encodeURIComponent(movie.title)}`)
  }

  const handleTrendingMovieClick = (movie: any) => {
    // Create a Movie object from trending movie and handle selection
    const movieObj: Movie = {
      title: movie.title,
      overview: movie.overview,
      vote_average: movie.vote_average,
      release_date: movie.release_date,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      tmdb_id: movie.id,
      id: movie.id
    }
    handleMovieSelect(movieObj)
  }

  return (
    <div className="min-h-screen text-white">
      {/* Hero Section */}
      <section className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className={`text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} bg-clip-text text-transparent`}>
              CineVerse
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Discover your next favorite movie with AI-powered recommendations
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <SearchBar
                onMovieSelect={handleMovieSelect}
                placeholder="Search for any movie to get recommendations..."
              />
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => document.getElementById('trending')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors duration-200"
              >
                <TrendingUp className="w-5 h-5 text-white" />
                <span>Trending Now</span>
              </button>
              <button
                onClick={() => router.push('/watchlist')}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors duration-200"
              >
                <Play className="w-5 h-5 text-white" />
                <span>My Watchlist</span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Loading State */}
      {isLoading && (
        <section className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <Loader size="lg" text="Finding perfect recommendations for you..." />
          </div>
        </section>
      )}

      {/* Error State */}
      {error && (
        <section className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className={`bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} bg-opacity-10 border border-current border-opacity-30 rounded-lg p-6 text-center`}>
              <Sparkles className="w-8 h-8 text-white" />
              <p className={`text-current bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} bg-clip-text text-transparent`}>{error}</p>
            </div>
          </div>
        </section>
      )}

      {/* Selected Movie Info */}
      {selectedMovie && !isLoading && (
        <section className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold mb-2">
                Recommendations for <span className={`bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} bg-clip-text text-transparent`}>{selectedMovie.title}</span>
              </h2>
              {selectedMovie.overview && (
                <p className="text-gray-400 max-w-3xl">
                  {selectedMovie.overview}
                </p>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <RecommendationList
              movies={recommendations}
              title="Recommended Movies"
              onMovieClick={handleMovieClick}
            />
          </div>
        </section>
      )}

      {/* Trending Movies */}
      <section id="trending" className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <RecommendationList
            movies={trendingMovies.map(movie => ({
              title: movie.title,
              overview: movie.overview,
              vote_average: movie.vote_average,
              release_date: movie.release_date,
              poster_path: movie.poster_path,
              backdrop_path: movie.backdrop_path,
              tmdb_id: movie.id,
              id: movie.id
            }))}
            title="Trending Now"
            loading={isLoadingTrending}
            onMovieClick={handleTrendingMovieClick}
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Why Choose CineVerse?</h2>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className={`w-16 h-16 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
                <p className="text-gray-400">Advanced recommendation algorithm finds movies you'll love</p>
              </div>
              <div className="text-center">
                <div className={`w-16 h-16 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <Search className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Smart Search</h3>
                <p className="text-gray-400">Find any movie instantly with intelligent search</p>
              </div>
              <div className="text-center">
                <div className={`w-16 h-16 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <Play className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Watchlist</h3>
                <p className="text-gray-400">Save and organize your favorite movies</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* AI Chat Component */}
      <AIChat />
    </div>
  )
}
