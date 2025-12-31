// Category Type Definitions and Helper Functions for TCG Gossip
// Mock data removed - now fetches real data from Supabase

export interface Subcategory {
  id: string;
  name: string;
  description?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  threadCount: number;
  postCount: number;
  subcategories?: Subcategory[];
}

// Helper function to format numbers
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

// Icon mapping for categories
export const iconMap: Record<string, string> = {
  MessageSquare: 'MessageSquare',
  Star: 'Star',
  TrendingUp: 'TrendingUp',
  Award: 'Award',
  BookOpen: 'BookOpen',
  Newspaper: 'Newspaper',
  ArrowLeftRight: 'ArrowLeftRight',
  Swords: 'Swords',
  Smartphone: 'Smartphone',
  Sparkles: 'Sparkles',
  ShieldCheck: 'ShieldCheck',
  GraduationCap: 'GraduationCap',
};
