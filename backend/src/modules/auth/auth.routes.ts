import { Router } from 'express';
import { login, getMe } from './auth.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { loginSchema } from './auth.schema';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.get('/me', authenticate, getMe);

export default router;
