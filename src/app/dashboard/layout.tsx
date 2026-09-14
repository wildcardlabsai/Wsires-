import { DashboardNav } from '@/components/dashboard/dashboard-nav';
import { requireCustomer } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, customer } = await requireCustomer();

  return (
    <div className="min-h-dvh bg-cream-100">
      <DashboardNav name={user.profile.full_name ?? customer.contact_name} email={user.email} />
      <div className="lg:pl-64">
        <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">{children}</main>
      </div>
    </div>
  );
}
