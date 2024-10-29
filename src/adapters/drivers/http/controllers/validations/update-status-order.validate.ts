import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const updateStatusOrderSchema = z.object({
  id: z.string(),
  status: z.enum([
    'PENDENTE',
    'RECEBIDO',
    'EM PREPARACAO',
    'PRONTO',
    'FINALIZADO',
  ]),
});

export class UpdateStatusOrderProps extends createZodDto(
  updateStatusOrderSchema,
) {}
