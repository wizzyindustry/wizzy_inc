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
    // SAMPLE links (example.com is reserved for examples).
    ...(category === 'web-development'
      ? { liveUrl: 'https://example.com/', repoUrl: 'https://example.com/sample-repo' }
      : { designUrl: 'https://example.com/sample-design' }),
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
  faq: [
    {
      q: s('How do I pay?', 'Nalipaje?'),
      a: s('Placeholder answer — not a real policy.', 'Jibu la mfano — si sera halisi.'),
    },
    {
      q: s('How many revisions are included?'),
      a: s('Placeholder answer — not a real policy.'),
    },
  ],
};

export const SAMPLE_LOGO_PATH = 'site/tools/sample-logo.svg';

/** About page text (settings/about). Placeholder only — the owner writes the real text. */
export const sampleAbout = {
  intro: s(
    'introduction to Panta-wizzy — edit this in Admin → About page.',
    'utangulizi wa Panta-wizzy — hariri hapa: Admin → About page.',
  ),
  graphicDesign: s('graphic design skills and experience.'),
  webDevelopment: s('web development skills and experience.'),
  tools: [{ name: 'Adobe Illustrator', logo: SAMPLE_LOGO_PATH }, { name: 'Figma' }],
};

export const SAMPLE_PARTNER_LOGO_PATH = 'site/partners/sample-partner.svg';

/**
 * Company facts (settings/company). Placeholders only — no real partners, numbers or names.
 * No founding year: a bare year cannot be marked SAMPLE, so that card stays hidden.
 */
export const sampleCompany = {
  story: s(
    'the story of how Wizzy Inc began — edit this in Admin → Company info.',
    'historia ya jinsi Wizzy Inc ilivyoanza — hariri hapa: Admin → Company info.',
  ),
  headquarters: s('city, Tanzania', 'mji, Tanzania'),
  founderName: 'SAMPLE: Founder name',
  partners: [
    { name: 'SAMPLE: Partner A', logo: SAMPLE_PARTNER_LOGO_PATH },
    { name: 'SAMPLE: Partner B' },
  ],
  impact: [
    { value: '10+', label: s('placeholder number', 'namba ya mfano') },
    { value: '99.9%', label: s('placeholder uptime', 'uptime ya mfano') },
  ],
  offices: [
    {
      name: s('Main office', 'Ofisi kuu'),
      address: s('street address, Dodoma', 'anwani, Dodoma'),
      latitude: -6.163,
      longitude: 35.7516,
    },
  ],
};

/** Placeholder logo (a plain circle) for the first sample tool card. */
export const SAMPLE_LOGO = Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#1d4ed8"/></svg>',
);

/** 1×1 transparent PNG used as a stand-in cover image. */
export const PLACEHOLDER_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

/**
 * SAMPLE leads for the admin inbox. Fake people, fake numbers. References use the year 2000
 * so they never clash with real numbering (counters/leads is not touched).
 */
const SAMPLE_DATE = new Date('2000-01-10T07:30:00Z');
export const SAMPLE_PDF = Buffer.from('%PDF-1.7\n% SAMPLE brief — not a real file\n');

export const sampleLeads = [
  {
    id: 'sample-lead-quote',
    ref: 'WZ-2000-0001',
    kind: 'quote',
    name: 'SAMPLE Client One',
    phone: '+255700000001',
    email: 'sample-client@example.test',
    preferredContact: 'whatsapp',
    locale: 'sw',
    serviceSlug: 'logo-design',
    description: 'SAMPLE: a logo for a small shop. Not a real request.',
    budgetRangeTZS: { min: 100_000, max: 300_000 },
    attachments: [
      {
        path: 'quotes/sample-lead-quote/1-sample-brief.pdf',
        name: 'sample-brief.pdf',
        size: SAMPLE_PDF.length,
        contentType: 'application/pdf',
      },
    ],
    status: 'new',
    statusHistory: [{ status: 'new', at: SAMPLE_DATE }],
    notes: [],
    createdAt: SAMPLE_DATE,
  },
  {
    id: 'sample-lead-contact',
    ref: 'WZ-2000-0002',
    kind: 'contact',
    name: 'SAMPLE Visitor Two',
    phone: '+255700000002',
    preferredContact: 'phone',
    locale: 'en',
    description: 'SAMPLE: do you print business cards? Not a real message.',
    attachments: [],
    status: 'new',
    statusHistory: [{ status: 'new', at: SAMPLE_DATE }],
    notes: [],
    createdAt: SAMPLE_DATE,
  },
];

/**
 * SAMPLE leads spread over recent months, so the admin analytics page has something to
 * show locally. Fake people; references in the year 2000 range (counter untouched).
 */
const monthsAgo = (n: number) => {
  const d = new Date();
  d.setUTCDate(10);
  d.setUTCMonth(d.getUTCMonth() - n);
  return d;
};
const RECENT: { months: number; status: string; service?: string }[] = [
  { months: 0, status: 'new', service: 'logo-design' },
  { months: 0, status: 'contacted' },
  { months: 1, status: 'won', service: 'logo-design' },
  { months: 1, status: 'quoted', service: 'business-websites' },
  { months: 2, status: 'lost', service: 'business-websites' },
  { months: 4, status: 'won', service: 'business-websites' },
  { months: 7, status: 'won', service: 'logo-design' },
];
export const sampleRecentLeads = RECENT.map((r, i) => {
  const at = monthsAgo(r.months);
  return {
    id: `sample-lead-recent-${i + 1}`,
    ref: `WZ-2000-${String(i + 3).padStart(4, '0')}`,
    kind: r.service ? 'quote' : 'contact',
    name: `SAMPLE Analytics ${i + 1}`,
    phone: `+2557000001${String(i).padStart(2, '0')}`,
    preferredContact: 'whatsapp',
    locale: 'en',
    ...(r.service && { serviceSlug: r.service }),
    description: 'SAMPLE: for the analytics page. Not a real request.',
    attachments: [],
    status: r.status,
    statusHistory: [{ status: r.status, at }],
    notes: [],
    createdAt: at,
  };
});
