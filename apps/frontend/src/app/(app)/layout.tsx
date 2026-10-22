'use client';

import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import {
  AppBar,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import type { Role } from '@turnosmart/shared';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Brand, NameAvatar } from '@/components/ui';

const DRAWER_WIDTH = 260;

const NAV = [
  { href: '/customers', label: 'Clientes', icon: <PeopleAltRoundedIcon /> },
  { href: '/settings', label: 'Negocio', icon: <StorefrontRoundedIcon /> },
];

const ROLE_LABEL: Record<Role, string> = { OWNER: 'Dueño/a', ADMIN: 'Admin', STAFF: 'Staff' };

/** Navegación protegida: sin sesión → login; sin negocio → onboarding. */
export default function AppLayout({ children }: { children: ReactNode }) {
  const { status, me, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (status === 'signedOut') router.replace('/login');
    else if (status === 'signedIn' && me && !me.onboarded) router.replace('/onboarding');
  }, [status, me, router]);

  useEffect(() => setMobileOpen(false), [pathname]);

  if (status !== 'signedIn' || !me?.onboarded) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress aria-label="Cargando" />
      </Box>
    );
  }

  const account = me.profile.fullName || me.user.email || 'Mi cuenta';

  const sidebar = (
    <Stack sx={{ height: '100%', p: 2 }}>
      <Box sx={{ px: 1, py: 1.5 }}>
        <Brand />
      </Box>

      <Box
        sx={{
          mt: 2,
          mb: 1,
          px: 1.5,
          py: 1.25,
          borderRadius: 2.5,
          bgcolor: 'action.hover',
        }}
      >
        <Typography variant="overline" color="text.secondary" sx={{ fontSize: 10, lineHeight: 1.6 }}>
          Negocio
        </Typography>
        <Typography variant="subtitle2" noWrap title={me.business.name}>
          {me.business.name}
        </Typography>
      </Box>

      <List component="nav" aria-label="Secciones" sx={{ mt: 1, display: 'grid', gap: 0.5 }}>
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <ListItemButton
              key={item.href}
              component={Link}
              href={item.href}
              selected={active}
              aria-current={active ? 'page' : undefined}
              sx={{
                py: 1,
                '&.Mui-selected': { bgcolor: 'primary.main', color: 'primary.contrastText' },
                '&.Mui-selected:hover': { bgcolor: 'primary.dark' },
                '&.Mui-selected .MuiListItemIcon-root': { color: 'inherit' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} slotProps={{ primary: { sx: { fontWeight: 600 } } }} />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ flexGrow: 1 }} />
      <Divider sx={{ my: 2 }} />

      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', px: 0.5 }}>
        <NameAvatar name={account} size={36} />
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography variant="body2" noWrap sx={{ fontWeight: 600 }} title={account}>
            {account}
          </Typography>
          <Chip size="small" label={ROLE_LABEL[me.profile.role]} sx={{ height: 20, fontSize: 11, mt: 0.25 }} />
        </Box>
        <Tooltip title="Cerrar sesión">
          <IconButton onClick={signOut} data-testid="logout" aria-label="Salir">
            <LogoutRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
      <Typography variant="caption" color="text.disabled" sx={{ px: 0.5, mt: 1.5 }}>
        versión {process.env.NEXT_PUBLIC_RELEASE_SHA}
      </Typography>
    </Stack>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{ display: { md: 'none' }, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
      >
        <Toolbar sx={{ gap: 1 }}>
          <IconButton edge="start" aria-label="Abrir menú" onClick={() => setMobileOpen(true)}>
            <MenuRoundedIcon />
          </IconButton>
          <Brand />
        </Toolbar>
      </AppBar>

      <Box component="aside" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
        >
          {sidebar}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, borderRight: 1, borderColor: 'divider' },
          }}
        >
          {sidebar}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, minWidth: 0 }}>
        <Toolbar sx={{ display: { md: 'none' } }} />
        <Box sx={{ maxWidth: 1120, mx: 'auto', px: { xs: 2, sm: 3, md: 5 }, py: { xs: 3, md: 5 } }}>{children}</Box>
      </Box>
    </Box>
  );
}
