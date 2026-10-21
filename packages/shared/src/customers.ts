import { z } from 'zod';

export interface CustomerDto {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .optional();

/** POST /api/customers. Email opcional y no único, como permite el modelo. */
export const createCustomerSchema = z.object({
  fullName: z.string().trim().min(1, 'El nombre es obligatorio').max(120),
  email: z
    .union([z.literal(''), z.email('Email inválido').max(254)])
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .optional(),
  phone: optionalText(40),
  notes: optionalText(1000),
});
export type CreateCustomerRequest = z.input<typeof createCustomerSchema>;

/** PATCH /api/customers/:id */
export const updateCustomerSchema = createCustomerSchema.partial();
export type UpdateCustomerRequest = z.input<typeof updateCustomerSchema>;

/** GET /api/customers?search=&page=&pageSize= (paginación acotada) */
export const listCustomersQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});
