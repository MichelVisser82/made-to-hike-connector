import DOMPurify from 'dompurify';

/**
 * Safely formats and sanitizes FAQ answer text
 * Converts markdown-style formatting to HTML while preventing XSS attacks
 */
export function sanitizeFAQAnswer(answer: string): string {
  // First, apply formatting transformations
  const formatted = answer
    .replace(/\\n/g, '\n')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/- /g, '• ');

  // Then sanitize with DOMPurify
  return DOMPurify.sanitize(formatted, {
    ALLOWED_TAGS: ['strong', 'em', 'br', 'p', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
  });
}
