import { Helmet } from 'react-helmet-async';
import { MainLayout } from '@/components/layout/MainLayout';
import { SearchPage } from '@/components/pages/SearchPage';
import { useFeaturedRegions, formatRegionPath } from '@/hooks/useFeaturedRegions';

/**
 * ToursPage - Dedicated page for browsing and searching hiking tours
 * Uses SearchPage component wrapped in MainLayout for consistent navigation
 * Includes proper SEO metadata and structured data
 */
export default function ToursPage() {
  const { data: featuredRegions } = useFeaturedRegions();
  
  const regionText = featuredRegions?.slice(0, 6)
    .map(r => formatRegionPath(r))
    .join(', ') || "Europe's premier mountain regions";

  return (
    <>
      <Helmet>
        <title>Hiking Tours Across Europe | MadeToHike - Certified Mountain Guides</title>
        <meta 
          name="description" 
          content={`Discover expertly guided hiking tours across ${regionText} and more. Browse multi-day adventures, day hikes, and alpine expeditions with certified mountain guides.`}
        />
        <meta 
          name="keywords" 
          content={`hiking tours, mountain tours Europe, guided hiking trips, ${regionText}, alpine adventures, multi-day hikes, certified mountain guides`}
        />
        <link rel="canonical" href={`${window.location.origin}/tours`} />
        
        {/* Open Graph */}
        <meta property="og:title" content="Hiking Tours Across Europe | MadeToHike" />
        <meta property="og:description" content="Discover expertly guided hiking tours across Europe's most stunning mountain ranges with certified guides." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${window.location.origin}/tours`} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Hiking Tours Across Europe | MadeToHike" />
        <meta name="twitter:description" content={`Browse guided hiking tours across ${regionText} and more.`} />
      </Helmet>

      {/* Structured Data for CollectionPage */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Hiking Tours",
          "description": "Browse expertly guided hiking tours across Europe's most stunning mountain ranges",
          "url": `${window.location.origin}/tours`,
          "provider": {
            "@type": "Organization",
            "name": "MadeToHike",
            "description": "Europe's premier marketplace for certified mountain guides and authentic hiking experiences",
            "url": window.location.origin
          }
        })}
      </script>

      <MainLayout>
        <SearchPage />
      </MainLayout>
    </>
  );
}
