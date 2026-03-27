export interface Movie {
  title: string
  genres?: string
  overview?: string
  vote_average?: number
  release_date?: string
  similarity_score?: number
  tmdb_id?: number
  poster_path?: string
  backdrop_path?: string
  tagline?: string
  runtime?: number
  budget?: number
  revenue?: number
  production_companies?: any[]
  spoken_languages?: any[]
  id?: number
  popularity?: number
}

export interface RecommendationResponse {
  query_movie: string
  recommendations: Movie[]
  total: number
  suggestions?: Movie[]
  message?: string
}

export interface SearchResponse {
  query: string
  results: Movie[]
  total: number
}

export interface TrendingResponse {
  trending: any[]
  total: number
  time_window?: string
  message?: string
  error?: string
}

export interface WatchlistItem extends Movie {
  addedAt: string
}

export interface UserActivity {
  searchedMovies: string[]
  recommendedMovies: Movie[]
  viewedMovies: Movie[]
  lastActivity: string
}
