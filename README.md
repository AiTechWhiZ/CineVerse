# 🎬 CineVerse - Movie Recommendation Web App

A modern, production-ready movie recommendation web application built with Next.js (frontend) and FastAPI (backend). Features content-based recommendations powered by precomputed similarity matrices from the TMDB 5000 dataset.

## ✨ Features

### 🎯 Core Features
- **Content-Based Recommendations**: AI-powered movie suggestions based on similarity scores
- **Smart Search**: Autocomplete with fuzzy search functionality
- **Rich Movie Details**: Comprehensive information including ratings, genres, release dates
- **Watchlist Management**: Add/remove movies with localStorage persistence
- **Trending Movies**: Integration with TMDB API for latest trending content
- **Responsive Design**: Beautiful Netflix-style UI optimized for all devices

### 🚀 Advanced Features
- **AI Chat Assistant**: Interactive chat window (Coming Soon message displayed)
- **Smooth Animations**: Framer Motion powered transitions and hover effects
- **Glassmorphism UI**: Modern design with backdrop blur effects
- **Dark Theme**: Netflix-inspired dark theme throughout
- **Loading States**: Skeleton loaders and smooth transitions
- **Error Handling**: Graceful error states and user feedback

## 🏗️ Architecture

### Backend (FastAPI)
```
backend/
├── main.py              # FastAPI application with endpoints
├── recommender.py       # Recommendation engine logic
├── requirements.txt     # Python dependencies
├── .env.example        # Environment variables template
└── models/             # Precomputed models directory
    ├── movie_dict.pkl  # Movie metadata dictionary
    └── similarity.pkl  # Similarity matrix
```

### Frontend (Next.js)
```
frontend/
├── app/
│   ├── page.tsx              # Home page with search and recommendations
│   ├── movie/[id]/page.tsx   # Movie details page
│   ├── watchlist/page.tsx    # Watchlist management
│   └── layout.tsx            # Root layout
├── components/
│   ├── Navbar.tsx            # Navigation component
│   ├── MovieCard.tsx         # Movie card with hover effects
│   ├── SearchBar.tsx         # Smart search with autocomplete
│   ├── RecommendationList.tsx # Horizontal scrolling movie list
│   ├── Loader.tsx            # Loading animation component
│   └── AIChat.tsx            # AI chat widget
├── lib/
│   ├── api.ts               # API integration layer
│   ├── types.ts             # TypeScript type definitions
│   └── utils.ts             # Utility functions
└── styles/
    └── globals.css          # Global styles and animations
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.8+
- `movie_dict.pkl` and `similarity.pkl` files in `backend/models/`

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Mac/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your TMDB API key (optional)
   ```

5. **Place model files**
   - Add `movie_dict.pkl` and `similarity.pkl` to `backend/models/`
   - These should be precomputed from the TMDB 5000 dataset

6. **Start the backend server**
   ```bash
   python main.py
   ```
   
   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd movie-recommender-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set environment variables**
   ```bash
   # Create .env.local file
   echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The application will be available at `http://localhost:3000`

## 📡 API Endpoints

### Movie Recommendations
- `GET /recommend?movie=movie_name&limit=10`
- Returns recommended movies based on content similarity

### Movie Search
- `GET /search?q=query&limit=10`
- Search movies by title with fuzzy matching

### Movie Details
- `GET /movie-details?movie=movie_name`
- Get detailed information about a specific movie

### Trending Movies
- `GET /trending`
- Get trending movies from TMDB API

### Health Check
- `GET /health`
- Check API status and model loading

## 🎨 UI Components

### MovieCard
- Hover animations with scale and overlay effects
- Displays poster, rating, release year, runtime
- Add to watchlist functionality
- Similarity score for recommendations

### SearchBar
- Real-time autocomplete suggestions
- Debounced search for performance
- Fuzzy search handling
- Keyboard navigation support

### RecommendationList
- Horizontal scrolling carousel
- Navigation buttons
- Smooth animations
- Responsive grid layout

### AIChat
- Floating chat button
- Animated chat window
- "Coming Soon" messaging
- Modern chat interface design

## 🛠️ Technologies Used

### Frontend
- **Next.js 14+** (App Router)
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons
- **Axios** for API calls

### Backend
- **FastAPI** for REST API
- **Python** with pandas and scikit-learn
- **Pickle** for model serialization
- **TMDB API** for movie data
- **CORS** middleware

## 🎯 Key Features Implementation

### Recommendation Engine
- Content-based filtering using cosine similarity
- Precomputed similarity matrix for fast lookups
- Efficient movie indexing and search
- Support for fuzzy movie title matching

### UI/UX Design
- Netflix-inspired dark theme
- Smooth transitions and micro-interactions
- Glassmorphism effects with backdrop blur
- Responsive design for mobile and desktop
- Loading states and error handling

### Performance Optimizations
- Debounced search input
- Lazy loading images
- API response caching
- Optimized component re-renders

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
TMDB_API_KEY=your_tmdb_api_key_here
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📱 Responsive Design

- **Mobile**: Optimized for 320px+ screens
- **Tablet**: Adaptive layouts for 768px+ screens
- **Desktop**: Full experience for 1024px+ screens
- **Large Desktop**: Enhanced layouts for 1440px+ screens

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the application: `npm run build`
2. Deploy to your preferred platform
3. Set environment variables in deployment settings

### Backend (Heroku/Railway/Render)
1. Install dependencies in production environment
2. Set environment variables
3. Start the FastAPI server with production WSGI server
4. Ensure model files are included in deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- TMDB for providing the movie database
- Next.js team for the excellent framework
- FastAPI for the modern Python web framework
- All contributors and open source libraries used

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation
- Review the API endpoints section

---

**Built with ❤️ for movie enthusiasts everywhere!**
