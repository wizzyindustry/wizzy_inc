import type { ReactNode } from 'react';
import { AdminSession } from '@/components/admin/AdminSession';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

/** Every admin page except /admin/login: nothing renders until the admin check passes. */
export default function AdminPanelLayout({ children }: { children: ReactNode }) {
  return (
    <AdminSession>
      <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
        <AdminSidebar />
        <main className="px-4 py-8 lg:px-8">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </AdminSession>
  );
}
