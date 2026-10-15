'use client';

import React from 'react';

interface VisualizerProps {
  isPlaying: boolean;
  color?: string;
}

export function Visualizer({ isPlaying, color }: VisualizerProps) {
  if (!isPlaying) return null;

  return (
    <div className="visualizer-container" aria-label="Audio Visualizer">
      <span className="visualizer-bar" style={color ? { background: color } : undefined} />
      <span className="visualizer-bar" style={color ? { background: color } : undefined} />
      <span className="visualizer-bar" style={color ? { background: color } : undefined} />
      <span className="visualizer-bar" style={color ? { background: color } : undefined} />
    </div>
  );
}
