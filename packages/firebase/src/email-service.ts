/**
 * Email Service for AINexSuite
 * Uses Resend API for transactional emails
 */

export interface EmailConfig {
  apiKey: string;
  fromEmail: string;
  fromName?: string;
}

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an email using the Resend API
 */
export async function sendEmail(
  config: EmailConfig,
  params: SendEmailParams
): Promise<SendEmailResult> {
  if (!config.apiKey) {
    console.warn('Email service: RESEND_API_KEY not configured');
    return { success: false, error: 'Email service not configured' };
  }

  if (!config.fromEmail) {
    console.warn('Email service: From email not configured');
    return { success: false, error: 'From email not configured' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        from: config.fromName
          ? `${config.fromName} <${config.fromEmail}>`
          : config.fromEmail,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
        reply_to: params.replyTo,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Email service error:', errorData);
      return {
        success: false,
        error: errorData.message || `HTTP ${response.status}`,
      };
    }

    const data = await response.json();
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('Email service exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =============================================================================
// Space Invitation Email Template
// =============================================================================

export interface InvitationEmailData {
  inviterName: string;
  inviterPhoto?: string;
  spaceName: string;
  spaceType: string;
  role: string;
  acceptUrl: string;
  expiresAt: number;
}

/**
 * Format a date for display in emails
 */
function formatExpirationDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get a human-readable label for space types
 */
function getSpaceTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    personal: 'Personal',
    family: 'Family',
    work: 'Work',
    couple: 'Couple',
    buddy: 'Buddy',
    squad: 'Squad',
    project: 'Project',
  };
  return labels[type] || type;
}

/**
 * Get a human-readable label for roles
 */
function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    admin: 'Admin',
    member: 'Member',
    viewer: 'Viewer',
  };
  return labels[role] || role;
}

/**
 * Generate HTML email template for space invitations
 */
export function generateInvitationEmailHtml(data: InvitationEmailData): string {
  const spaceTypeLabel = getSpaceTypeLabel(data.spaceType);
  const roleLabel = getRoleLabel(data.role);
  const expirationDate = formatExpirationDate(data.expiresAt);

  // Using inline styles for email compatibility
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Space Invitation - AINexSuite</title>
  <style>
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    /* Dark mode (default) */
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #0a0a0a !important;
    }
    .email-wrapper { background-color: #0a0a0a !important; }
    .email-container { background-color: #171717 !important; }
    .email-text { color: #fafafa !important; }
    .email-text-muted { color: #a3a3a3 !important; }
    .email-text-subtle { color: #737373 !important; }
    .email-text-dim { color: #525252 !important; }
    .email-card { background-color: #262626 !important; }
    .email-card-secondary { background-color: #404040 !important; }
    .email-footer { background-color: #0a0a0a !important; border-top: 1px solid #262626 !important; }

    /* Light mode */
    @media (prefers-color-scheme: light) {
      body {
        background-color: #f5f5f5 !important;
      }
      .email-wrapper { background-color: #f5f5f5 !important; }
      .email-container { background-color: #ffffff !important; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important; }
      .email-text { color: #171717 !important; }
      .email-text-muted { color: #525252 !important; }
      .email-text-subtle { color: #737373 !important; }
      .email-text-dim { color: #a3a3a3 !important; }
      .email-card { background-color: #f5f5f5 !important; }
      .email-card-secondary { background-color: #e5e5e5 !important; }
      .email-footer { background-color: #fafafa !important; border-top: 1px solid #e5e5e5 !important; }
    }
  </style>
</head>
<body>
  <table role="presentation" class="email-wrapper" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" class="email-container" style="max-width: 600px; margin: 0 auto; border-radius: 16px; overflow: hidden;">

          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 32px 40px; text-align: center;">
              <img src="https://www.ainexsuite.com/email-assets/logo-email.svg" alt="AINexSuite" style="height: 48px; width: 48px; display: block; margin: 0 auto 16px;" />
              <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #ffffff;">Space Invitation</h1>
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td style="padding: 40px;">

              <!-- Inviter info -->
              <table role="presentation" style="width: 100%; margin-bottom: 32px;">
                <tr>
                  <td style="text-align: center;">
                    ${
                      data.inviterPhoto
                        ? `<img src="${data.inviterPhoto}" alt="${data.inviterName}" style="width: 64px; height: 64px; border-radius: 50%; margin-bottom: 16px; border: 2px solid #f97316;" />`
                        : `<div style="width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                            <span style="font-size: 24px; font-weight: 600; color: #ffffff;">${data.inviterName.charAt(0).toUpperCase()}</span>
                          </div>`
                    }
                    <p class="email-text" style="margin: 0; font-size: 18px;">
                      <strong>${data.inviterName}</strong> has invited you to join
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Space card -->
              <table role="presentation" class="email-card" style="width: 100%; border-radius: 12px; margin-bottom: 32px;">
                <tr>
                  <td style="padding: 24px;">
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td>
                          <h2 class="email-text" style="margin: 0 0 8px; font-size: 22px; font-weight: 600;">${data.spaceName}</h2>
                          <p class="email-text-muted" style="margin: 0; font-size: 14px;">
                            <span class="email-card-secondary" style="display: inline-block; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">${spaceTypeLabel}</span>
                            <span style="color: #f97316;">As ${roleLabel}</span>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; margin-bottom: 32px;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${data.acceptUrl}" style="display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Expiration notice -->
              <table role="presentation" style="width: 100%; margin-bottom: 24px;">
                <tr>
                  <td style="text-align: center;">
                    <p class="email-text-subtle" style="margin: 0; font-size: 14px;">
                      This invitation expires on <strong class="email-text-muted">${expirationDate}</strong>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Alternative link -->
              <table role="presentation" class="email-card" style="width: 100%; border-radius: 8px;">
                <tr>
                  <td style="padding: 16px;">
                    <p class="email-text-subtle" style="margin: 0 0 8px; font-size: 12px;">If the button doesn't work, copy and paste this link:</p>
                    <p style="margin: 0; font-size: 12px; word-break: break-all;">
                      <a href="${data.acceptUrl}" style="color: #f97316; text-decoration: none;">${data.acceptUrl}</a>
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="email-footer" style="padding: 24px 40px; text-align: center;">
              <p class="email-text-subtle" style="margin: 0 0 8px; font-size: 14px;">
                Sent by <a href="https://ainexsuite.com" style="color: #f97316; text-decoration: none;">AINexSuite</a>
              </p>
              <p class="email-text-dim" style="margin: 0; font-size: 12px;">
                Your personal productivity suite
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text version of invitation email
 */
export function generateInvitationEmailText(data: InvitationEmailData): string {
  const spaceTypeLabel = getSpaceTypeLabel(data.spaceType);
  const roleLabel = getRoleLabel(data.role);
  const expirationDate = formatExpirationDate(data.expiresAt);

  return `
SPACE INVITATION - AINEXSUITE
==============================

${data.inviterName} has invited you to join "${data.spaceName}"

Space Type: ${spaceTypeLabel}
Your Role: ${roleLabel}

To accept this invitation, visit:
${data.acceptUrl}

This invitation expires on ${expirationDate}.

---
Sent by AINexSuite
https://ainexsuite.com
  `.trim();
}

/**
 * Send a space invitation email
 */
export async function sendInvitationEmail(
  config: EmailConfig,
  recipientEmail: string,
  data: InvitationEmailData
): Promise<SendEmailResult> {
  const html = generateInvitationEmailHtml(data);
  const text = generateInvitationEmailText(data);

  return sendEmail(config, {
    to: recipientEmail,
    subject: `${data.inviterName} invited you to join "${data.spaceName}" on AINexSuite`,
    html,
    text,
  });
}

// =============================================================================
// Welcome Email Template (New User Registration)
// =============================================================================

export interface WelcomeEmailData {
  userName: string;
  userEmail: string;
}

/**
 * Generate HTML email template for new user welcome
 */
export function generateWelcomeEmailHtml(data: WelcomeEmailData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Welcome to AINexSuite</title>
  <style>
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    /* Dark mode (default) */
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #0a0a0a !important;
    }
    .email-wrapper { background-color: #0a0a0a !important; }
    .email-container { background-color: #171717 !important; }
    .email-text { color: #fafafa !important; }
    .email-text-body { color: #d4d4d4 !important; }
    .email-text-muted { color: #a3a3a3 !important; }
    .email-text-subtle { color: #737373 !important; }
    .email-text-dim { color: #525252 !important; }
    .email-card { background-color: #262626 !important; }
    .email-footer { background-color: #0a0a0a !important; border-top: 1px solid #262626 !important; }

    /* Light mode */
    @media (prefers-color-scheme: light) {
      body {
        background-color: #f5f5f5 !important;
      }
      .email-wrapper { background-color: #f5f5f5 !important; }
      .email-container { background-color: #ffffff !important; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important; }
      .email-text { color: #171717 !important; }
      .email-text-body { color: #404040 !important; }
      .email-text-muted { color: #525252 !important; }
      .email-text-subtle { color: #737373 !important; }
      .email-text-dim { color: #a3a3a3 !important; }
      .email-card { background-color: #f5f5f5 !important; }
      .email-footer { background-color: #fafafa !important; border-top: 1px solid #e5e5e5 !important; }
    }
  </style>
</head>
<body>
  <table role="presentation" class="email-wrapper" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" class="email-container" style="max-width: 600px; margin: 0 auto; border-radius: 16px; overflow: hidden;">

          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 48px 40px; text-align: center;">
              <img src="https://www.ainexsuite.com/email-assets/logo-email.svg" alt="AINexSuite" style="height: 56px; width: 56px; display: block; margin: 0 auto 24px;" />
              <h1 style="margin: 0 0 8px; font-size: 32px; font-weight: 700; color: #ffffff;">Welcome to AINexSuite!</h1>
              <p style="margin: 0; font-size: 16px; color: rgba(255, 255, 255, 0.9);">Your personal productivity suite</p>
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td style="padding: 40px;">

              <!-- Greeting -->
              <p class="email-text" style="margin: 0 0 24px; font-size: 18px;">
                Hi ${data.userName || 'there'} 👋
              </p>

              <p class="email-text-body" style="margin: 0 0 24px; font-size: 16px; line-height: 1.6;">
                Thank you for joining AINexSuite! We're excited to have you on board. Your account has been created and you're ready to start organizing your life with our suite of productivity apps.
              </p>

              <!-- Feature highlights -->
              <table role="presentation" style="width: 100%; margin: 32px 0;">
                <tr>
                  <td class="email-card" style="border-radius: 12px; padding: 24px;">
                    <h2 class="email-text" style="margin: 0 0 16px; font-size: 18px; font-weight: 600;">What you can do with AINexSuite:</h2>

                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="padding: 8px 0;">
                          <p class="email-text-body" style="margin: 0; font-size: 15px;">
                            <span style="color: #f97316; font-weight: 600;">✓</span> Manage tasks and projects across 14 integrated apps
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <p class="email-text-body" style="margin: 0; font-size: 15px;">
                            <span style="color: #f97316; font-weight: 600;">✓</span> Create family spaces to collaborate with loved ones
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <p class="email-text-body" style="margin: 0; font-size: 15px;">
                            <span style="color: #f97316; font-weight: 600;">✓</span> Track habits, health, fitness, and personal growth
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <p class="email-text-body" style="margin: 0; font-size: 15px;">
                            <span style="color: #f97316; font-weight: 600;">✓</span> Organize notes, journals, and memories in one place
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; margin: 32px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="https://www.ainexsuite.com" style="display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);">
                      Get Started
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Quick links -->
              <table role="presentation" class="email-card" style="width: 100%; border-radius: 8px; margin-top: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <p class="email-text-muted" style="margin: 0 0 12px; font-size: 14px; font-weight: 600;">Quick Links:</p>
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="padding: 4px 0;">
                          <a href="https://notes.ainexsuite.com" style="color: #f97316; text-decoration: none; font-size: 14px;">📝 Notes</a>
                        </td>
                        <td style="padding: 4px 0;">
                          <a href="https://todo.ainexsuite.com" style="color: #f97316; text-decoration: none; font-size: 14px;">✓ Tasks</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0;">
                          <a href="https://habits.ainexsuite.com" style="color: #f97316; text-decoration: none; font-size: 14px;">🎯 Habits</a>
                        </td>
                        <td style="padding: 4px 0;">
                          <a href="https://journal.ainexsuite.com" style="color: #f97316; text-decoration: none; font-size: 14px;">📔 Journal</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Help section -->
              <p class="email-text-muted" style="margin: 32px 0 0; font-size: 14px; line-height: 1.6;">
                Need help getting started? Check out our <a href="https://www.ainexsuite.com/help" style="color: #f97316; text-decoration: none;">Help Center</a> or reply to this email with any questions.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="email-footer" style="padding: 24px 40px; text-align: center;">
              <p class="email-text-subtle" style="margin: 0 0 8px; font-size: 14px;">
                Sent by <a href="https://ainexsuite.com" style="color: #f97316; text-decoration: none;">AINexSuite</a>
              </p>
              <p class="email-text-dim" style="margin: 0; font-size: 12px;">
                You're receiving this because you created an account at AINexSuite
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text version of welcome email
 */
export function generateWelcomeEmailText(data: WelcomeEmailData): string {
  return `
WELCOME TO AINEXSUITE!
======================

Hi ${data.userName || 'there'} 👋

Thank you for joining AINexSuite! We're excited to have you on board. Your account has been created and you're ready to start organizing your life with our suite of productivity apps.

What you can do with AINexSuite:

✓ Manage tasks and projects across 14 integrated apps
✓ Create family spaces to collaborate with loved ones
✓ Track habits, health, fitness, and personal growth
✓ Organize notes, journals, and memories in one place

Get started: https://www.ainexsuite.com

Quick Links:
- Notes: https://notes.ainexsuite.com
- Tasks: https://todo.ainexsuite.com
- Habits: https://habits.ainexsuite.com
- Journal: https://journal.ainexsuite.com

Need help? Visit our Help Center: https://www.ainexsuite.com/help
Or reply to this email with any questions.

---
Sent by AINexSuite
You're receiving this because you created an account at AINexSuite
  `.trim();
}

/**
 * Send a welcome email to a new user
 */
export async function sendWelcomeEmail(
  config: EmailConfig,
  recipientEmail: string,
  data: WelcomeEmailData
): Promise<SendEmailResult> {
  const html = generateWelcomeEmailHtml(data);
  const text = generateWelcomeEmailText(data);

  return sendEmail(config, {
    to: recipientEmail,
    subject: 'Welcome to AINexSuite - Let\'s Get Started! 🚀',
    html,
    text,
  });
}
