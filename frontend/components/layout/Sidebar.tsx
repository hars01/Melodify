'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Compass,
  Search,
  Library,
  ListMusic,
  UploadCloud,
  User,
  Music2,
  LogIn,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function Sidebar() {
  const pathname = usePathname();
  const { user, isAuthenticated, isArtist } = useAuth();

  const navLinks = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Discover', href: '/discover', icon: Compass },
    { label: 'Search', href: '/search', icon: Search },
    { label: 'Library', href: '/library', icon: Library },
    { label: 'Playlists', href: '/playlists', icon: ListMusic },
  ];

  return (
    <aside className="sidebar" aria-label="Main Navigation">
      <Link href="/" className="sidebar-brand">
        <div className="brand-logo-icon">
          <Music2 size={20} color="#fff" />
        </div>
        <span className="brand-title">Melodify</span>
      </Link>

      <div className="nav-section">
        <p className="nav-section-title">Menu</p>
        {navLinks.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Artist Studio Section */}
      {isArtist && (
        <div className="nav-section">
          <p className="nav-section-title">Creator Studio</p>
          <Link
            href="/upload"
            className={`nav-item ${pathname === '/upload' ? 'active' : ''}`}
          >
            <UploadCloud size={18} />
            <span>Upload Music</span>
          </Link>
        </div>
      )}

      {/* User Session Footer */}
      <div className="sidebar-footer">
        {isAuthenticated && user ? (
          <Link href="/profile" className="user-mini-card">
            <div className="user-avatar">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="user-meta">
              <p className="user-name">{user.username}</p>
              <span className="user-role-badge">{user.role}</span>
            </div>
          </Link>
        ) : (
          <Link href="/login" className="user-mini-card">
            <div className="user-avatar" style={{ background: 'var(--bg-surface-hover)' }}>
              <LogIn size={16} />
            </div>
            <div className="user-meta">
              <p className="user-name">Sign In</p>
              <span className="user-role-badge">Join Melodify</span>
            </div>
          </Link>
        )}
      </div>
    </aside>
  );
}
