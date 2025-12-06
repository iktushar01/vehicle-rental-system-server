import type { Request, Response } from 'express'
import { usersService } from "./users.service"

const getUsers = async (req: Request, res: Response) => {
    try {
        const result = await usersService.getUsers()
        res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            data: result.rows
        })
    } catch (error: any) {
        console.error('Get users error:', error)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

const updateUser = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.userId || '')
        
        if (isNaN(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            })
        }

        // Check if user exists
        const existingUser = await usersService.getUserById(userId)
        if (existingUser.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        // Check authorization: Admin can update anyone, Customer can only update themselves
        const currentUser = req.user;
        if (!currentUser || !currentUser.id) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            })
        }

        const isAdmin = currentUser.role === 'admin';
        const isOwnProfile = Number(currentUser.id) === userId;

        if (!isAdmin && !isOwnProfile) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: You can only update your own profile'
            })
        }

        // Check if request body exists
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Request body is required'
            })
        }

        const { name, email, phone, role } = req.body;

        // Check if at least one field is provided
        if (!name && !email && !phone && !role) {
            return res.status(400).json({
                success: false,
                message: 'At least one field must be provided for update'
            })
        }

        // Customers cannot change their own role
        if (!isAdmin && role !== undefined) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: You cannot change your own role'
            })
        }

        // Build update object with only provided fields
        const updateData: {
            name?: string;
            email?: string;
            phone?: string;
            role?: string;
        } = {};

        if (name !== undefined) {
            updateData.name = name;
        }
        if (email !== undefined) {
            // Validate email format (basic check)
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email format'
                })
            }
            updateData.email = email.toLowerCase();
        }
        if (phone !== undefined) {
            updateData.phone = phone;
        }
        if (role !== undefined && isAdmin) {
            const validRoles = ['admin', 'customer'];
            if (!validRoles.includes(role)) {
                return res.status(400).json({
                    success: false,
                    message: `Role must be one of: ${validRoles.join(', ')}`
                })
            }
            updateData.role = role;
        }

        const result = await usersService.updateUser(userId, updateData)

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: result
        })
    } catch (error: any) {
        console.error('Update user error:', error)
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            detail: error.detail,
            stack: error.stack
        })
        
        // Handle unique constraint violation
        if (error.code === '23505') {
            return res.status(409).json({
                success: false,
                message: 'Email already exists'
            })
        }

        // Handle check constraint violations
        if (error.code === '23514') {
            return res.status(400).json({
                success: false,
                message: 'Invalid data: Check constraint violation'
            })
        }

        // Handle user not found from service
        if (error.message === 'User not found or update failed') {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        })
    }
}

export const usersController = {
    getUsers,
    updateUser
}