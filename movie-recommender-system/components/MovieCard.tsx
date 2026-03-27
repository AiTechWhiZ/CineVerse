'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Calendar, Clock, Plus, Heart, Play } from 'lucide-react'
import { Movie } from '@/lib/types'
import { cn, getImageUrl, formatRating, formatDate, truncateText } from '@/lib/utils'
import { trackUserActivity } from '@/lib/activity'
import { useTheme } from '@/contexts/ThemeContext'
import Image from 'next/image'

interface MovieCardProps {
  movie: Movie
  onClick?: () => void
  showAddToWatchlist?: boolean
  className?: string
}

const MovieCard = ({ 
  movie, 
  onClick, 
  showAddToWatchlist = true,
  className 
}: MovieCardProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isInWatchlist, setIsInWatchlist] = useState(false)
  const { currentTheme } = useTheme()

  const handleCardClick = () => {
    trackUserActivity.trackMovieView(movie)
    onClick?.()
  }

  const handleAddToWatchlist = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsInWatchlist(!isInWatchlist)
    
    // Get current watchlist from localStorage
    const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]')
    
    if (!isInWatchlist) {
      // Add to watchlist
      watchlist.push({ ...movie, addedAt: new Date().toISOString() })
    } else {
      // Remove from watchlist
      const index = watchlist.findIndex((item: Movie) => item.title === movie.title)
      if (index > -1) {
        watchlist.splice(index, 1)
      }
    }
    
    localStorage.setItem('watchlist', JSON.stringify(watchlist))
  }

  const posterUrl = getImageUrl(movie.poster_path || '', 'w500')

  return (
    <motion.div
      className={cn(
        "relative group cursor-pointer overflow-hidden rounded-lg transition-all duration-300",
        "bg-gray-900 border border-gray-800",
        `hover:border-${currentTheme.from.split('-')[1]}-600/50`,
        className
      )}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Movie Poster */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <Image
          src={posterUrl}
          alt={movie.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          sizes="(max-width: 768px) 40vw, (max-width: 1200px) 25vw, 20vw"
        />
        
        {/* Overlay on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          animate={{ opacity: isHovered ? 1 : 0 }}
        >
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">
              {movie.title}
            </h3>
            
            {/* Movie Info */}
            <div className="flex items-center space-x-3 text-sm text-gray-300 mb-3">
              {movie.vote_average && (
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span>{formatRating(movie.vote_average)}</span>
                </div>
              )}
              {movie.release_date && (
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(movie.release_date).getFullYear()}</span>
                </div>
              )}
              {movie.runtime && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{movie.runtime}m</span>
                </div>
              )}
            </div>
            
            {/* Overview */}
            {movie.overview && (
              <p className="text-gray-300 text-sm line-clamp-3 mb-3">
                {truncateText(movie.overview, 120)}
              </p>
            )}
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onClick?.()
                }}
                className={`flex items-center space-x-1 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} hover:opacity-90 text-white px-3 py-1.5 rounded-md text-sm transition-opacity duration-200`}
              >
                <Play className="w-3 h-3" />
                <span>Details</span>
              </button>
              
              {showAddToWatchlist && (
                <button
                  onClick={handleAddToWatchlist}
                  className={cn(
                    "flex items-center space-x-1 border border-gray-600 hover:border-white px-3 py-1.5 rounded-md text-sm transition-colors duration-200",
                    isInWatchlist && `bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} bg-opacity-20 border-current text-current`
                  )}
                >
                  <Heart className={cn(
                    "w-3 h-3",
                    isInWatchlist && "fill-current"
                  )} />
                  <span>{isInWatchlist ? 'Added' : 'Watchlist'}</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
        
        {/* Similarity Score (for recommendations) */}
        {movie.similarity_score && (
          <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-md">
            <span className="text-green-400 text-xs font-semibold">
              {Math.round(movie.similarity_score * 100)}% match
            </span>
          </div>
        )}
        
        {/* Rating Badge */}
        {movie.vote_average && (
          <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-md">
            <div className="flex items-center space-x-1">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span className="text-white text-xs font-semibold">
                {formatRating(movie.vote_average)}
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default MovieCard
