'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@ainexsuite/ui';

interface ChatMarkdownProps {
  content: string;
  className?: string;
}

/**
 * ChatMarkdown - Renders markdown content in AI chat responses
 *
 * Features:
 * - GitHub-flavored markdown (tables, strikethrough, task lists)
 * - Compact styling optimized for chat bubbles
 * - Dark theme compatible
 */
export function ChatMarkdown({ content, className }: ChatMarkdownProps) {
  return (
    <div className={cn('chat-markdown text-xs leading-relaxed', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        // Paragraphs
        p: ({ children }) => (
          <p className="mb-2 last:mb-0">{children}</p>
        ),

        // Headings
        h1: ({ children }) => (
          <h1 className="text-sm font-bold mb-2 mt-3 first:mt-0">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-xs font-bold mb-1.5 mt-2.5 first:mt-0">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-xs font-semibold mb-1 mt-2 first:mt-0">{children}</h3>
        ),

        // Lists
        ul: ({ children }) => (
          <ul className="list-disc list-inside mb-2 space-y-0.5 ml-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside mb-2 space-y-0.5 ml-1">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="text-xs">{children}</li>
        ),

        // Code
        code: ({ className, children, ...props }) => {
          const isInline = !className;
          if (isInline) {
            return (
              <code className="px-1 py-0.5 rounded bg-zinc-700/50 text-[10px] font-mono">
                {children}
              </code>
            );
          }
          return (
            <code className={cn('block p-2 rounded bg-zinc-700/50 text-[10px] font-mono overflow-x-auto', className)} {...props}>
              {children}
            </code>
          );
        },
        pre: ({ children }) => (
          <pre className="mb-2 overflow-x-auto">{children}</pre>
        ),

        // Links
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:text-amber-300 underline underline-offset-2"
          >
            {children}
          </a>
        ),

        // Blockquotes
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-zinc-600 pl-2 my-2 text-zinc-400 italic">
            {children}
          </blockquote>
        ),

        // Tables
        table: ({ children }) => (
          <div className="overflow-x-auto mb-2">
            <table className="min-w-full text-[10px] border-collapse">{children}</table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-zinc-700/50">{children}</thead>
        ),
        th: ({ children }) => (
          <th className="px-2 py-1 text-left font-semibold border border-zinc-600">{children}</th>
        ),
        td: ({ children }) => (
          <td className="px-2 py-1 border border-zinc-600">{children}</td>
        ),

        // Horizontal rule
        hr: () => <hr className="border-zinc-600 my-2" />,

        // Strong and emphasis
        strong: ({ children }) => (
          <strong className="font-semibold">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic">{children}</em>
        ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
