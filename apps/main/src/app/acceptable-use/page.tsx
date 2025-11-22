import { FooterPageLayout } from '@ainexsuite/ui/components';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function AcceptableUsePage() {
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
            {/* Introduction */}
            <div>
              <p className="text-white/70 leading-relaxed">
                This Acceptable Use Policy outlines the terms and conditions for using AINexSuite. By accessing
                or using our platform, you agree to comply with this policy. We reserve the right to modify this
                policy at any time, and continued use of our services constitutes acceptance of any changes.
              </p>
            </div>

            {/* Acceptable Use */}
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
                    <li className="flex items-start gap-3">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Monitor mood, energy levels, and wellness data</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Collaborate with team members on shared goals</span>
                    </li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-white/10 bg-zinc-700/50 p-5">
                  <ul className="space-y-2 text-sm text-white/70">
                    <li className="flex items-start gap-3">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Access AI-powered insights and recommendations</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Export your personal data in standard formats</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Use mobile and desktop versions of the platform</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Integrate with approved third-party services</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Prohibited Activities */}
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
                    <li className="flex items-start gap-3">
                      <span className="text-red-500 mt-1">✗</span>
                      <span>Storing, distributing, or promoting illegal content</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-500 mt-1">✗</span>
                      <span>Engaging in or promoting fraud, scams, or deceptive practices</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Security & Abuse</h3>
                  <ul className="space-y-2 text-sm text-white/70">
                    <li className="flex items-start gap-3">
                      <span className="text-red-500 mt-1">✗</span>
                      <span>Attempting to gain unauthorized access to accounts, systems, or networks</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-500 mt-1">✗</span>
                      <span>Distributing viruses, malware, or any malicious code</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-500 mt-1">✗</span>
                      <span>Launching denial-of-service attacks or interfering with service availability</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-500 mt-1">✗</span>
                      <span>Attempting to circumvent security measures or access restrictions</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Harmful Content</h3>
                  <ul className="space-y-2 text-sm text-white/70">
                    <li className="flex items-start gap-3">
                      <span className="text-red-500 mt-1">✗</span>
                      <span>Uploading or sharing content that promotes violence, hate, or discrimination</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-500 mt-1">✗</span>
                      <span>Harassing, threatening, or intimidating other users</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-500 mt-1">✗</span>
                      <span>Sharing sexually explicit, pornographic, or inappropriate content</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Account Misuse</h3>
                  <ul className="space-y-2 text-sm text-white/70">
                    <li className="flex items-start gap-3">
                      <span className="text-red-500 mt-1">✗</span>
                      <span>Sharing your account credentials or allowing unauthorized account access</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-500 mt-1">✗</span>
                      <span>Creating multiple accounts to abuse free trials or promotions</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-500 mt-1">✗</span>
                      <span>Impersonating another person or organization</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-500 mt-1">✗</span>
                      <span>Using automated bots or scripts without authorization</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Data & Privacy</h3>
                  <ul className="space-y-2 text-sm text-white/70">
                    <li className="flex items-start gap-3">
                      <span className="text-red-500 mt-1">✗</span>
                      <span>Scraping, harvesting, or collecting other users’ data</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-500 mt-1">✗</span>
                      <span>Violating others’ privacy rights or sharing private information without consent</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-500 mt-1">✗</span>
                      <span>Reverse engineering or attempting to extract source code</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Commercial Misuse</h3>
                  <ul className="space-y-2 text-sm text-white/70">
                    <li className="flex items-start gap-3">
                      <span className="text-red-500 mt-1">✗</span>
                      <span>Using the platform for unsolicited commercial communications (spam)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-500 mt-1">✗</span>
                      <span>Reselling or sublicensing access to AINexSuite</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-500 mt-1">✗</span>
                      <span>Using the platform to compete with our services</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Enforcement */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10">
                  <AlertTriangle className="h-6 w-6 text-yellow-500" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Enforcement & Consequences</h2>
              </div>
              <p className="text-white/70 leading-relaxed mb-4">
                Violations of this Acceptable Use Policy may result in one or more of the following actions:
              </p>
              <div className="rounded-2xl border border-white/10 bg-zinc-700/50 p-6">
                <ul className="space-y-3 text-white/70">
                  <li className="flex items-start gap-3">
                    <span className="text-yellow-500 mt-1">⚠</span>
                    <span><strong className="text-white">Warning:</strong> First-time minor violations may result in a warning</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-yellow-500 mt-1">⚠</span>
                    <span><strong className="text-white">Suspension:</strong> Temporary suspension of account access</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-yellow-500 mt-1">⚠</span>
                    <span><strong className="text-white">Termination:</strong> Permanent termination of account without refund</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-yellow-500 mt-1">⚠</span>
                    <span><strong className="text-white">Legal Action:</strong> Reporting to law enforcement for illegal activities</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-yellow-500 mt-1">⚠</span>
                    <span><strong className="text-white">Content Removal:</strong> Immediate removal of prohibited content</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Reporting */}
            <div className="rounded-2xl border border-white/10 bg-zinc-700/50 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Reporting Violations</h2>
              <p className="text-sm text-white/70 mb-4">
                If you become aware of any violations of this Acceptable Use Policy, please report them to us
                immediately. We investigate all reports and take appropriate action.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="mailto:abuse@ainexsuite.com"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#f97316] text-white text-sm font-semibold hover:bg-[#ea6a0f] transition-colors"
                >
                  Report Abuse
                </a>
                <a
                  href="mailto:security@ainexsuite.com"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-white/20 text-white text-sm font-semibold hover:bg-white/5 transition-colors"
                >
                  Report Security Issue
                </a>
              </div>
            </div>

            {/* Changes */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Changes to This Policy</h2>
              <p className="text-white/70 leading-relaxed">
                We may update this Acceptable Use Policy from time to time. Material changes will be communicated
                via email or through the platform. Continued use of AINexSuite after changes constitutes acceptance
                of the updated policy.
              </p>
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
