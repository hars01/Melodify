'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, User, Music, Clock } from 'lucide-react';
import { Track } from '@/types';
import { musicService } from '@/services/musicService';
import { usePlayer } from '@/contexts/PlayerContext';
import { useAuth } from '@/contexts/AuthContext';
import { getArtistName } from '@/utils/formatters';
import { TrackRow } from '@/components/music/TrackRow';
import { PlaylistModal } from '@/components/ui/PlaylistModal';

export default function ArtistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const artistId = resolvedParams.id;

  const { isAuthenticated } = useAuth();
  const { playTrack } = usePlayer();

  const [artistName, setArtistName] = useState('Artist');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalTrack, setModalTrack] = useState<Track | null>(null);

  useEffect(() => {
    async function loadArtistData() {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      try {
        const musics = await musicService.getAllMusics();
        const matches = musics.filter((t) => {
          const id =
            typeof t.artist === 'object' && t.artist !== null
              ? t.artist._id
              : String(t.artist);
          const name = getArtistName(t.artist);
          return id === artistId || name.toLowerCase() === decodeURIComponent(artistId).toLowerCase();
        });

        if (matches.length > 0) {
          setTracks(matches);
          setArtistName(getArtistName(matches[0].artist));
        }
      } catch (err) {
        console.error('Error loading artist details:', err);
      } finally {
        setLoading(false);
      }
    }

    loadArtistData();
  }, [artistId, isAuthenticated]);

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks);
    }
  };

  return (
    <div>
      <Link
        href="/artists"
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
        <span>Back to Artists</span>
      </Link>

      {/* Artist Profile Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '28px',
          marginBottom: '36px',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(6, 182, 212, 0.1) 100%)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '36px',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            width: '120px',
            height: '120px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--gradient-brand)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '44px',
            fontWeight: 800,
            color: '#fff',
            boxShadow: 'var(--shadow-neon)',
          }}
        >
          {artistName.charAt(0).toUpperCase()}
        </div>

        <div style={{ flex: 1, minWidth: '240px' }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'var(--brand-accent)',
            }}
          >
            Verified Artist
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '40px',
              fontWeight: 800,
              margin: '6px 0 12px',
            }}
          >
            {artistName}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            {tracks.length} releases available on Melodify
          </p>

          <button
            onClick={handlePlayAll}
            disabled={tracks.length === 0}
            className="btn-primary"
          >
            <Play size={18} fill="#fff" />
            <span>Play Discography</span>
          </button>
        </div>
      </div>

      {/* Track List */}
      <section>
        <h2 className="section-title" style={{ fontSize: '20px', marginBottom: '16px' }}>
          Popular Releases
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
            No tracks found for this artist.
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
