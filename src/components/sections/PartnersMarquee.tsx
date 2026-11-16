import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { storageUrl } from '@/lib/utils/storage-url';

type Partner = { name: string; logo?: string; url?: string };

function PartnerLogo({ partner }: { partner: Partner }) {
  const content = partner.logo ? (
    <Image
      src={storageUrl(partner.logo)}
      alt={partner.name}
      width={140}
      height={56}
      sizes="140px"
      unoptimized={partner.logo.endsWith('.svg')}
      className="h-14 w-36 object-contain"
    />
  ) : (
    <span className="text-lg font-semibold text-muted-foreground">{partner.name}</span>
  );
  return partner.url ? (
    <a href={partner.url} target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
      {content}
    </a>
  ) : (
    content
  );
}

/**
 * Home page strip of brands we work with, scrolling slowly sideways (pauses on hover; with
 * "reduce motion" the logos simply wrap). Not shown until the owner adds partners.
 */
export async function PartnersMarquee({ partners }: { partners: Partner[] }) {
  if (partners.length === 0) return null;
  const t = await getTranslations('HomePage.partners');

  return (
    <section aria-labelledby="partners-heading" className="border-y border-border">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h2
          id="partners-heading"
          className="text-center text-sm font-semibold tracking-wide text-muted-foreground uppercase"
        >
          {t('heading')}
        </h2>
        <div className="marquee mt-6 overflow-hidden">
          <div className="marquee-track flex w-max items-center">
            <ul className="flex shrink-0 items-center gap-12 pr-12">
              {partners.map((p, i) => (
                <li key={i}>
                  <PartnerLogo partner={p} />
                </li>
              ))}
            </ul>
            {/* Second copy so the strip loops without a gap; hidden from screen readers. */}
            <ul aria-hidden="true" className="marquee-copy flex shrink-0 items-center gap-12 pr-12">
              {partners.map((p, i) => (
                <li key={i} inert>
                  <PartnerLogo partner={p} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
