import type { Metadata } from 'next'
import { Bricolage_Grotesque } from 'next/font/google'
import '@/app/globals.css'

import Header1 from '@/components/Layout/Header1'
import Header2 from '@/components/Layout/Header2'
import Footer from '@/components/Layout/Footer'

import { ThemeProvider } from 'next-themes'
import NextTopLoader from 'nextjs-toploader'
import SessionProviderComp from '@/components/nextauth/SessionProvider'
import { PropertyTypesProvider } from '../../components/PropertyTypesContext'
import { Toaster } from 'react-hot-toast'

const font = Bricolage_Grotesque({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Property+ Africa | For everyone',
  description: 'A real estate platform connecting buyers, sellers, and agents.',
}

export default function RootLayout({
  children,
  session,
}: {
  children: React.ReactNode
  session: any
}) {
  return (
    <html lang="en">
      <body className={`${font.className} bg-white dark:bg-black antialiased`}>
        <NextTopLoader color="#07be8a" />

        <SessionProviderComp session={session}>
          <ThemeProvider
            attribute="class"
            enableSystem
            defaultTheme="light"
          >
            {/* 🔑 GLOBAL CONTEXT HERE */}
<PropertyTypesProvider>
              <Header1 />
              <Header2 />
              <Toaster position="top-right" />
              {children}
              <Footer />
</PropertyTypesProvider>
          </ThemeProvider>
        </SessionProviderComp>
      </body>
    </html>
  )
}
