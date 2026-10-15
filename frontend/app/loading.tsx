import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        gap: '16px',
        color: 'var(--text-secondary)',
      }}
    >
      <Loader2 size={36} className="animate-spin" color="var(--brand-primary)" />
      <p style={{ fontSize: '14px', fontWeight: 500 }}>Loading Melodify...</p>
    </div>
  );
}
