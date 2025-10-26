import type { LucideIcon } from "lucide-react";

type PagePlaceholderProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
};

export function PagePlaceholder({
  icon: Icon,
  title,
  description,
  actions,
  children,
}: PagePlaceholderProps) {
  return (
    <section className="rounded-3xl border border-dashed border-outline-subtle/70 bg-surface-elevated/80 px-8 py-10 shadow-sm">
      <div className="flex flex-col items-center gap-6 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-surface-muted text-accent-600 shadow-inner">
          <Icon className="h-8 w-8" aria-hidden />
        </span>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-ink-800">{title}</h1>
          <p className="mx-auto max-w-lg text-sm text-muted">{description}</p>
        </div>
        {children}
        {actions ? <div className="flex flex-wrap items-center justify-center gap-3">{actions}</div> : null}
      </div>
    </section>
  );
}
