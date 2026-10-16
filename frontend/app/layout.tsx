import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/contexts/ToastContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { PlayerProvider } from '@/contexts/PlayerContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Player } from '@/components/player/Player';
import { QueueDrawer } from '@/components/player/QueueDrawer';
import { MobileNav } from '@/components/layout/MobileNav';

export const metadata: Metadata = {
  icons: { icon: "/logo.png", },
  title: 'Melodify — Modern Music Streaming & Creator Studio',
  description:
    'Experience high-fidelity music streaming, discover fresh albums and artists, and upload your soundscapes with Melodify.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <AuthProvider>
            <PlayerProvider>
              <div className="app-container">
                <Sidebar />
                <div className="main-viewport">
                  <Header />
                  <main className="page-content">{children}</main>
                </div>
                <Player />
                <QueueDrawer />
                <MobileNav />
              </div>
            </PlayerProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
