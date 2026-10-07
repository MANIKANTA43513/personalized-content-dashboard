import { Flame, Heart, LayoutDashboard, Newspaper, Settings, type LucideIcon } from 'lucide-react';

export interface NavItem {
  href: string;
  labelKey: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { href: '/feed', labelKey: 'nav.feed', icon: Newspaper },
  { href: '/trending', labelKey: 'nav.trending', icon: Flame },
  { href: '/favorites', labelKey: 'nav.favorites', icon: Heart },
  { href: '/settings', labelKey: 'nav.settings', icon: Settings },
];
