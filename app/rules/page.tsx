

import { Shield, AlertTriangle, CheckCircle, XCircle, MessageSquare, Users, Ban } from 'lucide-react';

const rules = [
  {
    number: 1,
    title: 'Be Respectful',
    description: 'Treat all members with respect. No harassment, hate speech, discrimination, or personal attacks. Disagreements should be handled civilly.',
    icon: <Users className="w-5 h-5" />,
  },
  {
    number: 2,
    title: 'No Spam or Self-Promotion',
    description: 'Do not spam the forum with repetitive posts, advertisements, or excessive self-promotion. One trade thread per week is allowed.',
    icon: <Ban className="w-5 h-5" />,
  },
  {
    number: 3,
    title: 'Post in the Correct Category',
    description: 'Ensure your posts are in the appropriate category. Trading posts go in Trading, deck discussions in Deck Building, etc.',
    icon: <MessageSquare className="w-5 h-5" />,
  },
  {
    number: 4,
    title: 'No Counterfeit Cards',
    description: 'Selling, trading, or promoting counterfeit/fake cards is strictly prohibited and will result in an immediate permanent ban.',
    icon: <XCircle className="w-5 h-5" />,
  },
  {
    number: 5,
    title: 'Use Appropriate Language',
    description: 'Keep language family-friendly. No excessive profanity, NSFW content, or inappropriate material. This is an all-ages community.',
    icon: <Shield className="w-5 h-5" />,
  },
  {
    number: 6,
    title: 'No Scamming',
    description: 'Any attempt to scam members will result in a permanent ban and report to relevant authorities. Always use protected payment methods for trades.',
    icon: <AlertTriangle className="w-5 h-5" />,
  },
  {
    number: 7,
    title: 'Respect Privacy',
    description: 'Do not share personal information about other members without their consent. This includes real names, addresses, and contact details.',
    icon: <Shield className="w-5 h-5" />,
  },
  {
    number: 8,
    title: 'Follow Moderator Instructions',
    description: 'Moderators are here to help maintain a positive community. Please follow their instructions and do not argue publicly about moderation decisions.',
    icon: <CheckCircle className="w-5 h-5" />,
  },
];

const consequences = [
  { offense: 'First Offense', action: 'Warning', color: 'text-yellow-400' },
  { offense: 'Second Offense', action: '24-hour mute', color: 'text-orange-400' },
  { offense: 'Third Offense', action: '7-day ban', color: 'text-red-400' },
  { offense: 'Severe Violations', action: 'Permanent ban', color: 'text-rose-500' },
];

export default function RulesPage() {
  return (
    <div className="content-container">
      <div className="section-header">
        <h1 className="section-title">
          <Shield className="w-6 h-6" />
          Community Rules
        </h1>
      </div>

      <p className="text-[var(--color-text-muted)] mb-8">
        These rules help maintain a safe, welcoming, and enjoyable community for all Pokemon TCG enthusiasts.
        By participating in this forum, you agree to follow these guidelines.
      </p>

      <div className="space-y-4 mb-10">
        {rules.map((rule) => (
          <div key={rule.number} className="card p-5">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--color-primary)] text-black flex items-center justify-center font-bold">
                {rule.number}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[var(--color-primary)]">{rule.icon}</span>
                  <h2 className="text-lg font-semibold text-[var(--color-text)]">{rule.title}</h2>
                </div>
                <p className="text-[var(--color-text-muted)]">{rule.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-6 mb-8">
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[var(--color-primary)]" />
          Consequences
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {consequences.map((item) => (
            <div key={item.offense} className="text-center p-4 rounded-lg bg-[var(--color-surface-elevated)]">
              <div className={`font-semibold ${item.color}`}>{item.action}</div>
              <div className="text-sm text-[var(--color-text-muted)] mt-1">{item.offense}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
        <h3 className="font-semibold text-[var(--color-text)] mb-3">Questions or Concerns?</h3>
        <p className="text-[var(--color-text-muted)] text-sm">
          If you have questions about the rules or need to report a violation, please contact a moderator
          or use the report function on any post. We review all reports within 24 hours.
        </p>
      </div>
    </div>
  );
}
