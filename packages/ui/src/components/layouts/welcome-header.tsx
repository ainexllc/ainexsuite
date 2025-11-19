import React from 'react';

/**
 * WelcomeHeader Component
 *
 * A reusable welcome header that displays a personalized greeting with the app name
 * and user's first name, along with a contextual subtitle message.
 *
 * @example
 * ```tsx
 * // Basic usage with user name
 * <WelcomeHeader
 *   appName="Journey"
 *   userName="John Doe"
 * />
 *
 * // With custom subtitle
 * <WelcomeHeader
 *   appName="Notes"
 *   userName="Jane Smith"
 *   subtitle="Your organized workspace for ideas and thoughts"
 * />
 *
 * // With custom emoji
 * <WelcomeHeader
 *   appName="Fitness"
 *   userName="Mike Johnson"
 *   emoji="💪"
 *   subtitle="Track your progress and reach your goals"
 * />
 *
 * // Without user (uses default greeting)
 * <WelcomeHeader
 *   appName="Dashboard"
 * />
 * ```
 *
 * @component
 */

export interface WelcomeHeaderProps {
  /** The name of the application */
  appName: string;
  /** Full name of the user (first name will be extracted) */
  userName?: string | null;
  /** Custom subtitle message. Defaults to "Your {appName.toLowerCase()} workspace" */
  subtitle?: string;
  /** Emoji to display after greeting. Defaults to 👋 */
  emoji?: string;
  /** Additional CSS classes for the container */
  className?: string;
}

/**
 * Extracts the first name from a full name string
 * @param fullName - The user's full name
 * @returns The first name or "there" if no name provided
 */
const extractFirstName = (fullName?: string | null): string => {
  if (!fullName) return 'there';
  const nameParts = fullName.trim().split(' ');
  return nameParts[0] || 'there';
};

export const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({
  appName,
  userName,
  subtitle,
  emoji = '👋',
  className = '',
}) => {
  const firstName = extractFirstName(userName);
  const defaultSubtitle = `Your ${appName.toLowerCase()} workspace`;

  return (
    <div className={`mb-12 ${className}`}>
      <h2 className="text-3xl font-bold text-white mb-2">
        Welcome back, {firstName}! {emoji}
      </h2>
      <p className="text-lg text-white/70">
        {subtitle || defaultSubtitle}
      </p>
    </div>
  );
};

export default WelcomeHeader;
