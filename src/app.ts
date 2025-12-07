import express, { Request, Response } from 'express'
import logger from './middleware/logger'
import { authRoutes } from './modules/auth/auth.routes'
import { usersRoutes } from './modules/users/users.routes'
import { vehiclesRoutes } from './modules/vehicles/vehicles.routes'
import { bookingsRoutes } from './modules/bookings/bookings.routes'

const app = express()

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/v1/auth', authRoutes)
app.use('/v1/users', usersRoutes)
app.use('/v1/vehicles', vehiclesRoutes)
app.use('/v1/bookings', bookingsRoutes)

// Health check route
app.get('/', logger, (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Vehicle Rental System API is running',
    data: {
      service: 'Vehicle Rental System',
      version: '1.0.0',
      status: 'operational',
      endpoints: {
        auth: '/v1/auth',
        users: '/v1/users',
        vehicles: '/v1/vehicles',
        bookings: '/v1/bookings'
      }
    }
  })
})

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  })
})

export default app

