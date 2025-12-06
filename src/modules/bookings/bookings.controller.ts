import type { Request, Response } from 'express'
import { bookingsService } from "./bookings.service"

const createBooking = async (req: Request, res: Response) => {
    try {
        // Check if request body exists
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Request body is required'
            })
        }

        const { customer_id, vehicle_id, rent_start_date, rent_end_date } = req.body;

        // Validate required fields
        if (!customer_id || !vehicle_id || !rent_start_date || !rent_end_date) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required: customer_id, vehicle_id, rent_start_date, rent_end_date'
            })
        }

        // Validate dates
        const startDate = new Date(rent_start_date);
        const endDate = new Date(rent_end_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format. Use YYYY-MM-DD format'
            })
        }

        if (startDate < today) {
            return res.status(400).json({
                success: false,
                message: 'Rent start date cannot be in the past'
            })
        }

        if (endDate <= startDate) {
            return res.status(400).json({
                success: false,
                message: 'Rent end date must be after rent start date'
            })
        }

        // Check if vehicle exists
        const vehicleResult = await bookingsService.getVehicleById(vehicle_id);
        if (vehicleResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            })
        }

        const vehicle = vehicleResult.rows[0];

        // Validate vehicle availability
        if (vehicle.availability_status !== 'available') {
            return res.status(400).json({
                success: false,
                message: 'Vehicle is not available for booking'
            })
        }

        // Calculate total price (daily rate × duration)
        const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const totalPrice = daysDiff * parseFloat(vehicle.daily_rent_price);

        // Create booking (this also updates vehicle status to "booked")
        const booking = await bookingsService.createBooking({
            customer_id: parseInt(customer_id),
            vehicle_id: parseInt(vehicle_id),
            rent_start_date: rent_start_date,
            rent_end_date: rent_end_date,
            total_price: totalPrice
        });

        // Get booking with vehicle details
        const bookingWithVehicle = await bookingsService.getBookingWithVehicle(booking.id);

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: {
                id: booking.id,
                customer_id: booking.customer_id,
                vehicle_id: booking.vehicle_id,
                rent_start_date: booking.rent_start_date,
                rent_end_date: booking.rent_end_date,
                total_price: parseFloat(booking.total_price),
                status: booking.status,
                vehicle: {
                    vehicle_name: bookingWithVehicle.rows[0].vehicle_name,
                    daily_rent_price: parseFloat(bookingWithVehicle.rows[0].daily_rent_price)
                }
            }
        })
    } catch (error: any) {
        console.error('Create booking error:', error)
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            detail: error.detail,
            stack: error.stack
        })
        
        // Handle foreign key constraint violations
        if (error.code === '23503') {
            return res.status(404).json({
                success: false,
                message: 'Customer or vehicle not found'
            })
        }

        // Handle check constraint violations
        if (error.code === '23514') {
            return res.status(400).json({
                success: false,
                message: 'Invalid data: Check constraint violation'
            })
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        })
    }
}

const getBookings = async (req: Request, res: Response) => {
    try {
        const currentUser = req.user;
        if (!currentUser || !currentUser.id) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            })
        }

        const isAdmin = currentUser.role === 'admin';
        const customerId = Number(currentUser.id);

        let result;
        let bookings;

        if (isAdmin) {
            // Admin sees all bookings with customer and vehicle details
            result = await bookingsService.getAllBookings();
            bookings = result.rows.map(booking => ({
                id: booking.id,
                customer_id: booking.customer_id,
                vehicle_id: booking.vehicle_id,
                rent_start_date: booking.rent_start_date,
                rent_end_date: booking.rent_end_date,
                total_price: parseFloat(booking.total_price),
                status: booking.status,
                customer: {
                    name: booking.customer_name,
                    email: booking.customer_email
                },
                vehicle: {
                    vehicle_name: booking.vehicle_name,
                    registration_number: booking.registration_number
                }
            }));

            res.status(200).json({
                success: true,
                message: 'Bookings retrieved successfully',
                data: bookings
            })
        } else {
            // Customer sees only their own bookings with vehicle details
            result = await bookingsService.getBookingsByCustomerId(customerId);
            bookings = result.rows.map(booking => ({
                id: booking.id,
                vehicle_id: booking.vehicle_id,
                rent_start_date: booking.rent_start_date,
                rent_end_date: booking.rent_end_date,
                total_price: parseFloat(booking.total_price),
                status: booking.status,
                vehicle: {
                    vehicle_name: booking.vehicle_name,
                    registration_number: booking.registration_number,
                    type: booking.type
                }
            }));

            res.status(200).json({
                success: true,
                message: 'Your bookings retrieved successfully',
                data: bookings
            })
        }
    } catch (error: any) {
        console.error('Get bookings error:', error)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

export const bookingsController = {
    createBooking,
    getBookings
}
