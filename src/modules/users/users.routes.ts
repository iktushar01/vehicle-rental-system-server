import { Router } from 'express'
import { usersController } from './users.controller';
import auth from '../../middleware/auth';

const router = Router();

router.get('/', auth('admin'), usersController.getUsers)
router.put('/:userId', auth(), usersController.updateUser)

export const usersRoutes = router