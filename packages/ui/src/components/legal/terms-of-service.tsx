import { FooterPageLayout } from '../layouts/footer-page-layout';

export function TermsOfService() {
  return (
    <FooterPageLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card/80 p-8 shadow-lg backdrop-blur">
          <div className="prose prose-invert max-w-none space-y-6">
            <p className="text-muted-foreground">
              Our terms of service are currently being prepared and will be available soon.
            </p>

            <p className="text-muted-foreground">
              By using AINexSuite, you agree to use our services responsibly and in compliance with applicable laws.
              We reserve the right to modify these terms as our platform evolves.
            </p>

            <div className="mt-8 rounded-2xl border border-border bg-card/50 p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Key Terms
              </h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-[#f97316] mt-1">•</span>
                  <span>Use our services responsibly and ethically</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#f97316] mt-1">•</span>
                  <span>Respect intellectual property rights and user privacy</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#f97316] mt-1">•</span>
                  <span>Do not misuse our platform or attempt unauthorized access</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#f97316] mt-1">•</span>
                  <span>Your account is personal and should not be shared</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#f97316] mt-1">•</span>
                  <span>We provide services &quot;as is&quot; with ongoing improvements</span>
                </li>
              </ul>
            </div>

            <p className="text-sm text-muted-foreground mt-8">
              For questions about our terms of service, please contact us at{' '}
              <a href="mailto:legal@ainexsuite.com" className="text-[#f97316] hover:underline">
                legal@ainexsuite.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </FooterPageLayout>
  );
}
