'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ListMusic, Plus, Play, Trash2 } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';

export default function PlaylistsPage() {
  const { playlists, createPlaylist, deletePlaylist, playTrack } = usePlayer();
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    createPlaylist(title.trim(), desc.trim());
    setTitle('');
    setDesc('');
    setIsCreating(false);
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 className="section-title" style={{ fontSize: '32px' }}>
            Playlists
          </h1>
          <p className="section-subtitle">
            Curate and customize sound collections for every mood.
          </p>
        </div>

        <button onClick={() => setIsCreating(true)} className="btn-primary">
          <Plus size={18} />
          <span>Create Playlist</span>
        </button>
      </div>

      {/* Create Modal / Form */}
      {isCreating && (
        <form
          onSubmit={handleCreate}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-glow)',
            borderRadius: 'var(--radius-xl)',
            padding: '24px',
            marginBottom: '32px',
            maxWidth: '500px',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
            New Playlist
          </h3>
          <div className="form-group">
            <label className="form-label">Playlist Title</label>
            <input
              type="text"
              placeholder="e.g. Deep Focus Flow"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              autoFocus
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description (optional)</label>
            <input
              type="text"
              placeholder="Brief summary of vibe or mood"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="form-input"
            />
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="btn-primary"
            >
              Save Playlist
            </button>
          </div>
        </form>
      )}

      {/* Playlists Grid */}
      {playlists.length > 0 ? (
        <div className="cards-grid">
          {playlists.map((pl) => (
            <div key={pl.id} className="album-card" style={{ position: 'relative' }}>
              <Link href={`/playlists/${pl.id}`} style={{ textDecoration: 'none' }}>
                <div
                  className="album-card-cover"
                  style={{ background: pl.coverGradient || 'var(--gradient-aurora)' }}
                >
                  <ListMusic size={40} color="#fff" />
                </div>
                <p className="album-card-title">{pl.name}</p>
                <p className="album-card-meta">{pl.tracks.length} tracks</p>
              </Link>
            </div>
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
          <p style={{ fontSize: '18px', fontWeight: 700 }}>Your Playlist Collection is Empty</p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
            Create playlists to organize your favorite songs and albums.
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="btn-primary"
            style={{ marginTop: '20px' }}
          >
            Create Playlist
          </button>
        </div>
      )}
    </div>
  );
}
