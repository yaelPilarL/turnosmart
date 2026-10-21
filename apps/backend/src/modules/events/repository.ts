import type { PrismaClient } from '@prisma/client';
import type { AppointmentEventDto, AppointmentStatus } from '@turnosmart/shared';

export interface EventRecord {
  id: string;
  appointmentId: string;
  type: string;
  fromStatus: AppointmentStatus | null;
  toStatus: AppointmentStatus | null;
  actorId: string | null;
  metadata: unknown;
  createdAt: Date;
}

/**
 * Lectura del historial (C07). La escritura atómica turno + evento es de C:
 * este módulo nunca inserta eventos.
 */
export interface EventRepository {
  /** null si el turno no existe en ese negocio. */
  listForAppointment(businessId: string, appointmentId: string): Promise<EventRecord[] | null>;
}

export class PrismaEventRepository implements EventRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listForAppointment(businessId: string, appointmentId: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id: appointmentId, businessId },
      select: { id: true },
    });
    if (!appointment) return null;
    return this.prisma.appointmentEvent.findMany({
      where: { appointmentId, businessId },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });
  }
}

export function toEventDto(e: EventRecord): AppointmentEventDto {
  const metadata =
    e.metadata && typeof e.metadata === 'object' && !Array.isArray(e.metadata)
      ? (e.metadata as Record<string, unknown>)
      : null;
  return {
    id: e.id,
    appointmentId: e.appointmentId,
    type: e.type,
    fromStatus: e.fromStatus,
    toStatus: e.toStatus,
    actorId: e.actorId,
    metadata,
    createdAt: e.createdAt.toISOString(),
  };
}
