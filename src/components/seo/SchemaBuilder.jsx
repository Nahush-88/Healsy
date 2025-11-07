// JSON-LD Schema Builder Utilities
import { SITE_URL, SITE_NAME } from './routes';

export const SchemaBuilder = {
  website: () => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": SITE_NAME,
    "url": SITE_URL,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${SITE_URL}/?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  }),

  organization: () => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": SITE_NAME,
    "url": SITE_URL,
    "logo": `${SITE_URL}/logo.png`,
    "description": "AI-powered health and wellness platform",
    "sameAs": [
      "https://twitter.com/healsyai",
      "https://facebook.com/healsyai",
      "https://instagram.com/healsyai"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Support",
      "email": "support@healsy.ai"
    }
  }),

  softwareApplication: () => ({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": SITE_NAME,
    "applicationCategory": "HealthApplication",
    "operatingSystem": "Web Browser, iOS, Android",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR",
      "category": "Freemium"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1250",
      "bestRating": "5",
      "worstRating": "1"
    },
    "description": "AI-powered health & fitness assistant for tracking nutrition, sleep, mood, and exercise with personalized insights."
  }),

  breadcrumb: (items) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${SITE_URL}${item.path}`
    }))
  }),

  faqPage: (faqs) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }),

  article: ({ title, description, image, datePublished, dateModified, author }) => ({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "image": image,
    "datePublished": datePublished,
    "dateModified": dateModified || datePublished,
    "author": {
      "@type": "Person",
      "name": author || SITE_NAME
    },
    "publisher": {
      "@type": "Organization",
      "name": SITE_NAME,
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/logo.png`
      }
    }
  })
};

export const injectSchema = (schema) => {
  if (typeof window === 'undefined') return;
  
  const scriptId = `schema-${schema['@type']}`;
  let scriptElement = document.getElementById(scriptId);
  
  if (scriptElement) {
    scriptElement.textContent = JSON.stringify(schema);
  } else {
    scriptElement = document.createElement('script');
    scriptElement.id = scriptId;
    scriptElement.type = 'application/ld+json';
    scriptElement.textContent = JSON.stringify(schema);
    document.head.appendChild(scriptElement);
  }
};