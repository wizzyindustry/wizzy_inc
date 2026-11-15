import { localized } from '@/lib/i18n/localized';
import type { Locale } from '@/lib/i18n/routing';
import type { PortfolioItem, Service, SiteSettings } from '@/lib/schemas/content';
import { storageUrl } from '@/lib/utils/storage-url';
import { absoluteUrl, SITE_URL } from './site-url';

/*
 * Structured data (schema.org JSON-LD) for search engines — ARCHITECTURE §9.
 * Only facts we actually have: the business is in Dodoma (PRD); phone, email and social
 * links come from settings/site and are left out until the owner fills them in.
 */

type JsonLd = Record<string, unknown>;

const BUSINESS_NAME = 'Wizzy Inc';
const BUSINESS_ID = `${SITE_URL}/#business`;

/** Reference to the business node, used as provider/creator on other pages. */
const businessRef = { '@type': 'ProfessionalService', '@id': BUSINESS_ID, name: BUSINESS_NAME };

export function businessJsonLd(
  settings: SiteSettings | null,
  locale: Locale,
  description: string,
): JsonLd {
  const sameAs = Object.values(settings?.socialLinks ?? {});
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': BUSINESS_ID,
    name: BUSINESS_NAME,
    description,
    url: absoluteUrl(`/${locale}`),
    image: absoluteUrl(`/${locale}/opengraph-image`),
    address: { '@type': 'PostalAddress', addressLocality: 'Dodoma', addressCountry: 'TZ' },
    areaServed: { '@type': 'Country', name: 'Tanzania' },
    knowsLanguage: ['en', 'sw'],
    ...(settings && { telephone: settings.phone, email: settings.email }),
    ...(sameAs.length > 0 && { sameAs }),
  };
}

export function serviceJsonLd(service: Service, locale: Locale): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: localized(service.title, locale),
    description: localized(service.summary, locale),
    url: absoluteUrl(`/${locale}/services/${service.slug}`),
    provider: businessRef,
    areaServed: { '@type': 'Country', name: 'Tanzania' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'TZS',
      priceSpecification: {
        '@type': 'PriceSpecification',
        minPrice: service.startingPriceTZS,
        priceCurrency: 'TZS',
      },
    },
  };
}

/** FAQPage for a service's questions; null when there are none. */
export function faqJsonLd(faq: Service['faq'], locale: Locale): JsonLd | null {
  if (faq.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(({ q, a }) => ({
      '@type': 'Question',
      name: localized(q, locale),
      acceptedAnswer: { '@type': 'Answer', text: localized(a, locale) },
    })),
  };
}

export function creativeWorkJsonLd(item: PortfolioItem, locale: Locale): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: localized(item.title, locale),
    description: localized(item.problem, locale),
    url: absoluteUrl(`/${locale}/portfolio/${item.slug}`),
    image: storageUrl(item.coverImage),
    dateCreated: item.completedAt.toISOString().slice(0, 10),
    creator: businessRef,
    ...(item.tools.length > 0 && { keywords: item.tools.join(', ') }),
  };
}

/**
 * JSON for a <script type="application/ld+json">. "<" is escaped so content from the
 * database can never close the script tag (no HTML injection).
 */
export function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
