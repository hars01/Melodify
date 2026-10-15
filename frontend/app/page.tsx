'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Play, Sparkles, Disc3, Radio, ArrowRight, Music, AlertCircle } from 'lucide-react';
import { Album, Track } from '@/types';
import { musicService } from '@/services/musicService';
import { useAuth } from '@/contexts/AuthContext';
import { usePlayer } from '@/contexts/PlayerContext';
import { TrackCard } from '@/components/music/TrackCard';
import { AlbumCard } from '@/components/music/AlbumCard';
import { PlaylistModal } from '@/components/ui/PlaylistModal';

// Sample demonstration tracks for unauthenticated or brand-new empty database states
const DEMO_TRACKS: Track[] = [
  {
    _id: 'demo_1',
    title: 'Neon Nights & Cyber Dreams',
    uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    artist: { _id: 'artist_1', username: 'Starlight Waves' },
    artwork: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&auto=format&fit=crop&q=80',
    duration: 372,
  },
  {
    _id: 'demo_2',
    title: 'Ambient Echoes in the Rain',
    uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    artist: { _id: 'artist_2', username: 'Lunar Drift' },
    artwork: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    duration: 420,
  },
  {
    _id: 'demo_3',
    title: 'Electric Horizon Pulse',
    uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    artist: { _id: 'artist_3', username: 'Synth Voyage' },
    artwork: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    duration: 345,
  },
  {
    _id: 'demo_4',
    title: 'Solar Eclipse Melodies',
    uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    artist: { _id: 'artist_4', username: 'Aura Collective' },
    artwork: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    duration: 290,
  },
];

export default function HomePage() {
  const { isAuthenticated, user, isArtist } = useAuth();
  const { playTrack, recentlyPlayed } = usePlayer();

  const [tracks, setTracks] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBackendEmpty, setIsBackendEmpty] = useState(false);
  const [authRequiredNotice, setAuthRequiredNotice] = useState(false);

  const [activeModalTrack, setActiveModalTrack] = useState<Track | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setAuthRequiredNotice(false);

      if (!isAuthenticated) {
        setAuthRequiredNotice(true);
        setTracks(DEMO_TRACKS);
        setLoading(false);
        return;
      }

      try {
        const [fetchedMusics, fetchedAlbums] = await Promise.all([
          musicService.getAllMusics().catch((err) => {
            if (err.status === 401) setAuthRequiredNotice(true);
            return [];
          }),
          musicService.getAllAlbums().catch(() => []),
        ]);

        if (fetchedMusics.length > 0) {
          setTracks(fetchedMusics);
        } else {
          setIsBackendEmpty(true);
          setTracks(DEMO_TRACKS);
        }

        setAlbums(fetchedAlbums);
      } catch (err) {
        console.error('Error loading music data:', err);
        setTracks(DEMO_TRACKS);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isAuthenticated]);

  const handleHeroPlay = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks);
    }
  };

  return (
    <div>
      {/* Hero Soundscape Banner */}
      <section className="hero-banner">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={14} color="#ec4899" />
            <span>Featured Audio Experience</span>
          </div>

          <h1 className="hero-title">
            Immerse Yourself in High-Fidelity Sound
          </h1>

          <p className="hero-desc">
            Explore curated tracks, discover rising indie artists, and stream lossless audio.
            Upload your soundscapes and create custom mood playlists tailored to every rhythm of your day.
          </p>

          <div className="hero-actions">
            <button onClick={handleHeroPlay} className="btn-primary">
              <Play size={18} fill="#fff" />
              <span>Listen Now</span>
            </button>
            <Link href="/discover" className="btn-secondary">
              <Radio size={18} />
              <span>Explore Moods</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Auth Notice when user is unauthenticated */}
      {authRequiredNotice && (
        <div
          style={{
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid var(--border-glow)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={20} color="var(--brand-primary)" />
            <div>
              <p style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '14px' }}>
                Connect to Melodify Backend
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Sign in to stream your server-stored tracks and albums from MongoDB. Showing preview tracks below.
              </p>
            </div>
          </div>
          <Link href="/login" className="btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
            Sign In Now
          </Link>
        </div>
      )}

      {/* Creator Notice when DB has no music yet */}
      {isBackendEmpty && isAuthenticated && (
        <div
          style={{
            background: 'rgba(6, 182, 212, 0.1)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <p style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '14px' }}>
              Your Database is Ready for New Music!
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              No tracks uploaded to MongoDB yet. Artists can upload MP3s and create albums directly.
            </p>
          </div>
          {isArtist ? (
            <Link href="/upload" className="btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
              Upload First Track
            </Link>
          ) : (
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Artist role required to publish songs.
            </span>
          )}
        </div>
      )}

      {/* Trending / Recent Tracks */}
      <section style={{ marginBottom: '40px' }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">Trending Tracks</h2>
            <p className="section-subtitle">
              {isBackendEmpty ? 'Featured sample tracks' : 'Fresh sounds uploaded by artists'}
            </p>
          </div>
          <Link href="/discover" className="section-action">
            <span>View All</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="cards-grid">
          {tracks.map((track) => (
            <TrackCard
              key={track._id}
              track={track}
              allTracks={tracks}
              onAddToPlaylist={(t) => setActiveModalTrack(t)}
            />
          ))}
        </div>
      </section>

      {/* Albums Section */}
      <section style={{ marginBottom: '40px' }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">Featured Albums</h2>
            <p className="section-subtitle">Original collections crafted by creators</p>
          </div>
        </div>

        {albums.length > 0 ? (
          <div className="cards-grid">
            {albums.map((album) => (
              <AlbumCard key={album._id} album={album} />
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: '36px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              textAlign: 'center',
            }}
          >
            <Disc3 size={36} color="var(--text-dim)" style={{ margin: '0 auto 10px' }} />
            <p style={{ fontWeight: 600, fontSize: '15px' }}>No Albums Published Yet</p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Artists can package songs into albums via the Creator Studio.
            </p>
          </div>
        )}
      </section>

      {/* Recently Played */}
      {recentlyPlayed.length > 0 && (
        <section style={{ marginBottom: '40px' }}>
          <div className="section-header">
            <div>
              <h2 className="section-title">Recently Played</h2>
              <p className="section-subtitle">Jump straight back into your groove</p>
            </div>
          </div>

          <div className="cards-grid">
            {recentlyPlayed.slice(0, 5).map((track) => (
              <TrackCard
                key={track._id}
                track={track}
                allTracks={recentlyPlayed}
                onAddToPlaylist={(t) => setActiveModalTrack(t)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Playlist Modal */}
      <PlaylistModal
        track={activeModalTrack}
        isOpen={!!activeModalTrack}
        onClose={() => setActiveModalTrack(null)}
      />
    </div>
  );
}
