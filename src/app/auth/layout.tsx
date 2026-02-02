import type { Metadata } from 'next'
import { Bricolage_Grotesque } from 'next/font/google'
import '@/app/globals.css';
import Header from '@/components/Layout/Header2'
import Footer from '@/components/Layout/Footer'
import { ThemeProvider } from 'next-themes'
import NextTopLoader from 'nextjs-toploader';
import SessionProviderComp from '@/components/nextauth/SessionProvider'
import Header2 from '@/components/Layout/Header1'

const font = Bricolage_Grotesque({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Property Community',
  description: 'A real estate platform connecting buyers, sellers, and agents.',
}

export default function RootLayout({
  children,
  session,
}: Readonly<{
  children: React.ReactNode
  session: any
}>) {
  return (
    <html lang='en'>
      <body className={`${font.className} bg-white dark:bg-black antialiased`}>
        <NextTopLoader color="#07be8a" />
        <SessionProviderComp session={session}>
          <ThemeProvider
            attribute='class'
            enableSystem={true}
            defaultTheme='light'>
            {/* <Header /> */}
            {/* <Header2 /> */}
            {children}
            {/* <Footer /> */}
          </ThemeProvider>
        </SessionProviderComp>
      </body>
    </html>
  )
}
