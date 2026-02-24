'use client';

import { useState, useCallback } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = useCallback(() => {
    setMobileSidebarOpen((prev) => !prev);
  }, []);

  const closeMobileSidebar = useCallback(() => {
    setMobileSidebarOpen(false);
  }, []);

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-page-bg">
        <Sidebar mobileOpen={mobileSidebarOpen} onMobileClose={closeMobileSidebar} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Navbar onMenuToggle={toggleMobileSidebar} />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
