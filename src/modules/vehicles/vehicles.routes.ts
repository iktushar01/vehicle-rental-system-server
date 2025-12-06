import { Router } from 'express'
import { vehiclesController } from './vehicles.controller';
import auth from '../../middleware/auth';

const router = Router();

router.get('/', vehiclesController.getVehicles)
router.get('/:vehicleId', vehiclesController.getVehicleById)
router.post('/', auth('admin'), vehiclesController.createVehicle)

export const vehiclesRoutes = router

