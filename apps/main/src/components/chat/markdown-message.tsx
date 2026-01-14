'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarkdownMessageProps {
  content: string;
  className?: string;
}

interface CodeBlockProps {
  className?: string;
  children?: React.ReactNode;
}

function CodeBlock({ className, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const codeText = String(children).replace(/\n$/, '');
  // Check if it's inline code (no newlines and no language specified)
  const isInline = !String(children).includes('\n') && !language;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isInline) {
    return (
      <code className="px-1.5 py-0.5 rounded-md bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 font-mono text-[0.85em]">
        {children}
      </code>
    );
  }

  return (
    <div className="relative group my-3 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 shadow-sm">
      {/* Language label */}
      {language && (
        <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
          {language}
        </div>
      )}
      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded-lg bg-zinc-200/80 dark:bg-zinc-700/80 text-zinc-500 dark:text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-all"
        title="Copy code"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
      {/* Code content */}
      <pre className={cn('overflow-x-auto p-4', language && 'pt-3')}>
        <code className="text-[13px] leading-relaxed font-mono text-zinc-800 dark:text-zinc-100">
          {codeText}
        </code>
      </pre>
    </div>
  );
}

export function MarkdownMessage({ content, className }: MarkdownMessageProps) {
  return (
    <div className={cn('prose-sm max-w-none', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: (props) => <CodeBlock {...props} />,
          p: ({ children }) => (
            <p className="mb-2 last:mb-0 leading-relaxed text-zinc-700 dark:text-zinc-200">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="mb-2 pl-4 space-y-1 list-disc text-zinc-700 dark:text-zinc-200 marker:text-orange-400 dark:marker:text-orange-500">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-2 pl-4 space-y-1 list-decimal text-zinc-700 dark:text-zinc-200 marker:text-orange-400 dark:marker:text-orange-500">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">{children}</li>
          ),
          h1: ({ children }) => (
            <h1 className="text-lg font-semibold mb-2 mt-3 first:mt-0 text-zinc-900 dark:text-zinc-50">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-semibold mb-2 mt-3 first:mt-0 text-zinc-900 dark:text-zinc-50">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold mb-1 mt-2 first:mt-0 text-zinc-900 dark:text-zinc-50">
              {children}
            </h3>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-zinc-900 dark:text-zinc-50">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-zinc-600 dark:text-zinc-300">{children}</em>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-600 dark:text-orange-400 hover:underline font-medium"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-orange-500/50 pl-3 my-2 text-zinc-500 dark:text-zinc-400 italic bg-zinc-50 dark:bg-zinc-800/50 py-1 rounded-r-lg">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm">
              <table className="min-w-full text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-zinc-100 dark:bg-zinc-800">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-left font-semibold text-zinc-800 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-700">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-zinc-600 dark:text-zinc-300 border-b border-zinc-100 dark:border-zinc-700/50">
              {children}
            </td>
          ),
          hr: () => <hr className="my-4 border-zinc-200 dark:border-zinc-700" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
