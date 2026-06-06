import {
  User,
  Palette,
  Globe,
  Bell,
  Database,
  Lock,
  Info
} from 'lucide-react';

export const SETTINGS_SECTIONS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'regional', label: 'Regional & display', icon: Globe },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'data', label: 'Data & privacy', icon: Database },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'about', label: 'About', icon: Info }
];

export const PLACEHOLDER_SECTION_IDS = new Set(['data']);
