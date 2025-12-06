import { Router } from 'express'
import { vehiclesController } from './vehicles.controller';
import auth from '../../middleware/auth';

const router = Router();

router.get('/', vehiclesController.getVehicles)
router.post('/', auth('admin'), vehiclesController.createVehicle)

export const vehiclesRoutes = router

