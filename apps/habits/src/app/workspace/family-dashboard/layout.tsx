import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Family Dashboard | Habits',
  description: 'Family habit dashboard for wall display',
};

export default function FamilyDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Minimal layout without navigation chrome - designed for touchscreen displays
  return (
    <div className="min-h-screen bg-[#050505] overflow-hidden">
      {children}
    </div>
  );
}
