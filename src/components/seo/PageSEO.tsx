import { Helmet } from 'react-helmet-async';

interface PageSEOProps {
  /** Page title - used for browser tab and social sharing */
  title: string;
  
  /** Page description - used for meta description and social sharing */
  description: string;
  
  /** Canonical URL for this page */
  canonicalUrl?: string;
  
  /** Open Graph image URL */
  ogImage?: string;
  
  /** Alt text for OG image - should come from content, not image AI metadata */
  ogImageAlt?: string;
  
  /** Open Graph type */
  ogType?: 'website' | 'article' | 'profile' | 'product';
  
  /** Keywords for meta keywords tag */
  keywords?: string;
  
  /** Structured data (JSON-LD) */
  structuredData?: object;
}

/**
 * Reusable SEO component for consistent meta tags across pages
 * 
 * Priority: Content-first approach
 * - Use page/content descriptions for og:description
 * - Use content-derived text for og:image:alt
 * - Only use image AI metadata in structured data (ImageObject)
 */
export function PageSEO({
  title,
  description,
  canonicalUrl,
  ogImage,
  ogImageAlt,
  ogType = 'website',
  keywords,
  structuredData
}: PageSEOProps) {
  const baseUrl = 'https://madetohike.com';
  const finalOgImage = ogImage || `${baseUrl}/og-default.jpg`;
  const finalImageAlt = ogImageAlt || title;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:image" content={finalOgImage} />
      <meta property="og:image:alt" content={finalImageAlt} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/jpeg" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={finalOgImage} />
      <meta name="twitter:image:alt" content={finalImageAlt} />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}
