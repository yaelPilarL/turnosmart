'use client';

import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '@/components/AuthProvider';

export default function LoginPage() {
  const { status, me, signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'signedIn') router.replace(me?.onboarded === false ? '/onboarding' : '/customers');
  }, [status, me, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 400 }}>
        <CardContent>
          <Stack component="form" spacing={2} onSubmit={onSubmit}>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
              TurnoSmart
            </Typography>
            <Typography color="text.secondary">Ingresá con la cuenta de tu negocio.</Typography>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" variant="contained" size="large" disabled={submitting || status === 'loading'}>
              {submitting ? 'Ingresando…' : 'Ingresar'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
