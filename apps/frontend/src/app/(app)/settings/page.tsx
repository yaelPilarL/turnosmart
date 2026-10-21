'use client';

import { Alert, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { can, type BusinessDto, type UpdateBusinessRequest } from '@turnosmart/shared';
import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { api, errorMessage, fieldErrors } from '@/lib/api';

export default function SettingsPage() {
  const { me, refreshMe } = useAuth();
  const [form, setForm] = useState({ name: '', timezone: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (me?.onboarded) setForm({ name: me.business.name, timezone: me.business.timezone });
  }, [me]);

  if (!me?.onboarded) return null;
  const editable = can(me.profile.role, 'business:update');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setMessage(null);
    try {
      const body: UpdateBusinessRequest = form;
      await api<BusinessDto>('/api/business', { method: 'PATCH', body });
      await refreshMe();
      setMessage({ type: 'success', text: 'Cambios guardados' });
    } catch (err) {
      setErrors(fieldErrors(err));
      setMessage({ type: 'error', text: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card variant="outlined" sx={{ maxWidth: 560 }}>
      <CardContent>
        <Stack component="form" spacing={2} onSubmit={onSubmit}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
            Datos del negocio
          </Typography>
          {!editable && <Alert severity="info">Sólo dueños/as y administradores/as pueden modificar estos datos.</Alert>}
          {message && <Alert severity={message.type}>{message.text}</Alert>}
          <TextField
            label="Nombre"
            value={form.name}
            disabled={!editable}
            error={!!errors.name}
            helperText={errors.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            label="Zona horaria"
            value={form.timezone}
            disabled={!editable}
            error={!!errors.timezone}
            helperText={errors.timezone}
            onChange={(e) => setForm({ ...form, timezone: e.target.value })}
          />
          {editable && (
            <Button type="submit" variant="contained" disabled={saving} sx={{ alignSelf: 'flex-start' }}>
              {saving ? 'Guardando…' : 'Guardar'}
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
