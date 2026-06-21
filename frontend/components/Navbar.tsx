"use client";
import Link from 'next/link';
import { Film, Search, LayoutDashboard, Beaker } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Home', icon: Film },
    { href: '/search', label: 'Discover', icon: Search },
    { href: '/search/playground', label: 'Playground', icon: Beaker },
    { href: '/analytics', label: 'Analytics', icon: LayoutDashboard },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-accent to-blue-500 bg-clip-text text-transparent">
          <Film className="w-6 h-6 text-accent" />
          CineSeek
        </Link>
        
        <div className="flex gap-6">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-accent ${
                  isActive ? 'text-accent' : 'text-gray-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
