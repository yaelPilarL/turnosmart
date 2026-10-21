'use client';

import EditIcon from '@mui/icons-material/Edit';
import {
  Alert,
  Button,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import type { CustomerDto, Paginated } from '@turnosmart/shared';
import { useCallback, useEffect, useState } from 'react';
import { CustomerFormDialog } from '@/components/CustomerFormDialog';
import { api, errorMessage } from '@/lib/api';

const PAGE_SIZE = 20;

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [data, setData] = useState<Paginated<CustomerDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<{ open: boolean; customer: CustomerDto | null }>({
    open: false,
    customer: null,
  });

  // Búsqueda con debounce para no disparar un request por tecla.
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(search.trim());
      setPage(0);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page + 1), pageSize: String(PAGE_SIZE) });
      if (query) params.set('search', query);
      setData(await api<Paginated<CustomerDto>>(`/api/customers?${params}`));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
          Clientes
        </Typography>
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            placeholder="Buscar por nombre, email o teléfono"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{ htmlInput: { 'aria-label': 'Buscar clientes' } }}
          />
          <Button variant="contained" onClick={() => setDialog({ open: true, customer: null })}>
            Nuevo cliente
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" action={<Button onClick={load}>Reintentar</Button>}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} variant="outlined">
        <Table size="small" aria-label="Listado de clientes">
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell align="right" />
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.items.map((c) => (
              <TableRow key={c.id} hover>
                <TableCell>{c.fullName}</TableCell>
                <TableCell>{c.email ?? '—'}</TableCell>
                <TableCell>{c.phone ?? '—'}</TableCell>
                <TableCell align="right">
                  <IconButton
                    aria-label={`Editar ${c.fullName}`}
                    onClick={() => setDialog({ open: true, customer: c })}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!loading && data?.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  {query ? 'No hay clientes que coincidan con la búsqueda.' : 'Todavía no cargaste clientes.'}
                </TableCell>
              </TableRow>
            )}
            {loading && !data && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  Cargando…
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={data?.total ?? 0}
          page={page}
          rowsPerPage={PAGE_SIZE}
          rowsPerPageOptions={[PAGE_SIZE]}
          onPageChange={(_, p) => setPage(p)}
        />
      </TableContainer>

      <CustomerFormDialog
        open={dialog.open}
        customer={dialog.customer}
        onClose={() => setDialog({ open: false, customer: null })}
        onSaved={() => {
          setDialog({ open: false, customer: null });
          load();
        }}
      />
    </Stack>
  );
}
