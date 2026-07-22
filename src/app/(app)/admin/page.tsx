import { requireAdmin } from '@/lib/auth/session';
import { AdminDashboard } from '@/features/dashboard/admin-dashboard';

export default async function AdminPage() {
  await requireAdmin();
  return <AdminDashboard />;
}
