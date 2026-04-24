'use client';



import { useState } from 'react';

import Sidebar from '@/components/Sidebar';

import { Menu, LogOut } from 'lucide-react';

import Image from 'next/image';

import { useRouter } from 'next/navigation';



export default function SidebarLayout({ children }: { children: React.ReactNode }) {

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const router = useRouter();

  const handleLogout = () => {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('userId');
    router.push('/login');
  };



  return (

    <div className="flex h-screen overflow-y-hidden bg-gray-50">



      {/* Sidebar */}

      <aside

        className={`bg-white border-r shadow-sm flex flex-col transition-all duration-300 ease-in-out

        ${sidebarOpen ? 'w-64' : 'w-20'}`}

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



            {sidebarOpen && (

              <h1 className="text-lg font-semibold text-gray-900 whitespace-nowrap">

                Fresh Soft Tissue

              </h1>

            )}

          </div>



          {/* Toggle Button */}

          <button

            onClick={() => setSidebarOpen(!sidebarOpen)}

            className="p-2 rounded-md hover:bg-gray-100 transition ml-2"

          >

            <Menu size={20} className="text-gray-700" />

          </button>

        </div>



        {/* Sidebar Content */}

        <div className="flex-1 overflow-y-auto">

          <Sidebar collapsed={!sidebarOpen} />

        </div>

        {/* Logout Button */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-3 rounded-lg text-red-600 hover:bg-red-100"
          >
            <LogOut size={18} />
            {sidebarOpen && 'Logout'}
          </button>
        </div>



      </aside>



      {/* Main Area */}

      <div className="flex-1 flex flex-col overflow-hidden">



        <main className="flex-1 overflow-y-auto p-6">

          {children}

        </main>



      </div>

    </div>

  );

}