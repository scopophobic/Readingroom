# 🚀 Quick Integration Setup Guide

## Prerequisites

- Node.js 18+ and pnpm installed
- Python 3.8+ and pip installed
- PostgreSQL installed and running

## Step 1: Backend Setup

```bash
# Navigate to backend
cd Backend

# Install dependencies
pip install -r requirements.txt

# Set up database (if using PostgreSQL)
# Create database: readingroom
# Create user: djangoread with password: readingroom

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start backend server
python manage.py runserver
```

## Step 2: Frontend Setup

```bash
# Navigate to frontend
cd Frontend

# Install dependencies
pnpm install

# Create environment file
cp .env.example .env.local
# Edit .env.local with your backend URL
```

## Step 3: Environment Variables

Create `.env.local` in the Frontend directory:

```env
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000
NEXTAUTH_SECRET=your-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Step 4: Test Integration

1. Start both servers:

   ```bash
   # Backend (Terminal 1)
   cd Backend && python manage.py runserver

   # Frontend (Terminal 2)
   cd Frontend && pnpm dev
   ```

2. Visit the test page: `http://localhost:3000/test-integration`

3. Click "Run Integration Tests" to verify everything works

## Step 5: Verify Features

- ✅ Landing page shows for non-authenticated users
- ✅ Authentication flow works
- ✅ Posts are displayed
- ✅ Book search works
- ✅ User book statuses work

## Troubleshooting

### CORS Errors

- Check that backend is running on `http://127.0.0.1:8000`
- Verify CORS settings in `Backend/readingroom/settings.py`

### Authentication Issues

- Check JWT token in browser localStorage
- Verify backend authentication endpoints

### API Errors

- Check browser network tab for failed requests
- Verify API endpoints match between frontend and backend
- Check backend logs for errors

## Next Steps

1. Create some test posts in the backend admin
2. Test the full user flow
3. Deploy to production following the deployment checklist
