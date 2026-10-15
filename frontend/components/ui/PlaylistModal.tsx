'use client';

import React, { useState } from 'react';
import { X, Plus, Check, ListMusic } from 'lucide-react';
import { Track } from '@/types';
import { usePlayer } from '@/contexts/PlayerContext';

interface PlaylistModalProps {
  track: Track | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PlaylistModal({ track, isOpen, onClose }: PlaylistModalProps) {
  const { playlists, createPlaylist, addTrackToPlaylist } = usePlayer();
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen || !track) return null;

  const handleAddToPlaylist = (playlistId: string) => {
    addTrackToPlaylist(playlistId, track);
    onClose();
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    const pl = createPlaylist(newPlaylistName.trim());
    addTrackToPlaylist(pl.id, track);
    setNewPlaylistName('');
    setIsCreating(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Add to Playlist</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Adding &quot;{track.title}&quot;
            </p>
          </div>
          <button onClick={onClose} className="player-btn" aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        {/* Existing Playlists list */}
        <div style={{ maxHeight: '240px', overflowY: 'auto', marginBottom: '20px' }}>
          {playlists.length === 0 && !isCreating ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>
              No playlists found. Create one below!
            </p>
          ) : (
            playlists.map((pl) => {
              const alreadyIn = pl.tracks.some((t) => t._id === track._id);
              return (
                <div
                  key={pl.id}
                  onClick={() => !alreadyIn && handleAddToPlaylist(pl.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface)',
                    marginBottom: '8px',
                    cursor: alreadyIn ? 'default' : 'pointer',
                    opacity: alreadyIn ? 0.6 : 1,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ListMusic size={18} color="var(--brand-primary)" />
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 600 }}>{pl.name}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                        {pl.tracks.length} tracks
                      </p>
                    </div>
                  </div>
                  {alreadyIn ? (
                    <span style={{ fontSize: '12px', color: 'var(--brand-emerald)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Check size={14} /> Added
                    </span>
                  ) : (
                    <span style={{ fontSize: '12px', color: 'var(--brand-primary)' }}>+ Add</span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Create new playlist form */}
        {isCreating ? (
          <form onSubmit={handleCreateNew}>
            <input
              type="text"
              placeholder="Playlist name..."
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="form-input"
              autoFocus
              style={{ marginBottom: '12px' }}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="btn-secondary"
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newPlaylistName.trim()}
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                Create & Add
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <Plus size={16} />
            <span>Create New Playlist</span>
          </button>
        )}
      </div>
    </div>
  );
}
