/**
 * SAMPLE DATA — for the local emulator only. Not real content.
 * Every text says "SAMPLE" and prices are obvious placeholders so nothing here can be
 * mistaken for real services, prices, clients or testimonials (ARCHITECTURE-ESSENTIAL §7).
 * Service names follow the list in PRD §5.
 */
import type { BilingualText, ServiceCategory } from '@/lib/schemas/common';

const s = (en: string, sw = ''): BilingualText => ({
  en: `SAMPLE: ${en}`,
  sw: sw && `SAMPLE: ${sw}`,
});

type ServiceSeed = { slug: string; category: ServiceCategory; en: string; sw: string };

const SERVICES: ServiceSeed[] = [
  {
    slug: 'logo-design',
    category: 'graphic-design',
    en: 'Logo design & brand identity',
    sw: 'Usanifu wa nembo na utambulisho',
  },
  {
    slug: 'posters-flyers-banners',
    category: 'graphic-design',
    en: 'Posters, flyers & banners',
    sw: 'Mabango na vipeperushi',
  },
  {
    slug: 'social-media-graphics',
    category: 'graphic-design',
    en: 'Social media graphics',
    sw: 'Michoro ya mitandao ya kijamii',
  },
  {
    slug: 'business-cards-stationery',
    category: 'graphic-design',
    en: 'Business cards & stationery',
    sw: 'Kadi za biashara na vifaa vya ofisi',
  },
  {
    slug: 'event-branding',
    category: 'graphic-design',
    en: 'Event branding',
    sw: 'Utambulisho wa matukio',
  },
  {
    slug: 'landing-pages',
    category: 'web-development',
    en: 'Landing pages',
    sw: 'Kurasa za kutua',
  },
  {
    slug: 'business-websites',
    category: 'web-development',
    en: 'Business websites',
    sw: 'Tovuti za biashara',
  },
  {
    slug: 'portfolio-websites',
    category: 'web-development',
    en: 'Portfolio websites',
    sw: 'Tovuti za kazi binafsi',
  },
  {
    slug: 'ecommerce-catalogue',
    category: 'web-development',
    en: 'E-commerce / product catalogue',
    sw: 'Tovuti za mauzo / katalogi',
  },
  {
    slug: 'website-maintenance',
    category: 'web-development',
    en: 'Website maintenance',
    sw: 'Matengenezo ya tovuti',
  },
  {
    slug: 'website-redesign',
    category: 'web-development',
    en: 'Website redesign',
    sw: 'Kusanifu upya tovuti',
  },
];

export const sampleServices = SERVICES.map((svc, i) => ({
  id: svc.slug,
  slug: svc.slug,
  category: svc.category,
  title: s(svc.en, svc.sw),
  summary: s(`Short summary for ${svc.en}.`, i % 2 === 0 ? `Muhtasari wa ${svc.sw}.` : ''),
  body: s(`Full description placeholder for **${svc.en}**. Replace via the admin panel.`),
  inclusions: { en: ['SAMPLE inclusion 1', 'SAMPLE inclusion 2'], sw: [] },
  turnaroundDays: { min: 2, max: 7 },
  startingPriceTZS: 1000 * (i + 1),
  icon: svc.category === 'graphic-design' ? 'palette' : 'code',
  order: i + 1,
  published: true,
  faq: [{ q: s('Example question?'), a: s('Example answer.') }],
}));

const TIERS = ['basic', 'standard', 'premium'] as const;
const CATEGORIES: ServiceCategory[] = ['graphic-design', 'web-development'];

export const samplePackages = CATEGORIES.flatMap((category, c) =>
  TIERS.map((tier, t) => ({
    id: `${category}-${tier}`,
    category,
    tier,
    name: s(`${tier} package`, `kifurushi ${tier}`),
    priceTZS: 1000 * (c * 3 + t + 1),
    features: { en: [`SAMPLE feature A (${tier})`, `SAMPLE feature B (${tier})`], sw: [] },
    revisions: t + 1,
    deliveryDays: 3 + t * 4,
    highlighted: tier === 'standard',
    order: t + 1,
    published: true,
  })),
);

export const samplePortfolio = [1, 2, 3, 4].map((n) => {
  const category: ServiceCategory = n % 2 === 1 ? 'graphic-design' : 'web-development';
  return {
    id: `sample-project-${n}`,
    slug: `sample-project-${n}`,
    category,
    serviceSlugs: [category === 'graphic-design' ? 'logo-design' : 'business-websites'],
    title: s(`Project ${n}`, `Mradi ${n}`),
    clientType: 'SAMPLE client type',
    problem: s('Problem placeholder.'),
    solution: s('Solution placeholder.'),
    tools: category === 'graphic-design' ? ['Illustrator'] : ['Next.js'],
    coverImage: `portfolio/sample-project-${n}/cover.png`,
    gallery: [],
    featured: n <= 3,
    isPersonalProject: true,
    published: n !== 4, // one draft, to prove unpublished items stay hidden
    completedAt: new Date(Date.UTC(2026, n, 1)),
    order: n,
  };
});

export const sampleTestimonials = [
  {
    id: 'sample-testimonial-1',
    name: 'SAMPLE — not a real client',
    role: 'SAMPLE role',
    quote: s('Placeholder testimonial for development only.'),
    consentGiven: true as const,
    published: true,
  },
];

export const sampleSettings = {
  phone: '+255700000000',
  whatsappNumber: '255700000000',
  email: 'sample@example.com',
  location: { en: 'Dodoma, Tanzania', sw: 'Dodoma, Tanzania' },
  workingHours: s('Mon–Sat, 08:00–18:00', 'Jumatatu–Jumamosi, 08:00–18:00'),
  socialLinks: {},
  hero: {
    headline: s(
      'Design and websites that help your business grow',
      'Michoro na tovuti zinazokuza biashara yako',
    ),
    subheadline: s('Sub-headline placeholder.'),
  },
};

/** 1×1 transparent PNG used as a stand-in cover image. */
export const PLACEHOLDER_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);
