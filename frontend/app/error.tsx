'use client';

import React, { useEffect } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application runtime error:', error);
  }, [error]);

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
          width: '64px',
          height: '64px',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(239, 68, 68, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
        }}
      >
        <AlertCircle size={32} color="#ef4444" />
      </div>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>
        Something Went Wrong
      </h1>

      <p
        style={{
          color: 'var(--text-secondary)',
          maxWidth: '480px',
          marginTop: '8px',
          marginBottom: '24px',
          fontSize: '14px',
        }}
      >
        {error.message || 'An unexpected error occurred while processing this request.'}
      </p>

      <button onClick={() => reset()} className="btn-primary">
        <RotateCcw size={16} />
        <span>Try Again</span>
      </button>
    </div>
  );
}
