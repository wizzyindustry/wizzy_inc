import type { Metadata } from 'next';
import Image from 'next/image';
import { Camera, Download, FileText, Shapes, UserRound, type LucideIcon } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CopyButton } from '@/components/press/CopyButton';
import { SOCIAL_NETWORKS, SocialIcon, type SocialNetwork } from '@/components/ui/SocialIcon';
import { getPressPage } from '@/lib/data/press';
import { localized } from '@/lib/i18n/localized';
import { pageMetadata, toLocale } from '@/lib/i18n/metadata';
import type { Locale } from '@/lib/i18n/routing';
import type { BrandColor, Leader, MediaResource } from '@/lib/schemas/content';
import { hexToRgb } from '@/lib/utils/color';
import { storageUrl } from '@/lib/utils/storage-url';

const KIND_ICONS: Record<MediaResource['kind'], LucideIcon> = {
  logo: Shapes,
  document: FileText,
  photo: Camera,
};

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'Press.meta' });
  return pageMetadata({ locale, path: '/press', title: t('title'), description: t('description') });
}

/**
 * Press page (Company menu): leadership, downloadable media (logos, licences, photos) and
 * brand colours. All edited in Admin → Press page; empty sections are not shown.
 */
export default async function PressPage({ params }: Props) {
  const locale = toLocale((await params).locale);
  setRequestLocale(locale);
  const t = await getTranslations('Press');
  const press = await getPressPage();
  const leaders = press?.leaders ?? [];
  const media = press?.media ?? [];
  const colors = press?.colors ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">{t('heading')}</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{t('intro')}</p>
      {leaders.length + media.length + colors.length === 0 && (
        <p className="mt-8 rounded-md bg-muted p-4">{t('empty')}</p>
      )}
      {leaders.length > 0 && <Leadership leaders={leaders} locale={locale} />}
      {media.length > 0 && <MediaResources media={media} locale={locale} />}
      {colors.length > 0 && <BrandColours colors={colors} locale={locale} />}
    </div>
  );
}

async function Leadership({ leaders, locale }: { leaders: Leader[]; locale: Locale }) {
  const t = await getTranslations('Press');
  return (
    <section aria-labelledby="leadership-heading" className="mt-12">
      <h2 id="leadership-heading" className="font-display text-2xl font-bold">
        {t('leadership')}
      </h2>
      <ul className="mt-6 grid gap-6 md:grid-cols-2">
        {leaders.map((person, i) => {
          const links: { network: SocialNetwork; href: string }[] = [
            ...(person.email
              ? [{ network: 'email' as const, href: `mailto:${person.email}` }]
              : []),
            ...SOCIAL_NETWORKS.flatMap((network) =>
              person[network] ? [{ network, href: person[network]! }] : [],
            ),
          ];
          return (
            <li
              key={i}
              className="lift flex flex-col gap-4 rounded-lg border border-border p-6 sm:flex-row"
            >
              <div className="relative size-28 shrink-0 overflow-hidden rounded-full bg-muted">
                {person.photo ? (
                  <Image
                    src={storageUrl(person.photo)}
                    alt={t('photoOf', { name: person.name })}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                ) : (
                  <UserRound
                    aria-hidden="true"
                    className="absolute inset-0 m-auto size-12 text-primary"
                  />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold">{person.name}</h3>
                <p className="text-sm font-medium text-primary">{localized(person.role, locale)}</p>
                {person.bio && (
                  <p className="text-sm whitespace-pre-line text-muted-foreground">
                    {localized(person.bio, locale)}
                  </p>
                )}
                {links.length > 0 && (
                  <ul className="mt-1 flex flex-wrap gap-1">
                    {links.map(({ network, href }) => (
                      <li key={network}>
                        <a
                          href={href}
                          {...(network === 'email'
                            ? {}
                            : { target: '_blank', rel: 'noopener noreferrer' })}
                          aria-label={t('socialLink', {
                            name: person.name,
                            network: t(`networks.${network}`),
                          })}
                          title={t(`networks.${network}`)}
                          className="inline-flex size-10 items-center justify-center rounded-full border border-border text-foreground hover:border-primary hover:text-primary"
                        >
                          <SocialIcon network={network} />
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

async function MediaResources({ media, locale }: { media: MediaResource[]; locale: Locale }) {
  const t = await getTranslations('Press');
  return (
    <section aria-labelledby="media-heading" className="mt-12">
      <h2 id="media-heading" className="font-display text-2xl font-bold">
        {t('media')}
      </h2>
      <p className="mt-2 text-muted-foreground">{t('mediaIntro')}</p>
      <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {media.map((item, i) => {
          const Icon = KIND_ICONS[item.kind];
          const isPdf = item.file.endsWith('.pdf');
          const title = localized(item.title, locale);
          return (
            <li
              key={i}
              className="lift flex flex-col overflow-hidden rounded-lg border border-border"
            >
              <div className="relative flex aspect-[4/3] items-center justify-center bg-muted">
                {isPdf ? (
                  <FileText aria-hidden="true" className="size-14 text-primary" />
                ) : (
                  <Image
                    src={storageUrl(item.file)}
                    alt={title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    unoptimized={item.file.endsWith('.svg')}
                    className={item.kind === 'photo' ? 'object-cover' : 'object-contain p-6'}
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-5">
                <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  <Icon aria-hidden="true" className="size-4" />
                  {t(`kinds.${item.kind}`)}
                </p>
                <h3 className="font-semibold">{title}</h3>
                {item.description && (
                  <p className="text-sm text-muted-foreground">
                    {localized(item.description, locale)}
                  </p>
                )}
                <a
                  href={storageUrl(item.file)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center gap-1.5 pt-2 font-medium text-primary underline-offset-4 hover:underline"
                >
                  <Download aria-hidden="true" className="size-4" />
                  {t(isPdf ? 'openDocument' : 'download')}
                  <span className="sr-only">
                    : {title} ({t('opensInNewTab')})
                  </span>
                </a>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

async function BrandColours({ colors, locale }: { colors: BrandColor[]; locale: Locale }) {
  const t = await getTranslations('Press');
  return (
    <section aria-labelledby="colours-heading" className="mt-12">
      <h2 id="colours-heading" className="font-display text-2xl font-bold">
        {t('colours')}
      </h2>
      <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {colors.map((colour, i) => {
          const rgb = hexToRgb(colour.hex);
          return (
            <li key={i} className="lift overflow-hidden rounded-lg border border-border">
              {/* The swatch is an SVG fill, so the colour needs no inline style. */}
              <svg
                viewBox="0 0 4 2"
                preserveAspectRatio="none"
                aria-hidden="true"
                className="block h-28 w-full"
              >
                <rect width="4" height="2" fill={colour.hex} />
              </svg>
              <div className="flex flex-col gap-1 p-4">
                <h3 className="font-semibold">{colour.name}</h3>
                <dl className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 text-sm">
                  <dt className="text-muted-foreground">HEX</dt>
                  <dd className="font-mono">{colour.hex}</dd>
                  <dd>
                    <CopyButton
                      value={colour.hex}
                      label={t('copy', { value: colour.hex })}
                      copiedLabel={t('copied')}
                    />
                  </dd>
                  <dt className="text-muted-foreground">RGB</dt>
                  <dd className="font-mono">{rgb}</dd>
                  <dd>
                    <CopyButton
                      value={rgb}
                      label={t('copy', { value: rgb })}
                      copiedLabel={t('copied')}
                    />
                  </dd>
                </dl>
                {colour.usage && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {localized(colour.usage, locale)}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
