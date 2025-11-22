import { FooterPageLayout } from '../layouts/footer-page-layout';

export function CookiePolicy() {
  return (
    <FooterPageLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">
            Cookie Policy
          </h1>
          <p className="mt-4 text-lg text-white/70">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-zinc-800/80 p-8 shadow-lg backdrop-blur">
          <div className="prose prose-invert max-w-none space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">What Are Cookies?</h2>
              <p className="text-white/70 leading-relaxed">
                Cookies are small text files that are placed on your device when you visit a website. They help
                websites remember your preferences, authenticate your session, and provide a better user experience.
                AINexSuite uses cookies to enhance your productivity platform experience.
              </p>
            </div>

            <p className="text-sm text-white/60 mt-8 pt-8 border-t border-white/10">
              For questions about our use of cookies, please contact us at{' '}
              <a href="mailto:privacy@ainexsuite.com" className="text-[#f97316] hover:underline">
                privacy@ainexsuite.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </FooterPageLayout>
  );
}
