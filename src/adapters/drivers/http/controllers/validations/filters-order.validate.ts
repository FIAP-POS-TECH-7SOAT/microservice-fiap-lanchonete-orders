import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const filtersOrderSchema = z.object({
  status: z.union([z.string(), z.array(z.string())]).optional(),
});

export class FiltersOrderProps extends createZodDto(filtersOrderSchema) {}
