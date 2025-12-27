import { DashboardLayout } from '@/components/dashboard/DashBoardLayout';

export default function DashboardPage() {
  // This page is kept clean. All the logic and layout are in the DashboardLayout component.
  // This makes it easy to switch layouts or add wrappers (like auth providers) later.
  return <DashboardLayout />;
}