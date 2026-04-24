'use client';



import { useState } from 'react';

import Sidebar from '@/components/Sidebar';

import { Menu } from 'lucide-react';

import Image from 'next/image';



export default function SidebarLayout({ children }: { children: React.ReactNode }) {

  const [sidebarOpen, setSidebarOpen] = useState(true);



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