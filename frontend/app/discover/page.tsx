'use client';

import React, { useState, useEffect } from 'react';
import { Compass, Music, Disc, Sparkles, Filter } from 'lucide-react';
import { Track } from '@/types';
import { musicService } from '@/services/musicService';
import { useAuth } from '@/contexts/AuthContext';
import { TrackCard } from '@/components/music/TrackCard';
import { PlaylistModal } from '@/components/ui/PlaylistModal';

const GENRES = [
  { name: 'All Moods', color: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' },
  { name: 'Lo-Fi Chill', color: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' },
  { name: 'Synthwave', color: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)' },
  { name: 'Cyberpunk', color: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)' },
  { name: 'Ambient Deep', color: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)' },
  { name: 'Acoustic Indie', color: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' },
];

export default function DiscoverPage() {
  const { isAuthenticated } = useAuth();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedGenre, setSelectedGenre] = useState('All Moods');
  const [loading, setLoading] = useState(true);
  const [modalTrack, setModalTrack] = useState<Track | null>(null);

  useEffect(() => {
    async function fetchMusics() {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      try {
        const data = await musicService.getAllMusics();
        setTracks(data);
      } catch (err) {
        console.error('Failed to load discovery tracks:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMusics();
  }, [isAuthenticated]);

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="section-title" style={{ fontSize: '32px' }}>
          Discover Soundscapes
        </h1>
        <p className="section-subtitle">
          Explore eclectic rhythms, sonic moodboards, and indie artists from the Melodify ecosystem.
        </p>
      </div>

      {/* Mood & Genre Pills */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          overflowX: 'auto',
          paddingBottom: '12px',
          marginBottom: '36px',
        }}
      >
        {GENRES.map((genre) => {
          const isSelected = selectedGenre === genre.name;
          return (
            <button
              key={genre.name}
              onClick={() => setSelectedGenre(genre.name)}
              style={{
                background: isSelected ? genre.color : 'var(--bg-surface)',
                color: isSelected ? '#fff' : 'var(--text-secondary)',
                border: '1px solid',
                borderColor: isSelected ? 'transparent' : 'var(--border-subtle)',
                borderRadius: 'var(--radius-full)',
                padding: '10px 22px',
                fontWeight: 600,
                fontSize: '13px',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? '0 4px 16px rgba(139, 92, 246, 0.3)' : 'none',
              }}
            >
              {genre.name}
            </button>
          );
        })}
      </div>

      {/* Tracks Grid */}
      <section>
        <div className="section-header">
          <div>
            <h2 className="section-title">
              {selectedGenre === 'All Moods' ? 'Curated Audio Collection' : `${selectedGenre} Selections`}
            </h2>
            <p className="section-subtitle">
              {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'} available
            </p>
          </div>
        </div>

        {tracks.length > 0 ? (
          <div className="cards-grid">
            {tracks.map((track) => (
              <TrackCard
                key={track._id}
                track={track}
                allTracks={tracks}
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
            <Compass size={44} color="var(--brand-accent)" style={{ margin: '0 auto 16px' }} />
            <p style={{ fontSize: '18px', fontWeight: 700 }}>No Tracks In This Category Yet</p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
              Upload new audio files or browse other moodboards.
            </p>
          </div>
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
