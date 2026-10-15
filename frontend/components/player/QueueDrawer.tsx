'use client';

import React from 'react';
import { X, Trash2, Play, Music } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { formatTime, getArtistName, getTrackArtwork } from '@/utils/formatters';

export function QueueDrawer() {
  const {
    queue,
    queueIndex,
    isQueueOpen,
    toggleQueue,
    playTrack,
    removeFromQueue,
    clearQueue,
    currentTrack,
  } = usePlayer();

  return (
    <aside
      className={`queue-drawer ${isQueueOpen ? 'open' : ''}`}
      aria-label="Upcoming Queue"
    >
      <div className="queue-header">
        <div>
          <h2 className="queue-title">Queue</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {queue.length} {queue.length === 1 ? 'song' : 'songs'} in line
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {queue.length > 0 && (
            <button
              onClick={clearQueue}
              className="player-btn"
              title="Clear queue"
              aria-label="Clear queue"
            >
              <Trash2 size={16} />
            </button>
          )}
          <button
            onClick={toggleQueue}
            className="player-btn"
            title="Close queue"
            aria-label="Close queue"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="queue-list">
        {queue.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)' }}>
            <Music size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <p style={{ fontSize: '14px', fontWeight: 600 }}>Your queue is empty</p>
            <p style={{ fontSize: '12px', marginTop: '4px' }}>
              Add songs from home, discover, or your library.
            </p>
          </div>
        ) : (
          queue.map((track, idx) => {
            const isCurrent = currentTrack?._id === track._id;
            return (
              <div
                key={`${track._id}-${idx}`}
                className={`queue-item ${isCurrent ? 'active' : ''}`}
              >
                <img
                  src={getTrackArtwork(track)}
                  alt={track.title}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-sm)',
                    objectFit: 'cover',
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: isCurrent ? 'var(--brand-primary)' : 'var(--text-main)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {track.title}
                  </p>
                  <p
                    style={{
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {getArtistName(track.artist)}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button
                    onClick={() => playTrack(track, queue)}
                    className="player-btn"
                    title="Play track"
                    aria-label={`Play ${track.title}`}
                  >
                    <Play size={14} />
                  </button>
                  <button
                    onClick={() => removeFromQueue(idx)}
                    className="player-btn"
                    title="Remove from queue"
                    aria-label={`Remove ${track.title} from queue`}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
