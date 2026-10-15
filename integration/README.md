# Melodify Frontend-Backend Integration Architecture

This folder contains the integration specifications, API endpoint mappings, environment guidelines, testing suites, and architectural contracts between the **Melodify Express Backend** and the **Next.js Frontend**.

---

## 1. System Integration Architecture

```
┌────────────────────────────────────────────────────────┐
│                   Next.js 16 Frontend                  │
│                     (Port: 3001)                       │
│                                                        │
│  • App Router (React 19 Server & Client Components)    │
│  • Audio Engine & Persistent Player Context            │
│  • Modern Obsidian & Neon Visual Design                │
└───────────────────────────┬────────────────────────────┘
                            │
               Browser Requests: /api/*
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│               Next.js Built-in Proxy Rewrite           │
│  • Automatically forwards /api/* to Express backend    │
│  • Solves Cross-Origin (CORS) seamlessly               │
│  • Ensures Same-Origin HTTP Cookie persistence         │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                  Express.js 5 Backend                  │
│                     (Port: 3000)                       │
│                                                        │
│  • JWT Auth Cookie Middleware ('Token')                │
│  • MongoDB & Mongoose ORM Storage                      │
│  • Multer Multipart Memory Storage                     │
│  • ImageKit Cloud Media CDN Delivery                   │
└────────────────────────────────────────────────────────┘
```

---

## 2. Communication Strategy

### Reverse Proxy via Next.js Rewrites
To eliminate CORS restrictions and ensure browser security without modifying backend business logic, Next.js rewrites all client requests matching `/api/:path*` directly to the Express server at `http://localhost:3000/api/:path*`.

- **Client Origin:** `http://localhost:3001`
- **Cookie Scope:** Set to `localhost:3001`, so `credentials: 'include'` sends the `Token` cookie automatically on all requests.
- **Backend Receives:** Direct HTTP requests with `req.cookies.Token` intact.

---

## 3. API Endpoint Mapping

| Method | Endpoint | Access Level | Description |
|---|---|---|---|
| `GET` | `/` | Public | Backend health check |
| `POST` | `/api/auth/register` | Public | Register user/artist & set JWT cookie |
| `POST` | `/api/auth/login` | Public | Authenticate user & set JWT cookie |
| `POST` | `/api/auth/logout` | Public | Clear JWT auth cookie |
| `GET` | `/api/music` | Protected (`authUser`) | Fetch uploaded tracks (populates artist) |
| `POST` | `/api/music/upload` | Protected (`authArtist`) | Upload track audio to ImageKit & save to DB |
| `GET` | `/api/music/albums` | Protected (`authUser`) | Fetch all albums |
| `GET` | `/api/music/albums/:id` | Protected (`authUser`) | Fetch specific album and tracks |
| `POST` | `/api/music/album` | Protected (`authArtist`) | Create album referencing track IDs |

For comprehensive payload schemas, header requirements, and response structures, see [`endpoint_mapping.md`](./endpoint_mapping.md).

---

## 4. Authentication Flow

1. **User Sign Up / Login:**
   - The user submits credentials to `POST /api/auth/register` or `POST /api/auth/login`.
   - The backend validates credentials with `bcryptjs` and signs a JSON Web Token containing `{ id, role }`.
   - The backend issues a `Set-Cookie: Token=<jwt_token>` header.
2. **Session Persistence:**
   - The browser automatically stores the cookie.
   - The frontend `AuthContext` caches basic user metadata (`username`, `email`, `role`) in browser storage to hydrate the UI instantly on refresh.
3. **Protected API Access:**
   - On every request to `/api/music/*`, the browser transmits the `Token` cookie.
   - Backend middleware (`authUser` or `authArtist`) verifies the token with `process.env.JWT_SECRET`.
4. **Sign Out:**
   - `POST /api/auth/logout` clears the `Token` cookie. Frontend state resets immediately.

---

## 5. Environment Configuration

### Backend (`Backend/.env`)
```env
PORT= 3000
MONGO_URI=mongodb+srv://.../melodify
JWT_SECRET=your_jwt_secret
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
```

### Frontend (`Frontend/.env.local`)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
BACKEND_INTERNAL_URL=http://localhost:3000
```

---

## 6. How to Start Both Applications

### Terminal 1: Start Express Backend
```bash
cd Backend
npm run dev
# Starts on http://localhost:3000
```

### Terminal 2: Start Next.js Frontend
```bash
cd Frontend
npm run dev
# Starts on http://localhost:3001
```

Access the application in your browser at: **`http://localhost:3001`**

---

## 7. How to Test the Integration

An automated integration test script is provided in this directory.

With the backend server running, execute:
```bash
node integration/test_integration.js
```

This tests:
1. Server health check (`GET /`)
2. Unauthorized security check (`GET /api/music` returning 401)
3. New user registration (`POST /api/auth/register`)
4. User login & cookie extraction (`POST /api/auth/login`)
5. Authenticated music retrieval (`GET /api/music`)
6. Authenticated album retrieval (`GET /api/music/albums`)
7. Secure logout & cookie clearance (`POST /api/auth/logout`)

---

## 8. Approved Configuration Changes

During initial inspection, a runtime typo was discovered in `Backend/src/controllers/music.controller.js` on lines 120, 147, and 166 where `.pupulate("artist")` was called instead of Mongoose's `.populate("artist")`. This typo caused queries to crash with a `TypeError`.

- **File Modified:** `Backend/src/controllers/music.controller.js`
- **Lines:** 120, 147, 166
- **Modification:** Changed `.pupulate("artist")` to `.populate("artist")`
- **Approval:** Explicitly approved by user. Zero backend business rules or schemas were modified.

---

## 9. Known Backend Capabilities & Frontend Accommodations

1. **Playlists:** The backend does not implement playlist models or endpoints. The frontend provides a full playlist experience persisted in client storage and documents this backend limitation.
2. **Search Endpoint:** The backend does not expose a `/api/music/search` query endpoint. The frontend performs fast, client-side debounced search filtering over fetched music and albums.
3. **Audio Streaming Fallback:** If an uploaded file's URL is unreachable or incomplete, the frontend audio engine falls back gracefully to a verified preview stream, ensuring the persistent music player never freezes.
4. **Backend Response Key Structure:** The backend `getAllAlbums` endpoint returns albums under the response key `musics`. The frontend service adapter parses both `response.albums` and `response.musics` transparently.
