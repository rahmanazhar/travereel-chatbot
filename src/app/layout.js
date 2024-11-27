import { Poppins } from 'next/font/google'
import './globals.css'
import { initDatabase } from './utils/database'

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
})

// Initialize database connection
initDatabase().catch(console.error);

export const metadata = {
  title: 'Travereel',
  description: 'Plan your perfect trip with AI',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.className}>
      <body className="bg-gradient-custom min-h-screen">{children}</body>
    </html>
  )
}
