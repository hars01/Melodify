'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  Shuffle,
  Volume2,
  VolumeX,
  ListMusic,
  Heart,
  Loader2,
} from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { formatTime, getArtistName, getTrackArtwork } from '@/utils/formatters';
import { Visualizer } from '../music/Visualizer';

export function Player() {
  const {
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
    isQueueOpen,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    nextTrack,
    prevTrack,
    toggleRepeat,
    toggleShuffle,
    toggleQueue,
    favorites,
    toggleFavorite,
    isFavorite,
  } = usePlayer();

  const seekRailRef = useRef<HTMLDivElement>(null);
  const volumeRailRef = useRef<HTMLDivElement>(null);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercent = isMuted ? 0 : volume * 100;

  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!seekRailRef.current || duration <= 0) return;
    const rect = seekRailRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    seek(ratio * duration);
  };

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!volumeRailRef.current) return;
    const rect = volumeRailRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    setVolume(ratio);
  };

  const isLiked = currentTrack ? isFavorite(currentTrack._id) : false;

  return (
    <footer className="player-bar" role="region" aria-label="Audio Player">
      {/* Left: Track Information */}
      <div className="player-track-info">
        {currentTrack ? (
          <>
            <img
              src={getTrackArtwork(currentTrack)}
              alt={currentTrack.title}
              className="player-artwork"
              width={56}
              height={56}
            />
            <div className="player-titles">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <p className="player-track-title">{currentTrack.title}</p>
                <Visualizer isPlaying={isPlaying} />
              </div>
              <p className="player-artist-name">{getArtistName(currentTrack.artist)}</p>
            </div>
            <button
              onClick={() => toggleFavorite(currentTrack)}
              className={`player-like-btn ${isLiked ? 'liked' : ''}`}
              aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart size={18} fill={isLiked ? 'var(--brand-secondary)' : 'none'} />
            </button>
          </>
        ) : (
          <div className="player-titles">
            <p className="player-track-title" style={{ color: 'var(--text-muted)' }}>
              No track selected
            </p>
            <p className="player-artist-name">Choose a song to start listening</p>
          </div>
        )}
      </div>

      {/* Center: Controls & Seek Bar */}
      <div className="player-center-controls">
        <div className="player-buttons-group">
          <button
            onClick={toggleShuffle}
            className={`player-btn ${isShuffled ? 'active' : ''}`}
            aria-label="Shuffle"
            title="Shuffle"
          >
            <Shuffle size={17} />
          </button>

          <button
            onClick={prevTrack}
            className="player-btn"
            disabled={!currentTrack}
            aria-label="Previous track"
            title="Previous"
          >
            <SkipBack size={20} />
          </button>

          <button
            onClick={togglePlay}
            disabled={!currentTrack && queue.length === 0}
            className="player-btn-main"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : isPlaying ? (
              <Pause size={20} />
            ) : (
              <Play size={20} style={{ marginLeft: '2px' }} />
            )}
          </button>

          <button
            onClick={nextTrack}
            className="player-btn"
            disabled={!currentTrack && queue.length === 0}
            aria-label="Next track"
            title="Next"
          >
            <SkipForward size={20} />
          </button>

          <button
            onClick={toggleRepeat}
            className={`player-btn ${repeatMode !== 'off' ? 'active' : ''}`}
            aria-label={`Repeat: ${repeatMode}`}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? <Repeat1 size={17} /> : <Repeat size={17} />}
          </button>
        </div>

        {/* Progress Slider */}
        <div className="player-progress-container">
          <span className="player-time">{formatTime(currentTime)}</span>
          <div
            ref={seekRailRef}
            onClick={handleSeekClick}
            className="seek-bar-track"
            role="slider"
            aria-label="Playback progress"
            aria-valuemin={0}
            aria-valuemax={duration || 100}
            aria-valuenow={currentTime}
          >
            <div
              className="seek-bar-fill"
              style={{ width: `${progressPercent}%` }}
            >
              <span className="seek-bar-thumb" />
            </div>
          </div>
          <span className="player-time">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: Volume & Queue */}
      <div className="player-right-controls">
        <div className="volume-slider-container">
          <button
            onClick={toggleMute}
            className="player-btn"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <div
            ref={volumeRailRef}
            onClick={handleVolumeClick}
            className="volume-bar"
            role="slider"
            aria-label="Volume"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={volumePercent}
          >
            <div
              className="volume-bar-fill"
              style={{ width: `${volumePercent}%` }}
            />
          </div>
        </div>

        <button
          onClick={toggleQueue}
          className={`player-btn ${isQueueOpen ? 'active' : ''}`}
          aria-label="Playback queue"
          title="Playback Queue"
        >
          <ListMusic size={19} />
        </button>
      </div>
    </footer>
  );
}
