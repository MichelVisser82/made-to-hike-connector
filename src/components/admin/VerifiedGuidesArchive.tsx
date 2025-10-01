import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { CertificationBadge } from '../ui/certification-badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Search, ExternalLink, Eye, MapPin, Calendar, Award, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '../ui/badge';

export function VerifiedGuidesArchive() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuide, setSelectedGuide] = useState<any>(null);
  const [selectedDocument, setSelectedDocument] = useState<{ url: string; title: string } | null>(null);
  const [documentUrls, setDocumentUrls] = useState<Record<string, string>>({});

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

  const getDocumentUrl = async (documentPath: string): Promise<string> => {
    try {
      if (documentPath.startsWith('http')) {
        return documentPath;
      } else {
        const { data, error } = await supabase.storage
          .from('guide-documents')
          .createSignedUrl(documentPath, 3600);
        
        if (error) throw error;
        return data?.signedUrl || '';
      }
    } catch (error) {
      console.error('Error getting document URL:', error);
      return '';
    }
  };

  const openDocumentModal = async (documentPath: string, title: string) => {
    const url = await getDocumentUrl(documentPath);
    if (url) {
      setSelectedDocument({ url, title });
    }
  };

  useEffect(() => {
    const loadDocumentUrls = async () => {
      if (!selectedGuide) return;
      
      const certifications = selectedGuide.certifications || [];
      const urls: Record<string, string> = {};
      
      for (const cert of certifications) {
        if (cert.certificateDocument && typeof cert.certificateDocument === 'string') {
          const url = await getDocumentUrl(cert.certificateDocument);
          if (url) {
            urls[cert.certificateDocument] = url;
          }
        }
      }
      
      setDocumentUrls(urls);
    };
    
    loadDocumentUrls();
  }, [selectedGuide]);

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

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => setSelectedGuide(guide)}
                    >
                      <Eye className="h-3 w-3" />
                      View Details
                    </Button>
                    <a
                      href={`/guide/${guide.user_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Guide Details Modal */}
      <Dialog open={!!selectedGuide} onOpenChange={(open) => !open && setSelectedGuide(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Verified Guide Details</DialogTitle>
          </DialogHeader>
          {selectedGuide && (
            <div className="space-y-6 mt-4">
              {/* Guide Header */}
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedGuide.profile_image_url || undefined} />
                  <AvatarFallback className="text-2xl">
                    {selectedGuide.display_name?.charAt(0) || 'G'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold">{selectedGuide.display_name}</h3>
                  <p className="text-muted-foreground">{selectedGuide.profile?.email}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    {selectedGuide.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {selectedGuide.location}
                      </div>
                    )}
                    {selectedGuide.experience_years && (
                      <div className="flex items-center gap-1">
                        <Award className="h-3 w-3" />
                        {selectedGuide.experience_years} years experience
                      </div>
                    )}
                  </div>
                </div>
                <Badge variant="default" className="bg-green-600">
                  Verified
                </Badge>
              </div>

              {/* Bio */}
              {selectedGuide.bio && (
                <div>
                  <h4 className="font-semibold mb-2">About</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedGuide.bio}
                  </p>
                </div>
              )}

              {/* Certifications */}
              <div>
                <h4 className="font-semibold mb-3">Verified Certifications</h4>
                {selectedGuide.certifications && Array.isArray(selectedGuide.certifications) && selectedGuide.certifications.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedGuide.certifications.map((cert: any, index: number) => {
                      const documentUrl = cert.certificateDocument && documentUrls[cert.certificateDocument];
                      const isPdf = documentUrl?.toLowerCase().includes('.pdf') || 
                                   cert.certificateDocument?.toLowerCase().endsWith('.pdf');
                      
                      return (
                        <div
                          key={index}
                          className="p-3 border border-border rounded-lg bg-muted/30 flex gap-3"
                        >
                          <div className="flex-1">
                            <CertificationBadge
                              certification={cert}
                              size="full"
                              isGuideVerified={true}
                              showTooltip
                            />
                            {cert.certificateNumber && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Certificate #: {cert.certificateNumber}
                              </p>
                            )}
                            {cert.expiryDate && (
                              <p className="text-xs text-muted-foreground">
                                Expires: {new Date(cert.expiryDate).toLocaleDateString()}
                              </p>
                            )}
                            {cert.addedDate && (
                              <p className="text-xs text-muted-foreground">
                                Added: {formatDistanceToNow(new Date(cert.addedDate))} ago
                              </p>
                            )}
                          </div>
                          
                          {/* Certificate Thumbnail */}
                          {cert.certificateDocument && (
                            <div
                              className="relative w-20 h-20 rounded overflow-hidden border border-border bg-muted cursor-pointer group flex-shrink-0"
                              onClick={() => {
                                if (typeof cert.certificateDocument === 'string') {
                                  openDocumentModal(cert.certificateDocument, cert.title);
                                }
                              }}
                            >
                              {documentUrl ? (
                                <>
                                  {isPdf ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
                                      <FileText className="h-8 w-8 text-red-600 dark:text-red-400" />
                                    </div>
                                  ) : (
                                    <img 
                                      src={documentUrl} 
                                      alt={cert.title}
                                      className="absolute inset-0 w-full h-full object-cover"
                                    />
                                  )}
                                </>
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <FileText className="h-6 w-6 text-muted-foreground animate-pulse" />
                                </div>
                              )}
                              
                              {/* Hover overlay with eye icon */}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Eye className="h-6 w-6 text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No certifications on record</p>
                )}
              </div>

              {/* Specialties */}
              {selectedGuide.specialties && Array.isArray(selectedGuide.specialties) && selectedGuide.specialties.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedGuide.specialties.map((specialty: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Guiding Areas */}
              {selectedGuide.guiding_areas && Array.isArray(selectedGuide.guiding_areas) && selectedGuide.guiding_areas.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Guiding Areas</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedGuide.guiding_areas.map((area: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {selectedGuide.languages_spoken && Array.isArray(selectedGuide.languages_spoken) && selectedGuide.languages_spoken.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Languages Spoken</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedGuide.languages_spoken.map((lang: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Verification Info */}
              {selectedGuide.verification && (
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Verified {formatDistanceToNow(new Date(Array.isArray(selectedGuide.verification) ? selectedGuide.verification[0].updated_at : selectedGuide.verification.updated_at))} ago
                  </p>
                  {(Array.isArray(selectedGuide.verification) ? selectedGuide.verification[0].admin_notes : selectedGuide.verification.admin_notes) && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Admin Notes: {Array.isArray(selectedGuide.verification) ? selectedGuide.verification[0].admin_notes : selectedGuide.verification.admin_notes}
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-border">
                <a
                  href={`/guide/${selectedGuide.user_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="default" className="w-full gap-2">
                    View Public Profile
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
                <Button
                  variant="outline"
                  onClick={() => setSelectedGuide(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Certificate Document Viewer Modal */}
      <Dialog open={!!selectedDocument} onOpenChange={(open) => !open && setSelectedDocument(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedDocument?.title || 'Certificate Document'}</DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className="mt-4">
              {selectedDocument.url.toLowerCase().includes('.pdf') ? (
                <iframe
                  src={selectedDocument.url}
                  className="w-full h-[70vh] border border-border rounded"
                  title={selectedDocument.title}
                />
              ) : (
                <img
                  src={selectedDocument.url}
                  alt={selectedDocument.title}
                  className="w-full h-auto max-h-[70vh] object-contain rounded"
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
