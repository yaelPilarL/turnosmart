'use client';

import { Alert, Box, Button, Card, CardContent, Chip, List, ListItem, ListItemText, Typography } from '@mui/material';
import type { AppointmentEventDto, AppointmentStatus } from '@turnosmart/shared';
import { useCallback, useEffect, useState } from 'react';
import { api, errorMessage } from '@/lib/api';

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  SCHEDULED: 'Agendado',
  CONFIRMED: 'Confirmado',
  CANCELLED: 'Cancelado',
  COMPLETED: 'Completado',
  NO_SHOW: 'Ausente',
};

const TYPE_LABEL: Record<string, string> = {
  CREATED: 'Turno creado',
  RESCHEDULED: 'Turno reprogramado',
  STATUS_CHANGED: 'Cambio de estado',
};

/** Historial del turno en orden cronológico (C07). Sólo lectura. */
export function EventHistory({ appointmentId, timezone }: { appointmentId: string; timezone: string }) {
  const [events, setEvents] = useState<AppointmentEventDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setEvents(await api<AppointmentEventDto[]>(`/api/appointments/${appointmentId}/events`));
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [appointmentId]);

  useEffect(() => {
    load();
  }, [load]);

  const fmt = new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short', timeZone: timezone });

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom>
          Historial
        </Typography>
        {error && (
          <Alert severity="error" action={<Button onClick={load}>Reintentar</Button>}>
            {error}
          </Alert>
        )}
        {events?.length === 0 && <Typography color="text.secondary">Sin eventos registrados.</Typography>}
        {events && events.length > 0 && (
          <List dense aria-label="Historial del turno">
            {events.map((e) => (
              <ListItem key={e.id} divider>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span>{TYPE_LABEL[e.type] ?? e.type}</span>
                      {e.fromStatus && <Chip size="small" variant="outlined" label={STATUS_LABEL[e.fromStatus]} />}
                      {e.fromStatus && e.toStatus && <span aria-hidden>→</span>}
                      {e.toStatus && <Chip size="small" label={STATUS_LABEL[e.toStatus]} />}
                    </Box>
                  }
                  secondary={fmt.format(new Date(e.createdAt))}
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}
