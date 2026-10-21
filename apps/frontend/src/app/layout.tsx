import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AuthProvider } from '@/components/AuthProvider';
import { ThemeRegistry } from '@/components/ThemeRegistry';

export const metadata: Metadata = {
  title: 'TurnoSmart',
  description: 'Gestión de turnos con scoring de riesgo',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <AppRouterCacheProvider>
          <ThemeRegistry>
            <AuthProvider>{children}</AuthProvider>
          </ThemeRegistry>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
