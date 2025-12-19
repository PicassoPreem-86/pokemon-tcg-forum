import Link from 'next/link';
import Image from 'next/image';
import { Twitter, Youtube, MessageCircle } from 'lucide-react';
import { SITE_CONFIG, FOOTER_LINKS, SOCIAL_LINKS } from '@/lib/config';

const SocialIcon = ({ name }: { name: string }) => {
  switch (name) {
    case 'Twitter':
      return <Twitter className="h-5 w-5" />;
    case 'YouTube':
      return <Youtube className="h-5 w-5" />;
    default:
      return <div className="h-5 w-5 rounded-full bg-dark-600" />;
  }
};

export default function Footer() {
  return (
    <footer className="bg-dark-950 border-t border-dark-800">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/images/tcg-gossip-logo.png"
                alt="TCG Gossip"
                width={140}
                height={45}
                className="h-11 w-auto object-contain"
              />
            </Link>
            <p className="text-dark-400 text-sm mb-4">
              The hottest trading card community for collectors and players alike.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.slice(0, 4).map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-dark-400 hover:text-purple-400 transition-colors"
                  aria-label={social.name}
                >
                  <SocialIcon name={social.name} />
                </a>
              ))}
            </div>
          </div>

          {/* Community Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Community</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.community.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-dark-400 hover:text-purple-400 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-dark-400 hover:text-purple-400 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-dark-400 hover:text-purple-400 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-dark-400 hover:text-purple-400 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-dark-500 text-sm text-center sm:text-left">
              &copy; {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.
            </p>
            <p className="text-dark-600 text-xs text-center sm:text-right">
              Trading card names and images are trademarks of their respective owners.
              <br className="hidden sm:block" />
              This site is not affiliated with or endorsed by any card game publisher.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
