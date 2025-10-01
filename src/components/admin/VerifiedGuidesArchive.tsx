import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { CertificationBadge } from '../ui/certification-badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Search, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function VerifiedGuidesArchive() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: verifiedGuides, isLoading } = useQuery({
    queryKey: ['verified-guides'],
    queryFn: async () => {
      const { data: guides, error } = await supabase
        .from('guide_profiles')
        .select('*')
        .eq('verified', true)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Fetch related verifications and profiles separately
      const userIds = guides?.map(g => g.user_id) || [];

      const { data: verifications } = await supabase
        .from('user_verifications')
        .select('user_id, verification_status, admin_notes, updated_at')
        .in('user_id', userIds);

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, name')
        .in('id', userIds);

      // Combine the data
      const combined = guides?.map(guide => ({
        ...guide,
        verification: verifications?.find(v => v.user_id === guide.user_id),
        profile: profiles?.find(p => p.id === guide.user_id),
      }));

      return combined;
    },
  });

  const filteredGuides = verifiedGuides?.filter(guide => 
    guide.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guide.profile?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guide.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search verified guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Loading verified guides...</p>
          </CardContent>
        </Card>
      ) : !filteredGuides || filteredGuides.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              {searchQuery ? 'No guides match your search' : 'No verified guides yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGuides.map((guide) => {
            const verificationData = Array.isArray(guide.verification) 
              ? guide.verification[0] 
              : guide.verification;
            
            return (
              <Card key={guide.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={guide.profile_image_url || undefined} />
                      <AvatarFallback>
                        {guide.display_name?.charAt(0) || 'G'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{guide.display_name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {guide.profile?.email}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Experience</p>
                      <p className="font-medium">{guide.experience_years || 0} years</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-medium">{guide.location || 'N/A'}</p>
                    </div>
                  </div>

                  {guide.certifications && Array.isArray(guide.certifications) && guide.certifications.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Certifications</p>
                      <div className="flex flex-wrap gap-2">
                        {guide.certifications.slice(0, 3).map((cert: any, index: number) => (
                          <CertificationBadge
                            key={index}
                            certification={cert}
                            size="compact"
                            isGuideVerified={true}
                          />
                        ))}
                        {guide.certifications.length > 3 && (
                          <span className="text-sm text-muted-foreground">
                            +{guide.certifications.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {verificationData && (
                    <div className="text-sm text-muted-foreground">
                      Verified {formatDistanceToNow(new Date(verificationData.updated_at))} ago
                    </div>
                  )}

                  <a
                    href={`/guide/${guide.user_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block w-full"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                    >
                      View Profile
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </a>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
