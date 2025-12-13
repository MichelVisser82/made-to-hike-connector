import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Crawler detection regex
const CRAWLER_USER_AGENTS = /facebookexternalhit|Facebot|Twitterbot|TwitterBot|LinkedInBot|Slackbot-LinkExpanding|WhatsApp|TelegramBot|Discordbot|Googlebot|bingbot|Applebot|Pinterest|Embedly|outbrain|quora|vkShare|W3C_Validator/i

interface PageData {
  title: string
  description: string
  image: string
  imageAlt: string
  url: string
  type: string
  price?: string
  currency?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const path = url.searchParams.get('path') || '/'
    const userAgent = req.headers.get('user-agent') || ''
    
    console.log(`OG Handler - Path: ${path}, User-Agent: ${userAgent}`)

    // Check if request is from a crawler
    const isCrawler = CRAWLER_USER_AGENTS.test(userAgent)
    
    if (!isCrawler) {
      // Not a crawler - return minimal response indicating to serve the SPA
      return new Response(JSON.stringify({ 
        isCrawler: false,
        message: 'Not a crawler, serve SPA normally' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Determine page type and fetch data
    let pageData: PageData | null = null

    // Tour pages: /tours/:slug
    const tourMatch = path.match(/^\/tours\/([^\/]+)\/?$/)
    if (tourMatch) {
      const slug = tourMatch[1]
      pageData = await fetchTourData(supabase, slug)
    }

    // Guide pages: /guides/:slug
    const guideMatch = path.match(/^\/guides\/([^\/]+)\/?$/)
    if (guideMatch) {
      const slug = guideMatch[1]
      pageData = await fetchGuideData(supabase, slug)
    }

    // Region pages: /regions/:region
    const regionMatch = path.match(/^\/regions\/([^\/]+)\/?$/)
    if (regionMatch) {
      const region = regionMatch[1]
      pageData = await fetchRegionData(supabase, region)
    }

    // Default fallback for other pages
    if (!pageData) {
      pageData = getDefaultPageData(path)
    }

    // Generate HTML with OG tags
    const html = generateOGHtml(pageData)

    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })

  } catch (error) {
    console.error('OG Handler Error:', error)
    
    // Return default OG tags on error
    const fallbackHtml = generateOGHtml(getDefaultPageData('/'))
    return new Response(fallbackHtml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  }
})

async function fetchTourData(supabase: any, slug: string): Promise<PageData | null> {
  console.log(`Fetching tour data for slug: ${slug}`)
  
  const { data: tour, error } = await supabase
    .from('tours')
    .select('title, short_description, hero_image, images, region, price, currency, meta_title, meta_description, slug')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (error || !tour) {
    console.log(`Tour not found: ${slug}`, error)
    return null
  }

  const image = tour.hero_image || tour.images?.[0] || 'https://madetohike.com/og-tours.jpg'
  const regionFormatted = formatRegion(tour.region)
  
  return {
    title: tour.meta_title || `${tour.title} | ${regionFormatted} Hiking Tour | MadeToHike`,
    description: tour.meta_description || tour.short_description || `Book ${tour.title} - an authentic hiking experience in ${regionFormatted} with certified mountain guides.`,
    image: image,
    imageAlt: tour.short_description?.slice(0, 125) || `${tour.title} - ${regionFormatted} Hiking Tour`,
    url: `https://madetohike.com/tours/${tour.slug}`,
    type: 'product',
    price: tour.price?.toString(),
    currency: tour.currency || 'EUR',
  }
}

async function fetchGuideData(supabase: any, slug: string): Promise<PageData | null> {
  console.log(`Fetching guide data for slug: ${slug}`)
  
  const { data: guide, error } = await supabase
    .from('guide_profiles')
    .select('display_name, bio, profile_image_url, hero_background_url, location, slug, verified')
    .eq('slug', slug)
    .maybeSingle()

  if (error || !guide) {
    console.log(`Guide not found: ${slug}`, error)
    return null
  }

  const image = guide.hero_background_url || guide.profile_image_url || 'https://madetohike.com/og-guides.jpg'
  
  return {
    title: `${guide.display_name} | Certified Mountain Guide | MadeToHike`,
    description: guide.bio?.slice(0, 155) || `Book hiking tours with ${guide.display_name}, a certified mountain guide${guide.location ? ` based in ${guide.location}` : ''}.`,
    image: image,
    imageAlt: `${guide.display_name} - Certified Mountain Guide`,
    url: `https://madetohike.com/guides/${guide.slug}`,
    type: 'profile',
  }
}

async function fetchRegionData(supabase: any, regionSlug: string): Promise<PageData | null> {
  console.log(`Fetching region data for: ${regionSlug}`)
  
  // Fetch a representative tour from this region for the image
  const { data: tours, error } = await supabase
    .from('tours')
    .select('hero_image, images, region')
    .ilike('region', `%${regionSlug.replace(/-/g, ' ')}%`)
    .eq('is_active', true)
    .limit(1)

  const regionFormatted = formatRegion(regionSlug)
  const image = tours?.[0]?.hero_image || tours?.[0]?.images?.[0] || 'https://madetohike.com/og-default.jpg'
  
  return {
    title: `${regionFormatted} Hiking Tours | Certified Guides | MadeToHike`,
    description: `Discover authentic hiking adventures in ${regionFormatted} with certified IFMGA & IML mountain guides. Book your next mountain experience.`,
    image: image,
    imageAlt: `${regionFormatted} Hiking Tours with Certified Guides`,
    url: `https://madetohike.com/regions/${regionSlug}`,
    type: 'website',
  }
}

function getDefaultPageData(path: string): PageData {
  // Page-specific defaults
  if (path === '/tours' || path.startsWith('/tours')) {
    return {
      title: 'Hiking Tours | Certified Mountain Guides | MadeToHike',
      description: 'Browse authentic hiking tours across Europe with certified IFMGA & IML mountain guides. Scottish Highlands, Dolomites, Pyrenees and more.',
      image: 'https://madetohike.com/og-tours.jpg',
      imageAlt: 'Hiking Tours with Certified Mountain Guides',
      url: 'https://madetohike.com/tours',
      type: 'website',
    }
  }

  if (path === '/guides' || path.startsWith('/guides')) {
    return {
      title: 'Certified Mountain Guides | MadeToHike',
      description: 'Connect with certified IFMGA & IML mountain guides across Europe. Find your perfect guide for alpine adventures.',
      image: 'https://madetohike.com/og-guides.jpg',
      imageAlt: 'Certified Mountain Guides on MadeToHike',
      url: 'https://madetohike.com/guides',
      type: 'website',
    }
  }

  // Homepage/default
  return {
    title: 'Made to Hike - Europe\'s Premium Mountain Guide Marketplace',
    description: 'Connect with certified IFMGA & IML mountain guides for authentic alpine adventures across Europe. Book hiking tours in the Scottish Highlands, Dolomites, Pyrenees and more.',
    image: 'https://madetohike.com/og-default.jpg',
    imageAlt: 'Made to Hike - Certified Mountain Guides Europe',
    url: 'https://madetohike.com',
    type: 'website',
  }
}

function formatRegion(region: string): string {
  if (!region) return 'Europe'
  
  const regionMap: Record<string, string> = {
    'scotland': 'Scottish Highlands',
    'scottish-highlands': 'Scottish Highlands',
    'dolomites': 'Dolomites',
    'pyrenees': 'Pyrenees',
    'alps': 'Alps',
    'austria': 'Austrian Alps',
    'switzerland': 'Swiss Alps',
  }
  
  const lowerRegion = region.toLowerCase().replace(/\s+/g, '-')
  return regionMap[lowerRegion] || region.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function generateOGHtml(data: PageData): string {
  const productTags = data.type === 'product' && data.price ? `
    <meta property="product:price:amount" content="${data.price}" />
    <meta property="product:price:currency" content="${data.currency || 'EUR'}" />
  ` : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  
  <!-- Primary Meta Tags -->
  <title>${escapeHtml(data.title)}</title>
  <meta name="title" content="${escapeHtml(data.title)}" />
  <meta name="description" content="${escapeHtml(data.description)}" />
  <meta name="robots" content="index, follow" />
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="${data.type}" />
  <meta property="og:site_name" content="MadeToHike" />
  <meta property="og:url" content="${data.url}" />
  <meta property="og:title" content="${escapeHtml(data.title)}" />
  <meta property="og:description" content="${escapeHtml(data.description)}" />
  <meta property="og:image" content="${data.image}" />
  <meta property="og:image:alt" content="${escapeHtml(data.imageAlt)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:locale" content="en_EU" />
  ${productTags}
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${data.url}" />
  <meta name="twitter:title" content="${escapeHtml(data.title)}" />
  <meta name="twitter:description" content="${escapeHtml(data.description)}" />
  <meta name="twitter:image" content="${data.image}" />
  <meta name="twitter:image:alt" content="${escapeHtml(data.imageAlt)}" />
  
  <!-- Canonical -->
  <link rel="canonical" href="${data.url}" />
  
  <!-- Favicon -->
  <link rel="icon" type="image/png" href="https://madetohike.com/logo.png" />
</head>
<body>
  <h1>${escapeHtml(data.title)}</h1>
  <p>${escapeHtml(data.description)}</p>
  <img src="${data.image}" alt="${escapeHtml(data.imageAlt)}" />
  <p><a href="${data.url}">View on MadeToHike</a></p>
</body>
</html>`
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
