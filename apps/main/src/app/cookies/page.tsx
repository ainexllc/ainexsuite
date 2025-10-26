import { FooterPageLayout } from '@/components/footer-page-layout';

export default function CookiesPage() {
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

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">How We Use Cookies</h2>
              <p className="text-white/70 leading-relaxed mb-4">
                We use cookies for several essential purposes:
              </p>
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-zinc-700/50 p-6">
                  <h3 className="text-xl font-semibold text-white mb-3">Essential Cookies</h3>
                  <p className="text-sm text-white/70 mb-3">
                    These cookies are necessary for the platform to function properly. They enable core features
                    like authentication, security, and session management.
                  </p>
                  <ul className="space-y-2 text-sm text-white/60">
                    <li className="flex items-start gap-3">
                      <span className="text-[#f97316] mt-1">•</span>
                      <span>Authentication tokens to keep you signed in</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#f97316] mt-1">•</span>
                      <span>Security cookies to prevent fraud and unauthorized access</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#f97316] mt-1">•</span>
                      <span>Session cookies to maintain your current browsing session</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-white/10 bg-zinc-700/50 p-6">
                  <h3 className="text-xl font-semibold text-white mb-3">Functional Cookies</h3>
                  <p className="text-sm text-white/70 mb-3">
                    These cookies remember your preferences and settings to provide a personalized experience.
                  </p>
                  <ul className="space-y-2 text-sm text-white/60">
                    <li className="flex items-start gap-3">
                      <span className="text-[#f97316] mt-1">•</span>
                      <span>Theme preferences (dark/light mode)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#f97316] mt-1">•</span>
                      <span>Language and region settings</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#f97316] mt-1">•</span>
                      <span>Dashboard layout preferences</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#f97316] mt-1">•</span>
                      <span>Notification settings</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-white/10 bg-zinc-700/50 p-6">
                  <h3 className="text-xl font-semibold text-white mb-3">Analytics Cookies</h3>
                  <p className="text-sm text-white/70 mb-3">
                    These cookies help us understand how you use AINexSuite so we can improve the platform.
                  </p>
                  <ul className="space-y-2 text-sm text-white/60">
                    <li className="flex items-start gap-3">
                      <span className="text-[#f97316] mt-1">•</span>
                      <span>Page views and navigation patterns</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#f97316] mt-1">•</span>
                      <span>Feature usage statistics</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#f97316] mt-1">•</span>
                      <span>Performance metrics and error tracking</span>
                    </li>
                  </ul>
                  <p className="text-xs text-white/50 mt-3">
                    Note: Analytics data is anonymized and never tied to your personal content.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">Third-Party Cookies</h2>
              <p className="text-white/70 leading-relaxed mb-4">
                We use some trusted third-party services that may set their own cookies:
              </p>
              <ul className="space-y-3 text-white/70">
                <li className="flex items-start gap-3">
                  <span className="text-[#f97316] mt-1">•</span>
                  <span>
                    <strong className="text-white">Google Authentication:</strong> Used when you sign in with Google
                    to authenticate your account securely.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#f97316] mt-1">•</span>
                  <span>
                    <strong className="text-white">Stripe:</strong> Used for secure payment processing when you
                    subscribe to a paid plan.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#f97316] mt-1">•</span>
                  <span>
                    <strong className="text-white">Firebase:</strong> Used for authentication, database services,
                    and app infrastructure.
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">Managing Your Cookie Preferences</h2>
              <p className="text-white/70 leading-relaxed mb-4">
                You have control over the cookies we use. Here’s how to manage them:
              </p>
              <div className="rounded-2xl border border-white/10 bg-zinc-700/50 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Browser Settings</h3>
                <p className="text-sm text-white/70 mb-3">
                  Most web browsers allow you to control cookies through their settings. You can:
                </p>
                <ul className="space-y-2 text-sm text-white/60">
                  <li className="flex items-start gap-3">
                    <span className="text-[#f97316] mt-1">•</span>
                    <span>Block all cookies</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#f97316] mt-1">•</span>
                    <span>Block third-party cookies only</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#f97316] mt-1">•</span>
                    <span>Delete cookies after each browsing session</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#f97316] mt-1">•</span>
                    <span>View and delete existing cookies</span>
                  </li>
                </ul>
                <p className="text-xs text-white/50 mt-4">
                  <strong>Important:</strong> Blocking essential cookies may prevent AINexSuite from functioning
                  properly. You may not be able to sign in or save your preferences.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">Browser-Specific Instructions</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-zinc-700/50 p-4">
                  <h3 className="text-base font-semibold text-white mb-2">Google Chrome</h3>
                  <p className="text-sm text-white/60">
                    Settings → Privacy and Security → Cookies and other site data
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-zinc-700/50 p-4">
                  <h3 className="text-base font-semibold text-white mb-2">Mozilla Firefox</h3>
                  <p className="text-sm text-white/60">
                    Settings → Privacy & Security → Cookies and Site Data
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-zinc-700/50 p-4">
                  <h3 className="text-base font-semibold text-white mb-2">Safari</h3>
                  <p className="text-sm text-white/60">
                    Preferences → Privacy → Manage Website Data
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-zinc-700/50 p-4">
                  <h3 className="text-base font-semibold text-white mb-2">Microsoft Edge</h3>
                  <p className="text-sm text-white/60">
                    Settings → Cookies and site permissions → Manage and delete cookies
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">Cookie Retention</h2>
              <p className="text-white/70 leading-relaxed">
                Different cookies have different lifespans:
              </p>
              <ul className="space-y-2 text-white/70 mt-3">
                <li className="flex items-start gap-3">
                  <span className="text-[#f97316] mt-1">•</span>
                  <span>
                    <strong className="text-white">Session cookies:</strong> Deleted when you close your browser
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#f97316] mt-1">•</span>
                  <span>
                    <strong className="text-white">Persistent cookies:</strong> Remain for a set period (typically
                    30-90 days) or until manually deleted
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">Updates to This Policy</h2>
              <p className="text-white/70 leading-relaxed">
                We may update this Cookie Policy from time to time to reflect changes in our practices or for
                legal, operational, or regulatory reasons. We’ll notify you of significant changes by updating
                the “Last updated” date at the top of this page.
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
