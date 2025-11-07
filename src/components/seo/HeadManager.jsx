import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { getRouteByPath, SITE_URL } from './routes';
import { SchemaBuilder, injectSchema } from './SchemaBuilder';

export const HeadManager = ({ customMeta = {} }) => {
  const location = useLocation();
  const route = getRouteByPath(location.pathname);
  
  const meta = useMemo(() => ({
    ...route,
    ...customMeta
  }), [route, customMeta]);

  const canonicalUrl = useMemo(() => `${SITE_URL}${location.pathname}`, [location.pathname]);
  const locales = useMemo(() => ['en-IN', 'hi-IN', 'mr-IN', 'es'], []);

  useEffect(() => {
    // Set title
    document.title = meta.title;

    // Remove existing meta tags
    const existingMetas = document.querySelectorAll('[data-healsy-head]');
    existingMetas.forEach(el => el.remove());

    // Helper to create meta tag
    const addMeta = (attrs) => {
      const meta = document.createElement('meta');
      Object.entries(attrs).forEach(([key, value]) => {
        meta.setAttribute(key, value);
      });
      meta.setAttribute('data-healsy-head', 'true');
      document.head.appendChild(meta);
    };

    // Helper to create link tag
    const addLink = (attrs) => {
      const link = document.createElement('link');
      Object.entries(attrs).forEach(([key, value]) => {
        link.setAttribute(key, value);
      });
      link.setAttribute('data-healsy-head', 'true');
      document.head.appendChild(link);
    };

    // Basic meta tags
    addMeta({ name: 'description', content: meta.description });
    addMeta({ name: 'keywords', content: meta.keywords || '' });
    addMeta({ name: 'robots', content: meta.noindex ? 'noindex, nofollow' : 'index, follow' });
    addMeta({ name: 'googlebot', content: meta.noindex ? 'noindex, nofollow' : 'index, follow' });

    // Google Search Console Verification - NEW
    addMeta({ name: 'google-site-verification', content: 'zP0ysWQXApCDYs81GOzTqKOuLhkqEDOpcF0mNuTQqrs' });

    // Canonical
    addLink({ rel: 'canonical', href: canonicalUrl });

    // Open Graph
    addMeta({ property: 'og:type', content: 'website' });
    addMeta({ property: 'og:url', content: canonicalUrl });
    addMeta({ property: 'og:title', content: meta.title });
    addMeta({ property: 'og:description', content: meta.description });
    addMeta({ property: 'og:image', content: meta.ogImage });
    addMeta({ property: 'og:image:width', content: '1200' });
    addMeta({ property: 'og:image:height', content: '630' });
    addMeta({ property: 'og:site_name', content: 'Healsy AI' });
    addMeta({ property: 'og:locale', content: 'en_IN' });

    // Twitter Card
    addMeta({ name: 'twitter:card', content: 'summary_large_image' });
    addMeta({ name: 'twitter:url', content: canonicalUrl });
    addMeta({ name: 'twitter:title', content: meta.title });
    addMeta({ name: 'twitter:description', content: meta.description });
    addMeta({ name: 'twitter:image', content: meta.ogImage });

    // hreflang alternates
    locales.forEach(locale => {
      addLink({
        rel: 'alternate',
        hreflang: locale,
        href: `${SITE_URL}${location.pathname}?lang=${locale}`
      });
    });

    // Preconnect to external resources
    addLink({ rel: 'preconnect', href: 'https://fonts.googleapis.com' });
    addLink({ rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' });
    addLink({ rel: 'dns-prefetch', href: 'https://www.googletagmanager.com' });

  }, [location.pathname, meta, canonicalUrl, locales]);

  // Inject JSON-LD schemas
  useEffect(() => {
    if (location.pathname === '/') {
      // Home page schemas
      injectSchema(SchemaBuilder.website());
      injectSchema(SchemaBuilder.organization());
      injectSchema(SchemaBuilder.softwareApplication());
    } else {
      // Feature pages - breadcrumb
      const breadcrumbItems = [
        { name: 'Home', path: '/' },
        { name: meta.title.split('|')[0].trim(), path: location.pathname }
      ];
      injectSchema(SchemaBuilder.breadcrumb(breadcrumbItems));
    }
  }, [location.pathname, meta.title]);

  return null;
}