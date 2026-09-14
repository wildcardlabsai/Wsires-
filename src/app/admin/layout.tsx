import { AdminNav } from '@/components/admin/admin-nav';
import { requireAdmin } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <div className="min-h-dvh bg-cream-50">
      <AdminNav name={user.profile.full_name} email={user.email} />
      <div className="lg:pl-60">
        <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">{children}</main>
      </div>
    </div>
  );
}
