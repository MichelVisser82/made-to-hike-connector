import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { format, differenceInDays, differenceInHours } from 'date-fns';

interface OfferExpiryBadgeProps {
  expiresAt: string;
  status?: string;
}

export function OfferExpiryBadge({ expiresAt, status }: OfferExpiryBadgeProps) {
  const expiryDate = new Date(expiresAt);
  const now = new Date();
  const daysUntilExpiry = differenceInDays(expiryDate, now);
  const hoursUntilExpiry = differenceInHours(expiryDate, now);
  const isExpired = expiryDate < now;

  // Don't show badge if offer is not pending
  if (status && status !== 'pending') {
    return null;
  }

  // Expired
  if (isExpired) {
    return (
      <Badge variant="secondary" className="bg-muted text-muted-foreground">
        <Clock className="w-3 h-3 mr-1" />
        Expired
      </Badge>
    );
  }

  // Less than 1 day - show in red with hours
  if (hoursUntilExpiry < 24) {
    return (
      <Badge variant="destructive">
        <Clock className="w-3 h-3 mr-1" />
        Expires in {hoursUntilExpiry}h
      </Badge>
    );
  }

  // 1-3 days - show warning in yellow
  if (daysUntilExpiry <= 3) {
    return (
      <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600 text-white">
        <Clock className="w-3 h-3 mr-1" />
        Expires in {daysUntilExpiry} day{daysUntilExpiry > 1 ? 's' : ''}
      </Badge>
    );
  }

  // More than 3 days - show normal badge with full date
  return (
    <Badge variant="secondary">
      <Clock className="w-3 h-3 mr-1" />
      Valid until {format(expiryDate, 'MMM d, yyyy')}
    </Badge>
  );
}
