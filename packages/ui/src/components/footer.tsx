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
    { label: 'Plans', href: '/pricing' },
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
    { label: 'Contact Us', href: '/contact' },
  ];

  return (
    <footer className="bg-surface-base border-t border-border">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-foreground tracking-wider uppercase">Product</h3>
            <ul className="space-y-1">
              {defaultProductLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-foreground tracking-wider uppercase">Company</h3>
            <ul className="space-y-1">
              {defaultCompanyLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-foreground tracking-wider uppercase">Resources</h3>
            <ul className="space-y-1">
              {defaultResourceLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-foreground tracking-wider uppercase">Legal</h3>
            <ul className="space-y-1">
              {defaultLegalLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Links and Copyright */}
        <div className="mt-6 border-t border-border pt-4">
          {socialLinks && socialLinks.length > 0 && (
            <div className="flex justify-center gap-6 mb-4">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={link.label}
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
          <div className="text-center space-y-1">
            <p className="text-sm text-muted-foreground font-medium">
              &copy; {new Date().getFullYear()} {appName}. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Built with ❤️ for productivity and growth
            </p>
            <p className="text-xs text-muted-foreground">
              Questions? Contact us at <a href="mailto:support@ainexsuite.com" className="hover:text-foreground underline transition-colors">support@ainexsuite.com</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
