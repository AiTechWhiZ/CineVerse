from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Dict, Optional
import requests
import os
from dotenv import load_dotenv

from recommender import recommender

# Load environment variables
load_dotenv()

app = FastAPI(
    title="CineVerse Movie Recommendation API",
    description="A content-based movie recommendation system",
    version="1.0.0"
)

@app.on_event("startup")
def load_model():
    global recommender
    try:
        from recommender import MovieRecommender
        recommender = MovieRecommender()
        print("✅ Model loaded successfully")
    except Exception as e:
        print("❌ Startup failed:", e)
        raise e

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# TMDB API configuration
TMDB_API_KEY = os.getenv("TMDB_API_KEY", "your_tmdb_api_key_here")
TMDB_BASE_URL = "https://api.themoviedb.org/3"

@app.get("/")
async def root():
    """Welcome endpoint"""
    return {
        "message": "Welcome to CineVerse Movie Recommendation API",
        "version": "1.0.0",
        "endpoints": {
            "recommend": "/recommend?movie=movie_name",
            "search": "/search?q=query",
            "movie-details": "/movie-details?movie=movie_name",
            "all-movies": "/all-movies",
            "trending": "/trending",
            "tmdb-details": "/tmdb-details/{tmdb_id}"
        }
    }

@app.get("/recommend")
async def get_recommendations(
    movie: str = Query(..., description="Movie title to get recommendations for"),
    limit: int = Query(10, ge=1, le=20, description="Number of recommendations to return")
):
    """
    Get movie recommendations based on a given movie title
    """
    try:
        recommendations = recommender.recommend_movies(movie, limit)
        if recommendations is None:
            search_results = recommender.search_movies(movie, 5)
            return JSONResponse(
                status_code=404,
                content={
                    "message": f"Movie '{movie}' not found. Did you mean:",
                    "suggestions": search_results[:3],
                    "recommendations": []
                }
            )
        
        # Use the data directly from recommender which already includes poster URLs
        enhanced_recommendations = []
        for rec in recommendations:
            movie_data = {
                "title": rec.get("title", ""),
                "genres": rec.get("genres", ""),
                "overview": rec.get("overview", ""),
                "vote_average": rec.get("rating", 0),
                "release_date": rec.get("release_date", ""),
                "similarity_score": rec.get("similarity_score", 0),
                "tmdb_id": rec.get("movie_id", None),
                "poster_path": rec.get("poster_url", "").replace("https://image.tmdb.org/t/p/w500/", "") if rec.get("poster_url") and "image.tmdb.org" in rec.get("poster_url", "") else None,
                "backdrop_path": rec.get("backdrop_path"),
                "tagline": rec.get("tagline"),
                "runtime": rec.get("runtime"),
                "budget": rec.get("budget"),
                "revenue": rec.get("revenue"),
                "id": rec.get("movie_id", None)
            }
            
            enhanced_recommendations.append(movie_data)
        
        return {
            "query_movie": movie,
            "recommendations": enhanced_recommendations,
            "total": len(enhanced_recommendations)
        }
        
    except Exception as e:
        print("🔥 BACKEND ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/search")
async def search_movies(
    q: str = Query(..., description="Search query"),
    limit: int = Query(10, ge=1, le=20, description="Maximum number of results")
):
    """
    Search for movies by title
    """
    try:
        results = recommender.search_movies(q, limit)
        
        # Process results to match expected format
        processed_results = []
        for rec in results:
            movie_data = {
                "title": rec.get("title", ""),
                "genres": rec.get("genres", ""),
                "overview": rec.get("overview", ""),
                "vote_average": rec.get("rating", 0),
                "release_date": rec.get("release_date", ""),
                "tmdb_id": rec.get("movie_id", None),
                "poster_path": rec.get("poster_url", "").replace("https://image.tmdb.org/t/p/w500/", "") if rec.get("poster_url") and "image.tmdb.org" in rec.get("poster_url", "") else None,
                "backdrop_path": rec.get("backdrop_path"),
                "tagline": rec.get("tagline"),
                "runtime": rec.get("runtime"),
                "budget": rec.get("budget"),
                "revenue": rec.get("revenue"),
                "id": rec.get("movie_id", None)
            }
            processed_results.append(movie_data)
        
        return {
            "query": q,
            "results": processed_results,
            "total": len(processed_results)
        }
        
    except Exception as e:
        print("🔥 BACKEND ERROR:", e)
    raise HTTPException(status_code=500, detail=str(e))

@app.get("/movie-details")
async def get_movie_details(
    movie: str = Query(..., description="Movie title")
):
    """
    Get detailed information about a specific movie
    """
    try:
        movie_data = recommender.get_movie_details(movie)
        
        if not movie_data:
            raise HTTPException(status_code=404, detail=f"Movie '{movie}' not found")
        
        # Process movie data to match expected format
        processed_movie_data = {
            "title": movie_data.get("title", ""),
            "genres": movie_data.get("genres", ""),
            "overview": movie_data.get("overview", ""),
            "vote_average": movie_data.get("rating", 0),
            "release_date": movie_data.get("release_date", ""),
            "tmdb_id": movie_data.get("movie_id", None),
            "poster_path": movie_data.get("poster_url", "").replace("https://image.tmdb.org/t/p/w500/", "") if movie_data.get("poster_url") and "image.tmdb.org" in movie_data.get("poster_url", "") else None,
            "backdrop_path": movie_data.get("backdrop_path"),
            "tagline": movie_data.get("tagline"),
            "runtime": movie_data.get("runtime"),
            "budget": movie_data.get("budget"),
            "revenue": movie_data.get("revenue"),
            "id": movie_data.get("movie_id", None)
        }
        
        return processed_movie_data
        
    except Exception as e:
        print("🔥 BACKEND ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/all-movies")
async def get_all_movies(
    limit: int = Query(50, ge=1, le=500, description="Maximum number of movies to return"),
    offset: int = Query(0, ge=0, description="Number of movies to skip")
):
    """
    Get a list of all movies (paginated)
    """
    try:
        all_movies = recommender.get_all_movies()
        
        # Apply pagination
        start_idx = offset
        end_idx = min(offset + limit, len(all_movies))
        movies_slice = all_movies[start_idx:end_idx]
        
        return {
            "movies": [{"title": title} for title in movies_slice],
            "total": len(all_movies),
            "limit": limit,
            "offset": offset,
            "has_more": end_idx < len(all_movies)
        }
        
    except Exception as e:
        print("🔥 BACKEND ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/trending")
async def get_trending_movies(
    time_window: str = Query("week", description="Time window: day, week, or month")
):
    """
    Get trending movies from TMDB API or fallback to popular movies from dataset
    """
    try:
        print(f"TMDB_API_KEY: {TMDB_API_KEY}")
        print(f"Default check: {TMDB_API_KEY == 'your_tmdb_api_key_here'}")
        print(f"Time window: {time_window}")
        
        if TMDB_API_KEY != "your_tmdb_api_key_here":
            try:
                url = f"{TMDB_BASE_URL}/trending/movie/{time_window}"
                params = {
                    "api_key": TMDB_API_KEY,
                    "language": "en-US"
                }
                
                print(f"Requesting URL: {url}")
                response = requests.get(url, params=params, timeout=10)
                print(f"Response status: {response.status_code}")
                response.raise_for_status()
                
                data = response.json()
                results = data.get("results", [])
                print(f"Results count: {len(results)}")
                
                if results:
                    # Enhance with additional details
                    enhanced_results = []
                    for movie in results[:10]:
                        # Get additional details for each trending movie
                        try:
                            detail_url = f"{TMDB_BASE_URL}/movie/{movie['id']}"
                            detail_params = {
                                "api_key": TMDB_API_KEY,
                                "language": "en-US"
                            }
                            detail_response = requests.get(detail_url, params=detail_params, timeout=5)
                            if detail_response.status_code == 200:
                                detail_data = detail_response.json()
                                movie.update({
                                    "budget": detail_data.get("budget", 0),
                                    "revenue": detail_data.get("revenue", 0),
                                    "runtime": detail_data.get("runtime", 0),
                                    "tagline": detail_data.get("tagline", ""),
                                    "genres": ", ".join([g["name"] for g in detail_data.get("genres", [])])
                                })
                        except:
                            pass  # Continue with basic data if details fail
                        
                        enhanced_results.append(movie)
                    
                    return {
                        "trending": enhanced_results,
                        "total": len(enhanced_results),
                        "time_window": time_window
                    }
            except Exception as e:
                print(f"TMDB request failed: {e}")
        
        # Fallback: Return popular movies from our dataset
        print("Using fallback: popular movies from dataset")
        all_movies = recommender.get_all_movies()
        
        # Get some popular movie titles (you can customize this list)
        popular_titles = [
            "The Dark Knight", "Inception", "Interstellar", "The Matrix", "Pulp Fiction",
            "The Shawshank Redemption", "Forrest Gump", "Fight Club", "The Godfather", "Goodfellas",
            "The Avengers", "Avatar", "Titanic", "Jurassic Park", "The Lion King",
            "The Dark Knight Rises", "The Prestige", "Memento", "Gladiator", "The Departed"
        ]
        
        trending_movies = []
        for title in popular_titles:
            movie_data = recommender.get_movie_details(title)
            if movie_data:
                # Convert to expected format
                trending_movies.append({
                    "id": movie_data.get("movie_id"),
                    "title": movie_data.get("title"),
                    "overview": movie_data.get("overview", ""),
                    "vote_average": movie_data.get("rating", 0),
                    "poster_path": movie_data.get("poster_url", "").replace("https://image.tmdb.org/t/p/w500/", "") if movie_data.get("poster_url") and "image.tmdb.org" in movie_data.get("poster_url", "") else None,
                    "release_date": movie_data.get("release_date"),
                    "popularity": 100.0,  # Default popularity
                    "budget": movie_data.get("budget", 0),
                    "revenue": movie_data.get("revenue", 0),
                    "runtime": movie_data.get("runtime", 0),
                    "tagline": movie_data.get("tagline", ""),
                    "genres": movie_data.get("genres", "")
                })
            
            if len(trending_movies) >= 10:
                break
        
        print(f"Fallback returned {len(trending_movies)} movies")
        return {
            "trending": trending_movies,
            "total": len(trending_movies),
            "time_window": time_window,
            "message": "Showing popular movies from our collection (TMDB unavailable)"
        }
        
    except Exception as e:
        print(f"General error in trending: {e}")
        return {
            "message": "Failed to fetch trending movies",
            "error": str(e),
            "trending": [],
            "time_window": time_window
        }

@app.get("/tmdb-details/{tmdb_id}")
async def get_tmdb_movie_details(tmdb_id: int):
    """
    Get detailed movie information from TMDB API
    """
    try:
        if TMDB_API_KEY == "your_tmdb_api_key_here":
            raise HTTPException(status_code=503, detail="TMDB API key not configured")
        
        url = f"{TMDB_BASE_URL}/movie/{tmdb_id}"
        params = {
            "api_key": TMDB_API_KEY,
            "language": "en-US",
            "append_to_response": "credits,videos"
        }
        
        response = requests.get(url, params=params)
        response.raise_for_status()
        
        return response.json()
        
    except requests.RequestException as e:
        raise HTTPException(status_code=503, detail=f"TMDB API error: {str(e)}")

@app.get("/debug-env")
async def debug_env():
    """
    Debug endpoint to check environment variables
    """
    return {
        "tmdb_api_key": TMDB_API_KEY,
        "tmdb_base_url": TMDB_BASE_URL,
        "is_default": TMDB_API_KEY == "your_tmdb_api_key_here",
        "key_length": len(TMDB_API_KEY) if TMDB_API_KEY else 0
    }

@app.get("/ping")
def ping():
    return {"status": "running"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "recommender_loaded": recommender.movies_df is not None,
        "total_movies": len(recommender.get_all_movies()) if recommender.movies_df is not None else 0
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
