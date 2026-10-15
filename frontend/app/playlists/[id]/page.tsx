'use client';

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Play, ListMusic, Trash2, ArrowLeft, Clock, Music } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { TrackRow } from '@/components/music/TrackRow';
import { formatTime } from '@/utils/formatters';

export default function PlaylistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const playlistId = resolvedParams.id;

  const { playlists, playTrack, removeTrackFromPlaylist, deletePlaylist } = usePlayer();
  const playlist = playlists.find((p) => p.id === playlistId);

  if (!playlist) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <ListMusic size={48} color="var(--text-dim)" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Playlist Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px', marginBottom: '24px' }}>
          This playlist may have been deleted or does not exist.
        </p>
        <Link href="/playlists" className="btn-secondary">
          Back to Playlists
        </Link>
      </div>
    );
  }

  const handlePlayAll = () => {
    if (playlist.tracks.length > 0) {
      playTrack(playlist.tracks[0], playlist.tracks);
    }
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete playlist "${playlist.name}"?`)) {
      deletePlaylist(playlist.id);
      router.push('/playlists');
    }
  };

  const totalSeconds = playlist.tracks.reduce((acc, t) => acc + (t.duration || 200), 0);

  return (
    <div>
      <Link
        href="/playlists"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--text-muted)',
          fontSize: '13px',
          marginBottom: '24px',
        }}
      >
        <ArrowLeft size={16} />
        <span>Back to Playlists</span>
      </Link>

      {/* Playlist Hero Header */}
      <div
        style={{
          display: 'flex',
          gap: '32px',
          alignItems: 'flex-end',
          marginBottom: '36px',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            width: '200px',
            height: '200px',
            borderRadius: 'var(--radius-xl)',
            background: playlist.coverGradient || 'var(--gradient-aurora)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-md)',
            flexShrink: 0,
          }}
        >
          <ListMusic size={64} color="#fff" />
        </div>

        <div style={{ flex: 1, minWidth: '260px' }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'var(--brand-accent)',
            }}
          >
            Playlist
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '38px',
              fontWeight: 800,
              lineHeight: 1.2,
              margin: '8px 0 12px',
            }}
          >
            {playlist.name}
          </h1>
          {playlist.description && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '14px' }}>
              {playlist.description}
            </p>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontSize: '13px',
              color: 'var(--text-dim)',
            }}
          >
            <span>{playlist.tracks.length} songs</span>
            <span>•</span>
            <span>{formatTime(totalSeconds)} total runtime</span>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button
              onClick={handlePlayAll}
              disabled={playlist.tracks.length === 0}
              className="btn-primary"
            >
              <Play size={18} fill="#fff" />
              <span>Play All</span>
            </button>
            <button
              onClick={handleDelete}
              className="btn-secondary"
              style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
              title="Delete Playlist"
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Track List Table */}
      {playlist.tracks.length > 0 ? (
        <table className="track-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>#</th>
              <th>Title</th>
              <th style={{ textAlign: 'right' }}>
                <Clock size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />
              </th>
            </tr>
          </thead>
          <tbody>
            {playlist.tracks.map((track, idx) => (
              <TrackRow
                key={`${track._id}-${idx}`}
                track={track}
                index={idx}
                allTracks={playlist.tracks}
                onRemove={() => removeTrackFromPlaylist(playlist.id, track._id)}
              />
            ))}
          </tbody>
        </table>
      ) : (
        <div
          style={{
            padding: '48px 20px',
            textAlign: 'center',
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <Music size={40} color="var(--text-dim)" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: '16px', fontWeight: 600 }}>This playlist has no songs yet</p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Browse music and tap the &quot;+&quot; button to add tracks.
          </p>
          <Link href="/" className="btn-secondary" style={{ marginTop: '16px' }}>
            Find Music
          </Link>
        </div>
      )}
    </div>
  );
}
