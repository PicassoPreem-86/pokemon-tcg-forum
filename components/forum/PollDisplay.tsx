'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3,
  Check,
  Clock,
  Users,
  RefreshCw,
  Lock,
  AlertCircle,
} from 'lucide-react';
import { Poll } from '@/lib/types';
import { useThreadPoll, usePollStore } from '@/lib/poll-store';
import { useAuthStore } from '@/lib/auth-store';

interface PollDisplayProps {
  threadId: string;
  showHeader?: boolean;
  className?: string;
}

export default function PollDisplay({
  threadId,
  showHeader = true,
  className = '',
}: PollDisplayProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);

  const { user } = useAuthStore();
  const {
    poll,
    hasVoted,
    getUserVotes,
    vote,
    removeVote,
    canUserVote,
    getVotePercentage,
    isExpired,
  } = useThreadPoll(threadId);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && user && poll) {
      const userVotes = getUserVotes(user.id);
      if (userVotes.length > 0) {
        setSelectedOptions(userVotes);
        setShowResults(true);
      }
    }
  }, [isHydrated, user, poll, getUserVotes]);

  if (!isHydrated || !poll) {
    return null;
  }

  const userHasVoted = user ? hasVoted(user.id) : false;
  const canVote = user ? canUserVote(user.id) : false;

  // Determine if we should show results
  const shouldShowResults =
    showResults ||
    userHasVoted ||
    isExpired ||
    poll.showResultsBeforeVote;

  const handleOptionSelect = (optionId: string) => {
    if (!canVote && !poll.allowVoteChange) return;

    if (poll.allowMultipleVotes) {
      setSelectedOptions(prev =>
        prev.includes(optionId)
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptions([optionId]);
    }
  };

  const handleVote = () => {
    if (!user) {
      setVoteError('Please log in to vote');
      return;
    }

    if (selectedOptions.length === 0) {
      setVoteError('Please select an option');
      return;
    }

    const success = vote(user.id, selectedOptions);
    if (success) {
      setShowResults(true);
      setVoteError(null);
    } else {
      setVoteError('Failed to submit vote');
    }
  };

  const handleRemoveVote = () => {
    if (!user) return;
    removeVote(user.id);
    setSelectedOptions([]);
    setShowResults(poll.showResultsBeforeVote);
  };

  const formatTimeRemaining = () => {
    if (!poll.expiresAt) return null;

    const now = new Date();
    const expires = new Date(poll.expiresAt);
    const diff = expires.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} day${days !== 1 ? 's' : ''} left`;
    if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''} left`;
    return 'Less than an hour left';
  };

  return (
    <div className={`bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      {showHeader && (
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 border-b border-slate-700">
          <BarChart3 className="w-5 h-5 text-purple-400" />
          <span className="font-medium text-white">Poll</span>
          {isExpired && (
            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-500/20 text-red-400 rounded">
              Closed
            </span>
          )}
        </div>
      )}

      <div className="p-4">
        {/* Question */}
        <h4 className="text-lg font-semibold text-white mb-4">{poll.question}</h4>

        {/* Options */}
        <div className="space-y-2 mb-4">
          {poll.options.map((option) => {
            const percentage = getVotePercentage(option.id);
            const isSelected = selectedOptions.includes(option.id);
            const isUserVote = user && getUserVotes(user.id).includes(option.id);

            return (
              <div key={option.id} className="relative">
                {shouldShowResults ? (
                  // Results view
                  <div
                    className={`relative overflow-hidden rounded-lg border transition-all ${
                      isUserVote
                        ? 'border-purple-500/50 bg-purple-500/10'
                        : 'border-slate-600 bg-slate-900/50'
                    }`}
                  >
                    {/* Progress bar background */}
                    <div
                      className="absolute inset-0 bg-purple-500/20 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />

                    <div className="relative flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isUserVote && (
                          <Check className="w-4 h-4 text-purple-400" />
                        )}
                        <span className="text-sm text-white">{option.text}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">
                          {percentage}%
                        </span>
                        <span className="text-xs text-slate-400">
                          ({option.voteCount} vote{option.voteCount !== 1 ? 's' : ''})
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Voting view
                  <button
                    onClick={() => handleOptionSelect(option.id)}
                    disabled={!canVote}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500/20 text-white'
                        : 'border-slate-600 bg-slate-900/50 text-slate-300 hover:border-slate-500 hover:bg-slate-800'
                    } ${!canVote ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-slate-500'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm">{option.text}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Error message */}
        {voteError && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-400">{voteError}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-slate-400">
            {/* Voter count */}
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>
                {poll.voterCount} voter{poll.voterCount !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Time remaining */}
            {poll.expiresAt && (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTimeRemaining()}</span>
              </div>
            )}

            {/* Multiple votes indicator */}
            {poll.allowMultipleVotes && (
              <span className="text-purple-400">Multiple selections allowed</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* View Results / Hide Results toggle */}
            {!isExpired && !userHasVoted && poll.showResultsBeforeVote && (
              <button
                onClick={() => setShowResults(!showResults)}
                className="text-xs text-slate-400 hover:text-slate-300 transition-colors"
              >
                {showResults ? 'Hide Results' : 'View Results'}
              </button>
            )}

            {/* Vote button */}
            {!shouldShowResults && canVote && (
              <button
                onClick={handleVote}
                disabled={selectedOptions.length === 0}
                className="px-4 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors"
              >
                Vote
              </button>
            )}

            {/* Change vote button */}
            {userHasVoted && poll.allowVoteChange && !isExpired && (
              <button
                onClick={handleRemoveVote}
                className="flex items-center gap-1 px-3 py-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Change Vote
              </button>
            )}

            {/* Locked indicator */}
            {userHasVoted && !poll.allowVoteChange && !isExpired && (
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Lock className="w-3.5 h-3.5" />
                <span>Vote locked</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact poll preview for thread lists
 */
export function PollBadge({ threadId }: { threadId: string }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const poll = usePollStore(state => state.getPoll(threadId));

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated || !poll) {
    return null;
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-purple-500/20 text-purple-400">
      <BarChart3 className="w-3 h-3" />
      Poll
    </span>
  );
}
