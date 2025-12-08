import { Star, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SmartImage } from '@/components/SmartImage';
import { CertificationBadge } from '@/components/ui/certification-badge';

interface MockGuideCardProps {
  name: string;
  certification: string;
  location: string;
  experience: number;
  rating: number;
  verified: boolean;
  imageUrl?: string;
}

export function MockGuideCard({
  name,
  certification,
  location,
  experience,
  rating,
  verified,
  imageUrl,
}: MockGuideCardProps) {
  return (
    <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-elegant">
      <div className="relative aspect-[3/4]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${name} - Mountain Guide`}
            className="w-full h-full object-cover"
          />
        ) : (
          <SmartImage
            category="portrait"
            usageContext="landing"
            tags={['guide', 'professional', 'mountain']}
            className="w-full h-full object-cover"
            alt={`${name} - Mountain Guide`}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-cream" />
        
        {verified && (
          <Badge className="absolute top-3 left-3 bg-green-600 text-white border-0">
            Verified
          </Badge>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-charcoal">{name}</h3>
            <p className="text-sm text-muted-foreground">{certification}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-gold text-gold" />
            <span className="font-medium text-charcoal">{rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>
          <span>{experience} years</span>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <CertificationBadge
            certification={{
              title: certification,
              certifyingBody: certification === 'IFMGA' 
                ? 'International Federation of Mountain Guides Associations'
                : certification === 'IML'
                ? 'International Mountain Leader'
                : certification,
              certificationType: 'standard',
            }}
            displayMode="simple"
            showTooltip={true}
          />
        </div>
      </div>
    </Card>
  );
}
