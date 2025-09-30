import { Helmet } from 'react-helmet-async';
import type { Tour } from '@/types';
import { 
  generateTourMetaTitle, 
  generateTourMetaDescription, 
  getTourCanonicalUrl 
} from '@/lib/seoUtils';

interface TourSEOProps {
  tour: Tour;
}

export function TourSEO({ tour }: TourSEOProps) {
  const metaTitle = tour.meta_title || generateTourMetaTitle(tour);
  const metaDescription = tour.meta_description || generateTourMetaDescription(tour);
  const canonicalUrl = tour.slug ? getTourCanonicalUrl(tour.slug) : undefined;
  const ogImage = tour.hero_image || tour.images?.[0];

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{metaTitle}</title>
      <meta name="title" content={metaTitle} />
      <meta name="description" content={metaDescription} />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="product" />
      <meta property="og:site_name" content="MadeToHike" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {ogImage && <meta property="og:image:alt" content={tour.title} />}
      <meta property="og:locale" content="en_US" />
      
      {/* Product-specific OG tags */}
      <meta property="product:price:amount" content={tour.price.toString()} />
      <meta property="product:price:currency" content={tour.currency} />
      {tour.rating > 0 && (
        <meta property="product:rating:value" content={tour.rating.toString()} />
      )}
      {tour.reviews_count > 0 && (
        <meta property="product:rating:count" content={tour.reviews_count.toString()} />
      )}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      {canonicalUrl && <meta name="twitter:url" content={canonicalUrl} />}
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="author" content="MadeToHike" />
      
      {/* Geographic tags */}
      {tour.region && (
        <>
          <meta name="geo.region" content={getGeoRegion(tour.region)} />
          <meta name="geo.placename" content={getPlaceName(tour.region)} />
        </>
      )}
    </Helmet>
  );
}

function getGeoRegion(region: string): string {
  const geoMap: Record<string, string> = {
    dolomites: 'IT',
    pyrenees: 'ES-FR',
    scotland: 'GB-SCT'
  };
  return geoMap[region] || '';
}

function getPlaceName(region: string): string {
  const placeMap: Record<string, string> = {
    dolomites: 'Dolomites, Italy',
    pyrenees: 'Pyrenees, Spain/France',
    scotland: 'Scottish Highlands'
  };
  return placeMap[region] || region;
}
