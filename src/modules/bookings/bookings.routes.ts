import { Router } from 'express'
import { bookingsController } from './bookings.controller';
import auth from '../../middleware/auth';

const router = Router();

router.get('/', auth(), bookingsController.getBookings)
router.post('/', auth(), bookingsController.createBooking)

export const bookingsRoutes = router
