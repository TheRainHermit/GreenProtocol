import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ContextProvider from '../src/context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Green Protocol - Finanzas Regenerativas para un Futuro Sostenible',
  description: 'Transforma residuos en valor con Green Protocol. Gana $GSEED tokens por reciclar y canjéalos por recompensas. ReFi en Ethereum Sepolia Network.',
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ContextProvider cookies={null}>{children}</ContextProvider>
      </body>
    </html>
  )
}