'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Star, Calendar, Clock, DollarSign, Play, Heart, Plus } from 'lucide-react'
import Loader from '@/components/Loader'
import RecommendationList from '@/components/RecommendationList'
import { movieApi } from '@/lib/api'
import { Movie } from '@/lib/types'
import { getImageUrl, formatDate, formatRuntime, formatRating, getYouTubeUrl } from '@/lib/utils'
import { useTheme } from '@/contexts/ThemeContext'

export default function MovieDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const movieTitle = decodeURIComponent(params.id as string)
  
  const [movie, setMovie] = useState<Movie | null>(null)
  const [recommendations, setRecommendations] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isInWatchlist, setIsInWatchlist] = useState(false)
  const { currentTheme } = useTheme()

  useEffect(() => {
    const loadMovieDetails = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Get movie details
        const movieDetails = await movieApi.getMovieDetails(movieTitle)
        setMovie(movieDetails)
        
        // Get recommendations for this movie
        const recResponse = await movieApi.getRecommendations(movieTitle, 8)
        if (recResponse.recommendations) {
          setRecommendations(recResponse.recommendations)
        }
        
        // Check if movie is in watchlist
        const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]')
        setIsInWatchlist(watchlist.some((item: Movie) => item.title === movieTitle))
        
      } catch (err: any) {
        setError(err.message || 'Failed to load movie details')
      } finally {
        setIsLoading(false)
      }
    }

    if (movieTitle) {
      loadMovieDetails()
    }
  }, [movieTitle])

  const handleAddToWatchlist = () => {
    if (!movie) return
    
    const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]')
    
    if (!isInWatchlist) {
      watchlist.push({ ...movie, addedAt: new Date().toISOString() })
    } else {
      const index = watchlist.findIndex((item: Movie) => item.title === movie.title)
      if (index > -1) {
        watchlist.splice(index, 1)
      }
    }
    
    localStorage.setItem('watchlist', JSON.stringify(watchlist))
    setIsInWatchlist(!isInWatchlist)
  }

  const handleMovieClick = (movie: Movie) => {
    router.push(`/movie/${encodeURIComponent(movie.title)}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen text-white">
        <div className="flex items-center justify-center pt-32">
          <Loader size="lg" text="Loading movie details..." />
        </div>
      </div>
    )
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen text-white">
        <div className="flex items-center justify-center pt-32">
          <div className="text-center">
            <h2 className={`text-2xl font-bold bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} bg-clip-text text-transparent mb-4`}>Error</h2>
            <p className="text-gray-400 mb-8">{error || 'Movie not found'}</p>
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

  const backdropUrl = getImageUrl(movie.backdrop_path || '', 'w1920')
  const posterUrl = getImageUrl(movie.poster_path || '', 'w500')

  return (
    <div className="min-h-screen text-white">
      {/* Backdrop */}
      <div className="relative h-[600px] md:h-[700px] top-16">
        <div className="absolute inset-x-0 top-0 bottom-0">
          {movie.backdrop_path ? (
            <img
              src={backdropUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-gray-900 to-gray-800" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>
        
        {/* Back Button */}
        <div className="absolute top-20 left-4 z-20">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-black/70 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* Movie Info */}
      <section className="px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Poster */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="md:col-span-1"
            >
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                {movie.poster_path ? (
                  <img
                    src={posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <Play className="w-16 h-16 text-gray-600" />
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleAddToWatchlist}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg transition-colors duration-200 ${
                    isInWatchlist
                      ? `bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white`
                      : 'bg-gray-800 text-white hover:bg-gray-700'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isInWatchlist ? 'fill-current' : ''}`} />
                  <span>{isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
                </button>
              </div>
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="md:col-span-2"
            >
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{movie.title}</h1>
              
              {/* Tagline */}
              {movie.tagline && (
                <p className="text-xl text-gray-400 italic mb-6">{movie.tagline}</p>
              )}
              
              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                {movie.vote_average && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold">{formatRating(movie.vote_average)}</span>
                  </div>
                )}
                
                {movie.release_date && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span>{formatDate(movie.release_date)}</span>
                  </div>
                )}
                
                {movie.runtime && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span>{formatRuntime(movie.runtime)}</span>
                  </div>
                )}
                
                {movie.genres && (
                  <div className="flex flex-wrap gap-2">
                    {movie.genres.split(',').map((genre: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-800 rounded-full text-sm"
                      >
                        {genre.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Overview */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Overview</h2>
                <p className="text-gray-300 leading-relaxed">{movie.overview}</p>
              </div>
              
              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                {movie.budget && movie.budget > 0 && (
                  <div>
                    <h3 className="text-sm text-gray-400 mb-1">Budget</h3>
                    <p className="font-semibold flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {movie.budget.toLocaleString()}
                    </p>
                  </div>
                )}
                
                {movie.revenue && movie.revenue > 0 && (
                  <div>
                    <h3 className="text-sm text-gray-400 mb-1">Revenue</h3>
                    <p className="font-semibold flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {movie.revenue.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <RecommendationList
              movies={recommendations}
              title="More Like This"
              onMovieClick={handleMovieClick}
            />
          </div>
        </section>
      )}
    </div>
  )
}
