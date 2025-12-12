'use client';

import { ThemeToggle } from '../../components/profile/theme-toggle';

export function ThemeSection() {
  const colorTokens = [
    // Surface colors
    { name: 'surface-base', variable: '--color-surface-base', description: 'Base background' },
    { name: 'surface-elevated', variable: '--color-surface-elevated', description: 'Elevated surfaces' },
    { name: 'surface-muted', variable: '--color-surface-muted', description: 'Muted backgrounds' },
    { name: 'surface-hover', variable: '--color-surface-hover', description: 'Hover state' },

    // Text colors
    { name: 'foreground', variable: '--foreground', description: 'Primary text' },
    { name: 'muted-foreground', variable: '--muted-foreground', description: 'Secondary text' },

    // Border colors
    { name: 'border', variable: '--border', description: 'Default borders' },
    { name: 'outline-subtle', variable: '--color-outline-subtle', description: 'Subtle outlines' },
    { name: 'outline-base', variable: '--color-outline-base', description: 'Base outlines' },

    // Brand/Accent colors
    { name: 'primary', variable: '--primary', description: 'Primary brand color' },
    { name: 'accent-500', variable: '--color-accent-500', description: 'Accent color 500' },
    { name: 'accent-600', variable: '--color-accent-600', description: 'Accent color 600' },

    // Semantic colors
    { name: 'danger', variable: '--color-danger', description: 'Error/danger state' },
    { name: 'success', variable: '--color-success', description: 'Success state' },
    { name: 'warning', variable: '--color-warning', description: 'Warning state' },
  ];

  const getColorStyle = (variable: string) => {
    // For HSL variables like --foreground, use hsl() wrapper
    if (variable === '--foreground' || variable === '--muted-foreground' ||
        variable === '--border' || variable === '--primary') {
      return { backgroundColor: `hsl(var(${variable}))` };
    }
    // For RGB variables like --color-surface-base, use rgb() wrapper
    return { backgroundColor: `rgb(var(${variable}))` };
  };

  return (
    <div className="space-y-8">
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">ThemeToggle</h4>
        <div className="max-w-md">
          <ThemeToggle />
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">Color Palette</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {colorTokens.map((token) => (
            <div
              key={token.name}
              className="flex items-center gap-3 p-3 rounded-lg border border-border bg-surface-elevated"
            >
              <div
                className="w-12 h-12 rounded-lg border border-border shadow-sm flex-shrink-0"
                style={getColorStyle(token.variable)}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {token.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {token.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">Semantic Color Swatches</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div
              className="h-20 rounded-lg border border-border shadow-sm"
              style={{ backgroundColor: 'hsl(var(--primary))' }}
            />
            <p className="text-xs text-center text-muted-foreground">Primary</p>
          </div>
          <div className="space-y-2">
            <div
              className="h-20 rounded-lg border border-border shadow-sm"
              style={{ backgroundColor: 'rgb(var(--color-danger))' }}
            />
            <p className="text-xs text-center text-muted-foreground">Danger</p>
          </div>
          <div className="space-y-2">
            <div
              className="h-20 rounded-lg border border-border shadow-sm"
              style={{ backgroundColor: 'rgb(var(--color-success))' }}
            />
            <p className="text-xs text-center text-muted-foreground">Success</p>
          </div>
          <div className="space-y-2">
            <div
              className="h-20 rounded-lg border border-border shadow-sm"
              style={{ backgroundColor: 'rgb(var(--color-warning))' }}
            />
            <p className="text-xs text-center text-muted-foreground">Warning</p>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">Semantic Token Reference</h4>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Token Name</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Variable</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Preview</th>
              </tr>
            </thead>
            <tbody>
              {colorTokens.map((token) => (
                <tr key={token.name} className="border-b border-border/50">
                  <td className="py-3 px-3 text-sm font-medium">{token.name}</td>
                  <td className="py-3 px-3 text-xs font-mono text-muted-foreground">{token.variable}</td>
                  <td className="py-3 px-3">
                    <div
                      className="w-16 h-8 rounded border border-border"
                      style={getColorStyle(token.variable)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">Surface Hierarchy</h4>
        <div className="space-y-4">
          <div className="p-6 rounded-xl" style={{ backgroundColor: 'rgb(var(--color-surface-base))' }}>
            <p className="text-sm font-medium mb-2">surface-base</p>
            <p className="text-xs text-muted-foreground">Base application background</p>
            <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: 'rgb(var(--color-surface-elevated))' }}>
              <p className="text-sm font-medium mb-2">surface-elevated</p>
              <p className="text-xs text-muted-foreground">Elevated content like cards</p>
              <div className="mt-4 p-3 rounded" style={{ backgroundColor: 'rgb(var(--color-surface-muted))' }}>
                <p className="text-xs font-medium mb-1">surface-muted</p>
                <p className="text-xs text-muted-foreground">Muted backgrounds for subtle elements</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
