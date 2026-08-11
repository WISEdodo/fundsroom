import { z } from 'zod';

export const challanItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  unitPrice: z.number().positive('Unit price must be positive'),
});

export const createChallanSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  items: z.array(challanItemSchema).min(1, 'At least one product is required'),
  status: z.enum(['draft', 'confirmed']).default('draft'),
});

export const updateChallanSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID').optional(),
  items: z.array(challanItemSchema).min(1, 'At least one product is required').optional(),
  status: z.enum(['draft']).optional(), // Can only update draft challans to draft
});

export type CreateChallanInput = z.infer<typeof createChallanSchema>;
export type UpdateChallanInput = z.infer<typeof updateChallanSchema>;
