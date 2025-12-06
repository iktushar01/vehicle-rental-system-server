import type { Request, Response } from 'express'
import { vehiclesService } from "./vehicles.services"

const getVehicles = async (req: Request, res: Response) => {
    try {
        const result = await vehiclesService.getVehicles()
        
        if (result.rows.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No vehicles found',
                data: []
            })
        }
        
        res.status(200).json({
            success: true,
            message: 'Vehicles retrieved successfully',
            data: result.rows
        })
    } catch (error: any) {
        console.error('Get vehicles error:', error)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

const getVehicleById = async (req: Request, res: Response) => {
    try {
        const vehicleId = parseInt(req.params.vehicleId as string)
        
        if (isNaN(vehicleId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid vehicle ID'
            })
        }

        const result = await vehiclesService.getVehicleById(vehicleId)
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            })
        }
        
        res.status(200).json({
            success: true,
            message: 'Vehicle retrieved successfully',
            data: result.rows[0]
        })
    } catch (error: any) {
        console.error('Get vehicle by ID error:', error)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

const updateVehicle = async (req: Request, res: Response) => {
    try {
        const vehicleId = parseInt(req.params.vehicleId as string)
        
        if (isNaN(vehicleId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid vehicle ID'
            })
        }

        // Check if vehicle exists
        const existingVehicle = await vehiclesService.getVehicleById(vehicleId)
        if (existingVehicle.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            })
        }

        const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = req.body;

        // Check if at least one field is provided
        if (!vehicle_name && !type && registration_number === undefined && daily_rent_price === undefined && !availability_status) {
            return res.status(400).json({
                success: false,
                message: 'At least one field must be provided for update'
            })
        }

        // Build update object with only provided fields
        const updateData: {
            vehicle_name?: string;
            type?: string;
            registration_number?: string;
            daily_rent_price?: number;
            availability_status?: string;
        } = {};

        if (vehicle_name !== undefined) {
            updateData.vehicle_name = vehicle_name;
        }
        if (type !== undefined) {
            const validTypes = ['car', 'bike', 'van', 'SUV'];
            if (!validTypes.includes(type)) {
                return res.status(400).json({
                    success: false,
                    message: `Type must be one of: ${validTypes.join(', ')}`
                })
            }
            updateData.type = type;
        }
        if (registration_number !== undefined) {
            updateData.registration_number = registration_number;
        }
        if (daily_rent_price !== undefined) {
            const price = Number(daily_rent_price);
            if (isNaN(price) || price <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Daily rent price must be a positive number'
                })
            }
            updateData.daily_rent_price = price;
        }
        if (availability_status !== undefined) {
            const validStatuses = ['available', 'booked'];
            if (!validStatuses.includes(availability_status)) {
                return res.status(400).json({
                    success: false,
                    message: `Availability status must be one of: ${validStatuses.join(', ')}`
                })
            }
            updateData.availability_status = availability_status;
        }

        const result = await vehiclesService.updateVehicle(vehicleId, updateData)

        res.status(200).json({
            success: true,
            message: 'Vehicle updated successfully',
            data: result
        })
    } catch (error: any) {
        console.error('Update vehicle error:', error)
        
        // Handle unique constraint violation
        if (error.code === '23505') {
            return res.status(409).json({
                success: false,
                message: 'Registration number already exists'
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

const createVehicle = async (req: Request, res: Response) => {
    try {
        const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = req.body;

        // Validate required fields
        if (!vehicle_name || !type || !registration_number || daily_rent_price === undefined || !availability_status) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            })
        }

        // Validate type
        const validTypes = ['car', 'bike', 'van', 'SUV'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                message: `Type must be one of: ${validTypes.join(', ')}`
            })
        }

        // Validate availability_status
        const validStatuses = ['available', 'booked'];
        if (!validStatuses.includes(availability_status)) {
            return res.status(400).json({
                success: false,
                message: `Availability status must be one of: ${validStatuses.join(', ')}`
            })
        }

        // Convert daily_rent_price to number
        const price = Number(daily_rent_price);
        if (isNaN(price) || price <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Daily rent price must be a positive number'
            })
        }

        const result = await vehiclesService.createVehicle({
            vehicle_name,
            type,
            registration_number,
            daily_rent_price: price,
            availability_status
        })

        res.status(201).json({
            success: true,
            message: 'Vehicle created successfully',
            data: result
        })
    } catch (error: any) {
        console.error('Create vehicle error:', error)
        
        // Handle unique constraint violation
        if (error.code === '23505') {
            return res.status(409).json({
                success: false,
                message: 'Registration number already exists'
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

const deleteVehicle = async (req: Request, res: Response) => {
    try {
        const vehicleId = parseInt(req.params.vehicleId || '')
        
        if (isNaN(vehicleId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid vehicle ID'
            })
        }

        // Check if vehicle exists
        const existingVehicle = await vehiclesService.getVehicleById(vehicleId);
        if (existingVehicle.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            })
        }

        // Check if vehicle has active bookings
        const hasActive = await vehiclesService.hasActiveBookings(vehicleId);
        if (hasActive) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete vehicle with active bookings'
            })
        }

        // Delete the vehicle
        await vehiclesService.deleteVehicle(vehicleId);

        res.status(200).json({
            success: true,
            message: 'Vehicle deleted successfully'
        })
    } catch (error: any) {
        console.error('Delete vehicle error:', error)
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            detail: error.detail,
            stack: error.stack
        })
        
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        })
    }
}

export const vehiclesController = {
    getVehicles,
    getVehicleById,
    updateVehicle,
    createVehicle,
    deleteVehicle
}

