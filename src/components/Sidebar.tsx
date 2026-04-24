'use client';

import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutGrid,
  FileText,
  LogOut,
  BarChart4,
  Notebook
} from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
}

export default function Sidebar({ collapsed = false }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname() || '';

  const handleLogout = () => {
    sessionStorage.removeItem('auth');
    router.push('/login');
  };

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  return (
    <aside
      className={`flex flex-col min-h-screen bg-white border-r transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >

      {/* Navigation */}
      <nav className="space-y-2 px-3 mt-4">

        {/* Dashboard */}
        <button
          onClick={() => router.push('/dashboard')}
          className={`flex items-center gap-3 w-full p-3 rounded-lg ${
            isActive('/dashboard')
              ? 'bg-blue-600 text-white font-semibold'
              : 'text-blue-600 hover:bg-blue-100'
          }`}
        >
          <LayoutGrid size={18} />
          {!collapsed && 'Dashboard'}
        </button>

        {/* Billing */}
        <button
          onClick={() => router.push('/billing')}
          className={`flex items-center gap-3 w-full p-3 rounded-lg ${
            isActive('/billing')
              ? 'bg-blue-600 text-white font-semibold'
              : 'text-blue-600 hover:bg-blue-100'
          }`}
        >
          <FileText size={18} />
          {!collapsed && 'Billing'}
        </button>

        {/* Expense */}
        <button
          onClick={() => router.push('/expenses')}
          className={`flex items-center gap-3 w-full p-3 rounded-lg ${
            isActive('/expenses')
              ? 'bg-blue-600 text-white font-semibold'
              : 'text-blue-600 hover:bg-blue-100'
          }`}
        >
          <BarChart4 size={18} />
          {!collapsed && 'Expense Report'}
        </button>

        {/* Profit */}
        <button
          onClick={() => router.push('/reports')}
          className={`flex items-center gap-3 w-full p-3 rounded-lg ${
            isActive('/reports')
              ? 'bg-blue-600 text-white font-semibold'
              : 'text-blue-600 hover:bg-blue-100'
          }`}
        >
          <Notebook size={18} />
          {!collapsed && 'Profit Report'}
        </button>

      </nav>
    </aside>
  );
}