import { Package, Monitor, Wrench, Box, ShoppingCart, Cpu, FileText, Sun, Coffee, Clock, AlertTriangle, Calendar } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const ICON_MAP: Record<string, LucideIcon> = {
  Package,
  Monitor,
  Wrench,
  Box,
  ShoppingCart,
  Cpu,
  FileText,
  Sun,
  Coffee,
  Clock,
  AlertTriangle,
  Calendar,
};

export const COLOR_GRADIENTS: Record<string, string> = {
  violet: 'from-violet-500 to-purple-600',
  blue: 'from-blue-500 to-indigo-600',
  amber: 'from-amber-500 to-orange-600',
  gray: 'from-gray-500 to-slate-600',
  green: 'from-green-500 to-emerald-600',
  red: 'from-red-500 to-rose-600',
};

export const COLOR_ACCENTS: Record<string, string> = {
  violet: 'border-l-violet-500',
  blue: 'border-l-blue-500',
  amber: 'border-l-amber-500',
  gray: 'border-l-gray-500',
  green: 'border-l-green-500',
  red: 'border-l-red-500',
};

export function getIcon(iconName?: string): LucideIcon {
  return ICON_MAP[iconName || ''] || Box;
}

export function getGradient(color?: string): string {
  return COLOR_GRADIENTS[color || ''] || COLOR_GRADIENTS.gray;
}

export function getAccent(color?: string): string {
  return COLOR_ACCENTS[color || ''] || 'border-l-gray-400';
}
