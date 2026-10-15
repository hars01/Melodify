'use client';

import React, { useState } from 'react';
import { Play, Pause, Heart, Plus, MoreVertical, ListPlus } from 'lucide-react';
import { Track } from '@/types';
import { usePlayer } from '@/contexts/PlayerContext';
import { getArtistName, getTrackArtwork } from '@/utils/formatters';
import { Visualizer } from './Visualizer';

interface TrackCardProps {
  track: Track;
  allTracks?: Track[];
  onAddToPlaylist?: (track: Track) => void;
}

export function TrackCard({ track, allTracks, onAddToPlaylist }: TrackCardProps) {
  const { currentTrack, isPlaying, playTrack, togglePlay, toggleFavorite, isFavorite, addToQueue } =
    usePlayer();
  const [showMenu, setShowMenu] = useState(false);

  const isCurrent = currentTrack?._id === track._id;
  const isCurrentlyPlaying = isCurrent && isPlaying;
  const liked = isFavorite(track._id);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, allTracks);
    }
  };

  return (
    <div
      className="track-card"
      onClick={handlePlayClick}
      role="button"
      tabIndex={0}
      aria-label={`Play ${track.title} by ${getArtistName(track.artist)}`}
    >
      <div className="track-card-artwork-box">
        <img
          src={getTrackArtwork(track)}
          alt={track.title}
          className="track-card-img"
          loading="lazy"
        />
        <div
          className="track-card-play-overlay"
          style={isCurrentlyPlaying ? { opacity: 1, transform: 'translateY(0)' } : undefined}
        >
          {isCurrentlyPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: '2px' }} />}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <p
              className="track-card-title"
              style={isCurrent ? { color: 'var(--brand-primary)' } : undefined}
            >
              {track.title}
            </p>
            <Visualizer isPlaying={isCurrentlyPlaying} />
          </div>
          <p className="track-card-artist">{getArtistName(track.artist)}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(track);
            }}
            className="player-btn"
            style={{ padding: '4px', color: liked ? 'var(--brand-secondary)' : 'var(--text-muted)' }}
            aria-label={liked ? 'Unlike' : 'Like'}
          >
            <Heart size={15} fill={liked ? 'var(--brand-secondary)' : 'none'} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onAddToPlaylist) {
                onAddToPlaylist(track);
              } else {
                addToQueue(track);
              }
            }}
            className="player-btn"
            style={{ padding: '4px' }}
            title="Add to queue or playlist"
            aria-label="Add options"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
