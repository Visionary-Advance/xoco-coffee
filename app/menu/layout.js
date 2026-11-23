import { redirect } from 'next/navigation';
import { MENU_ENABLED } from '@/lib/siteConfig';

export default function MenuLayout({ children }) {
  if (!MENU_ENABLED) redirect('/');
  return children;
}
