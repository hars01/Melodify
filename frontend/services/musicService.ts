import { api } from './api';
import { Album, Track } from '@/types';

interface RawMusicsResponse {
  message: string;
  musics: Track[];
}

interface RawAlbumsResponse {
  message: string;
  musics?: Album[];
  albums?: Album[];
}

interface RawAlbumDetailResponse {
  message: string;
  musics?: Album;
  album?: Album;
}

interface RawUploadResponse {
  message: string;
  music: {
    id: string;
    _id?: string;
    uri: string;
    title: string;
    artist: string;
  };
}

interface RawCreateAlbumResponse {
  message: string;
  album: {
    id: string;
    _id?: string;
    title: string;
    musics: string | string[];
    artist: string;
  };
}

export const musicService = {
  /**
   * Fetch all musics from backend
   */
  async getAllMusics(): Promise<Track[]> {
    const res = await api.get<RawMusicsResponse>('/music');
    return Array.isArray(res.musics) ? res.musics : [];
  },

  /**
   * Fetch all albums from backend
   * Note: Backend returns albums under the 'musics' key
   */
  async getAllAlbums(): Promise<Album[]> {
    const res = await api.get<RawAlbumsResponse>('/music/albums');
    const albums = res.albums || res.musics;
    return Array.isArray(albums) ? albums : [];
  },

  /**
   * Fetch album details by ID
   * Note: Backend returns album under 'musics' key
   */
  async getAlbumById(albumId: string): Promise<Album | null> {
    const res = await api.get<RawAlbumDetailResponse>(`/music/albums/${albumId}`);
    return res.album || res.musics || null;
  },

  /**
   * Upload music track (artist / admin role required)
   * The backend requires multipart form with 'music' file, 'title', and 'uri'
   */
  async uploadMusic(file: File, title: string, uriPlaceholder = 'storage/audio'): Promise<Track> {
    const formData = new FormData();
    formData.append('music', file);
    formData.append('title', title);
    formData.append('uri', uriPlaceholder);

    const res = await api.postFormData<RawUploadResponse>('/music/upload', formData);
    return {
      _id: res.music.id || res.music._id || '',
      id: res.music.id || res.music._id,
      title: res.music.title,
      uri: res.music.uri,
      artist: res.music.artist,
    };
  },

  /**
   * Create an album (artist / admin role required)
   * Requires title and music ID (or array of music IDs)
   */
  async createAlbum(title: string, musics: string | string[]): Promise<Album> {
    const res = await api.post<RawCreateAlbumResponse>('/music/album', {
      title,
      musics,
    });
    return {
      _id: res.album.id || res.album._id || '',
      id: res.album.id || res.album._id,
      title: res.album.title,
      musics: res.album.musics,
      artist: res.album.artist,
    };
  },
};
