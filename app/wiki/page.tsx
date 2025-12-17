

import Link from 'next/link';
import { FileText, BookOpen, Sparkles, Shield, TrendingUp, Award } from 'lucide-react';

const wikiSections = [
  {
    title: 'Getting Started',
    icon: <Sparkles className="w-6 h-6" />,
    description: 'New to Pokemon TCG? Start here to learn the basics.',
    articles: ['How to Play Pokemon TCG', 'Building Your First Deck', 'Understanding Card Types', 'Energy System Explained'],
  },
  {
    title: 'Card Database',
    icon: <BookOpen className="w-6 h-6" />,
    description: 'Browse our comprehensive card database.',
    articles: ['Scarlet & Violet Sets', 'Sword & Shield Sets', 'Sun & Moon Sets', 'Vintage Cards'],
  },
  {
    title: 'Competitive Play',
    icon: <TrendingUp className="w-6 h-6" />,
    description: 'Everything about tournaments and competitive meta.',
    articles: ['Current Meta Decks', 'Tournament Rules', 'Deck Building Guide', 'Play Testing Tips'],
  },
  {
    title: 'Collecting Guide',
    icon: <Award className="w-6 h-6" />,
    description: 'Tips and guides for card collectors.',
    articles: ['Grading Basics', 'Identifying Fakes', 'Storage & Protection', 'Investment Guide'],
  },
];

export default function WikiPage() {
  return (
    <div className="content-container">
      <div className="section-header">
        <h1 className="section-title">
          <FileText className="w-6 h-6" />
          Community Wiki
        </h1>
      </div>

      <p className="text-[var(--color-text-muted)] mb-8">
        A community-driven knowledge base for all things Pokemon TCG. Browse guides, tutorials, and reference materials.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {wikiSections.map((section) => (
          <div key={section.title} className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-[var(--color-primary)] text-black">
                {section.icon}
              </div>
              <h2 className="text-lg font-semibold text-[var(--color-text)]">{section.title}</h2>
            </div>
            <p className="text-[var(--color-text-muted)] text-sm mb-4">{section.description}</p>
            <ul className="space-y-2">
              {section.articles.map((article) => (
                <li key={article}>
                  <Link
                    href="#"
                    className="text-[var(--color-primary)] hover:underline text-sm flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    {article}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
        <div className="flex items-center gap-3 mb-3">
          <Shield className="w-5 h-5 text-[var(--color-primary)]" />
          <h3 className="font-semibold text-[var(--color-text)]">Contribute to the Wiki</h3>
        </div>
        <p className="text-[var(--color-text-muted)] text-sm">
          Want to help expand our knowledge base? Senior members can submit articles for review.
          Contact a moderator to learn more about contributing.
        </p>
      </div>
    </div>
  );
}
