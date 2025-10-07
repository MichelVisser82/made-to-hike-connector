import { Shield, Star, Users } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

interface TrustIndicatorsCardProps {
  guideName: string;
  isVerified: boolean;
  averageRating: number;
  totalReviews: number;
  totalClients: number;
}

export function TrustIndicatorsCard({ 
  guideName, 
  isVerified, 
  averageRating, 
  totalReviews,
  totalClients 
}: TrustIndicatorsCardProps) {
  return (
    <Card className="border-burgundy/20 shadow-lg bg-gradient-to-br from-burgundy/5 to-burgundy/10">
      <CardContent className="p-6">
        <h4 className="text-lg font-semibold mb-4" style={{fontFamily: 'Playfair Display, serif'}}>
          Why Book with {guideName}?
        </h4>
        
        <div className="space-y-4">
          {isVerified && (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-burgundy/20 flex items-center justify-center">
                <Shield className="h-4 w-4 text-burgundy" />
              </div>
              <div>
                <div className="font-medium text-charcoal">Verified Professional Guide</div>
                <div className="text-sm text-charcoal/70">Identity and certifications verified</div>
              </div>
            </div>
          )}

          {averageRating > 0 && (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-burgundy/20 flex items-center justify-center">
                <Star className="h-4 w-4 text-burgundy fill-burgundy" />
              </div>
              <div>
                <div className="font-medium text-charcoal">
                  {averageRating.toFixed(1)}★ from {totalReviews} reviews
                </div>
                <div className="text-sm text-charcoal/70">Highly rated by past clients</div>
              </div>
            </div>
          )}

          {totalClients > 0 && (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-burgundy/20 flex items-center justify-center">
                <Users className="h-4 w-4 text-burgundy" />
              </div>
              <div>
                <div className="font-medium text-charcoal">{totalClients}+ satisfied clients</div>
                <div className="text-sm text-charcoal/70">Years of guiding experience</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
