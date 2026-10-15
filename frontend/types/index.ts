// Melodify Application Type Definitions

export type UserRole = 'user' | 'artist' | 'admin';

export interface User {
  id?: string;
  _id?: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface ArtistSummary {
  _id: string;
  username: string;
  email?: string;
  role?: UserRole;
}

export type ArtistRef = string | ArtistSummary;

export interface Track {
  _id: string;
  id?: string;
  title: string;
  uri: string;
  artist: ArtistRef;
  duration?: number;
  artwork?: string;
  albumId?: string;
  albumTitle?: string;
  isLocalFavorite?: boolean;
}

export interface Album {
  _id: string;
  id?: string;
  title: string;
  musics?: Track | Track[] | string | string[];
  artist: ArtistRef;
  coverGradient?: string;
  artwork?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  tracks: Track[];
  createdAt: string;
  updatedAt: string;
  coverGradient?: string;
}

export type RepeatMode = 'off' | 'all' | 'one';

export interface PlaybackState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  queue: Track[];
  queueIndex: number;
  isQueueOpen: boolean;
}

export interface ApiResponse<T = unknown> {
  message: string;
  user?: User;
  musics?: T;
  album?: T;
  error?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}
