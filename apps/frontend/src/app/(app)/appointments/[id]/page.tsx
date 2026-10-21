'use client';

import { Button, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import { use } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { EventHistory } from '@/components/EventHistory';
import { RiskExplanationPanel } from '@/components/RiskExplanationPanel';

/**
 * Detalle del turno: A aporta explicación de riesgo e historial.
 * C integra aquí los datos del turno, el score y las acciones de estado (C02/C06/C08).
 */
export default function AppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { me } = useAuth();
  if (!me?.onboarded) return null;

  return (
    <Stack spacing={2}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
          Detalle del turno
        </Typography>
        <Button component={Link} href="/customers">
          Volver
        </Button>
      </Stack>
      <RiskExplanationPanel appointmentId={id} />
      <EventHistory appointmentId={id} timezone={me.business.timezone} />
    </Stack>
  );
}
