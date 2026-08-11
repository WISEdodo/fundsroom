import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  category: z.string().min(1, 'Category is required'),
  unitPrice: z.number().positive('Unit price must be positive'),
  currentStock: z.number().int().min(0, 'Stock cannot be negative').default(0),
  minStockAlert: z.number().int().min(0, 'Min stock alert cannot be negative').default(10),
  location: z.string().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const stockAdjustmentSchema = z.object({
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  movementType: z.enum(['IN', 'OUT']),
  reason: z.string().min(1, 'Reason is required'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>;
