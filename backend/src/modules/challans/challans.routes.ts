import { Router } from 'express';
import {
  getChallans,
  getChallan,
  createChallan,
  updateChallan,
  confirmChallan,
  cancelChallan,
} from './challans.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createChallanSchema, updateChallanSchema } from './challans.schema';

const router = Router();

router.use(authenticate);

router.get('/', authorize('admin', 'sales', 'accounts', 'warehouse'), getChallans);
router.post('/', authorize('admin', 'sales'), validate(createChallanSchema), createChallan);
router.get('/:id', authorize('admin', 'sales', 'accounts', 'warehouse'), getChallan);
router.put('/:id', authorize('admin', 'sales'), validate(updateChallanSchema), updateChallan);
router.post('/:id/confirm', authorize('admin', 'sales'), confirmChallan);
router.post('/:id/cancel', authorize('admin'), cancelChallan);

export default router;
