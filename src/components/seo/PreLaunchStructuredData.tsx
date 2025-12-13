import { Helmet } from 'react-helmet-async';

/**
 * PreLaunchStructuredData Component
 * 
 * Adds JSON-LD structured data for the Coming Soon page to enhance SEO
 * Includes Organization, WebSite, and Person (Founder) schemas
 */
export function PreLaunchStructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "name": "Made to Hike",
    "description": "Europe's premium marketplace connecting certified IFMGA and IML mountain guides with adventure seekers across the Alps, Dolomites, Pyrenees, and Scottish Highlands.",
    "url": "https://madetohike.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://madetohike.com/logo.png",
      "width": 512,
      "height": 512
    },
    "image": "https://madetohike.com/og-default.jpg",
    "foundingDate": "2025",
    "founder": {
      "@type": "Person",
      "name": "Michel Visser",
      "jobTitle": "Mountain Guide & Founder",
      "sameAs": []
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "EU"
    },
    "areaServed": [
      {
        "@type": "Place",
        "name": "European Alps"
      },
      {
        "@type": "Place",
        "name": "Italian Dolomites"
      },
      {
        "@type": "Place",
        "name": "Spanish Pyrenees"
      },
      {
        "@type": "Place",
        "name": "Scottish Highlands"
      }
    ],
    "knowsAbout": [
      "Mountain Guiding",
      "IFMGA Certification",
      "IML Mountain Leadership",
      "Alpine Hiking",
      "Mountain Safety"
    ]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Made to Hike",
    "url": "https://madetohike.com",
    "description": "Europe's premium marketplace for certified mountain guides",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://madetohike.com/guides?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const founderSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Michel Visser",
    "jobTitle": "Mountain Guide & Founder",
    "description": "UK Mountain Leader and founder of Made to Hike, Europe's guide-centric marketplace for authentic mountain adventures.",
    "knowsAbout": [
      "Mountain Leadership",
      "UK Mountain Leader Certification",
      "Hiking Guide Training",
      "Mountain Safety"
    ],
    "memberOf": {
      "@type": "Organization",
      "name": "Made to Hike"
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(founderSchema)}
      </script>
    </Helmet>
  );
}
