'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Disc3, Plus, ArrowLeft } from 'lucide-react';
import { Album } from '@/types';
import { musicService } from '@/services/musicService';
import { useAuth } from '@/contexts/AuthContext';
import { AlbumCard } from '@/components/music/AlbumCard';

export default function AlbumsOverviewPage() {
  const { isAuthenticated, isArtist } = useAuth();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAlbums() {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      try {
        const data = await musicService.getAllAlbums();
        setAlbums(data);
      } catch (err) {
        console.error('Failed to load albums:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAlbums();
  }, [isAuthenticated]);

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
            Albums Collection
          </h1>
          <p className="section-subtitle">
            Explore curated LP albums and collections created by verified artists.
          </p>
        </div>

        {isArtist && (
          <Link href="/upload" className="btn-primary">
            <Plus size={18} />
            <span>Create Album</span>
          </Link>
        )}
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
            padding: '60px 20px',
            textAlign: 'center',
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <Disc3 size={44} color="var(--brand-primary)" style={{ margin: '0 auto 16px' }} />
          <p style={{ fontSize: '18px', fontWeight: 700 }}>No Albums in Database Yet</p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
            Artists can group published tracks into themed albums via the Creator Studio.
          </p>
          {isArtist && (
            <Link href="/upload" className="btn-primary" style={{ marginTop: '20px' }}>
              Create First Album
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
