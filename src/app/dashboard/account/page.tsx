import type { Metadata } from 'next';

import { PasswordForm, ProfileForm } from '@/components/dashboard/account-forms';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requireCustomer } from '@/lib/auth/session';

export const metadata: Metadata = { title: 'Account', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const { user, customer } = await requireCustomer();

  return (
    <div className="space-y-6">
      <PageHeader title="Account" description="Your profile and login details." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileForm
              fullName={user.profile.full_name ?? customer.contact_name ?? ''}
              phone={user.profile.phone ?? customer.phone ?? ''}
              email={user.email}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
          </CardHeader>
          <CardContent>
            <PasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
