import { Router } from 'express'
import { usersController } from './users.controller';
import auth from '../../middleware/auth';

const router = Router();

router.get('/', auth('admin'), usersController.getUsers)
router.put('/:userId', auth(), usersController.updateUser)
router.delete('/:userId', auth('admin'), usersController.deleteUser)

export const usersRoutes = router