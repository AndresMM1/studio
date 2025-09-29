import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/contexts/auth-context';
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export const metadata: Metadata = {
  title: 'Ecosistema de Gestion',
  description: 'Aplicación para gestionar incidentes',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Alan+Sans:wght@300..900&family=Bitcount+Prop+Double+Ink:wght@100..900&display=swap" rel="stylesheet"></link>
      </head>
      <body className="bg-gradient-to-br from-white to-blue-100 ">
        <AuthProvider>
          <div className="grid min-h-screen w-full md:grid-cols-[60px_1fr] lg:grid-cols-[60px_1fr]">
            <DashboardSidebar />
            <div className="flex flex-col overflow-auto h-screen">
              {children}
            </div>
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
