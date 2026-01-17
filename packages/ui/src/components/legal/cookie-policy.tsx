import { FooterPageLayout } from '../layouts/footer-page-layout';

export function CookiePolicy() {
  return (
    <FooterPageLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">
            Cookie Policy
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card/80 p-8 shadow-lg backdrop-blur">
          <div className="prose prose-invert max-w-none space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">What Are Cookies?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Cookies are small text files that are placed on your device when you visit a website. They help
                websites remember your preferences, authenticate your session, and provide a better user experience.
                AINexSpace uses cookies to enhance your productivity platform experience.
              </p>
            </div>

            <p className="text-sm text-muted-foreground mt-8 pt-8 border-t border-border">
              For questions about our use of cookies, please contact us at{' '}
              <a href="mailto:privacy@ainexspace.com" className="text-[#f97316] hover:underline">
                privacy@ainexspace.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </FooterPageLayout>
  );
}
