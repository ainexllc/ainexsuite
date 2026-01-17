import { FooterPageLayout } from '../layouts/footer-page-layout';

export function PrivacyPolicy() {
  return (
    <FooterPageLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card/80 p-8 shadow-lg backdrop-blur">
          <div className="prose prose-invert max-w-none space-y-6">
            <p className="text-muted-foreground">
              This privacy policy is currently being prepared and will be available soon.
            </p>

            <p className="text-muted-foreground">
              AINexSpace is committed to protecting your privacy and ensuring the security of your personal information.
              We implement industry-standard security measures and will never sell your data to third parties.
            </p>

            <div className="mt-8 rounded-2xl border border-border bg-card/50 p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Key Principles
              </h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-[#f97316] mt-1">•</span>
                  <span>Your data is encrypted and stored securely</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#f97316] mt-1">•</span>
                  <span>We never share your personal information with third parties</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#f97316] mt-1">•</span>
                  <span>You have full control over your data and can export or delete it at any time</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#f97316] mt-1">•</span>
                  <span>AI features only process data you explicitly authorize</span>
                </li>
              </ul>
            </div>

            <p className="text-sm text-muted-foreground mt-8">
              For questions about our privacy practices, please contact us at{' '}
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
