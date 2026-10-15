import React from 'react';
import Link from 'next/link';
import { Music, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
        }}
      >
        <Music size={32} color="var(--brand-primary)" />
      </div>

      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '32px',
          fontWeight: 800,
          marginBottom: '8px',
        }}
      >
        404 — Page Not Found
      </h1>

      <p
        style={{
          color: 'var(--text-secondary)',
          maxWidth: '460px',
          marginBottom: '28px',
          fontSize: '14px',
        }}
      >
        The frequency you are searching for does not exist or has been shifted in the sonic spectrum.
      </p>

      <Link href="/" className="btn-primary">
        <ArrowLeft size={16} />
        <span>Return to Melodify</span>
      </Link>
    </div>
  );
}
