import { Metadata } from 'next';
import { Info, Users, Target, Heart, Sparkles, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us | TCG Gossip',
  description: 'Learn about TCG Gossip - the premier community for trading card game enthusiasts, collectors, and competitive players.',
};

export default function AboutPage() {
  return (
    <div className="static-page">
      <div className="static-page-header">
        <Info className="static-page-icon" size={32} />
        <h1>About TCG Gossip</h1>
      </div>

      <div className="static-page-content">
        <section className="static-section">
          <p className="lead-text">
            Welcome to TCG Gossip, the premier online community for trading card game
            enthusiasts. Whether you&apos;re a seasoned collector, competitive player, or just starting
            your TCG journey, you&apos;ve found your home.
          </p>
        </section>

        <section className="static-section">
          <h2><Target size={20} /> Our Mission</h2>
          <p>
            Our mission is to create the most welcoming, informative, and engaging community for
            trading card fans worldwide. We strive to connect players and collectors, share knowledge,
            and foster a positive environment where everyone can enjoy their passion for cards.
          </p>
        </section>

        <section className="static-section">
          <h2><Sparkles size={20} /> What We Offer</h2>
          <ul className="feature-list">
            <li>
              <strong>Active Trading Community</strong> - Buy, sell, and trade cards with trusted members
            </li>
            <li>
              <strong>Deck Building Resources</strong> - Share strategies and get feedback on your decks
            </li>
            <li>
              <strong>Tournament Discussion</strong> - Stay updated on competitive play and events
            </li>
            <li>
              <strong>Price Guides</strong> - Track market values and grading information
            </li>
            <li>
              <strong>Collection Showcase</strong> - Show off your prized cards and collections
            </li>
            <li>
              <strong>News & Updates</strong> - Latest set releases, rule changes, and announcements
            </li>
          </ul>
        </section>

        <section className="static-section">
          <h2><Users size={20} /> Our Community</h2>
          <p>
            With over 45,000 members and growing, our community includes casual collectors,
            competitive players, judges, and everyone in between. Our dedicated
            moderation team ensures a safe and friendly environment for all ages.
          </p>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-number">45.7K+</span>
              <span className="stat-label">Members</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">89K+</span>
              <span className="stat-label">Discussions</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">1.2M+</span>
              <span className="stat-label">Posts</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">2024</span>
              <span className="stat-label">Founded</span>
            </div>
          </div>
        </section>

        <section className="static-section">
          <h2><Heart size={20} /> Join Us</h2>
          <p>
            Ready to become part of our community? Registration is free and takes just a minute.
            Join thousands of collectors who share your passion for trading cards!
          </p>
        </section>

        <section className="static-section">
          <h2><Shield size={20} /> Our Values</h2>
          <ul className="values-list">
            <li><strong>Respect</strong> - We treat all members with kindness and respect</li>
            <li><strong>Integrity</strong> - Honesty in all trades and interactions</li>
            <li><strong>Inclusivity</strong> - Everyone is welcome regardless of experience level</li>
            <li><strong>Knowledge Sharing</strong> - We help each other learn and grow</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
