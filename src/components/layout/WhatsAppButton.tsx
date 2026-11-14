import { MessageCircle } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { buildWhatsAppLink } from '@/lib/utils/whatsapp';

/** Floating click-to-chat button (F7). Rendered on every public page by the locale layout. */
export async function WhatsAppButton({ number }: { number: string }) {
  const t = await getTranslations('WhatsApp');

  return (
    <a
      href={buildWhatsAppLink(number, t('prefilledMessage'))}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('label')}
      className="fixed right-4 bottom-4 z-50 inline-flex size-14 items-center justify-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-lg transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <MessageCircle aria-hidden="true" className="size-7" />
    </a>
  );
}
