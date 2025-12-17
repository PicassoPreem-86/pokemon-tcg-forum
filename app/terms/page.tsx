import { Metadata } from 'next';
import { FileText, AlertTriangle, Scale, Ban, UserCheck, RefreshCw } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service | Pikachu TCG Forum',
  description: 'Read the Terms of Service for Pikachu TCG Forum. Understand your rights and responsibilities as a member of our community.',
};

export default function TermsPage() {
  return (
    <div className="static-page">
      <div className="static-page-header">
        <FileText className="static-page-icon" size={32} />
        <h1>Terms of Service</h1>
      </div>

      <div className="static-page-content">
        <p className="last-updated">Last updated: December 2024</p>

        <section className="static-section">
          <p className="lead-text">
            By accessing and using Pikachu TCG Forum, you agree to be bound by these Terms of Service.
            Please read them carefully before using our platform.
          </p>
        </section>

        <section className="static-section">
          <h2><UserCheck size={20} /> 1. Acceptance of Terms</h2>
          <p>
            By registering for an account or using any part of our services, you acknowledge that you
            have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.
            If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        <section className="static-section">
          <h2><Scale size={20} /> 2. User Responsibilities</h2>
          <p>As a member of Pikachu TCG Forum, you agree to:</p>
          <ul>
            <li>Provide accurate information when registering</li>
            <li>Maintain the security of your account credentials</li>
            <li>Be at least 13 years of age (or have parental consent)</li>
            <li>Follow our Community Rules at all times</li>
            <li>Respect other members and their property</li>
            <li>Not engage in any illegal activities on our platform</li>
          </ul>
        </section>

        <section className="static-section">
          <h2><Ban size={20} /> 3. Prohibited Conduct</h2>
          <p>The following activities are strictly prohibited:</p>
          <ul>
            <li>Harassment, bullying, or discrimination of any kind</li>
            <li>Posting spam, advertisements, or promotional content without permission</li>
            <li>Sharing malicious links or software</li>
            <li>Attempting to hack or compromise our systems</li>
            <li>Creating multiple accounts to evade bans</li>
            <li>Selling counterfeit or stolen merchandise</li>
            <li>Impersonating other users or staff members</li>
            <li>Sharing explicit, violent, or otherwise inappropriate content</li>
          </ul>
        </section>

        <section className="static-section">
          <h2><AlertTriangle size={20} /> 4. Trading Disclaimer</h2>
          <p>
            Pikachu TCG Forum provides a platform for members to discuss and arrange trades. However:
          </p>
          <ul>
            <li>We are not responsible for transactions between members</li>
            <li>All trades are conducted at your own risk</li>
            <li>We recommend using secure payment methods with buyer protection</li>
            <li>Always verify the reputation of trading partners</li>
            <li>Report suspicious activity to our moderation team immediately</li>
          </ul>
        </section>

        <section className="static-section">
          <h2><FileText size={20} /> 5. Content Ownership</h2>
          <p>
            By posting content on Pikachu TCG Forum, you grant us a non-exclusive, royalty-free license
            to use, display, and distribute your content on our platform. You retain ownership of your
            original content but are responsible for ensuring you have the rights to share it.
          </p>
          <p>
            Pokemon, the Pokemon TCG, and all related names and images are trademarks of Nintendo,
            Creatures Inc., and GAME FREAK inc. This forum is not affiliated with or endorsed by
            these companies.
          </p>
        </section>

        <section className="static-section">
          <h2><RefreshCw size={20} /> 6. Modifications to Terms</h2>
          <p>
            We reserve the right to modify these Terms of Service at any time. Changes will be effective
            immediately upon posting. Continued use of our services after changes constitutes acceptance
            of the modified terms. We will notify members of significant changes via forum announcement.
          </p>
        </section>

        <section className="static-section">
          <h2>7. Termination</h2>
          <p>
            We reserve the right to suspend or terminate accounts that violate these terms or our
            Community Rules. Users may also delete their accounts at any time through their account settings.
          </p>
        </section>

        <section className="static-section">
          <h2>8. Contact</h2>
          <p>
            If you have questions about these Terms of Service, please contact us through our
            Contact page or reach out to a moderator.
          </p>
        </section>
      </div>
    </div>
  );
}
