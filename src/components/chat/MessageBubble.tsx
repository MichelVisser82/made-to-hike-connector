import { AlertTriangle, CheckCheck, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/chat';
import { format } from 'date-fns';

interface MessageBubbleProps {
  message: Message;
  currentUserId?: string;
  isAdmin?: boolean;
}

export function MessageBubble({ message, currentUserId, isAdmin }: MessageBubbleProps) {
  const isSender = message.sender_id === currentUserId;
  const isAutomated = message.is_automated;
  const hasViolations = message.moderation_flags && message.moderation_flags.length > 0;

  // Show original content to admins and sender, moderated to others
  const displayContent = (isAdmin || isSender)
    ? message.content
    : message.moderated_content || message.content;

  return (
    <div className={cn("flex", isSender ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[70%] rounded-lg p-3 space-y-1",
          isSender
            ? "bg-primary text-primary-foreground"
            : isAutomated
            ? "bg-blue-100 dark:bg-blue-900 text-foreground border-l-4 border-blue-500"
            : "bg-muted text-foreground",
          hasViolations && "border-2 border-orange-500"
        )}
      >
        {/* Automated message indicator */}
        {isAutomated && (
          <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
            🤖 Automated Response
          </p>
        )}

        {/* Sender name for non-sender messages */}
        {!isSender && message.sender_name && (
          <p className="text-xs font-medium opacity-70">
            {message.sender_name}
          </p>
        )}

        {/* Message content */}
        <p className="whitespace-pre-wrap break-words">{displayContent}</p>

        {/* Image attachment */}
        {message.message_type === 'image' && message.attachment_url && (
          <img
            src={message.attachment_url}
            alt="Attached image"
            className="rounded-lg max-w-full h-auto mt-2"
            style={{ maxHeight: '300px' }}
          />
        )}

        {/* Moderation warning */}
        {hasViolations && !isAdmin && !isSender && (
          <div className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1 pt-1">
            <AlertTriangle className="w-3 h-3" />
            Content moderated for safety
          </div>
        )}

        {/* Admin view: show both versions */}
        {isAdmin && hasViolations && (
          <details className="text-xs opacity-70 pt-2 border-t border-white/20">
            <summary className="cursor-pointer font-medium">
              View Original (Admin Only)
            </summary>
            <div className="mt-2 p-2 bg-black/10 rounded">
              <p className="mb-1">{message.content}</p>
              <p className="text-orange-400 font-medium">
                Flags: {message.moderation_flags.join(', ')}
              </p>
            </div>
          </details>
        )}

        {/* Timestamp and read status */}
        <div className={cn(
          "flex items-center gap-1 text-xs opacity-70",
          isSender ? "justify-end" : "justify-start"
        )}>
          <span>{format(new Date(message.created_at), 'HH:mm')}</span>
          {isSender && message.read_receipts && (
            <>
              {message.read_receipts.length > 0 ? (
                <CheckCheck className="w-3 h-3" />
              ) : (
                <Check className="w-3 h-3" />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
