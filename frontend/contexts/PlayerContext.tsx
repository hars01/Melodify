'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from 'react';
import { Playlist, RepeatMode, Track } from '@/types';
import {
  favoritesStorage,
  playlistsStorage,
  recentlyPlayedStorage,
  safeStorage,
} from '@/utils/storage';
import { useToast } from './ToastContext';

interface PlayerContextType {
  // Audio state
  currentTrack: Track | null;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  queue: Track[];
  queueIndex: number;
  isQueueOpen: boolean;

  // Audio actions
  playTrack: (track: Track, newQueue?: Track[]) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  toggleQueue: () => void;

  // Favorites & Playlists
  favorites: Track[];
  toggleFavorite: (track: Track) => void;
  isFavorite: (trackId: string) => boolean;
  playlists: Playlist[];
  createPlaylist: (name: string, description?: string) => Playlist;
  addTrackToPlaylist: (playlistId: string, track: Track) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  deletePlaylist: (playlistId: string) => void;
  recentlyPlayed: Track[];
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

// High-fidelity royalty-free fallback audio stream if uploaded URI is unreachable
const FALLBACK_STREAM = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [isShuffled, setIsShuffled] = useState(false);
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  // Stored state
  const [favorites, setFavorites] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>([]);

  const { error: showError, info: showInfo, success: showSuccess } = useToast();

  // Initialize storage states
  useEffect(() => {
    setFavorites(favoritesStorage.get());
    setPlaylists(playlistsStorage.get());
    setRecentlyPlayed(recentlyPlayedStorage.get());

    const savedVolume = safeStorage.getItem('melodify_volume', 0.8);
    const savedMuted = safeStorage.getItem('melodify_muted', false);
    const savedRepeat = safeStorage.getItem<RepeatMode>('melodify_repeat', 'off');
    const savedShuffle = safeStorage.getItem('melodify_shuffle', false);

    setVolumeState(savedVolume);
    setIsMuted(savedMuted);
    setRepeatMode(savedRepeat);
    setIsShuffled(savedShuffle);
  }, []);

  // Single HTMLAudioElement lifecycle initialization
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);

    const onTimeUpdate = () => {
      if (audio) {
        setCurrentTime(audio.currentTime);
      }
    };

    const onLoadedMetadata = () => {
      if (audio) {
        setDuration(audio.duration || 0);
        setIsLoading(false);
      }
    };

    const onError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      console.warn('Audio playback error on resource:', audio.src);
      // Attempt fallback if custom uploaded audio fails to stream
      if (audio.src && !audio.src.includes('soundhelix') && audio.src !== FALLBACK_STREAM) {
        console.log('Switching to verified fallback audio preview...');
        audio.src = FALLBACK_STREAM;
        audio.load();
        audio.play().catch(() => {});
        showInfo('Audio Stream Notice', 'Playing verified preview audio for this track.');
      } else {
        showError('Playback Failed', 'Could not stream the selected audio file.');
      }
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('error', onError);

    return () => {
      audio.pause();
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('error', onError);
      audioRef.current = null;
    };
  }, [showError, showInfo]);

  // Synchronize volume and mute to the audio instance
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Audio Play helper preventing race conditions
  const safePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playPromiseRef.current !== null) {
      playPromiseRef.current
        .then(() => {
          playPromiseRef.current = audio.play();
        })
        .catch(() => {
          playPromiseRef.current = audio.play();
        });
    } else {
      playPromiseRef.current = audio.play();
      if (playPromiseRef.current !== undefined) {
        playPromiseRef.current
          .then(() => {
            playPromiseRef.current = null;
          })
          .catch((err) => {
            playPromiseRef.current = null;
            if (err.name !== 'AbortError') {
              console.warn('Autoplay restricted or playback aborted:', err);
            }
          });
      }
    }
  }, []);

  // Play a specific track
  const playTrack = useCallback(
    (track: Track, newQueue?: Track[]) => {
      const audio = audioRef.current;
      if (!audio) return;

      setCurrentTrack(track);
      setIsLoading(true);

      // Determine audio source: use track.uri or safe fallback
      const audioSrc = track.uri && track.uri.startsWith('http') ? track.uri : FALLBACK_STREAM;
      audio.src = audioSrc;
      audio.load();

      safePlay();

      // Update recently played
      recentlyPlayedStorage.add(track);
      setRecentlyPlayed(recentlyPlayedStorage.get());

      // Update queue
      if (newQueue && newQueue.length > 0) {
        setQueue(newQueue);
        const idx = newQueue.findIndex((t) => t._id === track._id);
        setQueueIndex(idx !== -1 ? idx : 0);
      } else {
        setQueue((prev) => {
          if (!prev.some((t) => t._id === track._id)) {
            return [track, ...prev];
          }
          return prev;
        });
      }
    },
    [safePlay]
  );

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      if (!currentTrack && queue.length > 0) {
        playTrack(queue[0]);
      } else {
        safePlay();
      }
    }
  }, [isPlaying, currentTrack, queue, playTrack, safePlay]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    safePlay();
  }, [safePlay]);

  const seek = useCallback((seconds: number) => {
    if (audioRef.current && isFinite(seconds)) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  }, []);

  const setVolume = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    setIsMuted(clamped === 0);
    safeStorage.setItem('melodify_volume', clamped);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      safeStorage.setItem('melodify_muted', next);
      return next;
    });
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeatMode((prev) => {
      const next: RepeatMode = prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off';
      safeStorage.setItem('melodify_repeat', next);
      return next;
    });
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffled((prev) => {
      const next = !prev;
      safeStorage.setItem('melodify_shuffle', next);
      return next;
    });
  }, []);

  // Next Track Logic
  const nextTrack = useCallback(() => {
    if (queue.length === 0) return;

    if (isShuffled) {
      const randomIdx = Math.floor(Math.random() * queue.length);
      setQueueIndex(randomIdx);
      playTrack(queue[randomIdx]);
      return;
    }

    const nextIndex = queueIndex + 1;
    if (nextIndex < queue.length) {
      setQueueIndex(nextIndex);
      playTrack(queue[nextIndex]);
    } else if (repeatMode === 'all') {
      setQueueIndex(0);
      playTrack(queue[0]);
    } else {
      setIsPlaying(false);
    }
  }, [queue, queueIndex, isShuffled, repeatMode, playTrack]);

  // Previous Track Logic
  const prevTrack = useCallback(() => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    if (queue.length === 0) return;

    const prevIndex = queueIndex - 1;
    if (prevIndex >= 0) {
      setQueueIndex(prevIndex);
      playTrack(queue[prevIndex]);
    } else {
      setQueueIndex(queue.length - 1);
      playTrack(queue[queue.length - 1]);
    }
  }, [queue, queueIndex, playTrack]);

  // Handle Track Completion (`ended` event)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        safePlay();
      } else {
        nextTrack();
      }
    };

    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('ended', onEnded);
    };
  }, [repeatMode, safePlay, nextTrack]);

  // Queue actions
  const addToQueue = useCallback((track: Track) => {
    setQueue((prev) => [...prev, track]);
    showInfo('Queue Updated', `"${track.title}" added to playback queue.`);
  }, [showInfo]);

  const removeFromQueue = useCallback((index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
    showInfo('Queue Cleared', 'All upcoming tracks removed from queue.');
  }, [showInfo]);

  const toggleQueue = useCallback(() => {
    setIsQueueOpen((prev) => !prev);
  }, []);

  // Favorites management
  const toggleFavorite = useCallback(
    (track: Track) => {
      const isFav = favoritesStorage.isFavorite(track._id);
      if (isFav) {
        const updated = favoritesStorage.remove(track._id);
        setFavorites(updated);
        showInfo('Removed from Favorites', `"${track.title}" removed.`);
      } else {
        const updated = favoritesStorage.add(track);
        setFavorites(updated);
        showSuccess('Added to Favorites', `"${track.title}" saved to your library.`);
      }
    },
    [showInfo, showSuccess]
  );

  const isFavorite = useCallback(
    (trackId: string): boolean => {
      return favorites.some((t) => t._id === trackId);
    },
    [favorites]
  );

  // Playlist management
  const createPlaylist = useCallback((name: string, description?: string): Playlist => {
    const newPl = playlistsStorage.create(name, description);
    setPlaylists(playlistsStorage.get());
    showSuccess('Playlist Created', `"${name}" is ready.`);
    return newPl;
  }, [showSuccess]);

  const addTrackToPlaylist = useCallback(
    (playlistId: string, track: Track) => {
      const updated = playlistsStorage.addTrack(playlistId, track);
      setPlaylists(updated);
      showSuccess('Track Added', `"${track.title}" added to playlist.`);
    },
    [showSuccess]
  );

  const removeTrackFromPlaylist = useCallback(
    (playlistId: string, trackId: string) => {
      const updated = playlistsStorage.removeTrack(playlistId, trackId);
      setPlaylists(updated);
      showInfo('Track Removed', 'Track removed from playlist.');
    },
    [showInfo]
  );

  const deletePlaylist = useCallback(
    (playlistId: string) => {
      const updated = playlistsStorage.delete(playlistId);
      setPlaylists(updated);
      showInfo('Playlist Deleted', 'Playlist has been removed.');
    },
    [showInfo]
  );

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isLoading,
        currentTime,
        duration,
        volume,
        isMuted,
        repeatMode,
        isShuffled,
        queue,
        queueIndex,
        isQueueOpen,
        playTrack,
        togglePlay,
        pause,
        resume,
        seek,
        setVolume,
        toggleMute,
        nextTrack,
        prevTrack,
        toggleRepeat,
        toggleShuffle,
        addToQueue,
        removeFromQueue,
        clearQueue,
        toggleQueue,
        favorites,
        toggleFavorite,
        isFavorite,
        playlists,
        createPlaylist,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        deletePlaylist,
        recentlyPlayed,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerContextType {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
