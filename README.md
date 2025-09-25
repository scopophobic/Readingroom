# 📚 Reading Room - Intelligent Book Social Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)](https://nextjs.org/)
[![Django](https://img.shields.io/badge/Django-5.2-green)](https://djangoproject.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-latest-009688)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.10+-blue)](https://python.org/)

A next-generation book-centered social media platform that combines AI-powered recommendations, intelligent book discussions, and vibrant community features to revolutionize how readers discover, discuss, and share their literary experiences.

## 🌟 Key Features

### 📖 **Smart Book Discovery**
- **Google Books Integration**: Seamlessly search and explore millions of books
- **AI-Powered Recommendations**: Advanced semantic search based on emotional tone, genre preferences, and reading patterns
- **Personalized Discovery**: Machine learning algorithms that understand your reading taste
- **Visual Book Search**: Rich metadata with covers, descriptions, and ratings

### 🤖 **RAG-Based Book Chat**
- **Intelligent Book Discussions**: Chat with AI about specific books using Retrieval-Augmented Generation
- **Context-Aware Responses**: AI understands book content through vector embeddings and Wikipedia integration
- **Literary Analysis**: Deep conversations about themes, characters, plot, and literary techniques
- **Memory-Enabled Conversations**: Maintains conversation history for continuity

### 🎯 **Semantic Recommendation Engine**
- **Emotion-Based Filtering**: Find books by mood (Happy, Suspenseful, Sad, Surprising, Angry)
- **Genre Intelligence**: Advanced categorization beyond simple genre tags
- **Vector Search**: Semantic similarity matching for nuanced recommendations
- **Multi-Factor Analysis**: Combines content analysis, sentiment, and user preferences

### 👥 **Social Community Platform**
- **Dynamic Posts**: Share thoughts, reviews, and reading updates
- **Rich Discussions**: Comment threads and book-focused conversations
- **User Profiles**: Track reading history, favorite books, and social connections
- **Feed Algorithms**: Curated content based on interests and connections

## 🏗 Architecture Overview

### Frontend (Next.js 15 + TypeScript)
```
Frontend/
├── app/                    # Next.js 15 App Router
│   ├── auth/              # Authentication pages
│   ├── books/             # Book discovery & details
│   ├── posts/             # Social media feed
│   ├── discussions/       # Book chat interface
│   ├── ai-recommendations/ # AI recommendation engine
│   ├── discover/          # Book search & browse
│   └── profile/           # User management
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui component library
│   ├── book-card.tsx     # Book display components
│   ├── post-card.tsx     # Social post components
│   └── chat-interface.tsx # AI chat components
└── lib/                  # Utilities & API clients
    ├── api-client.ts     # Backend API integration
    ├── auth-context.tsx  # Authentication state
    └── hooks/            # Custom React hooks
```

### Backend (Django REST Framework)
```
Backend/
├── readingroom/          # Main Django project
│   ├── settings.py      # Configuration with CORS, JWT
│   └── urls.py          # API routing
├── books/               # Book management
│   ├── models.py        # Book & UserBookStatus models
│   ├── views.py         # Google Books API integration
│   ├── serializers.py   # API serialization
│   └── utils/           # Google Books utilities
├── posts/               # Social media functionality
│   ├── models.py        # Post & interaction models
│   ├── views.py         # CRUD operations
│   └── serializers.py   # Post API serialization
├── users/               # User management
│   ├── models.py        # Custom User model
│   ├── views.py         # Authentication & profiles
│   └── serializers.py   # User API serialization
└── comments/            # Comment system
    ├── models.py        # Comment models
    ├── views.py         # Comment operations
    └── serializers.py   # Comment serialization
```

### RAG Chat System (FastAPI + AI)
```
Retrieval-Augmented Conversational Agents/
├── backend/
│   ├── api.py           # FastAPI endpoints
│   ├── embedder.py      # Vector embedding generation
│   ├── query_engine.py  # RAG query processing
│   ├── wiki_fetch.py    # Wikipedia data retrieval
│   └── main.py          # FastAPI application
├── vectorstore/         # ChromaDB vector storage
└── data/               # Book metadata & content
```

### Semantic Recommender (ML Engine)
```
Semantic-book-recommender/
├── app.py              # Gradio recommendation interface
├── vector-search.ipynb # Vector similarity algorithms
├── sentiment-analysis.ipynb # Emotion classification
├── text-classification.ipynb # Genre categorization
└── data/               # Processed book datasets
```

## 🚀 Technology Stack

### **Frontend Technologies**
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Modern component library
- **Radix UI**: Accessible component primitives
- **Axios**: HTTP client for API communication
- **NextAuth.js**: Authentication solution

### **Backend Technologies**
- **Django 5.2**: Robust web framework
- **Django REST Framework**: API development
- **PostgreSQL**: Production database
- **JWT Authentication**: Secure token-based auth
- **Django CORS Headers**: Cross-origin support
- **Google Books API**: Book metadata source

### **AI & ML Technologies**
- **FastAPI**: High-performance API framework
- **ChromaDB**: Vector database for embeddings
- **Sentence Transformers**: Text embedding models
- **Google Gemini API**: Large language model
- **LangChain**: LLM application framework
- **Gradio**: ML model interface
- **Pandas & NumPy**: Data processing

### **Development & Deployment**
- **Docker**: Containerization
- **Git**: Version control
- **Environment Variables**: Secure configuration
- **CORS**: Cross-origin resource sharing
- **RESTful APIs**: Standardized communication

## 🔧 Installation & Setup

### Prerequisites
- **Node.js 18+** and npm/pnpm
- **Python 3.10+** and pip
- **PostgreSQL** (for production)
- **Git** for version control

### API Keys Required
```bash
# Google Books API
GOOGLE_API_KEY=your_google_books_api_key

# Google Gemini API (for AI chat)
GEMINI_API_KEY=your_gemini_api_key

# Django Secret Key
SECRET_KEY=your_django_secret_key

# Database URL (production)
DATABASE_URL=your_postgresql_url
```

### Quick Start

#### 1. Frontend Setup
```bash
cd Frontend
npm install
# or
pnpm install

# Start development server
npm run dev
# Runs on http://localhost:3000
```

#### 2. Django Backend Setup
```bash
cd Backend
pip install -r requirements.txt

# Database migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start Django server
python manage.py runserver
# Runs on http://localhost:8000
```

#### 3. RAG Chat System Setup
```bash
cd "Retrieval-Augmented Conversational Agents for Literary Discussion/backend"
pip install -r requirements.txt

# Create .env file with API keys
echo "GOOGLE_API_KEY=your_key" > .env
echo "GEMINI_API_KEY=your_key" >> .env

# Start FastAPI server
uvicorn main:app --reload --port 8001
# Runs on http://localhost:8001
```

#### 4. Semantic Recommender Setup
```bash
cd Semantic-book-recommender
pip install -r requirements.txt

# Start Gradio interface
python app.py
# Creates shareable Gradio endpoint
```

## 📊 API Documentation

### Django Backend APIs
- **Base URL**: `http://localhost:8000/api/`
- **Authentication**: JWT Bearer tokens
- **Documentation**: Available at `/api/docs/` (when DEBUG=True)

#### Key Endpoints
```bash
# Authentication
POST /auth/login/          # User login
POST /auth/register/       # User registration
POST /auth/refresh/        # Token refresh

# Books
GET  /books/              # List books
GET  /books/{id}/         # Book details
POST /books/fetch/        # Fetch from Google Books
GET  /books/search/       # Search books

# Posts
GET  /posts/              # List posts
POST /posts/              # Create post
GET  /posts/{id}/         # Post details
PUT  /posts/{id}/         # Update post
DELETE /posts/{id}/       # Delete post

# Comments
GET  /posts/{id}/comments/ # Post comments
POST /posts/{id}/comments/ # Add comment
```

### RAG Chat APIs
- **Base URL**: `http://localhost:8001/`
- **Content-Type**: `application/json`

```bash
# Book Preparation
GET  /search-books        # Search Google Books
POST /books/fetch-wiki    # Fetch Wikipedia data
POST /books/embed         # Generate embeddings
POST /books/prepare       # Full preparation pipeline

# Chat Interface
POST /chat/query          # Ask questions about books
GET  /books/check         # Check if book is ready
```

### Semantic Recommender
- **Interface**: Gradio web interface
- **Input**: Text description, genre, emotional tone
- **Output**: Ranked book recommendations with covers

## 🔥 Core Features Deep Dive

### 1. AI-Powered Book Recommendations

The semantic recommendation system uses advanced machine learning to understand book content and user preferences:

- **Vector Embeddings**: Books are represented as high-dimensional vectors
- **Semantic Search**: Find books similar in meaning, not just keywords
- **Emotion Analysis**: Filter by emotional tone (joy, fear, anger, surprise, sadness)
- **Genre Intelligence**: Advanced categorization beyond simple tags
- **Personalization**: Learns from user interactions and preferences

### 2. RAG-Based Book Discussions

Revolutionary AI chat system for deep book conversations:

- **Content Preparation**: Wikipedia data + vector embeddings
- **Context Retrieval**: Relevant book passages for each question
- **Response Generation**: Google Gemini creates contextual answers
- **Memory**: Maintains conversation history for continuity
- **Metadata Integration**: Uses book details for richer responses

### 3. Social Media Features

Community-focused platform for book lovers:

- **Dynamic Posts**: Rich text posts about books and reading
- **Comments & Discussions**: Threaded conversations
- **User Profiles**: Reading history and social connections
- **Book Status**: Track reading progress (want to read, reading, read)
- **Discovery Feed**: Algorithm-curated content

### 4. Book Discovery Engine

Powerful search and discovery tools:

- **Google Books Integration**: Access to millions of books
- **Advanced Filtering**: Genre, author, publication date, ratings
- **Visual Search**: Rich metadata with covers and descriptions
- **Related Books**: AI-suggested similar titles
- **Trending**: Popular books and rising titles

## 🔒 Security & Authentication

- **JWT Tokens**: Secure authentication with refresh mechanism
- **CORS Configuration**: Proper cross-origin resource sharing
- **Environment Variables**: Secure API key management
- **Input Validation**: Request validation and sanitization
- **Rate Limiting**: API protection against abuse
- **HTTPS Ready**: SSL/TLS support for production

## 🚀 Deployment

### Development
- **Frontend**: Next.js development server
- **Backend**: Django development server
- **Database**: SQLite for development
- **AI Services**: Local FastAPI instances

### Production
- **Frontend**: Vercel, Netlify, or custom hosting
- **Backend**: Railway, Heroku, or VPS
- **Database**: PostgreSQL (Railway, Supabase, AWS RDS)
- **AI Services**: Cloud deployment with Docker
- **CDN**: Static asset optimization

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript/Python best practices
- Write comprehensive tests
- Update documentation
- Follow conventional commit messages
- Ensure code passes linting

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Books API** for book metadata
- **Google Gemini** for AI conversation capabilities
- **ChromaDB** for vector storage and retrieval
- **shadcn/ui** for beautiful UI components
- **Vercel** for Next.js hosting platform
- **Open Source Community** for amazing tools and libraries

## 📧 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/your-username/reading-room/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/reading-room/discussions)
<!-- - **Documentation**: [Project Wiki](https://github.com/your-username/reading-room/wiki) -->

---

**Reading Room** - Where every page opens a new conversation 📚✨
