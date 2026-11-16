import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/Button';
import { Link } from '@/lib/i18n/navigation';
import { storageUrl } from '@/lib/utils/storage-url';

type Props = { headline: string; subheadline: string; image?: string };

/**
 * Home hero. Without an image the headline is the first thing painted (fast on mobile data).
 * With a background image (Admin → Settings) the photo is loaded first and responsively, and
 * the text sits on a dark overlay so it stays readable on any photo.
 */
export async function Hero({ headline, subheadline, image }: Props) {
  const t = await getTranslations('HomePage.hero');

  return (
    <section className={`relative isolate overflow-hidden ${image ? 'bg-foreground' : 'bg-muted'}`}>
      {image && (
        <>
          <Image
            src={storageUrl(image)}
            alt="" // decorative: the headline says what matters
            fill
            priority
            sizes="100vw"
            className="-z-20 object-cover"
          />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-foreground/65" />
        </>
      )}
      <div
        className={`mx-auto flex max-w-6xl flex-col gap-6 px-4 py-14 sm:py-24 ${image ? 'text-background' : ''}`}
      >
        <h1 className="max-w-3xl font-display text-3xl leading-tight font-bold sm:text-5xl">
          {headline}
        </h1>
        <p
          className={`max-w-2xl text-lg ${image ? 'text-background/90' : 'text-muted-foreground'}`}
        >
          {subheadline}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/quote">{t('primaryCta')}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/portfolio">{t('secondaryCta')}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
