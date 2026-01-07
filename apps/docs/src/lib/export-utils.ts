/**
 * Export utilities for docs
 * Supports markdown, plain text, JSON, and clipboard export
 */

import type { Doc, ChecklistItem } from "@/lib/types/doc";

export type ExportFormat = "markdown" | "text" | "json";

/**
 * Convert HTML to Markdown
 * Simple conversion for common HTML elements
 */
function htmlToMarkdown(html: string): string {
  if (!html) return "";

  let markdown = html;

  // Headers
  markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n");
  markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n");
  markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n");

  // Bold and italic
  markdown = markdown.replace(/<(strong|b)[^>]*>(.*?)<\/(strong|b)>/gi, "**$2**");
  markdown = markdown.replace(/<(em|i)[^>]*>(.*?)<\/(em|i)>/gi, "*$2*");

  // Links
  markdown = markdown.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, "[$2]($1)");

  // Lists
  markdown = markdown.replace(/<ul[^>]*>/gi, "\n");
  markdown = markdown.replace(/<\/ul>/gi, "\n");
  markdown = markdown.replace(/<ol[^>]*>/gi, "\n");
  markdown = markdown.replace(/<\/ol>/gi, "\n");
  markdown = markdown.replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n");

  // Paragraphs and line breaks
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n");
  markdown = markdown.replace(/<br\s*\/?>/gi, "\n");
  markdown = markdown.replace(/<div[^>]*>(.*?)<\/div>/gi, "$1\n");

  // Code blocks
  markdown = markdown.replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gis, "```\n$1\n```\n");
  markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`");

  // Blockquotes
  markdown = markdown.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, (_, content) => {
    return content.split("\n").map((line: string) => `> ${line}`).join("\n") + "\n";
  });

  // Horizontal rule
  markdown = markdown.replace(/<hr\s*\/?>/gi, "\n---\n");

  // Strip remaining HTML tags
  markdown = markdown.replace(/<[^>]+>/g, "");

  // Decode HTML entities
  markdown = markdown.replace(/&nbsp;/g, " ");
  markdown = markdown.replace(/&amp;/g, "&");
  markdown = markdown.replace(/&lt;/g, "<");
  markdown = markdown.replace(/&gt;/g, ">");
  markdown = markdown.replace(/&quot;/g, '"');
  markdown = markdown.replace(/&#39;/g, "'");

  // Clean up multiple newlines
  markdown = markdown.replace(/\n{3,}/g, "\n\n");
  markdown = markdown.trim();

  return markdown;
}

/**
 * Convert HTML to plain text
 */
function htmlToText(html: string): string {
  if (!html) return "";

  let text = html;

  // Convert line breaks and paragraphs
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<\/p>/gi, "\n\n");
  text = text.replace(/<\/div>/gi, "\n");
  text = text.replace(/<li[^>]*>/gi, "- ");
  text = text.replace(/<\/li>/gi, "\n");

  // Strip all HTML tags
  text = text.replace(/<[^>]+>/g, "");

  // Decode HTML entities
  text = text.replace(/&nbsp;/g, " ");
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");

  // Clean up whitespace
  text = text.replace(/\n{3,}/g, "\n\n");
  text = text.trim();

  return text;
}

/**
 * Convert checklist to markdown format
 */
function checklistToMarkdown(checklist: ChecklistItem[]): string {
  return checklist
    .map((item) => {
      const indent = "  ".repeat(item.indent ?? 0);
      const checkbox = item.completed ? "[x]" : "[ ]";
      return `${indent}- ${checkbox} ${item.text}`;
    })
    .join("\n");
}

/**
 * Convert checklist to plain text
 */
function checklistToText(checklist: ChecklistItem[]): string {
  return checklist
    .map((item) => {
      const indent = "  ".repeat(item.indent ?? 0);
      const marker = item.completed ? "[x]" : "[ ]";
      return `${indent}${marker} ${item.text}`;
    })
    .join("\n");
}

/**
 * Export doc content to specified format
 */
export function exportDoc(
  doc: { title: string; body: string; type: "text" | "checklist"; checklist: ChecklistItem[] },
  format: ExportFormat
): { content: string; filename: string; mimeType: string } {
  const safeTitle = doc.title.trim() || "Untitled";
  const baseFilename = safeTitle.replace(/[^a-z0-9]/gi, "_").substring(0, 50);

  switch (format) {
    case "markdown": {
      const titleMd = `# ${safeTitle}\n\n`;
      const bodyMd =
        doc.type === "checklist"
          ? checklistToMarkdown(doc.checklist)
          : htmlToMarkdown(doc.body);
      return {
        content: titleMd + bodyMd,
        filename: `${baseFilename}.md`,
        mimeType: "text/markdown",
      };
    }

    case "text": {
      const bodyText =
        doc.type === "checklist"
          ? checklistToText(doc.checklist)
          : htmlToText(doc.body);
      const content = bodyText ? `${safeTitle}\n\n${bodyText}` : safeTitle;
      return {
        content,
        filename: `${baseFilename}.txt`,
        mimeType: "text/plain",
      };
    }

    case "json": {
      const jsonContent = JSON.stringify(
        {
          title: doc.title,
          body: doc.body,
          type: doc.type,
          checklist: doc.checklist,
          exportedAt: new Date().toISOString(),
        },
        null,
        2
      );
      return {
        content: jsonContent,
        filename: `${baseFilename}.json`,
        mimeType: "application/json",
      };
    }

    default:
      throw new Error(`Unknown export format: ${format}`);
  }
}

/**
 * Export full doc with metadata to JSON
 */
export function exportDocFull(doc: Doc): { content: string; filename: string; mimeType: string } {
  const safeTitle = doc.title.trim() || "Untitled";
  const baseFilename = safeTitle.replace(/[^a-z0-9]/gi, "_").substring(0, 50);

  // Create a clean export object without internal IDs
  const exportData = {
    title: doc.title,
    body: doc.body,
    type: doc.type,
    checklist: doc.checklist,
    color: doc.color,
    pattern: doc.pattern,
    pinned: doc.pinned,
    priority: doc.priority,
    labelIds: doc.labelIds,
    docDate: doc.docDate?.toISOString() ?? null,
    reminderAt: doc.reminderAt?.toISOString() ?? null,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    exportedAt: new Date().toISOString(),
  };

  return {
    content: JSON.stringify(exportData, null, 2),
    filename: `${baseFilename}_backup.json`,
    mimeType: "application/json",
  };
}

/**
 * Trigger file download in browser
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy content to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    // Fallback for older browsers
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      return true;
    } catch {
      return false;
    }
  }
}
