'use client';

import { Flame, TrendingUp, Zap } from 'lucide-react';

export type HeatLevel = 'fire' | 'hot' | 'warm' | 'normal';

interface TrendingIndicatorProps {
  level: HeatLevel;
  score?: number;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'badge' | 'icon' | 'minimal';
}

const sizeConfig = {
  sm: {
    iconSize: 'w-3 h-3',
    padding: 'px-1.5 py-0.5',
    text: 'text-xs',
    gap: 'gap-1',
  },
  md: {
    iconSize: 'w-4 h-4',
    padding: 'px-2 py-1',
    text: 'text-sm',
    gap: 'gap-1.5',
  },
  lg: {
    iconSize: 'w-5 h-5',
    padding: 'px-3 py-1.5',
    text: 'text-base',
    gap: 'gap-2',
  },
};

const levelConfig = {
  fire: {
    bg: 'bg-gradient-to-r from-orange-500 to-red-500',
    bgLight: 'bg-orange-500/20',
    text: 'text-white',
    textLight: 'text-orange-400',
    border: 'border-orange-500/50',
    icon: Flame,
    label: 'On Fire',
    pulse: true,
  },
  hot: {
    bg: 'bg-gradient-to-r from-orange-400 to-orange-500',
    bgLight: 'bg-orange-400/20',
    text: 'text-white',
    textLight: 'text-orange-400',
    border: 'border-orange-400/50',
    icon: Flame,
    label: 'Hot',
    pulse: false,
  },
  warm: {
    bg: 'bg-yellow-500/20',
    bgLight: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    textLight: 'text-yellow-400',
    border: 'border-yellow-500/30',
    icon: TrendingUp,
    label: 'Warming Up',
    pulse: false,
  },
  normal: {
    bg: 'bg-slate-700/50',
    bgLight: 'bg-slate-700/30',
    text: 'text-slate-400',
    textLight: 'text-slate-500',
    border: 'border-slate-700/50',
    icon: Zap,
    label: '',
    pulse: false,
  },
};

export default function TrendingIndicator({
  level,
  score,
  showScore = false,
  size = 'sm',
  variant = 'badge',
}: TrendingIndicatorProps) {
  if (level === 'normal') return null;

  const sizeStyles = sizeConfig[size];
  const levelStyles = levelConfig[level];
  const Icon = levelStyles.icon;

  if (variant === 'icon') {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-full ${levelStyles.bgLight} ${levelStyles.textLight} ${sizeStyles.padding}`}
        title={`${levelStyles.label}${score ? ` (Score: ${score})` : ''}`}
      >
        <Icon className={sizeStyles.iconSize} />
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <span className={`inline-flex items-center ${sizeStyles.gap} ${levelStyles.textLight}`}>
        <Icon className={sizeStyles.iconSize} />
        {showScore && score && (
          <span className={sizeStyles.text}>{score.toFixed(0)}</span>
        )}
      </span>
    );
  }

  // Default: badge variant
  return (
    <span
      className={`
        inline-flex items-center ${sizeStyles.gap} ${sizeStyles.padding} rounded font-medium
        ${levelStyles.bg} ${levelStyles.text} ${sizeStyles.text}
        ${levelStyles.pulse ? 'animate-pulse' : ''}
      `}
    >
      <Icon className={sizeStyles.iconSize} />
      <span>{levelStyles.label}</span>
      {showScore && score && (
        <span className="opacity-75">({score.toFixed(0)})</span>
      )}
    </span>
  );
}

// Compact version for thread lists
export function TrendingBadge({ level }: { level: HeatLevel }) {
  return <TrendingIndicator level={level} size="sm" variant="badge" />;
}

// Score display for detailed views
export function TrendingScoreDisplay({
  score,
  rank,
}: {
  score: number;
  rank?: number;
}) {
  const level = score >= 50 ? 'fire' : score >= 25 ? 'hot' : score >= 10 ? 'warm' : 'normal';
  const levelStyles = levelConfig[level];

  return (
    <div className="flex flex-col items-center justify-center min-w-[60px] px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
      {rank && (
        <>
          <span className="text-xs text-slate-500 uppercase">Rank</span>
          <span className={`text-lg font-bold ${levelStyles.textLight}`}>#{rank}</span>
        </>
      )}
      <span className="text-xs text-slate-500">{score.toFixed(1)} pts</span>
    </div>
  );
}

// Fire indicator for avatars
export function AvatarFireIndicator({ level }: { level: HeatLevel }) {
  if (level !== 'fire') return null;

  return (
    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center animate-pulse">
      <Flame className="w-3 h-3 text-white" />
    </div>
  );
}
