'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus, Music2, Sparkles, Loader2, Mic, Headphones } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !email.trim() || !password) {
      setErrorMsg('All fields are required.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password should be at least 6 characters.');
      return;
    }

    const success = await register({
      username: username.trim(),
      email: email.trim(),
      password,
      role,
    });

    if (success) {
      router.push('/');
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 240px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 0',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '40px 36px',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--gradient-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: 'var(--shadow-neon)',
            }}
          >
            <Music2 size={24} color="#fff" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 800 }}>
            Join Melodify
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '6px' }}>
            Choose your account type and start experiencing next-generation audio.
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              color: '#f87171',
              fontSize: '13px',
              marginBottom: '20px',
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div className="form-group">
            <label className="form-label">Select Account Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div
                onClick={() => setRole('user')}
                style={{
                  border: '1px solid',
                  borderColor: role === 'user' ? 'var(--brand-primary)' : 'var(--border-subtle)',
                  background: role === 'user' ? 'rgba(139, 92, 246, 0.12)' : 'var(--bg-main)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                <Headphones size={22} color={role === 'user' ? 'var(--brand-primary)' : 'var(--text-muted)'} style={{ margin: '0 auto 6px' }} />
                <p style={{ fontSize: '13px', fontWeight: 700 }}>Listener</p>
                <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>Stream & save music</p>
              </div>

              <div
                onClick={() => setRole('artist')}
                style={{
                  border: '1px solid',
                  borderColor: role === 'artist' ? 'var(--brand-primary)' : 'var(--border-subtle)',
                  background: role === 'artist' ? 'rgba(139, 92, 246, 0.12)' : 'var(--bg-main)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                <Mic size={22} color={role === 'artist' ? 'var(--brand-secondary)' : 'var(--text-muted)'} style={{ margin: '0 auto 6px' }} />
                <p style={{ fontSize: '13px', fontWeight: 700 }}>Artist / Creator</p>
                <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>Upload songs & albums</p>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              placeholder="e.g. soundscaper"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              placeholder="e.g. name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
            style={{ width: '100%', padding: '14px', marginTop: '8px' }}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        <div
          style={{
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-subtle)',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Already registered?{' '}
            <Link
              href="/login"
              style={{ color: 'var(--brand-primary)', fontWeight: 600, textDecoration: 'underline' }}
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
