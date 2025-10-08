import { Helmet } from 'react-helmet-async';
import { GuidesSearchPage } from '@/components/pages/GuidesSearchPage';

export default function GuidesPage() {
  return (
    <>
      <Helmet>
        <title>Find Mountain Guides | Certified Hiking Guides Across Europe | MadeToHike</title>
        <meta 
          name="description" 
          content="Browse certified mountain guides across Europe. Connect with IFMGA, UIMLA, and nationally certified guides for hiking, mountaineering, and alpine adventures in the Scottish Highlands, Alps, Dolomites, and Pyrenees." 
        />
        <meta 
          name="keywords" 
          content="mountain guides, hiking guides, IFMGA, UIMLA, certified guides, alpine guides, Europe, Scottish Highlands, Alps, Dolomites, Pyrenees, winter hiking, mountaineering guides" 
        />
        <link rel="canonical" href="https://madetohike.com/guides" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Find Mountain Guides | Certified Guides Across Europe" />
        <meta property="og:description" content="Browse certified mountain guides for hiking and alpine adventures across Europe." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://madetohike.com/guides" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Find Mountain Guides | MadeToHike" />
        <meta name="twitter:description" content="Browse certified mountain guides across Europe for unforgettable hiking adventures." />
      </Helmet>

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Mountain Guides Directory",
          "description": "Browse certified mountain guides across Europe for hiking and alpine adventures",
          "url": "https://madetohike.com/guides",
          "publisher": {
            "@type": "Organization",
            "name": "MadeToHike",
            "url": "https://madetohike.com"
          }
        })}
      </script>

      <GuidesSearchPage />
    </>
  );
}
