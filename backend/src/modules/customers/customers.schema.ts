import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  mobile: z.string().min(7, 'Mobile number must be at least 7 digits'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  businessName: z.string().optional(),
  gstNumber: z.string().optional(),
  customerType: z.enum(['retail', 'wholesale', 'distributor']),
  address: z.string().optional(),
  status: z.enum(['lead', 'active', 'inactive']).default('lead'),
  followUpDate: z.string().datetime().optional().nullable(),
  notes: z.string().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const addFollowUpSchema = z.object({
  note: z.string().min(1, 'Note is required'),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type AddFollowUpInput = z.infer<typeof addFollowUpSchema>;
