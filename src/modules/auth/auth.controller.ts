import type { Request, Response } from 'express'
import { authService } from './auth.service'
import bcrypt from 'bcrypt'
const signup = async (req: Request, res: Response) => {
    try {
      const { name, email, password, phone, role } = req.body
  
      // Validate required fields
      if (!name || !email || !password || !phone || !role) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        })
      }
  
      // Validate role
      if (role !== 'admin' && role !== 'customer') {
        return res.status(400).json({
          success: false,
          message: 'Role must be either "admin" or "customer"'
        })
      }
  
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)
  
      // Insert user into database
      const result = await authService.signup(name, email, hashedPassword, phone, role)
      console.log(result.rows[0])
  
      const user = result.rows[0]
  
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: user
      })
    } catch (error: any) {
      // Handle unique constraint violation (duplicate email)
      if (error.code === '23505') {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        })
      }
  
      console.error('Signup error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }


  export const authController = {
    signup
  }