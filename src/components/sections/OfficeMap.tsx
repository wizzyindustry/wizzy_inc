'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Clock, MapPin, Phone } from 'lucide-react';
import { osmEmbedUrl, osmPageUrl } from '@/lib/maps/openstreetmap';

export type OfficeView = {
  name: string;
  address: string;
  hours?: string;
  phone?: string;
  latitude: number;
  longitude: number;
};

/**
 * Office list with a map beside it (OpenStreetMap). Choosing an office moves the map to it.
 * The map loads lazily, only when it scrolls near the screen.
 */
export function OfficeMap({ offices }: { offices: OfficeView[] }) {
  const t = useTranslations('Offices');
  const [selected, setSelected] = useState(0);
  const office = offices[selected] ?? offices[0];
  if (!office) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <ul className="flex flex-col gap-3">
        {offices.map((o, i) => (
          <li key={i}>
            <article
              className={`lift flex flex-col gap-2 rounded-lg border p-5 ${i === selected ? 'border-primary' : 'border-border'}`}
            >
              <h3 className="font-semibold">{o.name}</h3>
              <p className="flex gap-2 text-sm text-muted-foreground">
                <MapPin aria-hidden="true" className="size-4 shrink-0 translate-y-0.5" />
                <span className="whitespace-pre-line">{o.address}</span>
              </p>
              {o.hours && (
                <p className="flex gap-2 text-sm text-muted-foreground">
                  <Clock aria-hidden="true" className="size-4 shrink-0 translate-y-0.5" />
                  {o.hours}
                </p>
              )}
              {o.phone && (
                <p className="flex gap-2 text-sm">
                  <Phone aria-hidden="true" className="size-4 shrink-0 translate-y-0.5" />
                  <a href={`tel:${o.phone.replace(/\s/g, '')}`} className="hover:text-primary">
                    {o.phone}
                  </a>
                </p>
              )}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium">
                {offices.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setSelected(i)}
                    aria-pressed={i === selected}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    {t('showOnMap')}
                  </button>
                )}
                <a
                  href={osmPageUrl(o.latitude, o.longitude)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {t('directions')}
                  <span className="sr-only"> ({t('opensInNewTab')})</span>
                </a>
              </div>
            </article>
          </li>
        ))}
      </ul>
      <iframe
        key={selected}
        title={t('mapTitle', { name: office.name })}
        src={osmEmbedUrl(office.latitude, office.longitude)}
        loading="lazy"
        referrerPolicy="no-referrer"
        className="h-80 w-full rounded-lg border border-border lg:h-full lg:min-h-96"
      />
    </div>
  );
}
