'use client';

import React from 'react';
import { Play, Pause, Heart, Plus, Trash2 } from 'lucide-react';
import { Track } from '@/types';
import { usePlayer } from '@/contexts/PlayerContext';
import { formatTime, getArtistName, getTrackArtwork } from '@/utils/formatters';
import { Visualizer } from './Visualizer';

interface TrackRowProps {
  track: Track;
  index: number;
  allTracks?: Track[];
  onRemove?: () => void;
  onAddToPlaylist?: (track: Track) => void;
}

export function TrackRow({
  track,
  index,
  allTracks,
  onRemove,
  onAddToPlaylist,
}: TrackRowProps) {
  const { currentTrack, isPlaying, playTrack, togglePlay, toggleFavorite, isFavorite, addToQueue } =
    usePlayer();

  const isCurrent = currentTrack?._id === track._id;
  const isCurrentlyPlaying = isCurrent && isPlaying;
  const liked = isFavorite(track._id);

  const handleRowClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, allTracks);
    }
  };

  return (
    <tr
      className={`track-row ${isCurrent ? 'playing' : ''}`}
      onClick={handleRowClick}
      style={{ cursor: 'pointer' }}
    >
      <td className="track-row-index">
        {isCurrentlyPlaying ? (
          <Visualizer isPlaying={true} />
        ) : (
          <span>{index + 1}</span>
        )}
      </td>

      <td>
        <div className="track-row-main">
          <img
            src={getTrackArtwork(track, index)}
            alt={track.title}
            className="track-row-thumb"
          />
          <div>
            <p
              className="track-row-title"
              style={isCurrent ? { color: 'var(--brand-primary)' } : undefined}
            >
              {track.title}
            </p>
            <p className="track-row-artist">{getArtistName(track.artist)}</p>
          </div>
        </div>
      </td>

      <td style={{ textAlign: 'right' }}>
        <div
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => toggleFavorite(track)}
            className="player-btn"
            style={{ color: liked ? 'var(--brand-secondary)' : 'var(--text-muted)' }}
            aria-label={liked ? 'Unlike' : 'Like'}
          >
            <Heart size={16} fill={liked ? 'var(--brand-secondary)' : 'none'} />
          </button>

          {onAddToPlaylist && (
            <button
              onClick={() => onAddToPlaylist(track)}
              className="player-btn"
              title="Add to playlist"
              aria-label="Add to playlist"
            >
              <Plus size={16} />
            </button>
          )}

          {onRemove && (
            <button
              onClick={onRemove}
              className="player-btn"
              style={{ color: '#ef4444' }}
              title="Remove from playlist"
              aria-label="Remove from playlist"
            >
              <Trash2 size={16} />
            </button>
          )}

          <span
            style={{
              fontSize: '12px',
              color: 'var(--text-dim)',
              minWidth: '40px',
              textAlign: 'right',
            }}
          >
            {track.duration ? formatTime(track.duration) : '3:20'}
          </span>
        </div>
      </td>
    </tr>
  );
}
