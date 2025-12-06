import { Router } from 'express'
import { usersController } from './users.controller';
import auth from '../../middleware/auth';

const router = Router();

router.get('/', auth(), usersController.getUsers)

export const usersRoutes = router