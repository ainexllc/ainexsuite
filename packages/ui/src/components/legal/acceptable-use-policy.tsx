import { FooterPageLayout } from '../layouts/footer-page-layout';
import { CheckCircle, XCircle } from 'lucide-react';

export function AcceptableUsePolicy() {
  return (
    <FooterPageLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">
            Acceptable Use Policy
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card/80 p-8 shadow-lg backdrop-blur">
          <div className="prose prose-invert max-w-none space-y-8">
            <div>
              <p className="text-muted-foreground leading-relaxed">
                This Acceptable Use Policy outlines the terms and conditions for using AINexSuite. By accessing
                or using our platform, you agree to comply with this policy. We reserve the right to modify this
                policy at any time, and continued use of our services constitutes acceptance of any changes.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground">Acceptable Use</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                AINexSuite is designed to help you improve productivity and personal growth. You may use our
                platform to:
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-border bg-card/50 p-5">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Track personal habits, goals, and productivity metrics</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Create and organize journal entries, notes, and tasks</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
                  <XCircle className="h-6 w-6 text-red-500" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground">Prohibited Activities</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The following activities are strictly prohibited when using AINexSuite:
              </p>
              <div className="space-y-4">
                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Illegal Activities</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <span className="text-red-500 mt-1">✗</span>
                      <span>Using the platform for any illegal purpose or to violate any laws</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mt-8 pt-8 border-t border-border">
              For questions about this Acceptable Use Policy, please contact us at{' '}
              <a href="mailto:legal@ainexspace.com" className="text-[#f97316] hover:underline">
                legal@ainexspace.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </FooterPageLayout>
  );
}
