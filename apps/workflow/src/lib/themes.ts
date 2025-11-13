export interface WorkflowTheme {
  id: string;
  name: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryRgb: string; // RGB values for opacity variants
}

export const workflowThemes: WorkflowTheme[] = [
  {
    id: 'purple',
    name: 'Purple',
    primary: '#a855f7',
    primaryLight: '#c084fc',
    primaryDark: '#9333ea',
    primaryRgb: '168, 85, 247',
  },
  {
    id: 'blue',
    name: 'Blue',
    primary: '#3b82f6',
    primaryLight: '#60a5fa',
    primaryDark: '#2563eb',
    primaryRgb: '59, 130, 246',
  },
  {
    id: 'green',
    name: 'Green',
    primary: '#10b981',
    primaryLight: '#34d399',
    primaryDark: '#059669',
    primaryRgb: '16, 185, 129',
  },
  {
    id: 'orange',
    name: 'Orange',
    primary: '#f97316',
    primaryLight: '#fb923c',
    primaryDark: '#ea580c',
    primaryRgb: '249, 115, 22',
  },
  {
    id: 'pink',
    name: 'Pink',
    primary: '#ec4899',
    primaryLight: '#f472b6',
    primaryDark: '#db2777',
    primaryRgb: '236, 72, 153',
  },
  {
    id: 'cyan',
    name: 'Cyan',
    primary: '#06b6d4',
    primaryLight: '#22d3ee',
    primaryDark: '#0891b2',
    primaryRgb: '6, 182, 212',
  },
  {
    id: 'red',
    name: 'Red',
    primary: '#ef4444',
    primaryLight: '#f87171',
    primaryDark: '#dc2626',
    primaryRgb: '239, 68, 68',
  },
  {
    id: 'amber',
    name: 'Amber',
    primary: '#f59e0b',
    primaryLight: '#fbbf24',
    primaryDark: '#d97706',
    primaryRgb: '245, 158, 11',
  },
];

export const defaultTheme = workflowThemes[0]; // Purple

export function getThemeById(id: string): WorkflowTheme {
  return workflowThemes.find((t) => t.id === id) || defaultTheme;
}
