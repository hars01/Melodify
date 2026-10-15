import { Playlist, Track, User } from '@/types';

const STORAGE_KEYS = {
  USER: 'melodify_user',
  FAVORITES: 'melodify_favorites',
  RECENTLY_PLAYED: 'melodify_recently_played',
  PLAYLISTS: 'melodify_playlists',
  VOLUME: 'melodify_volume',
  MUTED: 'melodify_muted',
  REPEAT: 'melodify_repeat',
  SHUFFLE: 'melodify_shuffle',
};

function isClient(): boolean {
  return typeof window !== 'undefined';
}

export const safeStorage = {
  getItem<T>(key: string, defaultValue: T): T {
    if (!isClient()) return defaultValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.warn(`Error reading key ${key} from localStorage:`, e);
      return defaultValue;
    }
  },

  setItem<T>(key: string, value: T): void {
    if (!isClient()) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`Error writing key ${key} to localStorage:`, e);
    }
  },

  removeItem(key: string): void {
    if (!isClient()) return;
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      console.warn(`Error removing key ${key} from localStorage:`, e);
    }
  },
};

// Storage helper functions
export const userStorage = {
  get: (): User | null => safeStorage.getItem<User | null>(STORAGE_KEYS.USER, null),
  set: (user: User): void => safeStorage.setItem(STORAGE_KEYS.USER, user),
  remove: (): void => safeStorage.removeItem(STORAGE_KEYS.USER),
};

export const favoritesStorage = {
  get: (): Track[] => safeStorage.getItem<Track[]>(STORAGE_KEYS.FAVORITES, []),
  add: (track: Track): Track[] => {
    const list = safeStorage.getItem<Track[]>(STORAGE_KEYS.FAVORITES, []);
    if (!list.some((t) => t._id === track._id)) {
      const updated = [track, ...list];
      safeStorage.setItem(STORAGE_KEYS.FAVORITES, updated);
      return updated;
    }
    return list;
  },
  remove: (trackId: string): Track[] => {
    const list = safeStorage.getItem<Track[]>(STORAGE_KEYS.FAVORITES, []);
    const updated = list.filter((t) => t._id !== trackId);
    safeStorage.setItem(STORAGE_KEYS.FAVORITES, updated);
    return updated;
  },
  isFavorite: (trackId: string): boolean => {
    const list = safeStorage.getItem<Track[]>(STORAGE_KEYS.FAVORITES, []);
    return list.some((t) => t._id === trackId);
  },
};

export const recentlyPlayedStorage = {
  get: (): Track[] => safeStorage.getItem<Track[]>(STORAGE_KEYS.RECENTLY_PLAYED, []),
  add: (track: Track): void => {
    const list = safeStorage.getItem<Track[]>(STORAGE_KEYS.RECENTLY_PLAYED, []);
    const filtered = list.filter((t) => t._id !== track._id);
    const updated = [track, ...filtered].slice(0, 30);
    safeStorage.setItem(STORAGE_KEYS.RECENTLY_PLAYED, updated);
  },
};

export const playlistsStorage = {
  get: (): Playlist[] => safeStorage.getItem<Playlist[]>(STORAGE_KEYS.PLAYLISTS, []),
  set: (playlists: Playlist[]): void => safeStorage.setItem(STORAGE_KEYS.PLAYLISTS, playlists),
  create: (name: string, description = ''): Playlist => {
    const list = safeStorage.getItem<Playlist[]>(STORAGE_KEYS.PLAYLISTS, []);
    const newPlaylist: Playlist = {
      id: `pl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name,
      description,
      tracks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      coverGradient: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
    };
    safeStorage.setItem(STORAGE_KEYS.PLAYLISTS, [newPlaylist, ...list]);
    return newPlaylist;
  },
  addTrack: (playlistId: string, track: Track): Playlist[] => {
    const list = safeStorage.getItem<Playlist[]>(STORAGE_KEYS.PLAYLISTS, []);
    const updated = list.map((pl) => {
      if (pl.id === playlistId) {
        const trackExists = pl.tracks.some((t) => t._id === track._id);
        if (!trackExists) {
          return {
            ...pl,
            tracks: [...pl.tracks, track],
            updatedAt: new Date().toISOString(),
          };
        }
      }
      return pl;
    });
    safeStorage.setItem(STORAGE_KEYS.PLAYLISTS, updated);
    return updated;
  },
  removeTrack: (playlistId: string, trackId: string): Playlist[] => {
    const list = safeStorage.getItem<Playlist[]>(STORAGE_KEYS.PLAYLISTS, []);
    const updated = list.map((pl) => {
      if (pl.id === playlistId) {
        return {
          ...pl,
          tracks: pl.tracks.filter((t) => t._id !== trackId),
          updatedAt: new Date().toISOString(),
        };
      }
      return pl;
    });
    safeStorage.setItem(STORAGE_KEYS.PLAYLISTS, updated);
    return updated;
  },
  delete: (playlistId: string): Playlist[] => {
    const list = safeStorage.getItem<Playlist[]>(STORAGE_KEYS.PLAYLISTS, []);
    const updated = list.filter((pl) => pl.id !== playlistId);
    safeStorage.setItem(STORAGE_KEYS.PLAYLISTS, updated);
    return updated;
  },
};
