'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search as SearchIcon, X, Music, Disc3, User, Sparkles } from 'lucide-react';
import { Album, Track } from '@/types';
import { musicService } from '@/services/musicService';
import { useAuth } from '@/contexts/AuthContext';
import { getArtistName } from '@/utils/formatters';
import { TrackCard } from '@/components/music/TrackCard';
import { AlbumCard } from '@/components/music/AlbumCard';
import { PlaylistModal } from '@/components/ui/PlaylistModal';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const { isAuthenticated } = useAuth();
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'all' | 'songs' | 'albums' | 'artists'>('all');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalTrack, setModalTrack] = useState<Track | null>(null);

  useEffect(() => {
    async function loadResources() {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      try {
        const [mList, aList] = await Promise.all([
          musicService.getAllMusics().catch(() => []),
          musicService.getAllAlbums().catch(() => []),
        ]);
        setTracks(mList);
        setAlbums(aList);
      } catch (err) {
        console.error('Error fetching search pool:', err);
      } finally {
        setLoading(false);
      }
    }
    loadResources();
  }, [isAuthenticated]);

  // Synchronize URL query changes
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) {
      setQuery(q);
    }
  }, [searchParams]);

  // Filtered Results
  const filteredTracks = useMemo(() => {
    if (!query.trim()) return tracks;
    const lower = query.toLowerCase().trim();
    return tracks.filter(
      (t) =>
        t.title.toLowerCase().includes(lower) ||
        getArtistName(t.artist).toLowerCase().includes(lower)
    );
  }, [tracks, query]);

  const filteredAlbums = useMemo(() => {
    if (!query.trim()) return albums;
    const lower = query.toLowerCase().trim();
    return albums.filter(
      (a) =>
        a.title.toLowerCase().includes(lower) ||
        getArtistName(a.artist).toLowerCase().includes(lower)
    );
  }, [albums, query]);

  // Distinct artists from matched tracks/albums
  const matchedArtists = useMemo(() => {
    const artistMap = new Map<string, string>();
    filteredTracks.forEach((t) => {
      const name = getArtistName(t.artist);
      if (name && !artistMap.has(name)) {
        artistMap.set(name, t._id);
      }
    });
    return Array.from(artistMap.entries());
  }, [filteredTracks]);

  return (
    <div>
      {/* Search Header Input */}
      <div style={{ marginBottom: '32px' }}>
        <h1 className="section-title" style={{ fontSize: '32px', marginBottom: '16px' }}>
          Search Melodify
        </h1>

        <div
          style={{
            position: 'relative',
            maxWidth: '680px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <SearchIcon size={20} color="var(--brand-primary)" />
          <input
            type="text"
            placeholder="Search by song title, artist, or album..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '16px',
              color: 'var(--text-main)',
              width: '100%',
              outline: 'none',
            }}
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="player-btn"
              aria-label="Clear search input"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '28px' }}>
        {(['all', 'songs', 'albums', 'artists'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              fontSize: '13px',
              fontWeight: 600,
              textTransform: 'capitalize',
              background: activeTab === tab ? 'var(--gradient-brand)' : 'var(--bg-surface)',
              color: activeTab === tab ? '#fff' : 'var(--text-secondary)',
              border: '1px solid',
              borderColor: activeTab === tab ? 'transparent' : 'var(--border-subtle)',
              transition: 'all 0.2s ease',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Results Rendering */}
      {query && (
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
          Found {filteredTracks.length} songs, {filteredAlbums.length} albums for &quot;{query}&quot;
        </p>
      )}

      {/* Songs Section */}
      {(activeTab === 'all' || activeTab === 'songs') && filteredTracks.length > 0 && (
        <section style={{ marginBottom: '40px' }}>
          <h2 className="section-title" style={{ fontSize: '20px', marginBottom: '16px' }}>
            Songs
          </h2>
          <div className="cards-grid">
            {filteredTracks.map((track) => (
              <TrackCard
                key={track._id}
                track={track}
                allTracks={filteredTracks}
                onAddToPlaylist={(t) => setModalTrack(t)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Albums Section */}
      {(activeTab === 'all' || activeTab === 'albums') && filteredAlbums.length > 0 && (
        <section style={{ marginBottom: '40px' }}>
          <h2 className="section-title" style={{ fontSize: '20px', marginBottom: '16px' }}>
            Albums
          </h2>
          <div className="cards-grid">
            {filteredAlbums.map((album) => (
              <AlbumCard key={album._id} album={album} />
            ))}
          </div>
        </section>
      )}

      {/* Artists Section */}
      {(activeTab === 'all' || activeTab === 'artists') && matchedArtists.length > 0 && (
        <section style={{ marginBottom: '40px' }}>
          <h2 className="section-title" style={{ fontSize: '20px', marginBottom: '16px' }}>
            Artists
          </h2>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {matchedArtists.map(([name, sampleTrackId]) => (
              <div
                key={name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 18px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--gradient-cyan)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                  }}
                >
                  <User size={18} color="#fff" />
                </div>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>{name}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {filteredTracks.length === 0 && filteredAlbums.length === 0 && (
        <div
          style={{
            padding: '60px 20px',
            textAlign: 'center',
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <SearchIcon size={44} color="var(--text-dim)" style={{ margin: '0 auto 16px' }} />
          <p style={{ fontSize: '18px', fontWeight: 700 }}>No Results Found</p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
            Try searching with a different song title or artist name.
          </p>
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
