'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Play, Disc3, ArrowLeft, Clock, AlertCircle } from 'lucide-react';
import { Album, Track } from '@/types';
import { musicService } from '@/services/musicService';
import { usePlayer } from '@/contexts/PlayerContext';
import { useAuth } from '@/contexts/AuthContext';
import { getArtistName, getDeterministicGradient } from '@/utils/formatters';
import { TrackRow } from '@/components/music/TrackRow';
import { PlaylistModal } from '@/components/ui/PlaylistModal';

export default function AlbumDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const albumId = resolvedParams.id;

  const { isAuthenticated } = useAuth();
  const { playTrack } = usePlayer();

  const [album, setAlbum] = useState<Album | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalTrack, setModalTrack] = useState<Track | null>(null);

  useEffect(() => {
    async function loadAlbum() {
      if (!isAuthenticated) {
        setError('Please sign in to view album details from the database.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await musicService.getAlbumById(albumId);
        if (data) {
          setAlbum(data);

          // If the backend populated or linked musics
          if (Array.isArray(data.musics)) {
            setTracks(data.musics as Track[]);
          } else if (data.musics && typeof data.musics === 'object' && '_id' in data.musics) {
            setTracks([data.musics as Track]);
          } else {
            // If musics was just an ID string, try to fetch all musics and filter
            const allMusics = await musicService.getAllMusics().catch(() => []);
            const match = allMusics.filter(
              (m) =>
                m._id === (data.musics as unknown as string) ||
                (data.musics && typeof data.musics === 'string' && m._id === data.musics)
            );
            setTracks(match.length > 0 ? match : allMusics.slice(0, 4));
          }
        } else {
          setError('Album not found in the database.');
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load album';
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    loadAlbum();
  }, [albumId, isAuthenticated]);

  const handlePlayAlbum = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
        <Disc3 size={40} className="animate-spin" style={{ margin: '0 auto 16px' }} />
        <p>Loading album details...</p>
      </div>
    );
  }

  if (error || !album) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <AlertCircle size={44} color="#ef4444" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Unable to Load Album</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '24px' }}>
          {error || 'The requested album could not be found.'}
        </p>
        <Link href="/" className="btn-secondary">
          Return to Home
        </Link>
      </div>
    );
  }

  const gradient = getDeterministicGradient(album.title || 'Melodify Album');

  return (
    <div>
      <Link
        href="/"
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
        <span>Back</span>
      </Link>

      {/* Album Header */}
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
            background: gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-md)',
            flexShrink: 0,
          }}
        >
          <Disc3 size={72} color="#fff" style={{ opacity: 0.9 }} />
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
            Album
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '40px',
              fontWeight: 800,
              lineHeight: 1.15,
              margin: '8px 0 12px',
            }}
          >
            {album.title}
          </h1>

          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            By <strong style={{ color: 'var(--text-main)' }}>{getArtistName(album.artist)}</strong>
          </p>

          <button
            onClick={handlePlayAlbum}
            disabled={tracks.length === 0}
            className="btn-primary"
          >
            <Play size={18} fill="#fff" />
            <span>Play Album</span>
          </button>
        </div>
      </div>

      {/* Track Listing */}
      <section>
        <h2 className="section-title" style={{ fontSize: '20px', marginBottom: '16px' }}>
          Track Listing ({tracks.length})
        </h2>

        {tracks.length > 0 ? (
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
              {tracks.map((track, idx) => (
                <TrackRow
                  key={`${track._id}-${idx}`}
                  track={track}
                  index={idx}
                  allTracks={tracks}
                  onAddToPlaylist={(t) => setModalTrack(t)}
                />
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: 'var(--text-muted)', padding: '24px 0' }}>
            No tracks associated with this album yet.
          </p>
        )}
      </section>

      <PlaylistModal
        track={modalTrack}
        isOpen={!!modalTrack}
        onClose={() => setModalTrack(null)}
      />
    </div>
  );
}
