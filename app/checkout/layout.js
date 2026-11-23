import { redirect } from 'next/navigation';
import { MENU_ENABLED } from '@/lib/siteConfig';

export default function CheckoutLayout({ children }) {
  if (!MENU_ENABLED) redirect('/');
  return children;
}
