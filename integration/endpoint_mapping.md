# Melodify API Endpoint Mapping & Contract Specification

This document details the exact API contracts implemented in the Melodify Express backend and integrated into the Next.js frontend.

---

## 1. Authentication Endpoints

Base URL: `http://localhost:3000/api/auth` (Proxied via `/api/auth` in Next.js)

### 1.1 Register User
- **Method:** `POST`
- **Route:** `/api/auth/register`
- **Access:** Public
- **Request Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "username": "string (required, unique)",
    "email": "string (required, unique)",
    "password": "string (required, hashed via bcryptjs)",
    "role": "string (optional: 'user' | 'artist' | 'admin', default: 'user')"
  }
  ```
- **Response Status:** `201 Created`
- **Response Headers:** `Set-Cookie: Token=<jwt_token>; Path=/`
- **Response Body:**
  ```json
  {
    "message": "User registered successfully",
    "user": {
      "id": "6ac40dcd0ed5f000b680be27",
      "username": "string",
      "email": "string",
      "role": "user"
    }
  }
  ```

### 1.2 Login User
- **Method:** `POST`
- **Route:** `/api/auth/login`
- **Access:** Public
- **Request Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "username": "string (optional if email provided)",
    "email": "string (optional if username provided)",
    "password": "string (required)"
  }
  ```
- **Response Status:** `200 OK`
- **Response Headers:** `Set-Cookie: Token=<jwt_token>; Path=/`
- **Response Body:**
  ```json
  {
    "message": "User logged in successfully",
    "user": {
      "id": "6ac40dcd0ed5f000b680be27",
      "username": "string",
      "email": "string",
      "role": "user | artist | admin"
    }
  }
  ```

### 1.3 Logout User
- **Method:** `POST`
- **Route:** `/api/auth/logout`
- **Access:** Public
- **Response Status:** `200 OK`
- **Response Headers:** `Set-Cookie: Token=; Path=/; Expires=Thu, 01 Jan 1970...`
- **Response Body:**
  ```json
  {
    "message": "You are successfully logged out"
  }
  ```

---

## 2. Music Endpoints

Base URL: `http://localhost:3000/api/music` (Proxied via `/api/music` in Next.js)

### 2.1 Get All Musics
- **Method:** `GET`
- **Route:** `/api/music`
- **Access:** Protected (`authMiddleware.authUser`)
- **Required Cookie:** `Token=<jwt_token>` (role: 'user', 'artist', or 'admin')
- **Response Status:** `200 OK`
- **Response Body:**
  ```json
  {
    "message": "Musics fetched successfully",
    "musics": [
      {
        "_id": "6ac7d31174dcb788fc9a642f",
        "title": "Midnight Horizon",
        "uri": "https://ik.imagekit.io/hiharsh/music_12345.mp3",
        "artist": {
          "_id": "6ac40dcd0ed5f000b680be27",
          "username": "Abh",
          "email": "abh@gmail.com",
          "role": "artist"
        }
      }
    ]
  }
  ```

### 2.2 Upload Music
- **Method:** `POST`
- **Route:** `/api/music/upload`
- **Access:** Protected (`authMiddleware.authArtist`)
- **Required Cookie:** `Token=<jwt_token>` (role: 'artist' or 'admin')
- **Request Headers:** `Content-Type: multipart/form-data`
- **Request Form Fields:**
  - `music`: Audio File (processed via Multer memoryStorage & uploaded to ImageKit)
  - `title`: string (Track title)
  - `uri`: string (Storage tag or placeholder passed in body)
- **Response Status:** `201 Created`
- **Response Body:**
  ```json
  {
    "message": "Music uploaded successfully",
    "music": {
      "id": "6ac8e421...",
      "uri": "https://ik.imagekit.io/hiharsh/music_1760472...",
      "title": "Ambient Soundscape",
      "artist": "6ac7dc7c8071db70469648f1"
    }
  }
  ```

---

## 3. Album Endpoints

### 3.1 Get All Albums
- **Method:** `GET`
- **Route:** `/api/music/albums`
- **Access:** Protected (`authMiddleware.authUser`)
- **Required Cookie:** `Token=<jwt_token>`
- **Response Status:** `200 OK`
- **Response Body:**
  *(Note: Backend returns album array under the `musics` key)*
  ```json
  {
    "message": "Albums fetched successfully",
    "musics": [
      {
        "_id": "6ac8f101...",
        "title": "Neon Symphony",
        "artist": {
          "_id": "6ac40dcd...",
          "username": "Abh",
          "email": "abh@gmail.com"
        }
      }
    ]
  }
  ```

### 3.2 Get Musics of Album by ID
- **Method:** `GET`
- **Route:** `/api/music/albums/:albumId`
- **Access:** Protected (`authMiddleware.authUser`)
- **Required Cookie:** `Token=<jwt_token>`
- **Response Status:** `200 OK`
- **Response Body:**
  *(Note: Backend returns album object under the `musics` key)*
  ```json
  {
    "message": "Album's all musics fetched successfully",
    "musics": {
      "_id": "6ac8f101...",
      "title": "Neon Symphony",
      "artist": {
        "_id": "6ac40dcd...",
        "username": "Abh"
      },
      "musics": "6ac7d31174dcb788fc9a642f"
    }
  }
  ```

### 3.3 Create Album
- **Method:** `POST`
- **Route:** `/api/music/album`
- **Access:** Protected (`authMiddleware.authArtist`)
- **Required Cookie:** `Token=<jwt_token>` (role: 'artist' or 'admin')
- **Request Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "title": "Album Title",
    "musics": ["6ac7d31174dcb788fc9a642f"]
  }
  ```
- **Response Status:** `201 Created`
- **Response Body:**
  ```json
  {
    "message": "Album created successfully",
    "album": {
      "id": "6ac8f99...",
      "title": "Album Title",
      "musics": ["6ac7d31174dcb788fc9a642f"],
      "artist": "6ac7dc7c8071db70469648f1"
    }
  }
  ```
