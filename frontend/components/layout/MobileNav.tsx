'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Search, Library, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function MobileNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Discover', href: '/discover', icon: Compass },
    { label: 'Search', href: '/search', icon: Search },
    { label: 'Library', href: '/library', icon: Library },
    { label: isAuthenticated ? 'Profile' : 'Sign In', href: isAuthenticated ? '/profile' : '/login', icon: User },
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation Dock">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
