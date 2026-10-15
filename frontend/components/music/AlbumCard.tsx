'use client';

import React from 'react';
import Link from 'next/link';
import { Disc3 } from 'lucide-react';
import { Album } from '@/types';
import { getArtistName, getDeterministicGradient } from '@/utils/formatters';

interface AlbumCardProps {
  album: Album;
}

export function AlbumCard({ album }: AlbumCardProps) {
  const gradient = album.coverGradient || getDeterministicGradient(album.title || 'Melodify');

  return (
    <Link href={`/albums/${album._id}`} className="album-card" aria-label={`View album ${album.title}`}>
      <div
        className="album-card-cover"
        style={{ background: gradient }}
      >
        <Disc3 size={42} style={{ opacity: 0.8 }} />
      </div>

      <p className="album-card-title">{album.title}</p>
      <p className="album-card-meta">{getArtistName(album.artist)}</p>
    </Link>
  );
}
