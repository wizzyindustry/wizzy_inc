import {
  Code,
  Globe,
  Image as ImageIcon,
  LayoutTemplate,
  Megaphone,
  Monitor,
  Palette,
  PenTool,
  Printer,
  Search,
  ShoppingCart,
  Smartphone,
  type LucideIcon,
} from 'lucide-react';
import type { ServiceCategory } from '@/lib/schemas/common';

/** Icon names the admin can type in a service's "Icon name" field. */
const ICONS: Record<string, LucideIcon> = {
  code: Code,
  globe: Globe,
  image: ImageIcon,
  layout: LayoutTemplate,
  megaphone: Megaphone,
  monitor: Monitor,
  palette: Palette,
  'pen-tool': PenTool,
  printer: Printer,
  search: Search,
  'shopping-cart': ShoppingCart,
  smartphone: Smartphone,
};

/** The service's own icon, or its category's icon when the name is unknown. */
export function serviceIcon(name: string | undefined, category: ServiceCategory): LucideIcon {
  return (name && ICONS[name]) || (category === 'graphic-design' ? Palette : Code);
}
