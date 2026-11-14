import createMiddleware from 'next-intl/middleware';
import { routing } from '@/lib/i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Locale routing for public pages only — skip admin, API, Next internals and files.
  matcher: ['/((?!api|admin|_next|_vercel|.*\\..*).*)'],
};
