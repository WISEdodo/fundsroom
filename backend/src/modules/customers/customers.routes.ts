import { Router } from 'express';
import {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  addFollowUp,
} from './customers.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import {
  createCustomerSchema,
  updateCustomerSchema,
  addFollowUpSchema,
} from './customers.schema';

const router = Router();

router.use(authenticate);

router.get('/', authorize('admin', 'sales', 'accounts'), getCustomers);
router.post('/', authorize('admin', 'sales'), validate(createCustomerSchema), createCustomer);
router.get('/:id', authorize('admin', 'sales', 'accounts'), getCustomer);
router.put('/:id', authorize('admin', 'sales'), validate(updateCustomerSchema), updateCustomer);
router.post(
  '/:id/follow-ups',
  authorize('admin', 'sales'),
  validate(addFollowUpSchema),
  addFollowUp
);

export default router;
