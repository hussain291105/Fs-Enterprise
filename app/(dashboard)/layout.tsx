import SidebarLayout from '@/components/SidebarLayout';

import { ReactNode } from 'react';



export default function Layout({ children }: { children: ReactNode }) {

  return <SidebarLayout>{children}</SidebarLayout>;

}