import { FooterPageLayout } from '@/components/footer-page-layout';
import { Shield, Lock, Download, Trash2, Edit3, Eye, CheckCircle, Mail } from 'lucide-react';

const userRights = [
  {
    icon: Eye,
    title: 'Right to Access',
    description: 'You have the right to request a copy of all personal data we hold about you.',
  },
  {
    icon: Edit3,
    title: 'Right to Rectification',
    description: 'You can request correction of any inaccurate or incomplete personal data.',
  },
  {
    icon: Trash2,
    title: 'Right to Erasure',
    description: 'You can request deletion of your personal data under certain circumstances.',
  },
  {
    icon: Lock,
    title: 'Right to Restriction',
    description: 'You can request that we limit the processing of your personal data.',
  },
  {
    icon: Download,
    title: 'Right to Data Portability',
    description: 'You can request your data in a structured, machine-readable format.',
  },
  {
    icon: CheckCircle,
    title: 'Right to Object',
    description: 'You can object to certain types of processing of your personal data.',
  },
];

export default function GDPRPage() {
  return (
    <FooterPageLayout maxWidth="medium">
      <div className="space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">
            GDPR Compliance
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Your data protection rights under the General Data Protection Regulation
          </p>
          <p className="text-sm text-white/60">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Introduction */}
        <div className="rounded-3xl border border-white/10 bg-zinc-800/80 p-8 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f97316]/10 text-[#f97316] flex-shrink-0">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">Our Commitment to Your Privacy</h2>
              <p className="text-white/70 leading-relaxed">
                At AINexSuite, we are committed to protecting your personal data and respecting your privacy rights.
                This page explains how we comply with the General Data Protection Regulation (GDPR) and what rights
                you have regarding your personal information.
              </p>
            </div>
          </div>
        </div>

        {/* Your Rights */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-white mb-4">Your Data Protection Rights</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Under GDPR, you have the following rights regarding your personal data:
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {userRights.map((right) => {
              const Icon = right.icon;
              return (
                <div
                  key={right.title}
                  className="rounded-3xl border border-white/10 bg-zinc-800/80 p-6 shadow-lg"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f97316]/10 text-[#f97316] mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{right.title}</h3>
                  <p className="text-sm text-white/70">{right.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* How We Protect Your Data */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 p-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-white mb-6">How We Protect Your Data</h2>
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-zinc-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Data Encryption</h3>
              <p className="text-sm text-white/70">
                We use industry-standard AES-256 encryption to protect your data both in transit (using HTTPS/TLS)
                and at rest. This ensures that your personal information is secure from unauthorized access.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-zinc-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Secure Infrastructure</h3>
              <p className="text-sm text-white/70">
                Our infrastructure is hosted in SOC 2 compliant data centers with Firebase, ensuring the highest
                standards of physical and digital security. Regular security audits and updates maintain our
                protective measures.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-zinc-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Limited Access</h3>
              <p className="text-sm text-white/70">
                Access to personal data is restricted to authorized personnel only, and all access is logged and
                monitored. We implement role-based access controls and regular access reviews.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-zinc-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Data Minimization</h3>
              <p className="text-sm text-white/70">
                We only collect and process the minimum amount of personal data necessary to provide our services.
                We regularly review and delete unnecessary data to minimize risk.
              </p>
            </div>
          </div>
        </div>

        {/* Data Processing */}
        <div className="space-y-6">
          <h2 className="text-3xl font-semibold text-white text-center">How We Process Your Data</h2>
          <div className="rounded-3xl border border-white/10 bg-zinc-800/80 p-8 shadow-lg">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Legal Basis for Processing</h3>
                <p className="text-white/70 mb-4">We process your personal data under the following legal bases:</p>
                <ul className="space-y-2 text-sm text-white/60">
                  <li className="flex items-start gap-3">
                    <span className="text-[#f97316] mt-1">•</span>
                    <span><strong className="text-white">Consent:</strong> When you create an account and agree to our terms</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#f97316] mt-1">•</span>
                    <span><strong className="text-white">Contract:</strong> To provide the services you subscribed to</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#f97316] mt-1">•</span>
                    <span><strong className="text-white">Legitimate Interest:</strong> To improve our services and prevent fraud</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#f97316] mt-1">•</span>
                    <span><strong className="text-white">Legal Obligation:</strong> To comply with applicable laws and regulations</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Data We Collect</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-zinc-700/50 p-4">
                    <h4 className="text-base font-semibold text-white mb-2">Account Information</h4>
                    <p className="text-sm text-white/60">Name, email address, password (encrypted)</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-zinc-700/50 p-4">
                    <h4 className="text-base font-semibold text-white mb-2">Usage Data</h4>
                    <p className="text-sm text-white/60">Feature usage, app interactions, session data</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-zinc-700/50 p-4">
                    <h4 className="text-base font-semibold text-white mb-2">Content Data</h4>
                    <p className="text-sm text-white/60">Journal entries, habits, tasks, goals, mood logs</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-zinc-700/50 p-4">
                    <h4 className="text-base font-semibold text-white mb-2">Technical Data</h4>
                    <p className="text-sm text-white/60">IP address, device type, browser information</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Data Retention</h3>
                <p className="text-white/70 mb-3">We retain your personal data for as long as necessary to:</p>
                <ul className="space-y-2 text-sm text-white/60">
                  <li className="flex items-start gap-3">
                    <span className="text-[#f97316] mt-1">•</span>
                    <span>Provide our services to you</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#f97316] mt-1">•</span>
                    <span>Comply with legal obligations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#f97316] mt-1">•</span>
                    <span>Resolve disputes and enforce agreements</span>
                  </li>
                </ul>
                <p className="text-sm text-white/60 mt-3">
                  When you delete your account, your data is permanently removed within 30 days, except where we
                  are required to retain it for legal purposes.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Exercising Your Rights */}
        <div className="rounded-3xl border border-white/10 bg-zinc-800/80 p-8 shadow-lg">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f97316]/10 text-[#f97316] flex-shrink-0">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white mb-2">Exercising Your Rights</h2>
              <p className="text-white/70">
                To exercise any of your GDPR rights, please contact our Data Protection Officer.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-zinc-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-3">How to Submit a Request</h3>
              <ol className="space-y-2 text-sm text-white/60">
                <li className="flex items-start gap-3">
                  <span className="text-[#f97316] font-semibold">1.</span>
                  <span>Email us at <a href="mailto:privacy@ainexsuite.com" className="text-[#f97316] hover:underline">privacy@ainexsuite.com</a></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#f97316] font-semibold">2.</span>
                  <span>Include your full name and account email address</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#f97316] font-semibold">3.</span>
                  <span>Specify which right you wish to exercise</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#f97316] font-semibold">4.</span>
                  <span>We will respond within 30 days of receiving your request</span>
                </li>
              </ol>
            </div>
            <div className="rounded-2xl border border-white/10 bg-zinc-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Verification Process</h3>
              <p className="text-sm text-white/60">
                To protect your privacy, we may need to verify your identity before fulfilling your request.
                This may involve asking for additional information or documentation.
              </p>
            </div>
          </div>
        </div>

        {/* Data Transfers */}
        <div className="rounded-3xl border border-white/10 bg-zinc-800/80 p-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-white mb-4">International Data Transfers</h2>
          <p className="text-white/70 leading-relaxed mb-4">
            Your data may be transferred to and processed in countries outside the European Economic Area (EEA).
            When we do this, we ensure appropriate safeguards are in place, including:
          </p>
          <ul className="space-y-2 text-white/60">
            <li className="flex items-start gap-3">
              <span className="text-[#f97316] mt-1">•</span>
              <span>Standard Contractual Clauses approved by the European Commission</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#f97316] mt-1">•</span>
              <span>Transfers to countries with adequacy decisions</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#f97316] mt-1">•</span>
              <span>Compliance with applicable data protection frameworks</span>
            </li>
          </ul>
        </div>

        {/* Contact and Complaints */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 p-8 shadow-lg text-center">
          <h2 className="text-2xl font-semibold text-white mb-4">Questions or Concerns?</h2>
          <p className="text-white/70 mb-6 max-w-2xl mx-auto">
            If you have questions about our GDPR compliance or wish to file a complaint, please contact us.
            You also have the right to lodge a complaint with your local data protection authority.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:privacy@ainexsuite.com"
              className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-[#f97316] text-white font-semibold hover:bg-[#ea6a0f] transition-colors"
            >
              Contact Data Protection Officer
            </a>
            <a
              href="/privacy"
              className="inline-flex items-center justify-center px-8 py-4 rounded-2xl border border-white/20 text-white font-semibold hover:bg-white/5 transition-colors"
            >
              View Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </FooterPageLayout>
  );
}
