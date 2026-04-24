import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FS Enterprise',
  description: 'Enterprise Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
        {/* Optional: Suppress browser extension warnings */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                const originalWarn = console.warn;
                console.warn = (...args) => {
                  if (typeof args[0] === 'string' && args[0].includes('Extra attributes from the server')) {
                    return;
                  }
                  originalWarn(...args);
                };
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
