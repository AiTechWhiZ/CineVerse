import axios from 'axios'
import { Movie, RecommendationResponse, SearchResponse, TrendingResponse } from './types'

// ✅ Use env OR fallback to your Render backend
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://cineverse-server-6uk4.onrender.com'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ✅ Request interceptor
api.interceptors.request.use(
  (config: any) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`)
    return config
  },
  (error: any) => Promise.reject(error)
)

// ✅ ONLY ONE response interceptor
api.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    console.error('FULL ERROR:', error)
    console.error('Response:', error.response)
    console.error('Message:', error.message)
    return Promise.reject(error)
  }
)

export const movieApi = {
  getRecommendations: async (movieTitle: string, limit: number = 10) => {
    try {
      const response = await api.get('/recommend', {
        params: { movie: movieTitle, limit }
      })
      return response.data
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Server is waking up... try again')
      }
      if (error.response?.status === 404) {
        return error.response.data
      }
      throw error
    }
  },

  searchMovies: async (query: string, limit: number = 10): Promise<SearchResponse> => {
    const response = await api.get('/search', {
      params: { q: query, limit }
    })
    return response.data
  },

  getMovieDetails: async (movieTitle: string): Promise<Movie> => {
    const response = await api.get('/movie-details', {
      params: { movie: movieTitle }
    })
    return response.data
  },

  getAllMovies: async (limit: number = 50, offset: number = 0) => {
    const response = await api.get('/all-movies', {
      params: { limit, offset }
    })
    return response.data
  },

  getTrendingMovies: async (timeWindow: string = 'week'): Promise<TrendingResponse> => {
    const response = await api.get('/trending', {
      params: { time_window: timeWindow }
    })
    return response.data
  },

  getTmdbDetails: async (tmdbId: number) => {
    const response = await api.get(`/tmdb-details/${tmdbId}`)
    return response.data
  },

  healthCheck: async () => {
    const response = await api.get('/health')
    return response.data
  }
}

export default api