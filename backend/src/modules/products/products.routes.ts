import { Router } from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  getStockMovements,
  adjustStock,
  getCategories,
} from './products.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import {
  createProductSchema,
  updateProductSchema,
  stockAdjustmentSchema,
} from './products.schema';

const router = Router();

router.use(authenticate);

router.get('/', getProducts);
router.get('/categories', getCategories);
router.post('/', authorize('admin', 'warehouse'), validate(createProductSchema), createProduct);
router.get('/:id', getProduct);
router.put('/:id', authorize('admin', 'warehouse'), validate(updateProductSchema), updateProduct);
router.get('/:id/stock-movements', authorize('admin', 'warehouse'), getStockMovements);
router.post(
  '/:id/stock-adjustment',
  authorize('admin', 'warehouse'),
  validate(stockAdjustmentSchema),
  adjustStock
);

export default router;
