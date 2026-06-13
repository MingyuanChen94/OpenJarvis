import { NavLink } from 'react-router';
import { Bot, LayoutDashboard, MessageSquare, Settings } from 'lucide-react';
import { cn } from '@/lib/cn';

const items = [
  { to: '/', label: 'Chat', icon: MessageSquare, end: true },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: false },
  { to: '/agents', label: 'Agents', icon: Bot, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
];

export function MobileNav() {
  return (
    <nav className="glass flex shrink-0 items-center justify-around border-t border-border py-1.5 sm:hidden">
      {items.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          end={it.end}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-[10px] font-medium transition-colors',
              isActive ? 'text-accent' : 'text-muted',
            )
          }
        >
          <it.icon className="h-5 w-5" />
          {it.label}
        </NavLink>
      ))}
    </nav>
  );
}
