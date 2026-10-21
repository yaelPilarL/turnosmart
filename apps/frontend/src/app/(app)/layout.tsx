'use client';

import {
  AppBar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@/components/AuthProvider';

const NAV = [
  { href: '/customers', label: 'Clientes' },
  { href: '/settings', label: 'Negocio' },
];

/** Navegación protegida: sin sesión → login; sin negocio → onboarding. */
export default function AppLayout({ children }: { children: ReactNode }) {
  const { status, me, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'signedOut') router.replace('/login');
    else if (status === 'signedIn' && me && !me.onboarded) router.replace('/onboarding');
  }, [status, me, router]);

  if (status !== 'signedIn' || !me?.onboarded) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress aria-label="Cargando" />
      </Box>
    );
  }

  return (
    <>
      <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar sx={{ gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="h6" sx={{ mr: 2, fontWeight: 700 }}>
            TurnoSmart
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexGrow: 1 }}>
            {NAV.map((item) => (
              <Button
                key={item.href}
                component={Link}
                href={item.href}
                color={pathname.startsWith(item.href) ? 'primary' : 'inherit'}
              >
                {item.label}
              </Button>
            ))}
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
            {me.business.name}
          </Typography>
          <Chip size="small" label={me.profile.role} />
          <Button onClick={signOut} data-testid="logout">
            Salir
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {children}
      </Container>
      <Box component="footer" sx={{ textAlign: 'center', py: 2, color: 'text.disabled', fontSize: 12 }}>
        versión {process.env.NEXT_PUBLIC_RELEASE_SHA}
      </Box>
    </>
  );
}
