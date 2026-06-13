import { NavLink } from 'react-router';
import { Bot, LayoutDashboard, MessageSquare, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/cn';
import { useUI } from '@/store/ui';
import { JarvisMark } from '@/components/layout/JarvisMark';

const items = [
  { to: '/', label: 'Chat', icon: MessageSquare, end: true },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: false },
  { to: '/agents', label: 'Agents', icon: Bot, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
];

export function SideRail() {
  const collapsed = useUI((s) => s.sidebarCollapsed);

  return (
    <aside
      className={cn(
        'hidden h-full shrink-0 flex-col gap-1 border-r border-border bg-surface/40 p-3 transition-[width] duration-200 ease-out sm:flex',
        collapsed ? 'w-[68px]' : 'w-[224px]',
      )}
    >
      <div className="mb-3 flex items-center gap-2.5 px-1.5 py-1">
        <JarvisMark className="h-8 w-8 shrink-0" />
        {!collapsed && <span className="font-semibold tracking-tight">OpenJarvis</span>}
      </div>

      <nav className="flex flex-col gap-1">
        {items.map((it) => (
          <NavLink key={it.to} to={it.to} end={it.end} title={it.label}>
            {({ isActive }) => (
              <div
                className={cn(
                  'relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
                  isActive ? 'text-text' : 'text-muted hover:bg-surface-2 hover:text-text',
                  collapsed && 'justify-center',
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="rail-active"
                    className="absolute inset-0 rounded-lg bg-surface-2"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <it.icon className="relative h-[18px] w-[18px] shrink-0" />
                {!collapsed && <span className="relative">{it.label}</span>}
              </div>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
