import { LoadingW } from './LoadingW';

/**
 * The "W" shown briefly each time a page is opened directly (typed address, refresh, link
 * from another site). Pure CSS: it fades out by itself after about 0.6 s, so the page never
 * stays covered — even if JavaScript fails. Page changes inside the site use NavigationLoader.
 */
export function PageSplash() {
  return (
    <div className="page-splash fixed inset-0 z-[70] flex items-center justify-center bg-background">
      <LoadingW />
    </div>
  );
}
