import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GA_MEASUREMENT_ID = 'G-EFZV9HKEK3';

export const Analytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Only load in production
    if (typeof window === 'undefined' || !GA_MEASUREMENT_ID) {
      return;
    }

    // Load GA4 script if not already loaded
    if (!window.gtag) {
      // Google tag (gtag.js)
      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      document.head.appendChild(script1);

      const script2 = document.createElement('script');
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_MEASUREMENT_ID}');
      `;
      document.head.appendChild(script2);
    }
  }, []);

  // Track page views on route change
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: location.pathname,
      });
    }
  }, [location]);

  return null;
};