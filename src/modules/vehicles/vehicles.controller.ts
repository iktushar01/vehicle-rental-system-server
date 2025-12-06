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
        const vehicleId = parseInt(req.params.vehicleId)
        
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

export const vehiclesController = {
    getVehicles,
    getVehicleById,
    createVehicle
}

