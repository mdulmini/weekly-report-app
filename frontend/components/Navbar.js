'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const links =
    user.role === 'manager'
      ? [{ href: '/dashboard', label: 'Dashboard' }]
      : [{ href: '/reports', label: 'My Reports' }];

  return (
    <nav className="border-b border-black/5 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-8">
          <span className="font-display text-lg font-bold text-ink">Weekly Report</span>
          <div className="flex gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  pathname === link.href
                    ? 'bg-accent/10 text-accent'
                    : 'text-ink/60 hover:bg-black/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-ink/60">
            {user.name} <span className="text-ink/30">·</span>{' '}
            <span className="capitalize">{user.role}</span>
          </span>
          <button
            onClick={logout}
            className="rounded-lg border border-black/10 px-3 py-1.5 text-sm font-medium text-ink/70 transition hover:bg-black/5"
          >
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
}