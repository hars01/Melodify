'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, LogOut, ShieldCheck, Heart, ListMusic, UploadCloud, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePlayer } from '@/contexts/PlayerContext';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, isArtist } = useAuth();
  const { favorites, playlists, recentlyPlayed } = usePlayer();

  if (!isAuthenticated || !user) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <User size={44} color="var(--text-dim)" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '22px', fontWeight: 700 }}>No Active User Session</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '24px' }}>
          Please sign in to view your profile and account settings.
        </p>
        <Link href="/login" className="btn-primary">
          Sign In
        </Link>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Profile Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '36px',
          marginBottom: '32px',
          boxShadow: 'var(--shadow-md)',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            width: '84px',
            height: '84px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--gradient-brand)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '34px',
            fontWeight: 800,
            color: '#fff',
            boxShadow: 'var(--shadow-neon)',
            flexShrink: 0,
          }}
        >
          {user.username.charAt(0).toUpperCase()}
        </div>

        <div style={{ flex: 1, minWidth: '240px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>
              {user.username}
            </h1>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                background: 'rgba(139, 92, 246, 0.2)',
                border: '1px solid var(--border-glow)',
                color: 'var(--brand-primary-hover)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              {user.role}
            </span>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            {user.email}
          </p>

          <p style={{ color: 'var(--text-dim)', fontSize: '12px', marginTop: '6px' }}>
            Account ID: {user.id || user._id || 'Verified'}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="btn-secondary"
          style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Account Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '36px',
        }}
      >
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <Heart size={28} color="var(--brand-secondary)" />
          <div>
            <p style={{ fontSize: '22px', fontWeight: 800 }}>{favorites.length}</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Liked Songs</p>
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <ListMusic size={28} color="var(--brand-primary)" />
          <div>
            <p style={{ fontSize: '22px', fontWeight: 800 }}>{playlists.length}</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Playlists Created</p>
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <ShieldCheck size={28} color="var(--brand-emerald)" />
          <div>
            <p style={{ fontSize: '22px', fontWeight: 800 }}>Active</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Session Security</p>
          </div>
        </div>
      </div>

      {/* Creator Quick Link */}
      {isArtist && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(236, 72, 153, 0.1) 100%)',
            border: '1px solid var(--border-glow)',
            borderRadius: 'var(--radius-xl)',
            padding: '28px',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Creator Studio</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Publish tracks and build original albums to share with listeners worldwide.
            </p>
          </div>
          <Link href="/upload" className="btn-primary">
            <UploadCloud size={16} />
            <span>Go to Studio</span>
          </Link>
        </div>
      )}

      {/* Backend Integration Note */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start',
        }}
      >
        <Info size={20} color="var(--brand-accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--text-main)' }}>Account Note:</strong> The backend Express
          service manages your authentication session via HTTP cookies. User profile mutations or
          password updates are not currently exposed as backend API endpoints and are safely preserved as-is.
        </div>
      </div>
    </div>
  );
}
