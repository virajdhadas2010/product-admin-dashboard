import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ProductMutationProvider } from '@/context/ProductMutationContext';
import { Navbar } from '@/components/layout/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AdminPulse - Product Admin Dashboard',
  description:
    'Modern Product Admin Dashboard built for Nexgensis Frontend Assignment using Next.js, React, Tailwind CSS, and Axios.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen flex flex-col antialiased`}>
        <AuthProvider>
          <ProductMutationProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <footer className="py-6 border-t border-slate-200/80 dark:border-slate-800/80 text-center text-xs text-slate-500">
              <p>AdminPulse Dashboard • Built for Nexgensis Assessment • Next.js &amp; Tailwind CSS</p>
            </footer>
          </ProductMutationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
