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

export const usersController = {
    getUsers
}