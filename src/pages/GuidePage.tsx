import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useGuideProfileBySlug } from '@/hooks/useGuideProfileBySlug';
import { useGuideStats } from '@/hooks/useGuideStats';
import { useGuideTours } from '@/hooks/useGuideTours';
import { useGuideReviews } from '@/hooks/useGuideReviews';
import { GuideProfilePage } from '@/components/pages/GuideProfilePage';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

export default function GuidePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const { data: guide, isLoading: guideLoading, error: guideError } = useGuideProfileBySlug(slug);
  const { data: stats, isLoading: statsLoading } = useGuideStats(guide?.user_id);
  const { data: tours = [], isLoading: toursLoading } = useGuideTours(guide?.user_id, 3);
  const { data: reviews = [], isLoading: reviewsLoading } = useGuideReviews(guide?.user_id, 3);

  // SEO meta tags with slug-based canonical URL
  useEffect(() => {
    if (guide) {
      document.title = `${guide.display_name} | Certified Mountain Guide | MadeToHike`;
      
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', 
          guide.bio 
            ? `${guide.bio.slice(0, 150)}...`
            : `Meet ${guide.display_name}, certified mountain guide specializing in ${guide.specialties.slice(0, 3).join(', ')}.`
        );
      }
    }
  }, [guide]);

  if (guideLoading || statsLoading || toursLoading || reviewsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (guideError || !guide) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <h1 className="text-4xl font-bold">Guide Not Found</h1>
        <p className="text-muted-foreground text-center max-w-md">
          The guide profile you're looking for doesn't exist or is not yet verified.
        </p>
        <Button onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </div>
    );
  }

  if (!stats) return null;

  const canonicalUrl = `https://madetohike.com/${guide.slug}`;

  return (
    <>
      <Helmet>
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="profile" />
        <meta property="og:title" content={`${guide.display_name} | MadeToHike`} />
        <meta property="og:description" content={guide.bio || `Certified mountain guide ${guide.display_name}`} />
        {guide.profile_image_url && <meta property="og:image" content={guide.profile_image_url} />}
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": guide.display_name,
            "url": canonicalUrl,
            "image": guide.profile_image_url,
            "jobTitle": "Certified Mountain Guide",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": guide.location
            },
            "hasCredential": guide.certifications.map(cert => ({
              "@type": "EducationalOccupationalCredential",
              "name": cert.title,
              "credentialCategory": cert.certifyingBody
            })),
            ...(stats.average_rating > 0 && {
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": stats.average_rating,
                "reviewCount": stats.tours_completed
              }
            })
          })}
        </script>
      </Helmet>
      
      <GuideProfilePage 
        guide={guide}
        stats={stats}
        tours={tours}
        reviews={reviews}
      />
    </>
  );
}
