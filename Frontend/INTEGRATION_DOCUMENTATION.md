# 📚 Reading Room - Frontend-Backend Integration Documentation

## 🎯 **Project Overview**

Reading Room is a book-centered social media platform built with:

- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS, and shadcn/ui
- **Backend**: Django 4.2 with Django REST Framework, PostgreSQL
- **Authentication**: JWT tokens with refresh mechanism
- **Database**: PostgreSQL for production, SQLite for development

---

## 🔧 **Integration Status & Issues Fixed**

### ✅ **Completed Fixes**

1. **API Endpoint Alignment**

   - Fixed base URL to include `/api` prefix
   - Updated all frontend API calls to match backend endpoints
   - Corrected user book status endpoints

2. **Authentication Flow**

   - Implemented safe localStorage handling for SSR
   - Added proper JWT token management
   - Fixed auth context state management

3. **Data Structure Alignment**

   - Updated backend serializers to match frontend expectations
   - Fixed Post model field mapping (user vs author)
   - Enhanced UserBookStatus serializer

4. **CORS Configuration**
   - Backend CORS properly configured for frontend development
   - Allowed credentials and necessary headers

---

## 🏗 **Architecture Overview**

### **Backend Structure**

```
Backend/
├── readingroom/          # Main Django project
│   ├── settings.py      # Django settings with CORS, JWT, etc.
│   └── urls.py          # Main URL routing
├── books/               # Book management app
│   ├── models.py        # Book, UserBookStatus models
│   ├── views.py         # Google Books API integration
│   └── serializers.py   # Book serializers
├── posts/               # Post management app
│   ├── models.py        # Post model
│   ├── views.py         # Post CRUD operations
│   └── serializers.py   # Post serializers
├── users/               # User management app
│   ├── models.py        # Custom User model
│   └── views.py         # Authentication views
└── comments/            # Comment management app
```

### **Frontend Structure**

```
Frontend/
├── app/                 # Next.js app directory
│   ├── page.tsx         # Home page with auth redirect
│   ├── discover/        # Book discovery page
│   ├── profile/         # User profile page
│   └── auth/            # Authentication pages
├── components/          # Reusable UI components
│   ├── landing-page.tsx # Landing page component
│   └── ui/              # shadcn/ui components
├── lib/                 # Utility libraries
│   ├── api.ts           # Axios configuration
│   ├── api-client.ts    # API client functions
│   └── auth-context.tsx # Authentication context
```

---

## 🔌 **API Integration Details**

### **Base URL Configuration**

```typescript
// Frontend: lib/api.ts
const api = axios.create({
  baseURL: `${
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000"
  }/api`,
  headers: {
    "Content-Type": "application/json",
  },
});
```

### **Authentication Flow**

1. **Login**: POST `/api/users/login/` → Returns JWT tokens
2. **Token Storage**: Frontend stores in localStorage
3. **Request Interceptor**: Automatically adds Authorization header
4. **Token Refresh**: Automatic refresh when token expires

### **Key API Endpoints**

#### **Posts**

- `GET /api/posts/posts/` - List all posts
- `POST /api/posts/posts/` - Create new post
- `GET /api/posts/posts/{id}/` - Get specific post
- `PUT /api/posts/posts/{id}/` - Update post
- `DELETE /api/posts/posts/{id}/` - Delete post

#### **Books**

- `GET /api/books/search/?q={query}` - Search Google Books
- `POST /api/books/save/` - Save Google Book
- `GET /api/books/` - List all books
- `GET /api/books/{id}/` - Get specific book

#### **User Book Status**

- `GET /api/books/my-reading-status/` - List user's book statuses
- `POST /api/books/my-reading-status/` - Create book status
- `PUT /api/books/my-reading-status/{id}/` - Update book status

#### **Authentication**

- `POST /api/users/login/` - Login
- `POST /api/users/register/` - Register
- `POST /api/users/refresh/` - Refresh token
- `GET /api/users/me/` - Get current user
- `POST /api/users/logout/` - Logout

---

## 🚀 **Setup Instructions**

### **Backend Setup**

1. **Install Dependencies**

   ```bash
   cd Backend
   pip install -r requirements.txt
   ```

2. **Database Setup**

   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

3. **Create Superuser**

   ```bash
   python manage.py createsuperuser
   ```

4. **Run Backend**
   ```bash
   python manage.py runserver
   ```

### **Frontend Setup**

1. **Install Dependencies**

   ```bash
   cd Frontend
   pnpm install
   ```

2. **Environment Variables**
   Create `.env.local`:

   ```env
   NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000
   NEXTAUTH_SECRET=your-secret-key
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

3. **Run Frontend**
   ```bash
   pnpm dev
   ```

---

## 🔐 **Authentication Implementation**

### **JWT Token Management**

```typescript
// Frontend: lib/auth-context.tsx
const setAuthToken = (token: string | null) => {
  if (typeof window === "undefined") return;

  if (token) {
    localStorage.setItem("access_token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    localStorage.removeItem("access_token");
    delete api.defaults.headers.common["Authorization"];
  }
};
```

### **Safe localStorage Access**

```typescript
// Helper functions for SSR-safe localStorage
const getLocalStorageItem = (key: string): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
};
```

---

## 📊 **Data Flow**

### **Post Creation Flow**

1. User creates post in frontend
2. Frontend calls `POST /api/posts/posts/`
3. Backend validates and saves post
4. Backend returns post with transformed data
5. Frontend updates UI with new post

### **Book Search Flow**

1. User searches for books
2. Frontend calls `GET /api/books/search/?q={query}`
3. Backend queries Google Books API
4. Backend returns formatted book data
5. Frontend displays search results

### **User Book Status Flow**

1. User adds book to reading list
2. Frontend calls `POST /api/books/my-reading-status/`
3. Backend creates UserBookStatus record
4. Backend returns updated status
5. Frontend updates user's reading list

---

## 🛠 **Development Workflow**

### **Adding New Features**

1. **Backend First**: Create models, serializers, views
2. **API Testing**: Test endpoints with Postman/curl
3. **Frontend Integration**: Update API client
4. **UI Implementation**: Create frontend components
5. **Testing**: Test full integration

### **Debugging Tips**

1. **Check Network Tab**: Verify API calls and responses
2. **Backend Logs**: Check Django development server logs
3. **Frontend Console**: Check for JavaScript errors
4. **Database**: Verify data persistence in Django admin

---

## 🔧 **Common Issues & Solutions**

### **CORS Errors**

- **Issue**: Frontend can't access backend API
- **Solution**: Verify CORS settings in `settings.py`

### **Authentication Errors**

- **Issue**: 401 Unauthorized responses
- **Solution**: Check JWT token in localStorage and Authorization header

### **Data Mismatch**

- **Issue**: Frontend expects different data structure
- **Solution**: Update backend serializers to match frontend expectations

### **SSR Issues**

- **Issue**: localStorage not available during server-side rendering
- **Solution**: Use safe localStorage helpers and Suspense boundaries

---

## 📈 **Performance Optimizations**

### **Frontend**

- Use React.memo for expensive components
- Implement proper loading states
- Optimize images with Next.js Image component
- Use proper error boundaries

### **Backend**

- Implement database query optimization
- Use select_related and prefetch_related
- Add proper indexing to database
- Implement caching where appropriate

---

## 🚀 **Deployment Checklist**

### **Backend Deployment**

- [ ] Set DEBUG = False
- [ ] Configure production database
- [ ] Set up environment variables
- [ ] Configure static files
- [ ] Set up CORS for production domain
- [ ] Configure JWT settings for production

### **Frontend Deployment**

- [ ] Set NEXT_PUBLIC_BACKEND_URL to production URL
- [ ] Configure environment variables
- [ ] Build and test production build
- [ ] Deploy to Vercel/Netlify

---

## 📚 **Additional Resources**

- **Django REST Framework**: https://www.django-rest-framework.org/
- **Next.js Documentation**: https://nextjs.org/docs
- **JWT Authentication**: https://django-rest-framework-simplejwt.readthedocs.io/
- **CORS Configuration**: https://github.com/adamchainz/django-cors-headers

---

## 🤝 **Contributing**

1. Follow the established code structure
2. Test both frontend and backend changes
3. Update documentation for new features
4. Ensure proper error handling
5. Follow TypeScript best practices

---

_Last Updated: December 2024_
_Version: 1.0.0_
