import type { Metadata } from 'next';
import '../styles/global.css'
import React, { FC } from 'react';
import { Rubik } from 'next/font/google';
import Header from '~/widgets/Header/ui/Header';
import { ReactQueryProvider } from '~/app/providers/react-query';
import { Toaster } from 'sonner';

const rubik = Rubik({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-rubik',
})

export const metadata: Metadata = {
  title: 'Electric avenue',
  description: 'Electric avenue',
  icons: {
    icon: '/favicon.ico',
  }
};

const RootLayout: FC<Readonly<{ children: React.ReactNode }>> = (
  { children },
) => {
  return (
    <html lang="en">
      <body className={`${rubik.variable} antialiased`}>
        <ReactQueryProvider>
          <div className='px-3 max-w-7xl min-h-screen mx-auto flex flex-col'>
            <Header />
            <main className='flex flex-col flex-1'>
              <Toaster />
              {children}
            </main>
            <footer></footer>
          </div>
        </ReactQueryProvider>
      </body>
    </html>
  );
};

export default RootLayout;
