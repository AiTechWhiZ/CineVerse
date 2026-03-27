import { Movie } from './types'

interface UserActivity {
  searchedMovies: string[]
  recommendedMovies: Movie[]
  viewedMovies: Movie[]
  lastActivity: string
}

export const trackUserActivity = {
  // Track when a movie is viewed
  trackMovieView: (movie: Movie) => {
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
  },

  // Track search queries
  trackSearch: (query: string) => {
    const activity: UserActivity = JSON.parse(localStorage.getItem('userActivity') || '{}')
    const searchedMovies = activity.searchedMovies || []
    
    // Remove if already exists, then add to beginning
    const filteredSearches = searchedMovies.filter(q => q !== query)
    filteredSearches.unshift(query)
    
    // Keep only last 50 searches
    const updatedSearches = filteredSearches.slice(0, 50)
    
    const updatedActivity = {
      ...activity,
      searchedMovies: updatedSearches,
      lastActivity: new Date().toISOString()
    }
    
    localStorage.setItem('userActivity', JSON.stringify(updatedActivity))
  },

  // Track recommended movies
  trackRecommendations: (movies: Movie[]) => {
    const activity: UserActivity = JSON.parse(localStorage.getItem('userActivity') || '{}')
    const recommendedMovies = activity.recommendedMovies || []
    
    // Add new recommendations (avoid duplicates)
    const newMovies = movies.filter(movie => 
      !recommendedMovies.some(existing => existing.title === movie.title)
    )
    
    const updatedRecommended = [...newMovies, ...recommendedMovies].slice(0, 100)
    
    const updatedActivity = {
      ...activity,
      recommendedMovies: updatedRecommended,
      lastActivity: new Date().toISOString()
    }
    
    localStorage.setItem('userActivity', JSON.stringify(updatedActivity))
  },

  // Get user activity data
  getActivity: (): UserActivity => {
    return JSON.parse(localStorage.getItem('userActivity') || '{}')
  },

  // Clear all activity data
  clearActivity: () => {
    localStorage.removeItem('userActivity')
  }
}
