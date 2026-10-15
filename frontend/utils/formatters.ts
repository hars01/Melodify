import { ArtistRef, Track } from '@/types';

/**
 * Format seconds into mm:ss format
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

/**
 * Safely get the display name of an artist
 */
export function getArtistName(artist: ArtistRef | undefined | null): string {
  if (!artist) return 'Unknown Artist';
  if (typeof artist === 'string') return artist;
  return artist.username || 'Unknown Artist';
}

/**
 * Curated music cover artworks for visual presentation
 */
const CURATED_ARTWORKS = [
  'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80',
];

/**
 * Returns artwork for track or deterministic fallback from curated set
 */
export function getTrackArtwork(track?: Track | null, seed = 0): string {
  if (track?.artwork) return track.artwork;
  const hash = track?.title
    ? track.title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    : seed;
  const index = Math.abs(hash) % CURATED_ARTWORKS.length;
  return CURATED_ARTWORKS[index];
}

/**
 * Color gradients for playlist & album covers
 */
const GRADIENTS = [
  'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
  'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
  'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
  'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
  'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
];

export function getDeterministicGradient(seedString: string): string {
  const hash = seedString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

export function truncate(str: string, maxLength = 30): string {
  if (!str) return '';
  return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
}
