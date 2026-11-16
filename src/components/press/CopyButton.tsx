'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

type Props = { value: string; label: string; copiedLabel: string };

/** Copies a colour code to the clipboard (labels come from the server, no extra messages). */
export function CopyButton({ value, label, copiedLabel }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked: the value is visible on the card to copy by hand.
    }
  }

  return (
    <button
      type="button"
      onClick={() => void copy()}
      aria-label={copied ? copiedLabel : label}
      title={label}
      className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
    >
      {copied ? (
        <Check aria-hidden="true" className="size-4 text-success" />
      ) : (
        <Copy aria-hidden="true" className="size-4" />
      )}
      <span aria-live="polite" className="sr-only">
        {copied ? copiedLabel : ''}
      </span>
    </button>
  );
}
