import { Crown, Instagram, Facebook, Mail } from 'lucide-react';
import { Button } from '../ui/button';
import type { GuideProfile } from '@/types/guide';

interface GuideFooterCTAProps {
  guide: GuideProfile;
}

export function GuideFooterCTA({ guide }: GuideFooterCTAProps) {
  return (
    <section className="py-16 bg-gradient-to-r from-red-900 to-red-800 text-white">
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center mb-4">
          <Crown className="w-12 h-12 text-yellow-400" />
        </div>

        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready for your Highland Adventure?
        </h2>
        
        <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
          Join {guide.display_name} on an unforgettable journey through Scotland's most breathtaking landscapes.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Button 
            size="lg" 
            className="bg-yellow-400 text-gray-900 hover:bg-yellow-300 font-semibold px-8"
          >
            Book {guide.display_name.split(' ')[0]}
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="bg-white/10 text-white border-white/30 hover:bg-white/20"
          >
            VIEW PROFILE
          </Button>
        </div>

        <div className="flex justify-center gap-4">
          {guide.instagram_url && (
            <a 
              href={guide.instagram_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <Instagram className="w-5 h-5" />
            </a>
          )}
          {guide.facebook_url && (
            <a 
              href={guide.facebook_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
            <Facebook className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
