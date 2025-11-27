import { useEffect, useState } from 'react';
import type { Tour } from '@/types';
import { getImageMetadataByUrl } from '@/utils/imageMetadataUtils';

interface StructuredDataProps {
  tour: Tour;
}

export function StructuredData({ tour }: StructuredDataProps) {
  const baseUrl = window.location.origin;
  const tourUrl = tour.slug ? `${baseUrl}/tours/${tour.slug}` : baseUrl;
  const [imageMetadata, setImageMetadata] = useState<any>(null);

  // Fetch image metadata for structured data
  useEffect(() => {
    const heroImage = tour.hero_image || tour.images?.[0];
    if (heroImage) {
      getImageMetadataByUrl(heroImage).then(metadata => {
        if (metadata) setImageMetadata(metadata);
      });
    }
  }, [tour.hero_image, tour.images]);

  // TouristTrip Schema with ImageObject
  const touristTripSchema = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    "name": tour.title,
    "description": tour.description || tour.short_description,
    "url": tourUrl,
    // ImageObject with AI-generated metadata for search engines
    ...(tour.hero_image || tour.images?.[0] ? {
      "image": {
        "@type": "ImageObject",
        "url": tour.hero_image || tour.images?.[0],
        "width": 1200,
        "height": 630,
        ...(imageMetadata?.description && { "caption": imageMetadata.description }),
        ...(imageMetadata?.alt_text && { "description": imageMetadata.alt_text })
      }
    } : {}),
    "offers": {
      "@type": "Offer",
      "price": tour.price,
      "priceCurrency": tour.currency,
      "availability": tour.is_active ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "validFrom": new Date().toISOString(),
      "url": tourUrl
    },
    "provider": {
      "@type": "Organization",
      "name": "MadeToHike",
      "url": baseUrl
    },
    "touristType": "Hiker",
    "itinerary": tour.highlights?.map((highlight, index) => ({
      "@type": "Place",
      "name": highlight,
      "position": index + 1
    }))
  };

  // Add rating if available
  if (tour.rating > 0 && tour.reviews_count > 0) {
    touristTripSchema["aggregateRating"] = {
      "@type": "AggregateRating",
      "ratingValue": tour.rating,
      "reviewCount": tour.reviews_count,
      "bestRating": 5,
      "worstRating": 1
    };
  }

  // Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "MadeToHike",
    "url": baseUrl,
    "logo": `${baseUrl}/logo.png`,
    "description": "Expert-led hiking adventures in Europe's most stunning mountain regions",
    "sameAs": [
      // Add social media URLs when available
    ]
  };

  // BreadcrumbList Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Tours",
        "item": `${baseUrl}/tours`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": tour.title,
        "item": tourUrl
      }
    ]
  };

  useEffect(() => {
    // Add structured data scripts to document head
    const scripts = [
      { id: 'schema-tourist-trip', data: touristTripSchema },
      { id: 'schema-organization', data: organizationSchema },
      { id: 'schema-breadcrumb', data: breadcrumbSchema }
    ];

    scripts.forEach(({ id, data }) => {
      let script = document.getElementById(id) as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.id = id;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(data);
    });

    // Cleanup function
    return () => {
      scripts.forEach(({ id }) => {
        const script = document.getElementById(id);
        if (script) {
          document.head.removeChild(script);
        }
      });
    };
  }, [touristTripSchema, organizationSchema, breadcrumbSchema]);

  return null;
}
