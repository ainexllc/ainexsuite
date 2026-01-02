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
  <title>Space Invitation - AINexSuite</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a; color: #fafafa;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #171717; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);">

          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 32px 40px; text-align: center;">
              <img src="https://ainexsuite.com/logo-white.png" alt="AINexSuite" style="height: 32px; margin-bottom: 16px;" />
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
                    <p style="margin: 0; font-size: 18px; color: #fafafa;">
                      <strong>${data.inviterName}</strong> has invited you to join
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Space card -->
              <table role="presentation" style="width: 100%; background-color: #262626; border-radius: 12px; margin-bottom: 32px;">
                <tr>
                  <td style="padding: 24px;">
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td>
                          <h2 style="margin: 0 0 8px; font-size: 22px; font-weight: 600; color: #fafafa;">${data.spaceName}</h2>
                          <p style="margin: 0; font-size: 14px; color: #a3a3a3;">
                            <span style="display: inline-block; padding: 4px 8px; background-color: #404040; border-radius: 4px; margin-right: 8px;">${spaceTypeLabel}</span>
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
                    <p style="margin: 0; font-size: 14px; color: #737373;">
                      This invitation expires on <strong style="color: #a3a3a3;">${expirationDate}</strong>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Alternative link -->
              <table role="presentation" style="width: 100%; background-color: #262626; border-radius: 8px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0 0 8px; font-size: 12px; color: #737373;">If the button doesn't work, copy and paste this link:</p>
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
            <td style="background-color: #0a0a0a; padding: 24px 40px; text-align: center; border-top: 1px solid #262626;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #737373;">
                Sent by <a href="https://ainexsuite.com" style="color: #f97316; text-decoration: none;">AINexSuite</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #525252;">
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
