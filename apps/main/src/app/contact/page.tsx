'use client';

import { FooterPageLayout } from '@ainexsuite/ui/components';
import { Mail, MessageSquare, Clock, HelpCircle, Send, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const contactMethods = [
  {
    icon: Mail,
    title: 'Email Support',
    description: 'Get help via email within 24 hours',
    contact: 'support@ainexsuite.com',
    href: 'mailto:support@ainexsuite.com',
  },
  {
    icon: MessageSquare,
    title: 'Live Chat',
    description: 'Chat with our team in real-time',
    contact: 'Available 9am-6pm EST',
    href: '#', // Would link to chat widget
  },
  {
    icon: HelpCircle,
    title: 'Help Center',
    description: 'Browse our documentation and guides',
    contact: 'Self-service resources',
    href: '/help',
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', category: '', message: '' });

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitStatus('idle'), 5000);
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <FooterPageLayout maxWidth="wide">
      <div className="space-y-16">
        {/* Header */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
            Get in Touch
          </h1>
          <p className="text-lg text-white/70 max-w-3xl mx-auto sm:text-xl">
            Have a question or need help? We’re here to assist you. Choose your preferred contact
            method or fill out the form below.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid gap-6 md:grid-cols-3">
          {contactMethods.map((method) => {
            const Icon = method.icon;
            return (
              <Link
                key={method.title}
                href={method.href}
                className="group rounded-3xl border border-white/10 bg-zinc-800/80 p-6 shadow-lg transition hover:-translate-y-1 hover:border-[#f97316]/50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f97316]/10 text-[#f97316] mb-4 transition group-hover:bg-[#f97316]/20">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{method.title}</h3>
                <p className="text-sm text-white/60 mb-3">{method.description}</p>
                <p className="text-sm text-[#f97316] font-semibold">{method.contact}</p>
              </Link>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Contact Form */}
          <div className="rounded-3xl border border-white/10 bg-zinc-800/80 p-8 shadow-lg">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-white mb-2">Send Us a Message</h2>
              <p className="text-white/60">
                Fill out the form below and we’ll get back to you within 24 hours.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-white mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#f97316] focus:outline-none focus:ring-2 focus:ring-[#f97316]/50 transition-all"
                  placeholder="John Doe"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#f97316] focus:outline-none focus:ring-2 focus:ring-[#f97316]/50 transition-all"
                  placeholder="john@example.com"
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-white mb-2">
                  Subject *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-[#f97316] focus:outline-none focus:ring-2 focus:ring-[#f97316]/50 transition-all [&>option]:bg-zinc-900 [&>option]:text-white"
                >
                  <option value="">Select a category...</option>
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="billing">Billing & Subscriptions</option>
                  <option value="feature">Feature Request</option>
                  <option value="bug">Bug Report</option>
                  <option value="partnership">Partnership Opportunity</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-white mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#f97316] focus:outline-none focus:ring-2 focus:ring-[#f97316]/50 resize-none transition-all"
                  placeholder="Tell us how we can help..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-[#f97316] text-white font-semibold hover:bg-[#ea6a0f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Send Message
                  </>
                )}
              </button>

              {/* Success Message */}
              {submitStatus === 'success' && (
                <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4 text-center">
                  <p className="text-green-400 font-semibold">Message sent successfully!</p>
                  <p className="text-sm text-green-400/70 mt-1">
                    We’ll get back to you within 24 hours.
                  </p>
                </div>
              )}

              {/* Error Message */}
              {submitStatus === 'error' && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-center">
                  <p className="text-red-400 font-semibold">Failed to send message.</p>
                  <p className="text-sm text-red-400/70 mt-1">
                    Please try again or email us directly.
                  </p>
                </div>
              )}
            </form>
          </div>

          {/* Additional Information */}
          <div className="space-y-6">
            {/* Support Hours */}
            <div className="rounded-3xl border border-white/10 bg-zinc-800/80 p-8 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f97316]/10 text-[#f97316] flex-shrink-0">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Support Hours</h3>
                  <div className="space-y-2 text-white/70">
                    <p className="flex justify-between">
                      <span className="font-medium text-white">Monday - Friday:</span>
                      <span>9:00 AM - 6:00 PM EST</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-medium text-white">Saturday:</span>
                      <span>10:00 AM - 4:00 PM EST</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-medium text-white">Sunday:</span>
                      <span>Closed</span>
                    </p>
                  </div>
                  <p className="text-sm text-white/50 mt-4">
                    We typically respond to all inquiries within 24 hours during business days.
                  </p>
                </div>
              </div>
            </div>

            {/* Office Location */}
            <div className="rounded-3xl border border-white/10 bg-zinc-800/80 p-8 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f97316]/10 text-[#f97316] flex-shrink-0">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Office Location</h3>
                  <div className="text-white/70 space-y-1">
                    <p>AINexSuite Inc.</p>
                    <p>123 Innovation Drive</p>
                    <p>San Francisco, CA 94102</p>
                    <p>United States</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="rounded-3xl border border-white/10 bg-zinc-800/80 p-8 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f97316]/10 text-[#f97316] flex-shrink-0">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Phone Support</h3>
                  <p className="text-white/70 mb-2">
                    For urgent technical issues, call us directly:
                  </p>
                  <a
                    href="tel:+1-555-0123"
                    className="text-lg font-semibold text-[#f97316] hover:text-[#ea6a0f] transition"
                  >
                    +1 (555) 123-4567
                  </a>
                  <p className="text-sm text-white/50 mt-2">
                    Available during support hours
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Link */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 p-8 lg:p-12 text-center">
          <h2 className="text-3xl font-semibold text-white mb-4">Need Quick Answers?</h2>
          <p className="text-white/70 mb-6 max-w-2xl mx-auto">
            Check out our Help Center and FAQ for instant answers to common questions about
            AINexSuite features, billing, and troubleshooting.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/help"
              className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-[#f97316] text-white font-semibold hover:bg-[#ea6a0f] transition-colors"
            >
              Visit Help Center
            </Link>
            <Link
              href="/faq"
              className="inline-flex items-center justify-center px-8 py-4 rounded-2xl border border-white/20 text-white font-semibold hover:bg-white/5 transition-colors"
            >
              Browse FAQ
            </Link>
          </div>
        </div>
      </div>
    </FooterPageLayout>
  );
}
