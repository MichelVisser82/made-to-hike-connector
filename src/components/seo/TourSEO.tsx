import { useEffect } from 'react';
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

  useEffect(() => {
    // Update document title
    document.title = metaTitle;

    // Update or create meta tags
    const updateMetaTag = (property: string, content: string, useProperty = false) => {
      const attribute = useProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${property}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Primary Meta Tags
    updateMetaTag('title', metaTitle);
    updateMetaTag('description', metaDescription);
    updateMetaTag('robots', 'index, follow');
    updateMetaTag('language', 'English');
    updateMetaTag('author', 'MadeToHike');

    // Open Graph
    updateMetaTag('og:type', 'product', true);
    updateMetaTag('og:site_name', 'MadeToHike', true);
    updateMetaTag('og:title', metaTitle, true);
    updateMetaTag('og:description', metaDescription, true);
    updateMetaTag('og:locale', 'en_US', true);
    if (canonicalUrl) updateMetaTag('og:url', canonicalUrl, true);
    if (ogImage) {
      updateMetaTag('og:image', ogImage, true);
      updateMetaTag('og:image:alt', tour.title, true);
    }
    
    // Product-specific OG tags
    updateMetaTag('product:price:amount', tour.price.toString(), true);
    updateMetaTag('product:price:currency', tour.currency, true);
    if (tour.rating > 0) {
      updateMetaTag('product:rating:value', tour.rating.toString(), true);
    }
    if (tour.reviews_count > 0) {
      updateMetaTag('product:rating:count', tour.reviews_count.toString(), true);
    }

    // Twitter
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', metaTitle);
    updateMetaTag('twitter:description', metaDescription);
    if (canonicalUrl) updateMetaTag('twitter:url', canonicalUrl);
    if (ogImage) updateMetaTag('twitter:image', ogImage);

    // Geographic tags
    if (tour.region) {
      updateMetaTag('geo.region', getGeoRegion(tour.region));
      updateMetaTag('geo.placename', getPlaceName(tour.region));
    }

    // Canonical link
    if (canonicalUrl) {
      let canonicalElement = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonicalElement) {
        canonicalElement = document.createElement('link');
        canonicalElement.rel = 'canonical';
        document.head.appendChild(canonicalElement);
      }
      canonicalElement.href = canonicalUrl;
    }
  }, [tour, metaTitle, metaDescription, canonicalUrl, ogImage]);

  return null;
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
