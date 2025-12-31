'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import { SUPPORTED_GAMES, GAME_ORDER, DEFAULT_GAME, type GameConfig } from '@/lib/config';

interface GameFilterProps {
  className?: string;
}

export function GameFilter({ className = '' }: GameFilterProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentGame = searchParams.get('game') || DEFAULT_GAME;

  const createGameUrl = (game: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (game === DEFAULT_GAME) {
      params.delete('game');
    } else {
      params.set('game', game);
    }
    const queryString = params.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
  };

  return (
    <div className={`game-filter ${className}`}>
      <div className="game-filter-tabs">
        {/* All Games Tab */}
        <Link
          href={createGameUrl(DEFAULT_GAME)}
          className={`game-tab ${currentGame === DEFAULT_GAME ? 'active' : ''}`}
        >
          <span className="game-icon">🎴</span>
          <span className="game-name">All Games</span>
        </Link>

        {/* Individual Game Tabs */}
        {GAME_ORDER.map((gameSlug) => {
          const game: GameConfig = SUPPORTED_GAMES[gameSlug];
          return (
            <Link
              key={gameSlug}
              href={createGameUrl(gameSlug)}
              className={`game-tab ${currentGame === gameSlug ? 'active' : ''}`}
              style={{
                '--game-color': game.color
              } as React.CSSProperties}
            >
              <span className="game-icon">{game.icon}</span>
              <span className="game-name">{game.shortName}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
