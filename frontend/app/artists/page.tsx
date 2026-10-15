'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { User, Music, Disc3, Mic2, ArrowRight } from 'lucide-react';
import { Track } from '@/types';
import { musicService } from '@/services/musicService';
import { useAuth } from '@/contexts/AuthContext';
import { getArtistName } from '@/utils/formatters';

interface ArtistGroup {
  id: string;
  name: string;
  tracks: Track[];
}

export default function ArtistsPage() {
  const { isAuthenticated } = useAuth();
  const [artists, setArtists] = useState<ArtistGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArtists() {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      try {
        const musics = await musicService.getAllMusics();
        const map = new Map<string, ArtistGroup>();

        musics.forEach((track) => {
          const artistName = getArtistName(track.artist);
          const artistId =
            typeof track.artist === 'object' && track.artist !== null
              ? track.artist._id
              : String(track.artist || artistName);

          if (!map.has(artistName)) {
            map.set(artistName, {
              id: artistId,
              name: artistName,
              tracks: [],
            });
          }
          map.get(artistName)!.tracks.push(track);
        });

        setArtists(Array.from(map.values()));
      } catch (err) {
        console.error('Failed to load artists:', err);
      } finally {
        setLoading(false);
      }
    }

    loadArtists();
  }, [isAuthenticated]);

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="section-title" style={{ fontSize: '32px' }}>
          Artists & Creators
        </h1>
        <p className="section-subtitle">
          Discover the producers and sound designers who craft music on Melodify.
        </p>
      </div>

      {artists.length > 0 ? (
        <div className="cards-grid">
          {artists.map((artist) => (
            <Link
              key={artist.name}
              href={`/artists/${artist.id}`}
              className="album-card"
              style={{ textAlign: 'center' }}
            >
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--gradient-brand)',
                  margin: '12px auto 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-neon)',
                  fontSize: '32px',
                  fontWeight: 800,
                  color: '#fff',
                }}
              >
                {artist.name.charAt(0).toUpperCase()}
              </div>
              <p className="album-card-title">{artist.name}</p>
              <p className="album-card-meta">{artist.tracks.length} releases</p>
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
          <Mic2 size={44} color="var(--brand-accent)" style={{ margin: '0 auto 16px' }} />
          <p style={{ fontSize: '18px', fontWeight: 700 }}>No Artist Profiles Available Yet</p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
            When artists upload songs, their creator profiles will automatically emerge here.
          </p>
        </div>
      )}
    </div>
  );
}
