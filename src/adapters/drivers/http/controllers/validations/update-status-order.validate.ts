import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const updateStatusOrderSchema = z.object({
  id: z.string(),
  status: z.enum([
    'Pendente',
    'Recebido',
    'Em preparação',
    'Pronto',
    'Finalizado',
  ]),
});

export class UpdateStatusOrderProps extends createZodDto(
  updateStatusOrderSchema,
) {}
