// One continuous line forming the W (viewBox 0 0 100 100).
const W_PATH = 'M10 22 L30 80 L50 36 L70 80 L90 22';

type Props = {
  /** Read out by screen readers ("Loading…"). Without it the W is decoration only. */
  label?: string;
};

/**
 * Brand loading animation: a big "W" drawn in the primary colour. Used by PageSplash (every
 * full page load) and NavigationLoader (every page change). There is no loading.tsx on
 * purpose: it would make missing pages answer "200" instead of "404".
 */
export function LoadingW({ label }: Props) {
  return (
    <div
      role={label ? 'status' : undefined}
      aria-hidden={label ? undefined : true}
      className="flex flex-col items-center justify-center gap-4 px-4 py-16"
    >
      <svg viewBox="0 0 100 100" aria-hidden="true" className="size-28 sm:size-36">
        {/* Faint track, so the shape of the W is visible from the start. */}
        <path
          d={W_PATH}
          pathLength={1}
          fill="none"
          strokeWidth={10}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-muted"
        />
        <path
          d={W_PATH}
          pathLength={1}
          fill="none"
          strokeWidth={10}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="loading-w-stroke stroke-primary"
        />
      </svg>
      {label && <span className="sr-only">{label}</span>}
    </div>
  );
}
