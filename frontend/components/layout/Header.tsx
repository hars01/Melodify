'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, UploadCloud, LogIn, User, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function Header() {
  const router = useRouter();
  const { user, isAuthenticated, isArtist } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="header" role="banner">
      {/* Quick Search Bar */}
      <form onSubmit={handleSearchSubmit} className="header-search-bar" role="search">
        <Search size={16} color="var(--text-muted)" />
        <input
          type="text"
          placeholder="Search songs, artists, albums..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="header-search-input"
          aria-label="Search music"
        />
      </form>

      {/* Action Controls */}
      <div className="header-actions">
        {isArtist && (
          <Link href="/upload" className="header-btn header-btn-primary">
            <UploadCloud size={16} />
            <span>Upload</span>
          </Link>
        )}

        {isAuthenticated && user ? (
          <Link href="/profile" className="header-btn header-btn-ghost">
            <User size={16} />
            <span>{user.username}</span>
          </Link>
        ) : (
          <Link href="/login" className="header-btn header-btn-primary">
            <LogIn size={16} />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </header>
  );
}
