'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  ClipboardList,
  CreditCard,
  FileText,
  Globe,
  LayoutDashboard,
  LayoutTemplate,
  LifeBuoy,
  LogOut,
  Menu,
  Receipt,
  Repeat,
  Settings,
  ShoppingBag,
  Users,
  X,
} from 'lucide-react';

import { Logo } from '@/components/shared/logo';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn, initials } from '@/lib/utils';

const NAV = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Websites', href: '/admin/websites', icon: Globe },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Subscriptions', href: '/admin/subscriptions', icon: Repeat },
  { label: 'Payments', href: '/admin/payments', icon: CreditCard },
  { label: 'Leads', href: '/admin/leads', icon: FileText },
  { label: 'Change requests', href: '/admin/change-requests', icon: ClipboardList },
  { label: 'Content', href: '/admin/content', icon: FileText },
  { label: 'Templates', href: '/admin/templates', icon: LayoutTemplate },
  { label: 'Domains', href: '/admin/domains', icon: Globe },
  { label: 'Support', href: '/admin/support', icon: LifeBuoy },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminNav({ name, email }: { name: string | null; email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const items = (
    <nav className="flex flex-1 flex-col gap-0.5 px-3">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              active ? 'bg-cymru-600 text-white' : 'text-charcoal-300 hover:bg-charcoal-800 hover:text-white',
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-charcoal-800 bg-charcoal-950 lg:flex">
        <div className="flex h-16 items-center border-b border-charcoal-800 px-5">
          <Logo href="/admin" invert />
        </div>
        <div className="flex-1 overflow-y-auto py-4">{items}</div>
        <div className="border-t border-charcoal-800 p-4">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-cymru-600">{initials(name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{name ?? 'Admin'}</p>
              <p className="truncate text-xs text-charcoal-400">{email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="mt-1 w-full justify-start text-charcoal-400 hover:bg-charcoal-800 hover:text-white" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </div>
      </aside>

      <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-charcoal-800 bg-charcoal-950 px-4 lg:hidden">
        <Logo href="/admin" invert />
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-md text-white hover:bg-charcoal-800"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col overflow-y-auto bg-charcoal-950 lg:hidden">
          <div className="flex-1 py-4">{items}</div>
          <div className="border-t border-charcoal-800 p-4">
            <Button variant="ghost" size="sm" className="w-full justify-start text-charcoal-400 hover:bg-charcoal-800 hover:text-white" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Log out
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
