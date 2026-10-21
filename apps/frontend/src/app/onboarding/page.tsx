'use client';

import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import type { MeResponse, OnboardingRequest } from '@turnosmart/shared';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { api, errorMessage, fieldErrors } from '@/lib/api';

const DEFAULT_TZ = 'America/Argentina/Buenos_Aires';

export default function OnboardingPage() {
  const { status, me, refreshMe, signOut } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<{ businessName: string; fullName: string; timezone: string }>({
    businessName: '',
    fullName: '',
    timezone: DEFAULT_TZ,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'signedOut') router.replace('/login');
    if (me?.onboarded) router.replace('/customers');
  }, [status, me, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    setError(null);
    try {
      const body: OnboardingRequest = {
        businessName: form.businessName,
        timezone: form.timezone,
        ...(form.fullName.trim() ? { fullName: form.fullName } : {}),
      };
      await api<MeResponse>('/api/onboarding', { method: 'POST', body });
      await refreshMe();
      router.replace('/customers');
    } catch (err) {
      setErrors(fieldErrors(err));
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 460 }}>
        <CardContent>
          <Stack component="form" spacing={2} onSubmit={onSubmit}>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
              Configurá tu negocio
            </Typography>
            <Typography color="text.secondary">
              Tu cuenta todavía no tiene un negocio asociado. Vas a quedar como dueño/a.
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Nombre del negocio"
              required
              value={form.businessName}
              error={!!errors.businessName}
              helperText={errors.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
            />
            <TextField
              label="Tu nombre (opcional)"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
            <TextField
              label="Zona horaria"
              value={form.timezone}
              error={!!errors.timezone}
              helperText={errors.timezone ?? 'Formato IANA, por ejemplo America/Argentina/Buenos_Aires'}
              onChange={(e) => setForm({ ...form, timezone: e.target.value })}
            />
            <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between' }}>
              <Button onClick={signOut}>Salir</Button>
              <Button type="submit" variant="contained" disabled={submitting}>
                {submitting ? 'Creando…' : 'Crear negocio'}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
