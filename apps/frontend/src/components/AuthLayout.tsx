'use client';

import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { Brand } from './ui';

const FEATURES = [
  { icon: <EventAvailableRoundedIcon />, text: 'Agenda, clientes y servicios en un solo lugar' },
  { icon: <AutoAwesomeRoundedIcon />, text: 'Riesgo de ausencia explicado con IA' },
  { icon: <ShieldRoundedIcon />, text: 'Cada negocio ve sólo sus propios datos' },
];

/** Pantallas sin sesión: panel de marca a la izquierda (escritorio) y formulario a la derecha. */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '5fr 6fr' } }}>
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 6,
          color: '#fff',
          background: 'linear-gradient(155deg, #0F766E 0%, #115E59 55%, #134E4A 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            width: 520,
            height: 520,
            borderRadius: '50%',
            right: -180,
            bottom: -200,
            background: 'radial-gradient(circle, rgba(94,234,212,0.28) 0%, rgba(94,234,212,0) 70%)',
          }}
        />
        <Brand size="lg" inverted />
        <Box sx={{ position: 'relative', maxWidth: 440 }}>
          <Typography variant="h4" component="p" sx={{ color: '#fff', mb: 2, lineHeight: 1.2 }}>
            Menos ausencias, una agenda más tranquila.
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.78)', mb: 4 }}>
            Gestioná los turnos de tu negocio y anticipate a los clientes que podrían faltar.
          </Typography>
          <Stack spacing={2}>
            {FEATURES.map((f) => (
              <Stack key={f.text} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: 'rgba(255,255,255,0.14)',
                    '& svg': { fontSize: 20 },
                  }}
                >
                  {f.icon}
                </Box>
                <Typography sx={{ color: 'rgba(255,255,255,0.92)', fontWeight: 500 }}>{f.text}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', position: 'relative' }}>
          UTN FRLP · Desarrollo de Software Cloud 2026
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', placeItems: 'center', p: { xs: 2, sm: 4 }, bgcolor: 'background.default' }}>
        <Box sx={{ width: '100%', maxWidth: 420 }}>
          <Box sx={{ display: { md: 'none' }, mb: 4 }}>
            <Brand />
          </Box>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
