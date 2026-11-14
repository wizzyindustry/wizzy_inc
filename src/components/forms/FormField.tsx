import type { ReactNode } from 'react';

type Props = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optionalLabel?: string;
  children: ReactNode;
};

/**
 * Label + control + hint + error, wired for screen readers. The control must use
 * `id`, `aria-describedby={describedBy(id, hint, error)}` and `aria-invalid={!!error}`.
 */
export function FormField({ id, label, hint, error, optionalLabel, children }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-medium">
        {label}
        {optionalLabel && (
          <span className="ml-1 text-sm font-normal text-muted-foreground">({optionalLabel})</span>
        )}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function describedBy(id: string, hint?: string, error?: string): string | undefined {
  return [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
}
