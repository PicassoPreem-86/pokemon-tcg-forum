'use client';

import { useState } from 'react';
import {
  BarChart3,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Clock,
  Users,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';
import { CreatePollData } from '@/lib/types';

interface PollCreatorProps {
  onPollCreate: (data: CreatePollData) => void;
  onCancel: () => void;
  isEnabled?: boolean;
}

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 10;

export default function PollCreator({
  onPollCreate,
  onCancel,
  isEnabled = true,
}: PollCreatorProps) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Advanced settings
  const [allowMultipleVotes, setAllowMultipleVotes] = useState(false);
  const [allowVoteChange, setAllowVoteChange] = useState(true);
  const [showResultsBeforeVote, setShowResultsBeforeVote] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [hasExpiration, setHasExpiration] = useState(false);
  const [expirationDays, setExpirationDays] = useState(7);

  const [errors, setErrors] = useState<{
    question?: string;
    options?: string;
  }>({});

  const addOption = () => {
    if (options.length < MAX_OPTIONS) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > MIN_OPTIONS) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!question.trim()) {
      newErrors.question = 'Poll question is required';
    }

    const filledOptions = options.filter(opt => opt.trim());
    if (filledOptions.length < MIN_OPTIONS) {
      newErrors.options = `At least ${MIN_OPTIONS} options are required`;
    }

    // Check for duplicate options
    const uniqueOptions = new Set(filledOptions.map(o => o.toLowerCase().trim()));
    if (uniqueOptions.size !== filledOptions.length) {
      newErrors.options = 'Options must be unique';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const filledOptions = options.filter(opt => opt.trim());

    let expiresAt: string | undefined;
    if (hasExpiration) {
      const date = new Date();
      date.setDate(date.getDate() + expirationDays);
      expiresAt = date.toISOString();
    }

    onPollCreate({
      question: question.trim(),
      options: filledOptions.map(o => o.trim()),
      expiresAt,
      allowMultipleVotes,
      allowVoteChange,
      showResultsBeforeVote,
      isAnonymous,
    });
  };

  if (!isEnabled) {
    return null;
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">Create Poll</h3>
      </div>

      {/* Question */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Poll Question
        </label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question..."
          className={`w-full px-4 py-2 bg-slate-900 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
            errors.question ? 'border-red-500' : 'border-slate-600'
          }`}
        />
        {errors.question && (
          <p className="mt-1 text-sm text-red-400">{errors.question}</p>
        )}
      </div>

      {/* Options */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Options ({options.length}/{MAX_OPTIONS})
        </label>
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="w-6 h-6 flex items-center justify-center bg-slate-700 rounded text-xs text-slate-400">
                {index + 1}
              </span>
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {options.length > MIN_OPTIONS && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors"
                  title="Remove option"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        {errors.options && (
          <p className="mt-1 text-sm text-red-400">{errors.options}</p>
        )}

        {options.length < MAX_OPTIONS && (
          <button
            type="button"
            onClick={addOption}
            className="mt-2 flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Option
          </button>
        )}
      </div>

      {/* Advanced Settings Toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300 mb-4 transition-colors"
      >
        {showAdvanced ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
        Advanced Settings
      </button>

      {/* Advanced Settings */}
      {showAdvanced && (
        <div className="mb-4 p-4 bg-slate-900/50 border border-slate-700 rounded-lg space-y-4">
          {/* Allow Multiple Votes */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={allowMultipleVotes}
              onChange={(e) => setAllowMultipleVotes(e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-purple-500 focus:ring-purple-500"
            />
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-300">Allow multiple selections</span>
            </div>
          </label>

          {/* Allow Vote Change */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={allowVoteChange}
              onChange={(e) => setAllowVoteChange(e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-purple-500 focus:ring-purple-500"
            />
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-300">Allow voters to change their vote</span>
            </div>
          </label>

          {/* Show Results Before Vote */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showResultsBeforeVote}
              onChange={(e) => setShowResultsBeforeVote(e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-purple-500 focus:ring-purple-500"
            />
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-300">Show results before voting</span>
            </div>
          </label>

          {/* Anonymous Voting */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-purple-500 focus:ring-purple-500"
            />
            <div className="flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-300">Anonymous voting (hide voter names)</span>
            </div>
          </label>

          {/* Expiration */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasExpiration}
                onChange={(e) => setHasExpiration(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-purple-500 focus:ring-purple-500"
              />
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-300">Set expiration</span>
              </div>
            </label>
            {hasExpiration && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={expirationDays}
                  onChange={(e) => setExpirationDays(parseInt(e.target.value) || 7)}
                  className="w-20 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-sm text-slate-400">days</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-4 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
        >
          Add Poll
        </button>
      </div>
    </div>
  );
}

/**
 * Toggle button to enable/show poll creator
 */
export function PollToggleButton({
  isActive,
  onClick,
}: {
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
        isActive
          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
          : 'bg-slate-800 text-slate-400 hover:text-purple-400 border border-slate-700 hover:border-purple-500/50'
      }`}
    >
      <BarChart3 className="w-4 h-4" />
      {isActive ? 'Poll Added' : 'Add Poll'}
    </button>
  );
}
