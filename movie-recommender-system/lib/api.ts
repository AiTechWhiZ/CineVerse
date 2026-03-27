import axios from 'axios'
import { Movie, RecommendationResponse, SearchResponse, TrendingResponse } from './types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config: any) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`)
    return config
  },
  (error: any) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response: any) => {
    return response
  },
  (error: any) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export const movieApi = {
  // Get movie recommendations
  getRecommendations: async (movieTitle: string, limit: number = 10): Promise<RecommendationResponse> => {
    try {
      const response = await api.get('/recommend', {
        params: { movie: movieTitle, limit }
      })
      return response.data
    } catch (error: any) {
      if (error.response?.status === 404) {
        return error.response.data // Return suggestions if movie not found
      }
      throw error
    }
  },

  // Search movies
  searchMovies: async (query: string, limit: number = 10): Promise<SearchResponse> => {
    const response = await api.get('/search', {
      params: { q: query, limit }
    })
    return response.data
  },

  // Get movie details
  getMovieDetails: async (movieTitle: string): Promise<Movie> => {
    const response = await api.get('/movie-details', {
      params: { movie: movieTitle }
    })
    return response.data
  },

  // Get all movies (paginated)
  getAllMovies: async (limit: number = 50, offset: number = 0) => {
    const response = await api.get('/all-movies', {
      params: { limit, offset }
    })
    return response.data
  },

  // Get trending movies
  getTrendingMovies: async (timeWindow: string = 'week'): Promise<TrendingResponse> => {
    const response = await api.get('/trending', {
      params: { time_window: timeWindow }
    })
    return response.data
  },

  // Get TMDB movie details
  getTmdbDetails: async (tmdbId: number) => {
    const response = await api.get(`/tmdb-details/${tmdbId}`)
    return response.data
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get('/health')
    return response.data
  }
}

export default api
