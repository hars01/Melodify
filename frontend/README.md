# Melodify — Modern Music Streaming Frontend 🎵

> A high-performance, modern music streaming frontend application built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **Vanilla CSS Design System**, seamlessly integrated with the existing Express & MongoDB backend.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture & Folder Structure](#architecture--folder-structure)
4. [File Inventory & Responsibilities](#file-inventory--responsibilities)
5. [Routes & Page Functionality](#routes--page-functionality)
6. [Music Player Engine](#music-player-engine)
7. [Design System, Aesthetics & Responsiveness](#design-system-aesthetics--responsiveness)
8. [Backend API & Authentication Integration](#backend-api--authentication-integration)
9. [Environment Variables](#environment-variables)
10. [Installation & Running Instructions](#installation--running-instructions)
11. [Known Backend Limitations & Frontend Solutions](#known-backend-limitations--frontend-solutions)

---

## 1. Project Overview

Melodify Frontend provides an immersive, audio-focused interface for music listeners and creators. It integrates directly with the existing Express.js backend for authentication (JWT cookies), track queries, album creation, and multipart audio file uploads to ImageKit.

---

## 2. Technology Stack

- **Framework:** Next.js 16.4.1 (App Router, Turbopack)
- **UI Library:** React 19.3.1 (Server & Client Components)
- **Language:** TypeScript 7.0.2 (Strict type checking)
- **Styling:** Curated Vanilla CSS with custom design tokens, glassmorphism, and responsive breakpoints
- **Iconography:** `lucide-react`
- **Audio Engine:** Custom HTML5 `Audio` singleton state machine with event listeners and race-condition guards

---

## 3. Architecture & Folder Structure

```
Frontend/
├── app/
│   ├── globals.css                # Obsidian & Neon global design system & tokens
│   ├── layout.tsx                 # Root layout with providers & shell structure
│   ├── loading.tsx                # Dynamic route suspense spinner
│   ├── error.tsx                  # Global error boundary with retry trigger
│   ├── not-found.tsx              # 404 handler
│   ├── page.tsx                   # Home page (Hero, Trending Tracks, Albums)
│   ├── discover/page.tsx          # Moodboards, genres, and audio discovery
│   ├── search/page.tsx            # Multi-dimensional instant search
│   ├── library/page.tsx           # Liked songs, custom playlists, and history
│   ├── playlists/
│   │   ├── page.tsx               # Playlists collection & create modal
│   │   └── [id]/page.tsx          # Playlist track view, play all, delete
│   ├── albums/
│   │   ├── page.tsx               # Albums catalog
│   │   └── [id]/page.tsx          # Album tracklist & LP vinyl display
│   ├── artists/
│   │   ├── page.tsx               # Artist directory & release counters
│   │   └── [id]/page.tsx          # Artist discography & verified profile
│   ├── upload/page.tsx            # Creator studio (Audio upload & album maker)
│   ├── login/page.tsx             # User authentication screen
│   ├── register/page.tsx          # Role-based registration (Listener / Artist)
│   └── profile/page.tsx           # User profile, statistics & logout
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx            # Desktop & tablet navigation sidebar
│   │   ├── Header.tsx             # Sticky top header with search & user status
│   │   └── MobileNav.tsx          # Mobile bottom navigation dock
│   ├── player/
│   │   ├── Player.tsx             # Persistent audio player bar
│   │   └── QueueDrawer.tsx        # Slide-out playback queue manager
│   ├── music/
│   │   ├── TrackCard.tsx          # Interactive track card with hover play
│   │   ├── TrackRow.tsx           # Table row for album & playlist tracklists
│   │   ├── AlbumCard.tsx          # Dynamic gradient album card
│   │   └── Visualizer.tsx         # Animated audio soundwave bars
│   └── ui/
│       └── PlaylistModal.tsx      # Modal to add tracks to existing/new playlists
├── contexts/
│   ├── AuthContext.tsx            # User session, role validation, login/logout
│   ├── PlayerContext.tsx          # Persistent HTML5 Audio state engine
│   └── ToastContext.tsx           # Toast feedback notifications
├── services/
│   ├── api.ts                     # Centralized API fetch client with cookie support
│   ├── authService.ts             # Calls /api/auth/register, /login, /logout
│   └── musicService.ts            # Calls /api/music, /upload, /albums, /album
├── types/
│   └── index.ts                   # TypeScript interfaces and contracts
├── utils/
│   ├── formatters.ts              # mm:ss time formatting & gradient generators
│   └── storage.ts                 # Safe localStorage state persistence wrapper
├── .env.example                   # Environment variable template
├── .env.local                     # Local development configuration
├── next.config.js                 # API rewrites & remote image domains
├── package.json                   # Dependencies and npm scripts
└── tsconfig.json                  # TypeScript compiler options
```

---

## 4. File Inventory & Responsibilities

| File Path | Purpose | Key Responsibilities |
|---|---|---|
| `app/globals.css` | Design System | Defines CSS variables, obsidian dark palette, neon gradients, cards, sliders, animations, and media queries. |
| `app/layout.tsx` | Shell Layout | Wraps application with `ToastProvider`, `AuthProvider`, `PlayerProvider`, `Sidebar`, `Header`, `Player`, `QueueDrawer`, and `MobileNav`. |
| `contexts/ToastContext.tsx` | UI Feedback | Manages stack of toast notifications for successes, errors, and audio events. |
| `contexts/AuthContext.tsx` | Authentication | Hydrates user from storage, executes login/register/logout with backend, manages `isArtist` and `isAdmin` flags. |
| `contexts/PlayerContext.tsx` | Audio Engine | Manages single `Audio` element, playback queue, volume, shuffle, repeat, favorites, and playlists with storage synchronization. |
| `services/api.ts` | API Client | Centralizes fetch calls, serializes parameters, handles errors, and ensures `credentials: 'include'` for cookies. |
| `services/authService.ts` | Auth Service | Exposes typed endpoints for user authentication. |
| `services/musicService.ts` | Music Service | Exposes typed endpoints for track and album queries and multipart uploads. |
| `components/player/Player.tsx` | Persistent Player | Fixed bottom bar displaying artwork, title, seek bar, time, volume, shuffle, and repeat controls. |
| `components/player/QueueDrawer.tsx` | Queue Drawer | Slide-out panel for inspecting, playing, and clearing upcoming queue tracks. |
| `components/music/TrackCard.tsx` | Music Card | Grid card displaying artwork, animated soundwave visualizer, title, artist, like button, and add-to-playlist trigger. |
| `components/music/TrackRow.tsx` | Music Table Row | List row for albums and playlists with index, title, artist, duration, like, and remove actions. |
| `components/ui/PlaylistModal.tsx` | Playlist Dialog | Accessible modal allowing users to create a playlist or add a track to an existing one. |
| `utils/formatters.ts` | Format Utilities | Formats seconds into `mm:ss`, extracts artist names safely, and generates deterministic cover gradients. |
| `utils/storage.ts` | Storage Wrapper | SSR-safe `localStorage` helper for favorites, playlists, and user session cache. |

---

## 5. Routes & Page Functionality

### 1. Home (`/`)
- Hero banner with audio visualizer and quick playback.
- Displays **Trending Tracks** fetched directly from `GET /api/music`.
- Displays **Featured Albums** fetched from `GET /api/music/albums`.
- Displays **Recently Played** tracks stored in user session.
- Displays auth notices and empty states when appropriate.

### 2. Discover (`/discover`)
- Mood & genre pills (Lo-Fi Chill, Synthwave, Cyberpunk, Ambient, Acoustic).
- Filterable track grid with instant audio preview.

### 3. Search (`/search`)
- Real-time instant search input with clear button.
- Multi-dimensional filter tabs: All, Songs, Albums, Artists.
- Searches song titles, artist usernames, and album titles simultaneously.

### 4. Library (`/library`)
- Dedicated user collection hub with 3 views: Liked Songs, Custom Playlists, and History.
- Quick "Play Favorites" action to stream all saved songs.

### 5. Playlists (`/playlists` & `/playlists/[id]`)
- Overview of all created playlists with track counters.
- Playlist detail view with duration calculations, play all, track removal, and deletion.

### 6. Albums (`/albums` & `/albums/[id]`)
- Album overview catalog.
- Detailed album LP view with disc artwork and full track listing fetched from `GET /api/music/albums/:id`.

### 7. Artists (`/artists` & `/artists/[id]`)
- Creator directory grouped from active releases.
- Artist detail page showing verified status and complete discography.

### 8. Creator Studio (`/upload`)
- Gated to `artist` and `admin` roles.
- Supports single track upload with Multer multipart form data directly to backend storage.
- Supports album creation linking uploaded track IDs.

### 9. Login & Register (`/login` & `/register`)
- Split-glass aesthetic with form validation.
- Role selector upon registration (Listener `user` vs Creator `artist`).
- Automatic login upon registration.

### 10. Profile (`/profile`)
- Displays user identity, email, role badge, session ID, and account statistics.
- Single-click sign out triggering backend cookie clearance.

---

## 6. Music Player Engine

The persistent audio player is implemented in `contexts/PlayerContext.tsx`:
1. **Single Audio Instance:** Uses a React `useRef<HTMLAudioElement>` to avoid memory leaks, duplicate streams, and event listener pile-ups.
2. **Autoplay Compliance:** Handles the browser `audio.play()` Promise carefully to avoid `AbortError` or uncaught exceptions.
3. **Audio Fallback:** If an uploaded audio URL fails or is incomplete, the engine automatically falls back to a verified royalty-free preview stream so playback never hangs.
4. **Queue Management:** Shuffle, repeat (off, all, one), previous track, next track, and upcoming queue drawer.

---

## 7. Design System, Aesthetics & Responsiveness

- **Obsidian Dark Palette:** Deep obsidian background (`#08090e`), elevated surface (`#131622`), glassmorphic panels (`rgba(19, 22, 34, 0.85)`).
- **Vibrant Neon Gradients:** Electric Violet (`#8b5cf6`), Radiant Magenta (`#ec4899`), Cyber Cyan (`#06b6d4`), and Emerald (`#10b981`).
- **Typography:** `Outfit` for bold display headings, `Plus Jakarta Sans` for clean body typography.
- **Responsive Layouts:**
  - **Desktop (>1024px):** Full sidebar, search header, grid cards, 3-column persistent player bar.
  - **Tablet (768px - 1024px):** Compact icon sidebar, auto-fit cards.
  - **Mobile (<768px):** Bottom navigation dock, streamlined mobile player bar, touch targets (>44px), zero horizontal overflow in portrait and landscape.

---

## 8. Backend API & Authentication Integration

- **Proxy Rewrites:** Next.js proxies `/api/:path*` to `http://localhost:3000/api/:path*`.
- **Cookies:** Uses HTTP cookie `Token` issued by the backend Express server. Requests pass `credentials: 'include'`.
- **Typo Resolution:** The runtime typo `.pupulate('artist')` in `Backend/src/controllers/music.controller.js` was corrected to `.populate('artist')` with user approval.

---

## 9. Environment Variables

Create `.env.local` inside `Frontend/`:
```env
# Backend Base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# Backend URL used by Next.js rewrites
BACKEND_INTERNAL_URL=http://localhost:3000
```

---

## 10. Installation & Running Instructions

```bash
# 1. Install dependencies
cd Frontend
npm install

# 2. Run the development server
npm run dev

# 3. Build for production
npm run build

# 4. Start production server
npm run start
```

Access the frontend in your browser at: **`http://localhost:3001`**

---

## 11. Known Backend Limitations & Frontend Solutions

1. **No Playlist Endpoints:** The backend lacks a playlist schema. The frontend implements local/session playlists saved via `safeStorage`.
2. **No Search Endpoint:** The frontend fetches catalog data and provides instantaneous client-side debounced search over tracks, artists, and albums.
3. **Response Key Differences:** `getAllAlbums` in the backend returns albums in a key named `musics`. The frontend `musicService` transparently maps this.
