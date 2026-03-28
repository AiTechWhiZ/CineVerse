import pickle
import pandas as pd
import numpy as np
import requests
from functools import lru_cache
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from typing import List, Dict, Optional
import os

# Create a requests Session with retries (mounted once)
session = requests.Session()
retries = Retry(total=3, backoff_factor=0.6, status_forcelist=[429, 500, 502, 503, 504], allowed_methods=["GET"])
adapter = HTTPAdapter(max_retries=retries)
session.mount("https://", adapter)
session.mount("http://", adapter)

class MovieRecommender:
    def __init__(self):
        self.movies_df = None
        self.similarity_matrix = None
        self.movie_to_index = {}
        self.tmdb_api_key = os.getenv("TMDB_API_KEY")
        try:
            self.load_models()
        except Exception as e:
            print("Model loading failed:", e)
    
    def load_models(self):
        """Load the precomputed movie dictionary and similarity matrix"""
        try:
            # Load movie dictionary
            with open('models/movie_dict.pkl', 'rb') as f:
                self.movies_df = pickle.load(f)
            
            # Load similarity matrix
            with open('models/similarity.pkl', 'rb') as f:
                self.similarity_matrix = pickle.load(f).astype(np.float32)
            
            # Create movie to index mapping for fast lookup
            self.movie_to_index = {title.lower(): idx for idx, title in self.movies_df['title'].items()}
            
            print(f"Loaded {len(self.movies_df['title'])} movies and similarity matrix")
            
        except FileNotFoundError as e:
            print(f"Error loading model files: {e}")
            print("Please ensure movie_dict.pkl and similarity.pkl are in the models/ directory")
            raise
    
    @lru_cache(maxsize=512)
    def fetch_poster(self, movie_id):
        """Fetch movie poster from TMDB API"""
        placeholder = "https://via.placeholder.com/500x750?text=No+Image"
        try:
            movie_id = int(movie_id)
        except Exception:
            return placeholder
        try:
            url = f"https://api.themoviedb.org/3/movie/{movie_id}?api_key={self.tmdb_api_key}&language=en-US"
            response = session.get(url, timeout=10)
            if response.status_code == 404:
                return placeholder
            response.raise_for_status()
            data = response.json()
            poster_path = data.get('poster_path')
            if poster_path:
                return "https://image.tmdb.org/t/p/w500/" + poster_path
            return placeholder
        except requests.exceptions.RequestException as e:
            print("TMDB request failed:", e)
            return placeholder
    
    @lru_cache(maxsize=512)
    def fetch_details(self, movie_id):
        """Fetch detailed movie information from TMDB API"""
        try:
            movie_id = int(movie_id)
        except Exception:
            return {}
        try:
            url = f"https://api.themoviedb.org/3/movie/{movie_id}?api_key={self.tmdb_api_key}&language=en-US"
            response = session.get(url, timeout=10)
            response.raise_for_status()
            d = response.json()
            genres = ", ".join(g.get("name","") for g in d.get("genres", []))
            return {
                "overview": d.get("overview"),
                "genres": genres,
                "release_date": d.get("release_date") or d.get("first_air_date"),
                "rating": d.get("vote_average"),
                "homepage": d.get("homepage"),
                "backdrop_path": d.get("backdrop_path"),
                "runtime": d.get("runtime"),
                "budget": d.get("budget"),
                "revenue": d.get("revenue"),
                "tagline": d.get("tagline")
            }
        except requests.exceptions.RequestException:
            return {}
    
    def get_movie_index(self, movie_title: str) -> Optional[int]:
        """Get the index of a movie from its title (case-insensitive)"""
        return self.movie_to_index.get(movie_title.lower())
    
    def get_all_movies(self) -> List[str]:
        """Get list of all movie titles"""
        return list(self.movies_df['title'].values())
    
    def recommend_movies(self, movie_title: str, top_n: int = 10) -> List[Dict]:
        """
        Get movie recommendations based on a given movie title
        Matches the Streamlit logic exactly
        """
        try:
            movie_index = self.get_movie_index(movie_title)
            if movie_index is None:
                return []
            
            distances = self.similarity_matrix[movie_index]
            movies_list = sorted(list(enumerate(distances)), reverse=True, key=lambda x: x[1])[1:top_n+1]

            recommended_movies = []
            for idx, i in enumerate(movies_list):
                movie_idx = i[0]
                movie_data = {
                    'title': self.movies_df['title'][movie_idx],
                    'movie_id': self.movies_df['movie_id'][movie_idx],
                    'tags': self.movies_df['tags'][movie_idx]
                }
                
                movie_id = movie_data['movie_id']
                if movie_id is None:
                    continue
                
                movie_data['similarity_score'] = float(i[1])
                
                # Add poster URL
                poster_url = self.fetch_poster(movie_id) or "https://via.placeholder.com/500x750?text=No+Image"
                movie_data['poster_url'] = poster_url
                
                # Add TMDB details
                tmdb_details = self.fetch_details(movie_id)
                movie_data.update(tmdb_details)
                
                recommended_movies.append(movie_data)
            
            return recommended_movies
            
        except Exception as e:
            print(f"Error getting recommendations: {e}")
            return []
    
    def search_movies(self, query: str, limit: int = 10) -> List[Dict]:
        """
        Search for movies by title (fuzzy search)
        """
        try:
            query_lower = query.lower()
            matching_movies = []
            
            for idx, title in self.movies_df['title'].items():
                if query_lower in title.lower():
                    movie_data = {
                        'title': title,
                        'movie_id': self.movies_df['movie_id'][idx],
                        'tags': self.movies_df['tags'][idx]
                    }
                    
                    # Add poster URL and TMDB details
                    movie_id = movie_data['movie_id']
                    if movie_id:
                        poster_url = self.fetch_poster(movie_id) or "https://via.placeholder.com/500x750?text=No+Image"
                        movie_data['poster_url'] = poster_url
                        
                        tmdb_details = self.fetch_details(movie_id)
                        movie_data.update(tmdb_details)
                    
                    matching_movies.append(movie_data)
                    if len(matching_movies) >= limit:
                        break
            
            return matching_movies
            
        except Exception as e:
            print(f"Error searching movies: {e}")
            return []
    
    def get_movie_details(self, movie_title: str) -> Optional[Dict]:
        """Get detailed information about a specific movie"""
        try:
            movie_idx = self.get_movie_index(movie_title)
            
            if movie_idx is None:
                return None
            
            movie_data = {
                'title': self.movies_df['title'][movie_idx],
                'movie_id': self.movies_df['movie_id'][movie_idx],
                'tags': self.movies_df['tags'][movie_idx]
            }
            
            # Add poster URL and TMDB details
            movie_id = movie_data['movie_id']
            if movie_id:
                poster_url = self.fetch_poster(movie_id) or "https://via.placeholder.com/500x750?text=No+Image"
                movie_data['poster_url'] = poster_url
                
                tmdb_details = self.fetch_details(movie_id)
                movie_data.update(tmdb_details)
            
            return movie_data
            
        except Exception as e:
            print(f"Error getting movie details: {e}")
            return None

# Global recommender instance
recommender = MovieRecommender()
