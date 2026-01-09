'use client';

import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}

interface Requirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: Requirement[] = [
  {
    label: 'At least 8 characters',
    test: (password) => password.length >= 8,
  },
  {
    label: 'Contains uppercase letter',
    test: (password) => /[A-Z]/.test(password),
  },
  {
    label: 'Contains lowercase letter',
    test: (password) => /[a-z]/.test(password),
  },
  {
    label: 'Contains a number',
    test: (password) => /[0-9]/.test(password),
  },
  {
    label: 'Contains special character (!@#$%^&*)',
    test: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
  },
];

function calculateStrength(password: string): { score: number; label: string; color: string } {
  if (!password) {
    return { score: 0, label: '', color: '' };
  }

  const passedRequirements = requirements.filter((req) => req.test(password)).length;

  if (passedRequirements <= 1) {
    return { score: 1, label: 'Weak', color: 'bg-red-500' };
  } else if (passedRequirements <= 3) {
    return { score: 2, label: 'Fair', color: 'bg-orange-500' };
  } else if (passedRequirements <= 4) {
    return { score: 3, label: 'Good', color: 'bg-yellow-500' };
  } else {
    return { score: 4, label: 'Strong', color: 'bg-green-500' };
  }
}

export function PasswordStrengthIndicator({ password, showRequirements = true }: PasswordStrengthIndicatorProps) {
  const strength = calculateStrength(password);

  if (!password) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Password Strength</span>
          <span className={`font-medium ${
            strength.score === 1 ? 'text-red-400' :
            strength.score === 2 ? 'text-orange-400' :
            strength.score === 3 ? 'text-yellow-400' :
            'text-green-400'
          }`}>
            {strength.label}
          </span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`h-1 flex-1 rounded-full transition-all ${
                level <= strength.score
                  ? strength.color
                  : 'bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Requirements Checklist */}
      {showRequirements && (
        <div className="space-y-1.5">
          {requirements.map((requirement, index) => {
            const passed = requirement.test(password);
            return (
              <div
                key={index}
                className={`flex items-center gap-2 text-xs transition-colors ${
                  passed ? 'text-green-400' : 'text-slate-500'
                }`}
              >
                {passed ? (
                  <Check className="h-3.5 w-3.5 flex-shrink-0" />
                ) : (
                  <X className="h-3.5 w-3.5 flex-shrink-0" />
                )}
                <span>{requirement.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function isPasswordStrong(password: string): boolean {
  return requirements.filter((req) => req.test(password)).length >= 4;
}
