import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/auth-provider"
import ConditionalFooter from "../src/components/ConditionalFooter";

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "HealthCare Pro - Doctor Dashboard",
  description: "AI-powered healthcare management system for doctors",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="light">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <AuthProvider>
          <main className="flex-1">
            {children}
          </main>
          <ConditionalFooter />
        </AuthProvider>
      </body>
    </html>
  )
}