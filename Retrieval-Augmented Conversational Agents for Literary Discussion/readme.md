# Retrieval-Augmented Conversational Agents for Literary Discussion

A sophisticated literary discussion platform that combines the power of Large Language Models (LLMs) with retrieval-augmented generation to provide intelligent, context-aware discussions about books.

## Backend Architecture

### Technology Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **ChromaDB**: Vector database for efficient similarity search and storage
- **Sentence Transformers**: For generating high-quality text embeddings
- **Google Gemini API**: For generating contextual responses
- **Wikipedia API**: For fetching book-related information
- **Google Books API**: For book metadata and search

### Core Components

#### 1. Book Data Preparation Pipeline

The system follows a three-step process to prepare books for discussion:

1. **Book Search & Selection**

   - Uses Google Books API to search and retrieve book metadata
   - Endpoint: `/search-books`
   - Returns book details including title, authors, description, and thumbnail

2. **Wikipedia Data Fetching**

   - Retrieves comprehensive book information from Wikipedia
   - Endpoint: `/books/fetch-wiki`
   - Stores book summaries and content in JSON format
   - Handles disambiguation and not-found cases gracefully

3. **Content Embedding**
   - Processes book content into vector embeddings
   - Uses SentenceTransformer ("all-MiniLM-L6-v2") for embedding generation
   - Chunks content into 500-character segments for optimal processing
   - Stores embeddings in ChromaDB for efficient retrieval
   - Endpoint: `/books/embed`

#### 2. Vector Storage & Retrieval

- **ChromaDB Integration**

  - Persistent vector storage in `vectorstore` directory
  - Each book gets its own collection
  - Efficient similarity search for context retrieval
  - Automatic collection management and persistence

- **Embedding Process**
  - Content chunking for manageable segments
  - High-quality embeddings using SentenceTransformer
  - Unique IDs for each chunk
  - Automatic collection creation and management

#### 3. Query Processing System

The system implements a sophisticated query processing pipeline:

1. **Context Retrieval**

   - Converts user questions into embeddings
   - Retrieves most relevant book chunks using similarity search
   - Combines retrieved context with conversation history

2. **Response Generation**

   - Uses Google Gemini API for response generation
   - Incorporates:
     - Retrieved book context
     - Conversation history
     - Book metadata
     - Wikipedia information
   - Generates concise, contextually relevant responses

3. **Response Management**
   - Maintains conversation history
   - Compresses responses for efficient storage
   - Handles error cases gracefully

### API Endpoints

#### Book Management

- `GET /search-books`: Search for books using Google Books API
- `POST /books/fetch-wiki`: Fetch Wikipedia data for a book
- `POST /books/embed`: Generate and store embeddings for a book
- `GET /books/check`: Check if a book is prepared for discussion
- `POST /books/prepare`: Prepare a book for discussion (combines wiki fetch and embedding)

#### Discussion

- `POST /chat/query`: Process user questions and generate responses
  - Input: book_id, question, conversation history
  - Output: AI response with updated history

### Data Flow

1. **Book Preparation**

   ```
   User Request → Book Search → Wikipedia Fetch → Content Embedding → Vector Storage
   ```

2. **Query Processing**
   ```
   User Question → Embedding → Context Retrieval → Response Generation → User Response
   ```

### Security & Environment

- Environment variables for API keys
- CORS middleware for secure cross-origin requests
- Error handling and validation at each step
- Persistent storage with proper directory management

## Frontend Overview

The frontend is a modern web application that provides:

- Book search and selection interface
- Real-time chat interface for book discussions
- Progress tracking for book preparation
- Responsive design for various devices

## Getting Started

### Prerequisites

- Python 3.10+
- Required API keys:
  - Google Books API
  - Google Gemini API
  - (Optional) Wikipedia API

### Environment Setup

1. Create a `.env` file with required API keys:

   ```
   GOOGLE_API_KEY=your_google_books_api_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Start the backend server:
   ```bash
   uvicorn backend.main:app --reload
   ```

## Technical Approach

### Retrieval-Augmented Generation (RAG)

The system implements RAG to enhance LLM responses with relevant book context:

1. **Retrieval**: Uses vector similarity search to find relevant book passages
2. **Augmentation**: Combines retrieved context with user query
3. **Generation**: Uses Gemini to generate contextually relevant responses

### Vector Search Optimization

- Chunk size optimization (500 characters)
- Efficient embedding storage and retrieval
- Persistent vector database for quick access
- Automatic collection management

### Error Handling & Resilience

- Graceful handling of API failures
- Proper error messages for users
- Automatic retry mechanisms
- Data validation at each step

## Future Improvements

1. **Enhanced Context Retrieval**

   - Implement more sophisticated chunking strategies
   - Add metadata-aware retrieval
   - Implement hybrid search (keyword + semantic)

2. **Performance Optimization**

   - Implement caching for frequent queries
   - Optimize vector search parameters
   - Add batch processing for embeddings

3. **Additional Features**
   - Support for multiple languages
   - Enhanced book metadata integration
   - Advanced conversation management
   - User feedback integration
