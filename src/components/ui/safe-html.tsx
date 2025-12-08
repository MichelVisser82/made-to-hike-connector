import DOMPurify from 'dompurify';
import { cn } from '@/lib/utils';

interface SafeHtmlProps {
  html: string;
  className?: string;
}

/**
 * Safely renders HTML content after sanitizing with DOMPurify.
 * Falls back to plain text if no HTML tags are detected.
 */
export function SafeHtml({ html, className }: SafeHtmlProps) {
  // Check if content contains HTML tags
  const hasHtmlTags = /<[^>]+>/.test(html);
  
  if (!hasHtmlTags) {
    // Render as plain text (backward compatibility for existing descriptions)
    return <p className={className}>{html}</p>;
  }

  // Sanitize and render HTML
  const sanitizedHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'b', 'i', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
  });

  return (
    <div
      className={cn('prose prose-sm max-w-none', className)}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
