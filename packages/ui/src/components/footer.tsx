'use client';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterProps {
  appName?: string;
  productLinks?: FooterLink[];
  companyLinks?: FooterLink[];
  resourceLinks?: FooterLink[];
  legalLinks?: FooterLink[];
  socialLinks?: { label: string; href: string; icon?: string }[];
}

export function Footer({
  appName = 'AINexSuite',
  productLinks,
  companyLinks,
  resourceLinks,
  legalLinks,
  socialLinks,
}: FooterProps) {
  // Default links
  const defaultProductLinks = productLinks || [
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
  ];

  const defaultCompanyLinks = companyLinks || [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
  ];

  const defaultResourceLinks = resourceLinks || [
    { label: 'Help Center', href: '/help' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Documentation', href: '/docs' },
    { label: 'FAQ', href: '/faq' },
  ];

  const defaultLegalLinks = legalLinks || [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Acceptable Use Policy', href: '/acceptable-use' },
    { label: 'GDPR', href: '/gdpr' },
  ];

  return (
    <footer className="bg-background-base border-t border-outline-base dark:bg-zinc-900/80 dark:border-white/10">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-ink-900 dark:text-white tracking-wider uppercase">Product</h3>
            <ul className="space-y-1">
              {defaultProductLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-ink-600 dark:text-white/60 hover:text-ink-900 dark:hover:text-white dark:hover:text-[#f97316] transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-ink-900 dark:text-white tracking-wider uppercase">Company</h3>
            <ul className="space-y-1">
              {defaultCompanyLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-ink-600 dark:text-white/60 hover:text-ink-900 dark:hover:text-white dark:hover:text-[#f97316] transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-ink-900 dark:text-white tracking-wider uppercase">Resources</h3>
            <ul className="space-y-1">
              {defaultResourceLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-ink-600 dark:text-white/60 hover:text-ink-900 dark:hover:text-white dark:hover:text-[#f97316] transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-ink-900 dark:text-white tracking-wider uppercase">Legal</h3>
            <ul className="space-y-1">
              {defaultLegalLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-ink-600 dark:text-white/60 hover:text-ink-900 dark:hover:text-white dark:hover:text-[#f97316] transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Links and Copyright */}
        <div className="mt-6 border-t border-outline-base dark:border-white/10 pt-4">
          {socialLinks && socialLinks.length > 0 && (
            <div className="flex justify-center gap-6 mb-4">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-ink-600 dark:text-white/60 hover:text-ink-900 dark:hover:text-white dark:hover:text-[#f97316] transition-colors"
                  aria-label={link.label}
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
          <div className="text-center space-y-1">
            <p className="text-sm text-ink-600 dark:text-white/60 font-medium">
              &copy; {new Date().getFullYear()} {appName}. All rights reserved.
            </p>
            <p className="text-xs text-ink-500 dark:text-white/50">
              Built with ❤️ for productivity and growth
            </p>
            <p className="text-xs text-ink-400 dark:text-white/50">
              Questions? Contact us at <a href="mailto:support@ainexsuite.com" className="hover:text-ink-700 dark:hover:text-[#f97316] underline transition-colors">support@ainexsuite.com</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
