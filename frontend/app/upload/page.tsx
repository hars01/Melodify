'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, Disc, Music, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Track } from '@/types';
import { musicService } from '@/services/musicService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

export default function UploadPage() {
  const router = useRouter();
  const { isAuthenticated, isArtist, user } = useAuth();
  const { success, error: showError } = useToast();

  const [activeTab, setActiveTab] = useState<'track' | 'album'>('track');

  // Track upload form state
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [uriPlaceholder, setUriPlaceholder] = useState('storage/melodify');
  const [isUploading, setIsUploading] = useState(false);

  // Album creation form state
  const [albumTitle, setAlbumTitle] = useState('');
  const [availableTracks, setAvailableTracks] = useState<Track[]>([]);
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      musicService.getAllMusics().then(setAvailableTracks).catch(() => {});
    }
  }, [isAuthenticated]);

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) {
      showError('Validation Error', 'Please select an audio file and enter a track title.');
      return;
    }

    try {
      setIsUploading(true);
      const newTrack = await musicService.uploadMusic(file, title.trim(), uriPlaceholder);
      success('Track Published!', `"${newTrack.title}" has been uploaded to ImageKit and MongoDB.`);
      setTitle('');
      setFile(null);
      router.push('/');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      showError('Upload Failed', msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAlbumSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumTitle.trim() || selectedTrackIds.length === 0) {
      showError('Validation Error', 'Please provide an album title and select at least one track.');
      return;
    }

    try {
      setIsCreatingAlbum(true);
      const newAlbum = await musicService.createAlbum(albumTitle.trim(), selectedTrackIds);
      success('Album Created!', `"${newAlbum.title}" has been saved to the database.`);
      setAlbumTitle('');
      setSelectedTrackIds([]);
      router.push('/');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Album creation failed';
      showError('Album Creation Error', msg);
    } finally {
      setIsCreatingAlbum(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <AlertCircle size={44} color="var(--brand-primary)" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Authentication Required</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '24px' }}>
          Please sign in with an artist or admin account to access the Creator Studio.
        </p>
        <button onClick={() => router.push('/login')} className="btn-primary">
          Sign In
        </button>
      </div>
    );
  }

  if (!isArtist) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <AlertCircle size={44} color="var(--brand-amber)" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Artist Role Required</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '24px' }}>
          Your current account role is <strong>{user?.role}</strong>. In the Melodify backend, only
          accounts with the &quot;artist&quot; or &quot;admin&quot; role have permission to publish audio or albums.
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>
          You can create a new account with the &quot;artist&quot; role on the registration page.
        </p>
        <button onClick={() => router.push('/register')} className="btn-primary">
          Register as Artist
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="section-title" style={{ fontSize: '32px' }}>
          Creator Studio
        </h1>
        <p className="section-subtitle">
          Upload lossless audio tracks directly to the backend storage and package them into albums.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
        <button
          onClick={() => setActiveTab('track')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: 'var(--radius-full)',
            fontSize: '13px',
            fontWeight: 600,
            background: activeTab === 'track' ? 'var(--gradient-brand)' : 'var(--bg-surface)',
            color: activeTab === 'track' ? '#fff' : 'var(--text-secondary)',
            border: '1px solid',
            borderColor: activeTab === 'track' ? 'transparent' : 'var(--border-subtle)',
          }}
        >
          <Music size={16} />
          <span>Upload Track</span>
        </button>

        <button
          onClick={() => setActiveTab('album')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: 'var(--radius-full)',
            fontSize: '13px',
            fontWeight: 600,
            background: activeTab === 'album' ? 'var(--gradient-brand)' : 'var(--bg-surface)',
            color: activeTab === 'album' ? '#fff' : 'var(--text-secondary)',
            border: '1px solid',
            borderColor: activeTab === 'album' ? 'transparent' : 'var(--border-subtle)',
          }}
        >
          <Disc size={16} />
          <span>Create Album</span>
        </button>
      </div>

      {/* Track Upload Form */}
      {activeTab === 'track' && (
        <form
          onSubmit={handleTrackSubmit}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: '32px',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div className="form-group">
            <label className="form-label">Audio File (MP3, WAV, AAC)</label>
            <div
              style={{
                border: '2px dashed var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '32px 20px',
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.02)',
                cursor: 'pointer',
              }}
              onClick={() => document.getElementById('audio-file-input')?.click()}
            >
              <UploadCloud size={36} color="var(--brand-primary)" style={{ margin: '0 auto 12px' }} />
              {file ? (
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '14px' }}>
                    {file.name}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '14px' }}>
                    Click to select audio file
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Supports audio files up to 25MB
                  </p>
                </div>
              )}
              <input
                id="audio-file-input"
                type="file"
                accept="audio/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                    if (!title) {
                      // Pre-fill title without extension
                      const nameWithoutExt = e.target.files[0].name.replace(/\.[^/.]+$/, '');
                      setTitle(nameWithoutExt);
                    }
                  }
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Track Title</label>
            <input
              type="text"
              placeholder="e.g. Midnight Reverie"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Storage URI / Tag</label>
            <input
              type="text"
              placeholder="Backend URI required by /api/music/upload"
              value={uriPlaceholder}
              onChange={(e) => setUriPlaceholder(e.target.value)}
              className="form-input"
            />
            <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
              Sent to Express backend as required by `req.body.uri`. ImageKit uploads the audio and replaces with public URL.
            </p>
          </div>

          <button
            type="submit"
            disabled={isUploading || !file || !title.trim()}
            className="btn-primary"
            style={{ width: '100%', padding: '14px', marginTop: '12px' }}
          >
            {isUploading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Uploading to Backend & ImageKit...</span>
              </>
            ) : (
              <>
                <UploadCloud size={18} />
                <span>Publish Song</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* Album Creation Form */}
      {activeTab === 'album' && (
        <form
          onSubmit={handleAlbumSubmit}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: '32px',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div className="form-group">
            <label className="form-label">Album Title</label>
            <input
              type="text"
              placeholder="e.g. Chronicles of Neon"
              value={albumTitle}
              onChange={(e) => setAlbumTitle(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Select Musics to Include ({selectedTrackIds.length} selected)
            </label>
            {availableTracks.length > 0 ? (
              <div
                style={{
                  maxHeight: '260px',
                  overflowY: 'auto',
                  background: 'var(--bg-main)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {availableTracks.map((track) => {
                  const isChecked = selectedTrackIds.includes(track._id);
                  return (
                    <div
                      key={track._id}
                      onClick={() => {
                        setSelectedTrackIds((prev) =>
                          isChecked ? prev.filter((id) => id !== track._id) : [...prev, track._id]
                        );
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: isChecked ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                        cursor: 'pointer',
                        marginBottom: '4px',
                      }}
                    >
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>{track.title}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        style={{ accentColor: 'var(--brand-primary)', width: '16px', height: '16px' }}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                No uploaded tracks found. Please publish tracks first before creating an album.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isCreatingAlbum || !albumTitle.trim() || selectedTrackIds.length === 0}
            className="btn-primary"
            style={{ width: '100%', padding: '14px', marginTop: '12px' }}
          >
            {isCreatingAlbum ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Creating Album...</span>
              </>
            ) : (
              <>
                <Disc size={18} />
                <span>Create Album</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
