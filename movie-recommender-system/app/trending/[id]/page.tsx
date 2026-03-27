'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, TrendingUp, Star, Calendar, Clock, DollarSign, Play, Heart, BarChart3, Users } from 'lucide-react'
import Loader from '@/components/Loader'
import RecommendationList from '@/components/RecommendationList'
import { movieApi } from '@/lib/api'
import { Movie } from '@/lib/types'
import { getImageUrl, formatDate, formatRuntime, formatRating } from '@/lib/utils'
import { useTheme } from '@/contexts/ThemeContext'

export default function TrendingMovieDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const movieId = params.id as string
  
  const [movie, setMovie] = useState<Movie | null>(null)
  const [recommendations, setRecommendations] = useState<Movie[]>([])
  const [trendingInfo, setTrendingInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isInWatchlist, setIsInWatchlist] = useState(false)
  const { currentTheme } = useTheme()

  useEffect(() => {
    const loadMovieDetails = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Try to get movie by TMDB ID first
        let movieDetails: Movie | null = null
        
        if (movieId && !isNaN(Number(movieId))) {
          // It's a TMDB ID, get details from TMDB
          try {
            const tmdbDetails = await movieApi.getTmdbDetails(Number(movieId))
            movieDetails = {
              title: tmdbDetails.title,
              overview: tmdbDetails.overview,
              vote_average: tmdbDetails.vote_average,
              release_date: tmdbDetails.release_date,
              poster_path: tmdbDetails.poster_path,
              backdrop_path: tmdbDetails.backdrop_path,
              tmdb_id: tmdbDetails.id,
              id: tmdbDetails.id,
              genres: tmdbDetails.genres ? tmdbDetails.genres.map((g: any) => g.name).join(', ') : '',
              tagline: tmdbDetails.tagline,
              runtime: tmdbDetails.runtime,
              budget: tmdbDetails.budget,
              revenue: tmdbDetails.revenue,
              popularity: tmdbDetails.popularity
            }
          } catch (tmdbError) {
            console.log('TMDB lookup failed, trying by title')
          }
        }
        
        // If TMDB lookup failed or it's a title, try by title
        if (!movieDetails) {
          movieDetails = await movieApi.getMovieDetails(movieId)
        }
        
        setMovie(movieDetails)
        
        // Get recommendations for this movie
        if (movieDetails) {
          const recResponse = await movieApi.getRecommendations(movieDetails.title, 8)
          if (recResponse.recommendations) {
            setRecommendations(recResponse.recommendations)
          }
          
          // Get trending info for this movie
          try {
            const trendingResponse = await movieApi.getTrendingMovies()
            const trendingMovie = trendingResponse.trending.find((m: any) => 
              m.id === movieDetails?.tmdb_id || m.title === movieDetails?.title
            )
            if (trendingMovie) {
              setTrendingInfo({
                rank: trendingResponse.trending.indexOf(trendingMovie) + 1,
                popularity: trendingMovie.popularity,
                timeWindow: trendingResponse.time_window
              })
            }
          } catch (trendingError) {
            console.log('Could not fetch trending info')
          }
        }
        
        // Check if movie is in watchlist
        const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]')
        setIsInWatchlist(watchlist.some((item: Movie) => item.title === movieDetails?.title))
        
      } catch (err: any) {
        setError(err.message || 'Failed to load movie details')
      } finally {
        setIsLoading(false)
      }
    }

    if (movieId) {
      loadMovieDetails()
    }
  }, [movieId])

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
          <Loader size="lg" text="Loading trending movie details..." />
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
              onClick={() => router.push('/trending')}
              className={`bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} hover:opacity-90 px-6 py-3 rounded-full transition-opacity duration-200`}
            >
              Back to Trending
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
        
        {/* Trending Badge */}
        {trendingInfo && (
          <div className="absolute top-20 right-4 z-20">
            <div className={`bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} px-4 py-2 rounded-full flex items-center space-x-2`}>
              <TrendingUp className="w-4 h-4" />
              <span className="font-semibold">#{trendingInfo.rank} Trending</span>
            </div>
          </div>
        )}
        
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
              
              {/* Trending Stats */}
              {trendingInfo && (
                <div className={`bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} bg-opacity-20 border border-current border-opacity-30 rounded-lg p-4 mb-6`}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                    <TrendingUp className={`w-5 h-5 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} bg-clip-text text-transparent`} />
                    <span>Trending Statistics</span>
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className={`text-2xl font-bold bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} bg-clip-text text-transparent`}>#{trendingInfo.rank}</div>
                      <div className="text-sm text-gray-400">Rank</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-500">
                        {movie.popularity ? movie.popularity.toFixed(1) : 'N/A'}
                      </div>
                      <div className="text-sm text-gray-400">Popularity</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-500 capitalize">
                        {trendingInfo.timeWindow}
                      </div>
                      <div className="text-sm text-gray-400">Time Window</div>
                    </div>
                  </div>
                </div>
              )}
              
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
