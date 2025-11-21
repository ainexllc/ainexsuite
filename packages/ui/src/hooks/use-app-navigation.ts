/**
 * Shared hook for app navigation configuration
 * Provides environment-aware URLs and app metadata for the AppNavigationSidebar
 */

export interface AppNavItem {
  name: string;
  slug: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
}

/**
 * Get all available apps in the Suite
 * @returns Array of app configuration objects with environment-aware URLs
 */
export function getAppNavigation(
  apps?: Array<{
    name: string;
    slug: string;
    description?: string;
    icon: React.ComponentType<{ className?: string }>;
    color?: string;
    url: string;
  }>
): AppNavItem[] {
  // If apps are provided, use them
  if (apps && apps.length > 0) {
    return apps.map(app => ({
      name: app.name,
      slug: app.slug,
      url: app.url,
      icon: app.icon,
      color: app.color,
    }));
  }

  // Default fallback - returns empty array, should be provided by parent
  return [];
}

/**
 * Hook to access app navigation
 * Should be used in components that render AppNavigationSidebar
 */
export function useAppNavigation(
  appsList?: Array<{
    name: string;
    slug: string;
    description?: string;
    icon: React.ComponentType<{ className?: string }>;
    color?: string;
    url: string;
  }>
): AppNavItem[] {
  return getAppNavigation(appsList);
}
