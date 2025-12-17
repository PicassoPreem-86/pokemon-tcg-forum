import { Metadata } from 'next';
import { Lock, Eye, Database, Shield, Cookie, Mail, Settings, Trash2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Pikachu TCG Forum',
  description: 'Learn how Pikachu TCG Forum collects, uses, and protects your personal information. Your privacy is important to us.',
};

export default function PrivacyPage() {
  return (
    <div className="static-page">
      <div className="static-page-header">
        <Lock className="static-page-icon" size={32} />
        <h1>Privacy Policy</h1>
      </div>

      <div className="static-page-content">
        <p className="last-updated">Last updated: December 2024</p>

        <section className="static-section">
          <p className="lead-text">
            At Pikachu TCG Forum, we take your privacy seriously. This policy explains how we collect,
            use, and protect your personal information when you use our services.
          </p>
        </section>

        <section className="static-section">
          <h2><Database size={20} /> Information We Collect</h2>
          <h3>Information You Provide</h3>
          <ul>
            <li><strong>Account Information:</strong> Username, email address, password</li>
            <li><strong>Profile Information:</strong> Display name, avatar, bio, location (optional)</li>
            <li><strong>Content:</strong> Posts, comments, messages, and other content you create</li>
            <li><strong>Communications:</strong> Messages you send to other users or our support team</li>
          </ul>

          <h3>Information Collected Automatically</h3>
          <ul>
            <li><strong>Usage Data:</strong> Pages visited, time spent, features used</li>
            <li><strong>Device Information:</strong> Browser type, operating system, device type</li>
            <li><strong>Log Data:</strong> IP address, access times, referring URLs</li>
          </ul>
        </section>

        <section className="static-section">
          <h2><Eye size={20} /> How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Provide and maintain our services</li>
            <li>Process your registration and manage your account</li>
            <li>Enable communication between members</li>
            <li>Send important notifications about your account or our services</li>
            <li>Improve and optimize our platform</li>
            <li>Detect and prevent fraud or abuse</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className="static-section">
          <h2><Shield size={20} /> How We Protect Your Information</h2>
          <p>We implement various security measures to protect your data:</p>
          <ul>
            <li>Encryption of sensitive data in transit and at rest</li>
            <li>Secure password hashing</li>
            <li>Regular security audits and updates</li>
            <li>Limited employee access to personal information</li>
            <li>Monitoring for suspicious activity</li>
          </ul>
        </section>

        <section className="static-section">
          <h2><Cookie size={20} /> Cookies and Tracking</h2>
          <p>We use cookies and similar technologies to:</p>
          <ul>
            <li>Keep you logged in to your account</li>
            <li>Remember your preferences and settings</li>
            <li>Understand how you use our platform</li>
            <li>Improve our services based on usage patterns</li>
          </ul>
          <p>
            You can control cookies through your browser settings. However, disabling cookies may
            affect the functionality of our services.
          </p>
        </section>

        <section className="static-section">
          <h2><Mail size={20} /> Information Sharing</h2>
          <p>We do not sell your personal information. We may share information:</p>
          <ul>
            <li><strong>With Your Consent:</strong> When you explicitly agree to sharing</li>
            <li><strong>Public Content:</strong> Posts and profile information you make public</li>
            <li><strong>Service Providers:</strong> Third parties who help operate our services</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect rights</li>
          </ul>
        </section>

        <section className="static-section">
          <h2><Settings size={20} /> Your Rights and Choices</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Delete your account and associated data</li>
            <li>Export your data</li>
            <li>Opt out of non-essential communications</li>
            <li>Control your privacy settings</li>
          </ul>
        </section>

        <section className="static-section">
          <h2><Trash2 size={20} /> Data Retention</h2>
          <p>
            We retain your information for as long as your account is active or as needed to provide
            services. If you delete your account, we will delete your personal information within 30 days,
            except where we are required to retain it for legal purposes.
          </p>
        </section>

        <section className="static-section">
          <h2>Children&apos;s Privacy</h2>
          <p>
            Our services are not intended for children under 13. We do not knowingly collect information
            from children under 13. If you believe a child has provided us with personal information,
            please contact us immediately.
          </p>
        </section>

        <section className="static-section">
          <h2>Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any significant
            changes by posting a notice on our forum. Your continued use of our services after changes
            constitutes acceptance of the updated policy.
          </p>
        </section>

        <section className="static-section">
          <h2>Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or your personal information, please
            contact us through our Contact page.
          </p>
        </section>
      </div>
    </div>
  );
}
