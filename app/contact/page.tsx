import { Metadata } from 'next';
import { Mail, MessageSquare, Shield, AlertTriangle, HelpCircle, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us | Pikachu TCG Forum',
  description: 'Get in touch with the Pikachu TCG Forum team. Contact us for support, feedback, or general inquiries.',
};

export default function ContactPage() {
  return (
    <div className="static-page">
      <div className="static-page-header">
        <Mail className="static-page-icon" size={32} />
        <h1>Contact Us</h1>
      </div>

      <div className="static-page-content">
        <section className="static-section">
          <p className="lead-text">
            Have a question, feedback, or need assistance? We&apos;re here to help! Choose the best way
            to reach us based on your needs.
          </p>
        </section>

        <section className="static-section">
          <h2><HelpCircle size={20} /> General Support</h2>
          <p>
            For general questions about using the forum, your account, or our features, the best way
            to get help is:
          </p>
          <ul>
            <li>Check our <strong>Wiki</strong> for guides and FAQs</li>
            <li>Post in the <strong>General Discussion</strong> category</li>
            <li>Message a moderator directly on the forum</li>
          </ul>
        </section>

        <section className="static-section">
          <h2><Shield size={20} /> Report a Problem</h2>
          <div className="contact-card">
            <h3>Rule Violations & Moderation</h3>
            <p>
              To report posts that violate our community rules, use the &quot;Report&quot; button on the post.
              Our moderation team reviews all reports within 24 hours.
            </p>
          </div>
          <div className="contact-card">
            <h3>Suspicious Trading Activity</h3>
            <p>
              If you encounter potential scams or suspicious trading behavior, please message a
              moderator immediately with screenshots and details.
            </p>
          </div>
        </section>

        <section className="static-section">
          <h2><AlertTriangle size={20} /> Urgent Issues</h2>
          <p>For urgent matters such as:</p>
          <ul>
            <li>Account security concerns</li>
            <li>Harassment or threats</li>
            <li>Illegal content</li>
            <li>Technical emergencies</li>
          </ul>
          <p>
            Please contact our admin team directly by messaging <strong>@Admin</strong> or
            <strong>@Moderator</strong> on the forum. We prioritize urgent issues and aim to
            respond within hours.
          </p>
        </section>

        <section className="static-section">
          <h2><MessageSquare size={20} /> Feedback & Suggestions</h2>
          <p>
            We love hearing from our community! Share your ideas for improving the forum:
          </p>
          <ul>
            <li>Post in the <strong>Feedback & Suggestions</strong> thread</li>
            <li>Participate in community polls and discussions</li>
            <li>Join our Discord server for real-time conversations</li>
          </ul>
        </section>

        <section className="static-section">
          <h2><Mail size={20} /> Business Inquiries</h2>
          <p>
            For partnership opportunities, advertising inquiries, or press requests, please reach
            out through our official channels. Include details about your proposal and we&apos;ll get
            back to you within 3-5 business days.
          </p>
        </section>

        <section className="static-section">
          <h2><Clock size={20} /> Response Times</h2>
          <div className="response-times">
            <div className="response-item">
              <span className="response-type">Report Reviews</span>
              <span className="response-time">Within 24 hours</span>
            </div>
            <div className="response-item">
              <span className="response-type">Urgent Issues</span>
              <span className="response-time">Within 4 hours</span>
            </div>
            <div className="response-item">
              <span className="response-type">General Questions</span>
              <span className="response-time">Within 48 hours</span>
            </div>
            <div className="response-item">
              <span className="response-type">Business Inquiries</span>
              <span className="response-time">3-5 business days</span>
            </div>
          </div>
        </section>

        <section className="static-section community-section">
          <h2>Join Our Community</h2>
          <p>
            The best way to stay connected is to be an active member of our community. Register for
            free and join thousands of Pokemon TCG enthusiasts!
          </p>
        </section>
      </div>
    </div>
  );
}
