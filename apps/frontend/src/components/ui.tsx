'use client';

import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import { Avatar, Box, Stack, Typography, type SxProps, type Theme } from '@mui/material';
import type { ReactNode } from 'react';

/** Isotipo + nombre de la marca. */
export function Brand({ size = 'md', inverted = false }: { size?: 'md' | 'lg'; inverted?: boolean }) {
  const box = size === 'lg' ? 40 : 32;
  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
      <Box
        aria-hidden
        sx={{
          width: box,
          height: box,
          borderRadius: 2.5,
          display: 'grid',
          placeItems: 'center',
          bgcolor: inverted ? 'rgba(255,255,255,0.16)' : 'primary.main',
          color: inverted ? '#fff' : 'primary.contrastText',
        }}
      >
        <EventAvailableRoundedIcon sx={{ fontSize: box * 0.6 }} />
      </Box>
      <Typography
        component="span"
        sx={{
          fontWeight: 750,
          letterSpacing: '-0.02em',
          fontSize: size === 'lg' ? 22 : 18,
          color: inverted ? '#fff' : 'text.primary',
        }}
      >
        TurnoSmart
      </Typography>
    </Stack>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
  back,
}: {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  back?: ReactNode;
}) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'flex-end' }, mb: 3 }}
    >
      <Box>
        {back}
        <Typography variant="h5" component="h1">
          {title}
        </Typography>
        {subtitle && (
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexShrink: 0 }}>
          {actions}
        </Stack>
      )}
    </Stack>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Stack spacing={1.5} sx={{ alignItems: 'center', textAlign: 'center', py: 6, px: 2 }}>
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'action.hover',
          color: 'text.secondary',
          '& svg': { fontSize: 28 },
        }}
      >
        {icon}
      </Box>
      <Typography variant="subtitle1">{title}</Typography>
      {description && (
        <Typography color="text.secondary" sx={{ maxWidth: 380 }}>
          {description}
        </Typography>
      )}
      {action}
    </Stack>
  );
}

const AVATAR_COLORS = ['#0F766E', '#7C3AED', '#C2410C', '#0369A1', '#BE185D', '#4D7C0F', '#A16207'];

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase() || '?';
}

/** Avatar con iniciales y un color estable derivado del nombre. */
export function NameAvatar({ name, size = 36, sx }: { name: string; size?: number; sx?: SxProps<Theme> }) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return (
    <Avatar
      sx={[
        { width: size, height: size, fontSize: size * 0.38, fontWeight: 700, color: '#fff', bgcolor: AVATAR_COLORS[hash % AVATAR_COLORS.length] },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {initials(name)}
    </Avatar>
  );
}
