import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const updateOrderSchema = z.object({
  client: z
    .object({
      name: z.string(),
      email: z.string().email(),
      document: z.string(),
    })
    .optional(),
  products: z.array(
    z.object({
      id: z.string(),
      amount: z.number().positive(),
      unit_price: z.number().positive(),
    }),
  ),
});

export class UpdateOrderProps extends createZodDto(updateOrderSchema) {}
