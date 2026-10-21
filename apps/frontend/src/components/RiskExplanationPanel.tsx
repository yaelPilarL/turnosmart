'use client';

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { Alert, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import type { RiskExplanationResponse, RiskLevel } from '@turnosmart/shared';
import { useState } from 'react';
import { ApiError, api, errorMessage } from '@/lib/api';

const LEVEL: Record<RiskLevel, { label: string; color: 'success' | 'warning' | 'error' }> = {
  LOW: { label: 'Bajo', color: 'success' },
  MEDIUM: { label: 'Medio', color: 'warning' },
  HIGH: { label: 'Alto', color: 'error' },
};

/**
 * Explicación del score bajo demanda (A08). La llamada a Gemini sólo se hace al pulsar el botón;
 * si falla, el resto de la pantalla y la agenda siguen funcionando.
 */
export function RiskExplanationPanel({ appointmentId }: { appointmentId: string }) {
  const [result, setResult] = useState<RiskExplanationResponse | null>(null);
  const [error, setError] = useState<{ text: string; severity: 'error' | 'info' } | null>(null);
  const [loading, setLoading] = useState(false);

  async function requestExplanation() {
    setLoading(true);
    setError(null);
    try {
      setResult(
        await api<RiskExplanationResponse>(`/api/appointments/${appointmentId}/risk/explanation`, { method: 'POST' }),
      );
    } catch (err) {
      const info = err instanceof ApiError && err.code === 'RISK_NOT_AVAILABLE';
      setError({ text: errorMessage(err), severity: info ? 'info' : 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="h6" component="h2">
              Riesgo de ausencia
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AutoAwesomeIcon />}
              onClick={requestExplanation}
              disabled={loading}
            >
              {loading ? 'Consultando IA…' : result ? 'Volver a explicar' : 'Explicar con IA'}
            </Button>
          </Stack>

          {error && <Alert severity={error.severity}>{error.text}</Alert>}

          {result && (
            <>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography variant="h4" component="p" sx={{ fontWeight: 700 }}>
                  {result.risk.score}
                </Typography>
                <Typography color="text.secondary">/ 100</Typography>
                <Chip color={LEVEL[result.risk.level].color} label={`Riesgo ${LEVEL[result.risk.level].label}`} />
              </Stack>

              {result.risk.factors.length > 0 && (
                <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }} aria-label="Factores del score">
                  {result.risk.factors.map((f) => (
                    <Chip
                      key={f.code}
                      size="small"
                      variant="outlined"
                      label={`${f.label} (${f.impact > 0 ? '+' : ''}${f.impact})`}
                    />
                  ))}
                </Stack>
              )}

              <Typography>{result.explanation.summary}</Typography>
              <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 3 }}>
                {result.explanation.recommendations.map((r) => (
                  <Typography component="li" key={r}>
                    {r}
                  </Typography>
                ))}
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {result.disclaimer} Modelo: {result.model}.
              </Typography>
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
