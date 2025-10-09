# Launch SEO Transition Checklist

This document outlines the steps needed to transition from pre-launch SEO configuration to full website SEO when `IS_LAUNCHED` is set to `true`.

## Pre-Launch Configuration (Current State)

### What's Currently Active:
- ✅ Coming Soon page is indexable (noindex removed)
- ✅ All other pages blocked with noindex via SEOWrapper
- ✅ robots.txt blocks non-homepage paths
- ✅ Pre-launch sitemap active (sitemap-prelaunch.xml)
- ✅ Structured data on Coming Soon page
- ✅ FAQ section with FAQPage schema
- ✅ Optimized meta tags for organic traffic

### What Search Engines See:
- **Indexed**: Homepage only (madetohike.com/)
- **Blocked**: All tours, guides, auth, dashboard pages
- **Sitemap**: Points to sitemap-prelaunch.xml (1 URL only)

---

## Launch Day Steps (When IS_LAUNCHED = true)

### 1. Update Launch Configuration
**File**: `src/config/launchConfig.ts`
```typescript
export const IS_LAUNCHED = true; // Change from false to true
```

This single change will automatically:
- ✅ Remove noindex from all pages (via SEOWrapper)
- ✅ Show full app instead of Coming Soon page
- ✅ Allow search engines to index all public pages

### 2. Update robots.txt
**File**: `public/robots.txt`

**Change from**:
```
# Pre-launch configuration - Only allow homepage
User-agent: *
Allow: /$
Allow: /assets/
Disallow: /tours/
Disallow: /guides/
...
Sitemap: https://madetohike.com/sitemap-prelaunch.xml
```

**Change to**:
```
# Production configuration - Allow all public pages
User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /admin/
Disallow: /api/

Sitemap: https://madetohike.com/sitemap.xml
```

### 3. Generate Dynamic Sitemap
**Action Required**: Implement dynamic sitemap generation

The static `public/sitemap.xml` needs to be replaced with a dynamically generated sitemap that includes:
- Homepage
- Guides search page
- Certifications page
- All guide profiles (dynamically fetched from database)
- All tour pages (dynamically fetched from database)

**Recommended implementation**:
- Create API endpoint `/api/sitemap.xml` that queries database
- Or use a build-time generation script
- Include lastmod dates from database timestamps

### 4. Submit to Google Search Console
**Actions**:
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Remove old sitemap: `sitemap-prelaunch.xml`
3. Submit new sitemap: `sitemap.xml`
4. Request indexing for key pages:
   - Homepage
   - Guides search page
   - Top 10 guide profiles
   - Certifications page

### 5. Monitor Indexing Progress
**Check within 1-2 weeks**:
```
site:madetohike.com
```
Should show all public pages being indexed.

**Tools to monitor**:
- Google Search Console → Coverage report
- Google Search Console → Performance report
- Check for crawl errors

### 6. Update Structured Data (Optional Enhancement)
**Consider adding on launch**:
- Individual TouristTrip schemas for each tour page
- BreadcrumbList schemas for navigation
- Review/Rating aggregates for guides with reviews
- LocalBusiness schema if physical office exists

### 7. Social Media & Off-Page SEO
**Launch day actions**:
- Update social media profiles with live website link
- Post launch announcement across social channels
- Reach out to hiking blogs/media contacts
- Submit to relevant directories:
  - Mountain guide directories
  - Hiking resource websites
  - Travel platforms

### 8. Performance Check
**Verify on launch**:
- Core Web Vitals scores (use PageSpeed Insights)
- All images loading correctly
- No broken links (use Screaming Frog or similar)
- Meta tags rendering correctly on all pages
- Structured data validates (use Google Rich Results Test)

---

## Post-Launch SEO Enhancements

### Week 1 After Launch:
- [ ] Monitor Google Search Console for crawl errors
- [ ] Check that key pages are being indexed
- [ ] Verify structured data appears correctly in search results
- [ ] Monitor page load speeds and Core Web Vitals

### Week 2-4:
- [ ] Start content marketing (blog posts about mountain guiding)
- [ ] Reach out for backlinks from hiking/travel websites
- [ ] Optimize underperforming pages based on Search Console data
- [ ] Add more structured data to individual pages

### Ongoing:
- [ ] Regular content updates
- [ ] Monitor keyword rankings
- [ ] Build quality backlinks
- [ ] Update sitemap as new guides/tours are added
- [ ] Respond to user reviews (for local SEO)

---

## SEO Configuration Reference

### Environment Variables Needed:
```env
VITE_SITE_URL=https://madetohike.com
```

### Files with SEO Impact:
1. `src/config/launchConfig.ts` - Main launch toggle
2. `public/robots.txt` - Search engine access control
3. `public/sitemap.xml` - URL discovery for search engines
4. `src/components/seo/SEOWrapper.tsx` - Dynamic noindex control
5. `src/components/seo/PreLaunchStructuredData.tsx` - Structured data
6. `index.html` - Base meta tags

### Verification Tools:
- [Google Search Console](https://search.google.com/search-console)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [XML Sitemap Validator](https://www.xml-sitemaps.com/validate-xml-sitemap.html)

---

## Rollback Plan (If Issues Occur)

If you need to revert to pre-launch mode:

1. Set `IS_LAUNCHED = false` in `src/config/launchConfig.ts`
2. Revert `public/robots.txt` to pre-launch version
3. Update sitemap link in robots.txt to `sitemap-prelaunch.xml`
4. Request de-indexing in Google Search Console (if needed)

This will immediately hide the full site and return to Coming Soon page.

---

## Success Metrics

### Week 1 Post-Launch:
- Homepage indexed in Google
- Key pages appearing in search results
- No critical crawl errors
- Core Web Vitals passing

### Month 1 Post-Launch:
- 10+ pages indexed
- Appearing for branded searches ("Made to Hike")
- Initial organic traffic (even if small)
- Structured data showing in SERPs

### Month 3 Post-Launch:
- 50+ pages indexed
- Ranking for some long-tail keywords
- Growing organic traffic
- Guide profiles appearing in search results

---

**Last Updated**: 2025-10-09
**Status**: Pre-launch SEO configuration active
