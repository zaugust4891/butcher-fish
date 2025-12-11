# Market Scout Frontend

React frontend for the Specialty Food Market Review Platform.

## Quick Start

### Prerequisites
- Node.js 18+ (check with `node --version`)
- Your Flask backend (optional - frontend works in demo mode without it)

### Installation

```bash
# Navigate to frontend directory
cd market-scout-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be running at **http://localhost:3000**

### Connecting to Flask Backend

The frontend is configured to proxy API requests to your Flask backend at `localhost:5000`.

**Terminal 1 - Start Flask:**
```bash
cd /path/to/your/flask/project
flask run
```

**Terminal 2 - Start React:**
```bash
cd market-scout-frontend
npm run dev
```

When both are running, the status indicator in the header will show "API Connected" (green).

If Flask isn't running, the frontend automatically switches to "Demo Mode" (yellow) with mock data.

---

## Project Structure

```
market-scout-frontend/
├── index.html              # Entry HTML file
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite config with Flask proxy
├── src/
│   ├── main.jsx           # React entry point
│   ├── App.jsx            # Main application component
│   ├── index.css          # Global styles
│   │
│   ├── components/        # UI Components
│   │   ├── AuthModal.jsx      # Login/Register modal
│   │   ├── Header.jsx         # Navigation header
│   │   ├── Footer.jsx         # API reference footer
│   │   ├── MarketCard.jsx     # Individual market display
│   │   ├── ReviewForm.jsx     # Review submission form
│   │   ├── ProfilePanel.jsx   # User profile display
│   │   ├── StarRating.jsx     # Interactive star rating
│   │   └── Icons.jsx          # SVG icon components
│   │
│   ├── hooks/             # Custom React hooks
│   │   └── useApi.js          # Auth, markets, reviews hooks
│   │
│   └── services/          # API and data services
│       ├── api.js             # Flask API client
│       └── mockData.js        # Demo mode data
```

---

## How It Connects to Your Flask Backend

### Vite Proxy Configuration

The `vite.config.js` sets up a proxy that forwards requests:

```
Frontend Request          →  Flask Backend
─────────────────────────────────────────
GET  /api/                →  GET  http://localhost:5000/
GET  /api/leaderboard     →  GET  http://localhost:5000/leaderboard
POST /api/login           →  POST http://localhost:5000/login
POST /api/1/review        →  POST http://localhost:5000/1/review
```

### API Service Layer (`src/services/api.js`)

This file is the bridge between React and Flask:

| React Hook              | API Method              | Flask Route                |
|------------------------|------------------------|---------------------------|
| `useAuth().login()`    | `api.login()`          | `POST /login`             |
| `useAuth().register()` | `api.register()`       | `POST /register`          |
| `useAuth().logout()`   | `api.logout()`         | `POST /logout`            |
| `useMarkets()`         | `api.getMarkets()`     | `GET /`                   |
| `useLeaderboard()`     | `api.getLeaderboard()` | `GET /leaderboard`        |
| `useReviewSubmit()`    | `api.postReview()`     | `POST /<id>/review`       |

### JWT Token Handling

1. On login, tokens are stored in `sessionStorage`
2. Every authenticated request includes `Authorization: Bearer <token>` header
3. If access token expires, the API client automatically tries to refresh
4. On logout, tokens are cleared

---

## Development Workflow

### Making Changes

1. Edit components in `src/components/`
2. Vite hot-reloads automatically
3. Check browser console for errors

### Adding New API Endpoints

1. Add method in `src/services/api.js`:
   ```javascript
   async getMyNewEndpoint() {
     return this._request('GET', '/my-endpoint', null, true);
   }
   ```

2. Create a hook in `src/hooks/useApi.js`:
   ```javascript
   export function useMyNewData() {
     const [data, setData] = useState(null);
     // ... fetch logic
     return { data };
   }
   ```

3. Use in component:
   ```javascript
   const { data } = useMyNewData();
   ```

### Adding Mock Data

For new features where the backend isn't ready, add mock data in `src/services/mockData.js`.

---

## Building for Production

```bash
npm run build
```

This creates a `dist/` folder with static files you can serve from any web server.

### Deployment Options

**Option A: Serve from Flask**
```python
# In your Flask app
app = Flask(__name__, static_folder='../market-scout-frontend/dist', static_url_path='')

@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')
```

**Option B: Separate hosting (Vercel, Netlify, etc.)**
- Update `API_BASE` in `src/services/api.js` to your production Flask URL
- Configure CORS on your Flask backend

---

## Troubleshooting

### "Demo Mode" showing when Flask is running

1. Check Flask is on port 5000: `curl http://localhost:5000/`
2. Check for CORS errors in browser console
3. Verify proxy in `vite.config.js`

### Login not working

1. Check Flask `/login` route returns `access_token` in JSON
2. Check browser Network tab for the actual response
3. Verify your user exists in the database

### Reviews not posting

1. Must be logged in (JWT required)
2. Review text must be ≥10 characters
3. Rating must be 1-5

---

## Next Steps

Once you build out your profile routes in Flask, the frontend is ready:

1. **Implement Flask routes** in `app/routes/profiles.py`
2. **The API methods already exist** in `src/services/api.js`:
   - `api.getProfile(userId)`
   - `api.updateMyProfile(data)`
   - `api.followUser(userId)`
   - `api.unfollowUser(userId)`
   - `api.followMarket(marketId)`

3. **Create hooks** in `useApi.js` similar to existing patterns
4. **Update ProfilePanel.jsx** to use real data instead of mocks
