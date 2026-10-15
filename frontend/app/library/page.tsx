'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, ListMusic, History, Play, Plus, Music2 } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { useAuth } from '@/contexts/AuthContext';
import { TrackCard } from '@/components/music/TrackCard';
import { TrackRow } from '@/components/music/TrackRow';
import { PlaylistModal } from '@/components/ui/PlaylistModal';
import { Track } from '@/types';

export default function LibraryPage() {
  const { isAuthenticated, user } = useAuth();
  const { favorites, playlists, recentlyPlayed, playTrack, createPlaylist } = usePlayer();

  const [activeTab, setActiveTab] = useState<'favorites' | 'playlists' | 'history'>('favorites');
  const [modalTrack, setModalTrack] = useState<Track | null>(null);
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');

  const handlePlayFavorites = () => {
    if (favorites.length > 0) {
      playTrack(favorites[0], favorites);
    }
  };

  const handleCreatePlaylistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistTitle.trim()) return;
    createPlaylist(newPlaylistTitle.trim());
    setNewPlaylistTitle('');
    setIsCreatingPlaylist(false);
  };

  return (
    <div>
      {/* Library Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 className="section-title" style={{ fontSize: '32px' }}>
            Your Music Library
          </h1>
          <p className="section-subtitle">
            Personalized collection of liked tracks, playlists, and recently enjoyed audio.
          </p>
        </div>

        {activeTab === 'favorites' && favorites.length > 0 && (
          <button onClick={handlePlayFavorites} className="btn-primary">
            <Play size={18} fill="#fff" />
            <span>Play Favorites</span>
          </button>
        )}

        {activeTab === 'playlists' && (
          <button onClick={() => setIsCreatingPlaylist(true)} className="btn-primary">
            <Plus size={18} />
            <span>New Playlist</span>
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
        <button
          onClick={() => setActiveTab('favorites')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: 'var(--radius-full)',
            fontSize: '13px',
            fontWeight: 600,
            background: activeTab === 'favorites' ? 'var(--gradient-brand)' : 'var(--bg-surface)',
            color: activeTab === 'favorites' ? '#fff' : 'var(--text-secondary)',
            border: '1px solid',
            borderColor: activeTab === 'favorites' ? 'transparent' : 'var(--border-subtle)',
          }}
        >
          <Heart size={16} fill={activeTab === 'favorites' ? '#fff' : 'none'} />
          <span>Liked Songs ({favorites.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('playlists')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: 'var(--radius-full)',
            fontSize: '13px',
            fontWeight: 600,
            background: activeTab === 'playlists' ? 'var(--gradient-brand)' : 'var(--bg-surface)',
            color: activeTab === 'playlists' ? '#fff' : 'var(--text-secondary)',
            border: '1px solid',
            borderColor: activeTab === 'playlists' ? 'transparent' : 'var(--border-subtle)',
          }}
        >
          <ListMusic size={16} />
          <span>Playlists ({playlists.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: 'var(--radius-full)',
            fontSize: '13px',
            fontWeight: 600,
            background: activeTab === 'history' ? 'var(--gradient-brand)' : 'var(--bg-surface)',
            color: activeTab === 'history' ? '#fff' : 'var(--text-secondary)',
            border: '1px solid',
            borderColor: activeTab === 'history' ? 'transparent' : 'var(--border-subtle)',
          }}
        >
          <History size={16} />
          <span>History ({recentlyPlayed.length})</span>
        </button>
      </div>

      {/* Tab 1: Favorites */}
      {activeTab === 'favorites' && (
        <div>
          {favorites.length > 0 ? (
            <div className="cards-grid">
              {favorites.map((track) => (
                <TrackCard
                  key={track._id}
                  track={track}
                  allTracks={favorites}
                  onAddToPlaylist={(t) => setModalTrack(t)}
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: '60px 20px',
                textAlign: 'center',
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <Heart size={44} color="var(--brand-secondary)" style={{ margin: '0 auto 16px' }} />
              <p style={{ fontSize: '18px', fontWeight: 700 }}>No Liked Songs Yet</p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
                Tap the heart icon on any song across Melodify to save it to your library.
              </p>
              <Link href="/" className="btn-secondary" style={{ marginTop: '20px' }}>
                Explore Music
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Playlists */}
      {activeTab === 'playlists' && (
        <div>
          {isCreatingPlaylist && (
            <form
              onSubmit={handleCreatePlaylistSubmit}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-glow)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                marginBottom: '24px',
                maxWidth: '450px',
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>
                Name Your Playlist
              </h3>
              <input
                type="text"
                placeholder="e.g. Late Night Coding Vibes"
                value={newPlaylistTitle}
                onChange={(e) => setNewPlaylistTitle(e.target.value)}
                className="form-input"
                autoFocus
                style={{ marginBottom: '12px' }}
              />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsCreatingPlaylist(false)}
                  className="btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newPlaylistTitle.trim()}
                  className="btn-primary"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  Create
                </button>
              </div>
            </form>
          )}

          {playlists.length > 0 ? (
            <div className="cards-grid">
              {playlists.map((pl) => (
                <Link
                  key={pl.id}
                  href={`/playlists/${pl.id}`}
                  className="album-card"
                  style={{ textDecoration: 'none' }}
                >
                  <div
                    className="album-card-cover"
                    style={{ background: pl.coverGradient || 'var(--gradient-aurora)' }}
                  >
                    <ListMusic size={38} color="#fff" />
                  </div>
                  <p className="album-card-title">{pl.name}</p>
                  <p className="album-card-meta">{pl.tracks.length} tracks</p>
                </Link>
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: '60px 20px',
                textAlign: 'center',
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <ListMusic size={44} color="var(--brand-primary)" style={{ margin: '0 auto 16px' }} />
              <p style={{ fontSize: '18px', fontWeight: 700 }}>No Playlists Created Yet</p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
                Create custom playlists to bundle tracks for focus, workout, or relaxation.
              </p>
              <button
                onClick={() => setIsCreatingPlaylist(true)}
                className="btn-primary"
                style={{ marginTop: '20px' }}
              >
                Create First Playlist
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: History */}
      {activeTab === 'history' && (
        <div>
          {recentlyPlayed.length > 0 ? (
            <div className="cards-grid">
              {recentlyPlayed.map((track) => (
                <TrackCard
                  key={track._id}
                  track={track}
                  allTracks={recentlyPlayed}
                  onAddToPlaylist={(t) => setModalTrack(t)}
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: '60px 20px',
                textAlign: 'center',
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <History size={44} color="var(--text-dim)" style={{ margin: '0 auto 16px' }} />
              <p style={{ fontSize: '18px', fontWeight: 700 }}>No Listening History Yet</p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
                Songs you play will automatically appear here.
              </p>
            </div>
          )}
        </div>
      )}

      <PlaylistModal
        track={modalTrack}
        isOpen={!!modalTrack}
        onClose={() => setModalTrack(null)}
      />
    </div>
  );
}
