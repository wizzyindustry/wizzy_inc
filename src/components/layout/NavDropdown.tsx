'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { usePathname } from '@/lib/i18n/navigation';

const CLOSE_DELAY_MS = 150; // time to move the mouse from the button into the menu

type Props = {
  label: string;
  /** Wide menus span the header; narrow ones sit under their button. */
  wide?: boolean;
  children: ReactNode;
};

/**
 * Header dropdown ("Services", "Company"). Opens on hover (mouse) or click/tap, works with
 * the keyboard (Enter/Space to open, Escape to close and return to the button), closes when
 * clicking elsewhere or after choosing a page.
 */
export function NavDropdown({ label, wide = false, children }: Props) {
  const [open, setOpenState] = useState(false);
  // The latest value, readable at once: a click can arrive before React re-renders after hover.
  const openRef = useRef(false);
  const setOpen = (value: boolean) => {
    openRef.current = value;
    setOpenState(value);
  };
  const panelId = useId();
  const itemRef = useRef<HTMLLIElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const openedByHover = useRef(false);
  const pathname = usePathname();

  useEffect(() => {
    openRef.current = false;
    setOpenState(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const close = () => {
      openRef.current = false;
      setOpenState(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      close();
      buttonRef.current?.focus();
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!itemRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  return (
    <li
      ref={itemRef}
      className={wide ? undefined : 'relative'}
      onPointerEnter={(e) => {
        if (e.pointerType !== 'mouse') return;
        clearTimeout(closeTimer.current);
        if (!openRef.current) openedByHover.current = true;
        setOpen(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== 'mouse') return;
        openedByHover.current = false;
        closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
      }}
      onBlur={(e) => {
        if (!itemRef.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          // A click right after the mouse opened the menu keeps it open.
          if (openedByHover.current) {
            openedByHover.current = false;
            setOpen(true);
            return;
          }
          setOpen(!openRef.current);
        }}
        className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary"
      >
        {label}
        <ChevronDown
          aria-hidden="true"
          className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        id={panelId}
        hidden={!open}
        className={`dropdown-enter absolute z-50 pt-3 ${wide ? 'inset-x-4 top-full' : 'top-full left-1/2 w-72 -translate-x-1/2'}`}
      >
        <div className="rounded-lg border border-border bg-background p-4 shadow-lg">
          {children}
        </div>
      </div>
    </li>
  );
}
