import { FooterPageLayout } from '../layouts/footer-page-layout';
import { CheckCircle, XCircle } from 'lucide-react';

export function AcceptableUsePolicy() {
  return (
    <FooterPageLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">
            Acceptable Use Policy
          </h1>
          <p className="mt-4 text-lg text-white/70">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-zinc-800/80 p-8 shadow-lg backdrop-blur">
          <div className="prose prose-invert max-w-none space-y-8">
            <div>
              <p className="text-white/70 leading-relaxed">
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
                <h2 className="text-2xl font-semibold text-white">Acceptable Use</h2>
              </div>
              <p className="text-white/70 leading-relaxed mb-4">
                AINexSuite is designed to help you improve productivity and personal growth. You may use our
                platform to:
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-zinc-700/50 p-5">
                  <ul className="space-y-2 text-sm text-white/70">
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
                <h2 className="text-2xl font-semibold text-white">Prohibited Activities</h2>
              </div>
              <p className="text-white/70 leading-relaxed mb-4">
                The following activities are strictly prohibited when using AINexSuite:
              </p>
              <div className="space-y-4">
                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Illegal Activities</h3>
                  <ul className="space-y-2 text-sm text-white/70">
                    <li className="flex items-start gap-3">
                      <span className="text-red-500 mt-1">✗</span>
                      <span>Using the platform for any illegal purpose or to violate any laws</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <p className="text-sm text-white/60 mt-8 pt-8 border-t border-white/10">
              For questions about this Acceptable Use Policy, please contact us at{' '}
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
