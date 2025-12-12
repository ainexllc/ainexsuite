'use client';

import { useEffect, useState } from 'react';

export interface TOCSection {
  id: string;
  title: string;
}

interface TableOfContentsProps {
  sections: TOCSection[];
}

export function TableOfContents({ sections }: TableOfContentsProps) {
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    // IntersectionObserver to track which section is currently visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-100px 0px -66%',
        threshold: 0,
      }
    );

    // Observe all sections
    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [sections]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <nav className="sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto border-r border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-6">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
          Contents
        </h3>
        <ul className="space-y-2">
          {sections.map(({ id, title }) => {
            const isActive = activeSection === id;
            return (
              <li key={id}>
                <button
                  onClick={() => handleClick(id)}
                  className={`
                    w-full text-left text-sm py-1.5 px-3 rounded-md transition-colors
                    ${
                      isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }
                  `}
                >
                  {title}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
