'use client';

import { useState, useEffect } from 'react';

import Sidebar from '@/components/Sidebar';

import { Menu, LogOut, X } from 'lucide-react';

import Image from 'next/image';

import { usePathname, useRouter } from 'next/navigation';

import { useIsMobile } from '@/hooks/use-mobile';


export default function SidebarLayout({ children }: { children: React.ReactNode }) {

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const router = useRouter();
  const pathname = usePathname();


  const handleLogout = () => {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('userId');
    router.push('/login');
  };

  // Close mobile menu when switching to desktop
  useEffect(() => {
    if (!isMobile) {
      setMobileMenuOpen(false);
      setSidebarOpen(true);
    } else {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  // Close mobile menu when route changes
  useEffect(() => {
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  }, [pathname, isMobile]);


  return (

    <div className="flex h-screen overflow-y-hidden bg-gray-50">



      {/* Mobile Overlay */}
      {isMobile && mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}

      <aside

        className={`bg-white border-r shadow-sm flex flex-col transition-all duration-300 ease-in-out z-50
        ${isMobile
          ? mobileMenuOpen
            ? 'fixed inset-y-0 left-0 w-64 transform translate-x-0'
            : 'fixed inset-y-0 left-0 w-64 transform translate-x-0'
          : sidebarOpen
          ? 'w-64'
          : 'w-20'}
        ${isMobile && !mobileMenuOpen ? '-translate-x-full' : ''}`}

      >



        {/* Header */}

        <div className="flex items-center justify-between p-4 border-b">



          <div className="flex items-center gap-3">

            {/* Logo */}

            <Image

              src="/ezzylogo.png"

              alt="Fresh Soft Tissue"

              width={32}

              height={32}

            />



            {(sidebarOpen || isMobile) && (

              <h1 className="text-lg font-semibold text-gray-900 whitespace-nowrap">

                Fresh Soft Tissue

              </h1>

            )}

          </div>



          {/* Toggle Button */}
          {isMobile ? (
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-md hover:bg-gray-100 transition ml-2"
            >
              <X size={20} className="text-gray-700" />
            </button>
          ) : (
            <button

              onClick={() => setSidebarOpen(!sidebarOpen)}

              className="p-2 rounded-md hover:bg-gray-100 transition ml-2"

            >

              <Menu size={20} className="text-gray-700" />

            </button>
          )}

        </div>



        {/* Sidebar Content */}

        <div className="flex-1 overflow-y-auto">

          <Sidebar
            collapsed={!sidebarOpen && !isMobile}
            onNavigate={() => {
              if (isMobile) setMobileMenuOpen(false);
            }}
          />

        </div>

        {/* Logout Button */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-3 rounded-lg text-red-600 hover:bg-red-100"
          >
            <LogOut size={18} />
            {(sidebarOpen || isMobile) && 'Logout'}
          </button>
        </div>



      </aside>



      {/* Main Area */}

      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Mobile Header */}
        {isMobile && (
          <div className="flex items-center justify-between p-4 border-b bg-white lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-md hover:bg-gray-100 transition"
            >
              <Menu size={20} className="text-gray-700" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">FS Enterprise</h1>
            <div className="w-8" />
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">

          {children}

        </main>



      </div>

    </div>

  );

}