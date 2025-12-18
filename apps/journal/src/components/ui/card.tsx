import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-theme-surface rounded-lg shadow-md border border-theme-border',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
