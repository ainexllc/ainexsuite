import { FooterPageLayout } from '../layouts/footer-page-layout';
import { Shield, Lock, Download, Trash2, Edit3, Eye, CheckCircle } from 'lucide-react';

export function GDPRHelp() {
  const userRights = [
    { icon: Eye, title: 'Right to Access', description: 'You have the right to request a copy of all personal data we hold about you.' },
    { icon: Edit3, title: 'Right to Rectification', description: 'You can request correction of any inaccurate or incomplete personal data.' },
    { icon: Trash2, title: 'Right to Erasure', description: 'You can request deletion of your personal data under certain circumstances.' },
    { icon: Lock, title: 'Right to Restriction', description: 'You can request that we limit the processing of your personal data.' },
    { icon: Download, title: 'Right to Data Portability', description: 'You can request your data in a structured, machine-readable format.' },
    { icon: CheckCircle, title: 'Right to Object', description: 'You can object to certain types of processing of your personal data.' },
  ];

  return (
    <FooterPageLayout maxWidth="medium">
      <div className="space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">
            GDPR Compliance
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your data protection rights under the General Data Protection Regulation
          </p>
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card/80 p-8 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f97316]/10 text-[#f97316] flex-shrink-0">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-3">Our Commitment to Your Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                At AINexSuite, we are committed to protecting your personal data and respecting your privacy rights.
                This page explains how we comply with the General Data Protection Regulation (GDPR) and what rights
                you have regarding your personal information.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-foreground mb-4">Your Data Protection Rights</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Under GDPR, you have the following rights regarding your personal data:
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {userRights.map((right) => {
              const Icon = right.icon;
              return (
                <div key={right.title} className="rounded-3xl border border-border bg-card/80 p-6 shadow-lg">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f97316]/10 text-[#f97316] mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{right.title}</h3>
                  <p className="text-sm text-muted-foreground">{right.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-gradient-to-br from-card/80 to-background/80 p-8 shadow-lg text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Questions or Concerns?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            If you have questions about our GDPR compliance or wish to file a complaint, please contact us.
          </p>
          <a
            href="mailto:privacy@ainexspace.com"
            className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-[#f97316] text-foreground font-semibold hover:bg-[#ea6a0f] transition-colors"
          >
            Contact Data Protection Officer
          </a>
        </div>
      </div>
    </FooterPageLayout>
  );
}
