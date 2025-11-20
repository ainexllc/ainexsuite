import OpenAI from 'openai';
import { ContentEnhancementStyle } from '@ainexsuite/types';
import { plainText } from '@/lib/utils/text';

const apiKey = process.env.XAI_API_KEY;
const openai = apiKey
  ? new OpenAI({
      apiKey,
      baseURL: 'https://api.x.ai/v1',
    })
  : null;

const STYLE_INSTRUCTIONS: Record<ContentEnhancementStyle, string> = {
  clarity:
    'Polish the writing for clarity and cohesion. Smooth transitions, tighten phrasing, and remove redundancy while preserving the original voice and intent.',
  concise:
    'Make the entry more concise. Remove repetition and keep the strongest sentences so the narrative stays focused and efficient.',
  warmth:
    'Infuse a warmer, more encouraging tone. Keep it authentic, first-person, and grounded while softening sharp language.',
  reflection:
    'Highlight insights and reflective takeaways. Draw out personal realizations and gently suggest next steps or observations.',
};

export async function enhanceJournalContent(content: string, style: ContentEnhancementStyle) {
  if (!apiKey || !openai) {
    return fallbackEnhancement(content, style);
  }

  try {
    const textOnly = plainText(content);
    const instruction = STYLE_INSTRUCTIONS[style];

    const systemPrompt = `You are an expert writing coach helping someone refine their private journal entry. The entry is provided as HTML. Rewrite it according to the requested style while strictly following these rules:
1. Preserve first-person voice and factual details.
2. Maintain privacy—do not add new people, events, or specific names that are not present.
3. Return clean HTML using <p>, <ul>/<ol>, and <strong>/<em> tags only. Do not wrap in <html> or <body>.
4. Keep custom language, emojis, and distinctive phrases unless they harm clarity.
5. Output only the rewritten HTML, nothing else.`;

    const userPrompt = `Requested style: ${style}
Style instructions: ${instruction}

Original entry (HTML):
${content}

For reference, the plain text version is:
${textOnly}`;

    const message = await openai.chat.completions.create({
      model: 'grok-beta',
      max_tokens: 800,
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const responseContent = message.choices[0]?.message?.content?.trim() || '';

    if (!responseContent) {
      throw new Error('AI did not return enhanced content.');
    }

    return responseContent;
  } catch (error) {
    return fallbackEnhancement(content, style);
  }
}

function fallbackEnhancement(content: string, style: ContentEnhancementStyle) {
  const textOnly = plainText(content).trim();
  if (!textOnly) {
    return content;
  }

  const normalized = textOnly.replace(/\s+/g, ' ').replace(/\s([?.!])/g, '$1').trim();
  const paragraphs = splitIntoParagraphs(normalized);

  switch (style) {
    case 'clarity': {
      return renderParagraphs(paragraphs);
    }
    case 'concise': {
      const limited = limitWords(paragraphs.join(' '), 180);
      return renderParagraphs(splitIntoParagraphs(limited));
    }
    case 'warmth': {
      const base = renderParagraphs(paragraphs);
      return `${base}<p><em>Be gentle with yourself—capture what you felt and remember you're doing your best.</em></p>`;
    }
    case 'reflection': {
      const base = renderParagraphs(paragraphs);
      const highlights = buildHighlights(paragraphs);
      return `${base}${highlights}`;
    }
    default:
      return content;
  }
}

function splitIntoParagraphs(text: string) {
  return text
    .split(/\n{2,}|\r?\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
}

function renderParagraphs(paragraphs: string[]) {
  if (paragraphs.length === 0) return '';
  return paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('\n');
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function limitWords(text: string, limit: number) {
  const words = text.split(/\s+/);
  if (words.length <= limit) {
    return text;
  }
  return `${words.slice(0, limit).join(' ')}…`;
}

function buildHighlights(paragraphs: string[]) {
  const candidates = paragraphs
    .flatMap((p) => p.split(/(?<=[.!?])\s+/))
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .slice(0, 3);

  if (candidates.length === 0) {
    return '';
  }

  const items = candidates.map((item) => `<li>${escapeHtml(item)}</li>`).join('');

  return `<p><strong>Key reflections</strong></p><ul>${items}</ul>`;
}
